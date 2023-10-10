const express = require("express");
const axios = require("axios");
const router = express.Router();

// Configuration pour gérer les dates en français
/*
const locale = require("os-locale");
const osLocale = locale.sync();
const moment = require("moment");
moment.locale(osLocale);
*/
// Fonction pour convertir une date au format "jour mois" en objet JavaScript Date
/*function convertirDate(dateStr) {
    const moisMapping = {
        "JAN": 0, "FEV": 1, "MARS": 2, "AVRIL": 3,
        "MAI": 4, "JUN": 5, "JUL": 6, "AUT": 7,
        "SEP": 8, "OCT": 9, "NOV": 10, "DEC": 11
    };

    const [jour, moisAbbr] = dateStr.split(" ");
    const mois = moisMapping[moisAbbr.toUpperCase()] || 0;
    const annee = new Date().getFullYear();
    return new Date(annee, mois, parseInt(jour));
}
*/
// Fonction pour vérifier les panneaux RPA
function verifierPanneau(descriptionRpa) {
    if (descriptionRpa.includes("EN TOUT TEMPS")) {
        // Exemple de description RPA : "Stationnement interdit en tout temps"
        return true;
    }

    if (descriptionRpa.includes("RESERVE TAXIS")) {
        // Exemple de description RPA : "RESERVE TAXIS"
        return true;
    }

    if (descriptionRpa.includes("LIVRAISON SEULEMENT")) {
        // Exemple de description RPA : "LIVRAISON SEULEMENT"
        return true;
    }

    if (descriptionRpa.includes("PARCOMETRE")) {
        // Exemple de description RPA : "PARCOMETRE"
        return true;
    }

    if (descriptionRpa.includes("ZONE DE REMORQUAGE")) {
        // Exemple de description RPA : "ZONE DE REMORQUAGE"
        return true;
    }

    if (descriptionRpa.includes("EXCEPTE VEHICULES MUNIS D'UN PERMIS")) {
        // Exemple de description RPA : "EXCEPTE VEHICULES MUNIS D'UN PERMIS"
        return true;
    }

    if (descriptionRpa.includes("RESERVE MOTOS")) {
        // Exemple de description RPA : "RESERVE MOTOS"
        return "MOTOS";
    }

    if (descriptionRpa.includes("RESERVE TITULAIRES DE PERMIS")) {
        // Exemple de description RPA : "RESERVE TITULAIRES DE PERMIS"
        return "PERMIS";
    }

    // Ajoutez ici d'autres conditions pour traiter les nouvelles descriptions RPA

    return "Description RPA non traitée : " + descriptionRpa; // Si aucune condition ne correspond
}

// Fonction pour récupérer les descriptions RPA depuis l'API avec les coordonnées
async function recupererDescriptionsRpaAvecCoordonnees() {
    const url = "https://donnees.montreal.ca/api/3/action/datastore_search?resource_id=7f1d4ae9-1a12-46d7-953e-6b9c18c78680&limit=1000000";
    try {
        const response = await axios.get(url);
        const data = response.data;
        const records = data.result.records;
        const descriptionsCoordonnees = [];

        for (const record of records) {
            const descriptionRpa = record.DESCRIPTION_RPA;
            const resultatVerif = verifierPanneau(descriptionRpa);
            const descriptionRep = record.DESCRIPTION_REP;

            if (descriptionRep !== "Enlevé") {
                const coordonnees = {
                    "Latitude": record.Latitude,
                    "Longitude": record.Longitude
                };
                descriptionsCoordonnees.push({
                    "Description_RPA": descriptionRpa,
                    "Resultat_Verification": resultatVerif,
                    "Coordonnees": coordonnees
                });
            }
        }

        return descriptionsCoordonnees; // Retourne la liste complète
    } catch (error) {
        console.error(`La demande a échoué avec le code d'état ${error.response.status}`);
        return []; // Retourne une liste vide en cas d'échec
    }
}

// Route pour obtenir les descriptions RPA avec coordonnées
router.get("/", async (req, res) => {
    const descriptions = await recupererDescriptionsRpaAvecCoordonnees();
    res.json(descriptions);
});

module.exports = router;