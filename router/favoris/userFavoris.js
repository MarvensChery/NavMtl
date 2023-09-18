const express = require("express");
const db = require("../../modules/db");
const authMiddleware = require("../../modules/auth-middleware");
const router = express.Router();


/*
 * Pour tester:
 * curl -H "Authorization: Bearer TOKEN" http://localhost:3000/favoris
 */

router.get("/", authMiddleware, async (request, response) => {
    try {
        
        const favoris = await db("favoris")
            .where("userID", request.user.userID);
        if (!favoris) {
            return response.status(404)
                .json({ message: "Pas de Favoris" });
        }
        const favori = favoris.map((f) => ({
            favorisID: f.favorisID,
            userID: f.userID,
            titre: f.titre,
            addresse: f.addresse
        }));
        return response.status(200)
            .json(favori);
    } catch (e) {
        console.log(e.message);
        return response.status(400)
            .json({ message: e.message });
    }
});


/*
 * Pour tester:
 * curl -X DELETE -H "Authorization: Bearer VOTRE_TOKEN" http://localhost:3000/favoris/IDfavoris
 */

router.delete("/:favorisID", authMiddleware, async (request, response) => {
    try {
        const { favorisID } = request.params;

        // Vérifiez si le favori appartient à l'utilisateur actuel en utilisant userID et favorisID
        const favori = await db("favoris")
            .where("userID", request.user.userID)
            .where("favorisID", favorisID)
            .first();

        if (!favori) {
            return response.status(404).json({ message: "Favori non trouvé" });
        }

        // Supprimez le favori de la base de données
        await db("favoris")
            .where("favorisID", favorisID)
            .del();

        return response.status(200).json({ message: "Favori supprimé avec succès" });
    } catch (e) {
        console.error(e.message);
        return response.status(500).json({ message: "Erreur lors de la suppression du favori" });
    }
});

router.put("/:favorisID",authMiddleware, async (request, response) => {
    try {
        const userID = request.user.userID; // Récupérez l'ID de l'utilisateur à partir du token
        const updatedUserData = request.body; // Les nouvelles données de l'utilisateur
        const { favorisID } = request.params;
        // Mettez à jour les informations de l'utilisateur dans la base de données
        const updatedFavoris = await db("favoris")
            .where("userID", userID)
            .where("favorisID", favorisID)
            .update(updatedUserData);

        if (!updatedFavoris) {
            return response.status(404)
                .json({ message: "Favoris non trouvé." });
        }

        // Renvoyez les données mises à jour de l'utilisateur si nécessaire
        const userDetails = {
            addresse: updatedUserData.addresse,
            titre: updatedUserData.titre,
           
        };
        return response.status(200)
            .json({ message: "Favoris mis à jour avec succès.", user: userDetails });
    } catch (e) {
        console.error(e.message);
        return response.status(400)
            .json({ message: "Erreur lors de la mise à jour du Favoris." });
    }
});
router.post("/", authMiddleware, async (request, response) => {
    try {
        const userID = request.user.userID; // Récupérez l'ID de l'utilisateur à partir du token
        const { titre, addresse } = request.body; // Les données du nouveau favori à créer

        // Insérez le nouveau favori dans la base de données
        const newFavori = await db("favoris").insert({
            userID,
            titre,
            addresse
        });

        if (!newFavori) {
            return response.status(500).json({ message: "Erreur lors de la création du favori" });
        }

        return response.status(201).json({ message: "Favori créé avec succès" });
    } catch (e) {
        console.error(e.message);
        return response.status(400).json({ message: "Erreur lors de la création du favori" });
    }
});


module.exports = router;