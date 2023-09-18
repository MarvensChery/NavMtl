const express = require("express");
const db = require("../../modules/db");
const authMiddleware = require("../../modules/auth-middleware");
const router = express.Router();


/*
 * Pour tester:
 * curl -H "Authorization: Bearer TOKEN" http://localhost:3000/alerte
 */

router.get("/", authMiddleware, async (request, response) => {
    try {
        
        const alerte = await db("alerte")
            .where("userID", request.user.userID);
        if (!alerte) {
            return response.status(404)
                .json({ message: "Pas d<alerte" });
        }
        const params = alerte.map((p) => ({
            alerteID: p.alerteID,
            userID: p.userID,
            contenu: p.contenu,
            temps: p.temps,
            lu: p.lu
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
 * curl -X DELETE -H "Authorization: Bearer VOTRE_TOKEN" http://localhost:3000/alerte/alerteID
 */

router.delete("/:alerteID", authMiddleware, async (request, response) => {
    try {
        const { alerteID } = request.params;

        // Vérifiez si le favori appartient à l'utilisateur actuel en utilisant userID et favorisID
        const alerte = await db("alerte")
            .where("userID", request.user.userID)
            .where("alerteID", alerteID)
            .first();

        if (!alerte) {
            return response.status(404).json({ message: "alerte non trouvé" });
        }

        // Supprimez le favori de la base de données
        await db("alerte")
            .where("alerteID", alerteID)
            .del();

        return response.status(200).json({ message: "alerte supprimé avec succès" });
    } catch (e) {
        console.error(e.message);
        return response.status(500).json({ message: "Erreur lors de la suppression du alerte" });
    }
});

router.put("/:alerteID",authMiddleware, async (request, response) => {
    try {
        const userID = request.user.userID; // Récupérez l'ID de l'utilisateur à partir du token
        const updatedUserData = request.body; // Les nouvelles données de l'utilisateur
        const { alerteID } = request.params;
        // Mettez à jour les informations de l'utilisateur dans la base de données
        const updatedAlerte = await db("alerte")
            .where("userID", userID)
            .where("alerteID", alerteID)
            .update(updatedUserData);

        if (!updatedAlerte) {
            return response.status(404)
                .json({ message: "alerte non trouvé." });
        }

        // Renvoyez les données mises à jour de l'utilisateur si nécessaire
        const userDetails = {
            contenu: updatedUserData.contenu,
            temps: updatedUserData.temps,
            lu: updatedUserData.lu,
           
        };
        return response.status(200)
            .json({ message: "alerte mis à jour avec succès.", user: userDetails });
    } catch (e) {
        console.error(e.message);
        return response.status(400)
            .json({ message: "Erreur lors de la mise à jour du alerte." });
    }
});
router.post("/", authMiddleware, async (request, response) => {
    try {
        const userID = request.user.userID; // Récupérez l'ID de l'utilisateur à partir du token
        const { contenu, temps, lu } = request.body; // Les données du nouveau favori à créer

        // Insérez le nouveau favori dans la base de données
        const newFavori = await db("alerte").insert({
            userID,
            contenu,
            temps,
            lu
        });

        if (!newFavori) {
            return response.status(500).json({ message: "Erreur lors de la création du alerte" });
        }

        return response.status(201).json({ message: "alerte créé avec succès" });
    } catch (e) {
        console.error(e.message);
        return response.status(400).json({ message: "Erreur lors de la création du alerte" });
    }
});


module.exports = router;