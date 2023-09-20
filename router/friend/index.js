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
        const userID = request.user.userID;
        const friendID = parseInt(request.params.friendID);

        // Vérifier si l'ami existe dans la liste d'amis de l'utilisateur
        const amiExiste = await db("friendship")
            .where(function () {
                this.where("userID", userID).andWhere("friendID", friendID);
            })
            .orWhere(function () {
                this.where("userID", friendID).andWhere("friendID", userID);
            })
            .first();

        if (!amiExiste) {
            return response.status(404).json({ message: "Ami introuvable." });
        }

        // Supprimer l'ami de la liste d'amis de l'utilisateur
        await db("friendship")
            .where(function () {
                this.where("userID", userID).andWhere("friendID", friendID);
            })
            .orWhere(function () {
                this.where("userID", friendID).andWhere("friendID", userID);
            })
            .del();

        return response.status(200).json({ message: "Ami supprimé avec succès." });
    } catch (e) {
        console.error(e.message);
        return response.status(500).json({ message: "Erreur serveur lors de la suppression de l'ami." });
    }
});

// Demamande Damis recu

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

        // Démarrer une transaction pour assurer la cohérence entre les opérations
        await db.transaction(async (trx) => {
            // Mettre à jour l'état de la demande d'ami à "acceptée"
            await trx("demandeAmis")
                .where("demandeID", demandeID)
                .update({ etat: "acceptée" });

            // Supprimer la demande d'ami une fois qu'elle est acceptée
             await db("demandeAmis")
            .where("demandeID", demandeID)
            .del();

            // Ajouter l'expéditeur de la demande en tant qu'ami dans la table "friendship"
            await trx("friendship").insert([
                { userID: destinataireID, friendID: demandeAmi.expediteurID },
                { userID: demandeAmi.expediteurID, friendID: destinataireID }
            ]);
        });

        return response.status(200).json({ message: "Demande d'ami acceptée avec succès." });
    } catch (e) {
        console.error(e.message);
        return response.status(500).json({ message: "Erreur serveur lors de l'acceptation de la demande d'ami." });
    }
});
/*
 * Pour supprimer une demande d'ami :
 * curl -X DELETE -H "Authorization: Bearer VOTRE_TOKEN" http://localhost:3000/demande-ami/:demandeID
 */

router.delete("/demande-ami/:demandeID", authMiddleware, async (request, response) => {
    try {
        const destinataireID = request.user.userID;
        const demandeID = parseInt(request.params.demandeID);

        // Vérifier si la demande d'ami existe et si le destinataire correspond à l'utilisateur actuel
        const demandeAmi = await db("demandeAmis")
            .where("demandeID", demandeID)
            .andWhere("destinataireID", destinataireID)
            .first();

        if (!demandeAmi) {
            return response.status(404).json({ message: "Demande d'ami introuvable ou non éligible pour suppression." });
        }

        // Supprimer la demande d'ami de la base de données
        await db("demandeAmis")
            .where("demandeID", demandeID)
            .del();

        return response.status(200).json({ message: "Demande d'ami supprimée avec succès." });
    } catch (e) {
        console.error(e.message);
        return response.status(500).json({ message: "Erreur serveur lors de la suppression de la demande d'ami." });
    }
});
// demande damis envoyer
router.get("/demandes-envoyees", authMiddleware, async (request, response) => {
    try {
        const expediteurID = request.user.userID;

        // Récupérer les demandes d'amis envoyées par l'utilisateur
        const demandesEnvoyees = await db("demandeAmis")
            .where("expediteurID", expediteurID)
            .select("demandeID", "destinataireID", "etat", "date_demande");

        return response.status(200).json(demandesEnvoyees);
    } catch (e) {
        console.error(e.message);
        return response.status(500).json({ message: "Erreur serveur lors de la récupération des demandes envoyées." });
    }
});

// delete demander envoyee 
router.delete("/demandes-envoyees/:demandeID", authMiddleware, async (request, response) => {
    try {
        const expediteurID = request.user.userID;
        const demandeID = parseInt(request.params.demandeID);

        // Vérifier si la demande d'ami existe et si l'expéditeur correspond à l'utilisateur actuel
        const demandeEnvoyee = await db("demandeAmis")
            .where("demandeID", demandeID)
            .andWhere("expediteurID", expediteurID)
            .first();

        if (!demandeEnvoyee) {
            return response.status(404).json({ message: "Demande d'ami envoyée introuvable ou non éligible pour suppression." });
        }

        // Supprimer la demande d'ami envoyée de la base de données
        await db("demandeAmis")
            .where("demandeID", demandeID)
            .del();

        return response.status(200).json({ message: "Demande d'ami envoyée supprimée avec succès." });
    } catch (e) {
        console.error(e.message);
        return response.status(500).json({ message: "Erreur serveur lors de la suppression de la demande d'ami envoyée." });
    }
});

module.exports = router;