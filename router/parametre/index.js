const express = require("express");
const db = require("../../modules/db");
const authMiddleware = require("../../modules/auth-middleware");
const router = express.Router();


/*
 * Pour tester:
 * curl -H "Authorization: Bearer TOKEN" http://localhost:3000/parametre
 */

router.get("/", authMiddleware, async (request, response) => {
    try {
        
        const parametre = await db("parametre")
            .where("userID", request.user.userID);
        if (!parametre) {
            return response.status(404)
                .json({ message: "Pas de parametre" });
        }
        const params = parametre.map((p) => ({
            parametreID: p.parametreID,
            userID: p.userID,
            parametre: p.parametre,
            valeur: p.valeur
        }));
        return response.status(200)
            .json(params);
    } catch (e) {
        console.log(e.message);
        return response.status(400)
            .json({ message: e.message });
    }
});


/*
 * Pour tester:
 * curl -X DELETE -H "Authorization: Bearer VOTRE_TOKEN" http://localhost:3000/parametre/parametreID
 */

router.delete("/:parametreID", authMiddleware, async (request, response) => {
    try {
        const { parametreID } = request.params;

        // Vérifiez si le favori appartient à l'utilisateur actuel en utilisant userID et favorisID
        const parametre = await db("parametre")
            .where("userID", request.user.userID)
            .where("parametreID", parametreID)
            .first();

        if (!parametre) {
            return response.status(404).json({ message: "parametre non trouvé" });
        }

        // Supprimez le favori de la base de données
        await db("parametre")
            .where("parametreID", parametreID)
            .del();

        return response.status(200).json({ message: "parametre supprimé avec succès" });
    } catch (e) {
        console.error(e.message);
        return response.status(500).json({ message: "Erreur lors de la suppression du parametre" });
    }
});

router.put("/:parametreID",authMiddleware, async (request, response) => {
    try {
        const userID = request.user.userID; // Récupérez l'ID de l'utilisateur à partir du token
        const updatedUserData = request.body; // Les nouvelles données de l'utilisateur
        const { parametreID } = request.params;
        // Mettez à jour les informations de l'utilisateur dans la base de données
        const updatedParametre = await db("parametre")
            .where("userID", userID)
            .where("parametreID", parametreID)
            .update(updatedUserData);

        if (!updatedParametre) {
            return response.status(404)
                .json({ message: "parametre non trouvé." });
        }

        // Renvoyez les données mises à jour de l'utilisateur si nécessaire
        const userDetails = {
            parametre: updatedUserData.parametre,
            valeur: updatedUserData.valeur,
           
        };
        return response.status(200)
            .json({ message: "parametre mis à jour avec succès.", user: userDetails });
    } catch (e) {
        console.error(e.message);
        return response.status(400)
            .json({ message: "Erreur lors de la mise à jour du parametre." });
    }
});
router.post("/", authMiddleware, async (request, response) => {
    try {
        const userID = request.user.userID; // Récupérez l'ID de l'utilisateur à partir du token
        const { parametre, valeur } = request.body; // Les données du nouveau favori à créer

        // Insérez le nouveau favori dans la base de données
        const newFavori = await db("parametre").insert({
            userID,
            parametre,
            valeur
        });

        if (!newFavori) {
            return response.status(500).json({ message: "Erreur lors de la création du parametre" });
        }

        return response.status(201).json({ message: "parametre créé avec succès" });
    } catch (e) {
        console.error(e.message);
        return response.status(400).json({ message: "Erreur lors de la création du parametre" });
    }
});


module.exports = router;