const express = require("express");
const db = require("../../modules/db");

const router = express.Router();

/*
 * Pour tester:
 * curl -H "Authorization: Bearer TOKEN" http://localhost:3000/user
 */
router.get("/", async (request, response) => {
    try {
        
        const user = await db("utilisateur")
            .where("userID", request.user.userID)
            .first();
        if (!user) {
            return response.status(404)
                .json({ message: "Utilisateur inconnu." });
        }
        const userDetails = {
                userID: user.userID,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                mdp: user.mdp,
                number: user.number,
                //pfp: user.pfp,
                lat: user.lat,
                long: user.long
        };
        return response.status(200)
            .json(userDetails);
    } catch (e) {
        console.log(e.message);
        return response.status(400)
            .json({ message: e.message });
    }
});
/*
 * Pour tester:
 * curl -H "Authorization: Bearer TOKEN" http://localhost:3000/user/modifUser
 */
                                    // MODIFIER UN UTILISATEUR
router.put("/modifUser", async (request, response) => {
    try {
        const userID = request.user.userID; // Récupérez l'ID de l'utilisateur à partir du token
        const updatedUserData = request.body; // Les nouvelles données de l'utilisateur

        // Mettez à jour les informations de l'utilisateur dans la base de données
        const updatedUser = await db("utilisateur")
            .where("userID", userID)
            .update(updatedUserData);

        if (!updatedUser) {
            return response.status(404)
                .json({ message: "Utilisateur non trouvé." });
        }

        // Renvoyez les données mises à jour de l'utilisateur si nécessaire
        const userDetails = {
            userID: userID,
            nom: updatedUserData.nom,
            prenom: updatedUserData.prenom,
            email: updatedUserData.email,
            mdp: updatedUserData.mdp,
            number: updatedUserData.number,
            //pfp: updatedUserData.pfp,
            lat: updatedUserData.lat,
            long: updatedUserData.long
        };

        return response.status(200)
            .json({ message: "Utilisateur mis à jour avec succès.", user: userDetails });
    } catch (e) {
        console.error(e.message);
        return response.status(400)
            .json({ message: "Erreur lors de la mise à jour de l'utilisateur." });
    }
});
/*
 * Pour tester:
 * curl -H "Authorization: Bearer TOKEN" http://localhost:3000/user/delUser
 */

// Supprimer un Utilisateur


router.delete("/delUser", async (request, response) => {
    try {
        const userID = request.user.userID; // Récupérez l'ID de l'utilisateur à partir du token

        // Supprimez l'utilisateur de la base de données
        const deletedUser = await db("utilisateur")
            .where("userID", userID)
            .del();

        if (!deletedUser) {
            return response.status(404)
                .json({ message: "Utilisateur non trouvé." });
        }

        return response.status(200)
            .json({ message: "Utilisateur supprimé avec succès." });
    } catch (e) {
        console.error(e.message);
        return response.status(400)
            .json({ message: "Erreur lors de la suppression de l'utilisateur." });
    }
});

module.exports = router;
