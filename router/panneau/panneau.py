import spacy
from datetime import datetime
import locale
import re
import requests

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
def recuperer_descriptions_rpa_avec_coordonnees():
    url = "https://donnees.montreal.ca/api/3/action/datastore_search?resource_id=7f1d4ae9-1a12-46d7-953e-6b9c18c78680&limit=1000"
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        records = data.get('result', {}).get('records', [])
        descriptions_coordonnees = []

        for record in records:
            description_rpa = record.get('DESCRIPTION_RPA')
            description_rep = record.get('DESCRIPTION_REP')

            if description_rep != "Enlevé":  # vérifier que le panneau n'est pas "Enlevé"
                resultat_verif = verifier_panneau(description_rpa)  # Vérifier le panneau

                coordonnees = {
                    'Latitude': record.get('Latitude'),
                    'Longitude': record.get('Longitude')
                }
                descriptions_coordonnees.append({
                    'Description_RPA': description_rpa,
                    'Resultat_Verification': resultat_verif,
                    'Coordonnees': coordonnees
                })

        return descriptions_coordonnees


# Testez la fonction
print(recuperer_descriptions_rpa_avec_coordonnees())
