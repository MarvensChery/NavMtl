import spacy
from datetime import datetime
import locale
import re
import requests
import pandas as pd
import numpy as np
import json
from math import radians, sin, cos, sqrt, atan2
import sys

# Récupérez les arguments de la ligne de commande
lat = float(sys.argv[1])
long = float(sys.argv[2])

locale.setlocale(locale.LC_TIME, 'fr_FR.UTF-8')
nlp = spacy.load('fr_core_news_sm')

def verifier_panneau(description):
    # Obtenez le jour actuel et l'heure actuelle

    description = description.lower()

    keywords_true = [
        "en tout temps",
        "reserve taxis",
        "livraison seulement",
        "parcometre",
        "zone de remorquage",
        "excepte vehicules munis d'un permis",
        "deux cotes"
    ]

    for keyword in keywords_true:
        if keyword in description:
            return True

    if "reserve motos" in description:
        return "MOTOS"

    if "reserve titulaires de permis" in description:
        return "PERMIS"

    now = datetime.now()
    current_day = now.strftime("%A").lower()
    current_hour = now.hour
    current_minute = now.minute
    current_month = now.month

   
    # Prétraitement du texte
    description = description.lower()
    doc = nlp(description)
    
    

    # Vérifiez les mois
    mois = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "sept", "octobre", "nov", "dec"]
    current_month = now.strftime("%B").lower()  # Get the full month name in French

    start_month = None
    end_month = None

    for token in doc:
        if token.text.lower() in mois:
            if start_month is None:
                start_month = mois.index(token.text.lower())
            else:
                end_month = mois.index(token.text.lower())

    # Si des mois sont détectés, vérifiez si le mois actuel est valide
    if start_month is not None:
        if end_month is None:
            end_month = start_month


        if current_month not in mois[start_month:end_month+1]:
            return False
    




    # Vérifiez le jour
    jours = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]
    jours_abbr = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"]  # Ajout de la version abrégée
    start_day = None
    end_day = None
    for token in doc:
        if token.text.lower() in jours:
            if start_day is None:
                start_day = jours.index(token.text.lower())
            else:
                end_day = jours.index(token.text.lower())
    # Vérifiez les versions abrégées des jours
        elif token.text.lower() in jours_abbr:
            if start_day is None:
                start_day = jours_abbr.index(token.text.lower())
            else:
                end_day = jours_abbr.index(token.text.lower())

    if start_day is None:
        return False

    if end_day is None:
        end_day = start_day


    if current_day not in jours[start_day:end_day+1]:
       return False

    # Vérifiez l'heure
    heures = []
# Utilisation d'une expression régulière pour détecter les heures et les minutes
    matches = re.findall(r'(\d{1,2}h\d{0,2})', description)
    for match in matches:
        heure_parties = match.split("h")
        heures.extend(heure_parties)
    #print("heures",heures)
     # Si aucune heure n'est trouvée, retournez True
    if not heures:
        return True

    start_hour = int(heures[0])
    start_minute = int(heures[1]) if heures[1] else 0  # Handle empty string
    end_hour = int(heures[2])
    end_minute = int(heures[3]) if heures[3] else 0  # Handle empty string


    if start_hour <= current_hour <= end_hour:
        if start_hour == current_hour and current_minute < start_minute:
            #print("Il est trop tôt.")  # Ajout pour le débogage
            return False
        if end_hour == current_hour and current_minute > end_minute:
            #print("Il est trop tard.")  # Ajout pour le débogage
            return False
        #print("L'heure actuelle est valide.")  # Ajout pour le débogage
        return True
    else:
        #print("L'heure actuelle n'est pas valide.")  # Ajout pour le débogage
        return False

# Pour tester
def calculer_distance(lat1, lon1, lat2, lon2):
    # Rayon de la Terre en m
    R = 6371000
    
    # Convertir les coordonnées de degrés en radians
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    # Calculer les changements de coordonnées
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    # Calculer la distance
    a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    distance = R * c
    
    return distance

def recuperer_descriptions_rpa_avec_coordonnees(lat_specifique, lon_specifique):
    url = "https://donnees.montreal.ca/api/3/action/datastore_search"
    params_total = {
        "resource_id": "7f1d4ae9-1a12-46d7-953e-6b9c18c78680",
        "limit": 1,
        "fields": "DESCRIPTION_RPA",
        "filters": json.dumps({
            "DESCRIPTION_REP": "Réel",
            "NOM_ARROND": "Ville-Marie"
        })
    }
    response_total = requests.get(url, params=params_total)
    total_results = response_total.json().get('result', {}).get('total', 0)

    params_derniers = {
        "resource_id": "7f1d4ae9-1a12-46d7-953e-6b9c18c78680",
        "limit": 100000,
        "fields": "DESCRIPTION_RPA, Latitude, Longitude",
        "filters": json.dumps({
            "DESCRIPTION_REP": "Réel",
            "NOM_ARROND": "Ville-Marie"
        })
    }
    response_derniers = requests.get(url, params=params_derniers)

    if response_derniers.status_code == 200:
        data = response_derniers.json()
        records = data.get('result', {}).get('records', [])
        descriptions_coordonnees = []

        for record in records:
            lat_panneau = float(record.get('Latitude'))
            lon_panneau = float(record.get('Longitude'))
            distance = calculer_distance(lat_specifique, lon_specifique, lat_panneau, lon_panneau)

            if distance <= 1000:
                description_rpa = record.get('DESCRIPTION_RPA')
                resultat_verif = verifier_panneau(description_rpa)  # Vérifier le panneau

                coordonnees = {
                    'Latitude': lat_panneau,
                    'Longitude': lon_panneau
                    }
                descriptions_coordonnees.append({
                    'Description_RPA': description_rpa,
                    'Resultat_Verification': resultat_verif,
                    'Coordonnees': coordonnees,
                    'Distance': distance
                })

        print(descriptions_coordonnees)

# Testez la fonction avec les coordonnées spécifiques
print(lat,long)
recuperer_descriptions_rpa_avec_coordonnees(lat, long)
