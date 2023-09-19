const express = require("express");
const db = require("../../modules/db");
const authMiddleware = require("../../modules/auth-middleware");
const router = express.Router();


/*
 * Pour tester:
 * curl -H "Authorization: Bearer TOKEN" http://localhost:3000/friend
 */

router.get("/", authMiddleware, async (request, response) => {
    try {
        const friends = await db("friendship as fs")
            .join("friend as f", "fs.friendID", "f.friendID")
            .where("fs.userID", request.user.userID)
            .select("f.nom as ami_nom", "f.prenom as ami_prenom", "f.lat", "f.long");

        if (!friends || friends.length === 0) {
            return response.status(404).json({ message: "Pas d'amis trouvés." });
        }

        return response.status(200).json(friends);
    } catch (e) {
        console.log(e.message);
        return response.status(400).json({ message: e.message });
    }
});

/*
 * Pour tester:
 * curl -X DELETE -H "Authorization: Bearer VOTRE_TOKEN" http://localhost:3000/friend/friendID
 */

router.delete("/:friendID", authMiddleware, async (request, response) => {
    try {
        const friendID = parseInt(request.params.friendID);

        // Vérifier si l'ami existe dans le résultat de la requête
        const friendToDelete = await db("friendship as fs")
            .join("friend as f", "fs.friendID", "f.friendID")
            .where("fs.userID", request.user.userID)
            .andWhere("f.friendID", friendID)
            .first();

        if (!friendToDelete) {
            return response.status(404).json({ message: "Ami introuvable dans la liste de vos amis." });
        }

        // Supprimer l'ami de la base de données
        await db("friendship")
            .where("friendID", friendID)
            .andWhere("userID", request.user.userID)
            .del();

        return response.status(200).json({ message: "Ami supprimé avec succès." });
    } catch (e) {
        console.log(e.message);
        return response.status(500).json({ message: "Erreur serveur lors de la suppression de l'ami." });
    }
});

// Demamande Damis

router.get("/demandes-en-attente", authMiddleware, async (request, response) => {
    try {
        const destinataireID = request.user.userID;

        // Récupérer les demandes d'amis en attente pour l'utilisateur actuel
        const demandesEnAttente = await db("demandeAmis as da")
            .join("utilisateur as u", "da.expediteurID", "u.userID")
            .where("da.destinataireID", destinataireID)
            .andWhere("da.etat", "en attente")
            .select("u.nom", "u.prenom");

        return response.status(200).json(demandesEnAttente);
    } catch (e) {
        console.error(e.message);
        return response.status(500).json({ message: "Erreur serveur lors de la récupération des demandes d'amis en attente." });
    }
});


// envoyer une demande damis

router.post("/demande-ami/:destinataireID", authMiddleware, async (request, response) => {
    try {
        const expediteurID = request.user.userID;
        const destinataireID = parseInt(request.params.destinataireID);

        // Vérifier si la demande d'ami existe déjà
        const demandeExistante = await db("demandeAmis")
            .where("expediteurID", expediteurID)
            .andWhere("destinataireID", destinataireID)
            .first();

        if (demandeExistante) {
            return response.status(400).json({ message: "Une demande d'ami similaire existe déjà." });
        }

        // Créer une nouvelle demande d'ami
        await db("demandeAmis").insert({
            expediteurID,
            destinataireID,
            etat: "en attente", // L'état initial est "en attente", vous pouvez personnaliser les états selon vos besoins
            date_demande: new Date(),
        });

        return response.status(201).json({ message: "Demande d'ami envoyée avec succès." });
    } catch (e) {
        console.error(e.message);
        return response.status(500).json({ message: "Erreur serveur lors de l'envoi de la demande d'ami." });
    }
});

// accepter une demande dami 
router.post("/accepter-demande-ami/:demandeID", authMiddleware, async (request, response) => {
    try {
        const destinataireID = request.user.userID;
        const demandeID = parseInt(request.params.demandeID);

        // Vérifier si la demande d'ami existe et si le destinataire correspond à l'utilisateur actuel
        const demandeAmi = await db("demandeAmis")
            .where("demandeID", demandeID)
            .andWhere("destinataireID", destinataireID)
            .first();

        if (!demandeAmi || demandeAmi.etat !== "en attente") {
            return response.status(404).json({ message: "Demande d'ami introuvable ou non éligible pour acceptation." });
        }

        // Mettre à jour l'état de la demande d'ami à "acceptée"
        await db("demandeAmis")
            .where("demandeID", demandeID)
            .update({ etat: "acceptée" });

        // Vous pouvez également ajouter l'expéditeur de la demande en tant qu'ami dans la table "friendship" ici

        return response.status(200).json({ message: "Demande d'ami acceptée avec succès." });
    } catch (e) {
        console.error(e.message);
        return response.status(500).json({ message: "Erreur serveur lors de l'acceptation de la demande d'ami." });
    }
});

module.exports = router;