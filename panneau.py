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
        return "Vous n'avez pas le droit de vous garer en tout temps."

    if re.match(r'\\P \d{1,2}h-\d{1,2}h [A-ZÉ]+', description_rpa):
        return "Vous avez le droit de vous garer."

    if re.match(r'\\P RESERVE TAXIS', description_rpa):
        return "Vous avez le droit de vous garer pour les taxis."

    if re.match(r'\\P LIVRAISON SEULEMENT \d{1,2}h-\d{1,2}h [A-ZÉ]+ AU [A-ZÉ]+', description_rpa):
        return "Vous avez le droit de vous garer pour la livraison pendant les heures spécifiées."

    if re.match(r'\\P \d{1,2}h\d{1,2}-\d{1,2}h\d{1,2} [A-ZÉ]+', description_rpa):
        return "Vous avez le droit de vous garer pendant les heures spécifiées."

    if re.match(r'\\A \d{1,2}h-\d{1,2}h\d{1,2} LUN\. AU VEN.', description_rpa):
        return "Vous avez le droit de vous garer pendant les heures spécifiées du lundi au vendredi."

    if re.match(r'P \d+ min \d{1,2}h-\d{1,2}h [A-ZÉ]+', description_rpa):
        return "Vous avez le droit de vous garer pour une durée limitée pendant les heures spécifiées."

    if re.match(r'\\P RESERVE S3R \d{1,2}h-\d{1,2}h', description_rpa):
        return "Vous avez le droit de vous garer dans la zone réservée S3R pendant les heures spécifiées."

    if "LIVRAISON SEULEMENT" in description_rpa:
        return "Vous avez le droit de vous garer pour la livraison pendant les heures spécifiées."

    if "PARCOMETRE" in description_rpa:
        return "Vous devez payer au parcomètre pour vous garer."

    if "ZONE DE REMORQUAGE" in description_rpa:
        return "Il s'agit d'une zone de remorquage, le stationnement est interdit."

    if re.match(r'\\A \d{1,2}h-\d{1,2}h\d{1,2} LUN\. AU VEN.', description_rpa):
        return "Vous avez le droit de vous garer pendant les heures spécifiées du lundi au vendredi."

    if "EXCEPTE VEHICULES MUNIS D'UN PERMIS" in description_rpa:
        return "Sauf véhicules munis d'un permis, le stationnement est interdit."

    if "RESERVE MOTOS" in description_rpa:
        return "Le stationnement est réservé aux motos."

    if "RESERVE TITULAIRES DE PERMIS" in description_rpa:
        return "Le stationnement est réservé aux titulaires de permis."

    # Ajoutez ici d'autres conditions pour traiter les nouvelles descriptions RPA

    return "Description RPA non traitée : " + description_rpa  # Si aucune condition ne correspond

# Fonction pour récupérer les descriptions RPA depuis l'API avec les coordonnées
def recuperer_descriptions_rpa_avec_coordonnees():
    url = "https://donnees.montreal.ca/api/3/action/datastore_search?resource_id=7f1d4ae9-1a12-46d7-953e-6b9c18c78680&limit=1000000"
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

        return descriptions_coordonnees
    else:
        print(f"La demande a échoué avec le code d'état {response.status_code}")
        return []


# Configuration de Flask
app = Flask(__name__)

# Route pour obtenir les descriptions RPA avec coordonnées
@app.route('/api/descriptions_rpa_avec_coordonnees', methods=['GET'])
def get_descriptions_rpa_avec_coordonnees():
    descriptions = recuperer_descriptions_rpa_avec_coordonnees()
    return jsonify(descriptions)

if __name__ == '__main__':
    app.run(debug=True)

