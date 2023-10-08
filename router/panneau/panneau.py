from flask import Flask, jsonify
import requests
import re
import datetime
import locale

locale.setlocale(locale.LC_TIME, 'fr_FR.utf8')

def convertir_date(date_str):
    mois_mapping = {
        'JAN': 1, 'FEV': 2, 'MARS': 3, 'AVRIL': 4,
        'MAI': 5, 'JUN': 6, 'JUL': 7, 'AUT': 8,
        'SEP': 9, 'OCT': 10, 'NOV': 11, 'DEC': 12
    }
    jour, mois_abbr = date_str.split()
    mois = mois_mapping.get(mois_abbr.upper(), 1)
    annee = datetime.datetime.now().year
    return datetime.datetime(annee, mois, int(jour))

def verifier_panneau(description_rpa):
    if "EN TOUT TEMPS" in description_rpa:
        # Exemple de description RPA : "Stationnement interdit en tout temps"
        return True

    if "RESERVE TAXIS" in description_rpa:
        # Exemple de description RPA : "RESERVE TAXIS"
        return True

    if "LIVRAISON SEULEMENT" in description_rpa:
        # Exemple de description RPA : "LIVRAISON SEULEMENT"
        return True

    if "PARCOMETRE" in description_rpa:
        # Exemple de description RPA : "PARCOMETRE"
        return True

    if "ZONE DE REMORQUAGE" in description_rpa:
        # Exemple de description RPA : "ZONE DE REMORQUAGE"
        return True

    if "EXCEPTE VEHICULES MUNIS D'UN PERMIS" in description_rpa:
        # Exemple de description RPA : "EXCEPTE VEHICULES MUNIS D'UN PERMIS"
        return True

    if "RESERVE MOTOS" in description_rpa:
        # Exemple de description RPA : "RESERVE MOTOS"
        return "MOTOS"

    if "RESERVE TITULAIRES DE PERMIS" in description_rpa:
        # Exemple de description RPA : "RESERVE TITULAIRES DE PERMIS"
        return "PERMIS"
    
            


    # Ajoutez ici d'autres conditions pour traiter les nouvelles descriptions RPA

    return "Description RPA non traitee : " + description_rpa  # Si aucune condition ne correspond

# Fonction pour récupérer les descriptions RPA depuis l'API avec les coordonnées
def recuperer_descriptions_rpa_avec_coordonnees():
    url = "https://donnees.montreal.ca/api/3/action/datastore_search?resource_id=7f1d4ae9-1a12-46d7-953e-6b9c18c78680&limit=1000"
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        records = data.get('result', {}).get('records', [])
        descriptions_coordonnees = []

        for record in records:
            description_rpa = record.get('DESCRIPTION_RPA')
            resultat_verif = verifier_panneau(description_rpa)
            description_rep = record.get('DESCRIPTION_REP')  # Récupérez la valeur de DESCRIPTION_REP

            # Ajoutez une condition pour exclure les panneaux ayant DESCRIPTION_REP égal à "Enlevé"
            if description_rep != "Enlevé":
                coordonnees = {
                    'Latitude': record.get('Latitude'),
                    'Longitude': record.get('Longitude')
                }
                descriptions_coordonnees.append({
                    'Description_RPA': description_rpa,
                    'Resultat_Verification': resultat_verif,
                    'Coordonnees': coordonnees
                })

        print(descriptions_coordonnees)
    else:
        print(f"La demande a échoué avec le code d'état {response.status_code}")
        return []


recuperer_descriptions_rpa_avec_coordonnees()

