const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../../modules/db");

const router = express.Router();

const secret = "dgjkgevuyetggvdghdfhegchgjdg,dvbmdghkdvghmdvhmshmg";

/*
** pour Test
{
  "nom": "nom",
  "prenom": "prenom",
  "email": "email.smith@email.com",
  "mdp": "mdpsecret123",
  "number": 5149996666
}
** http://localhost:3000/inscription
*/

// Route pour créer un nouvel utilisateur
router.post("/", async (request, response) => {
    try {
        const {
            nom,
            prenom,
            email,
            mdp,
            number,
        
        } = request.body;

        // Vérifier si l'utilisateur existe déjà avec le même email
        const existingUser = await db("utilisateur")
            .where("email", email)
            .first();
        
        if (existingUser) {
            return response.status(400)
                .json({ message: "Cet email est déjà utilisé par un autre utilisateur." });
        }

        // Hacher le mot de passe avant de le stocker
        const hashedPassword = await bcrypt.hash(mdp, 10);

        // Insérer le nouvel utilisateur dans la base de données
        const newUser = await db("utilisateur").insert({
            nom,
            prenom,
            email,
            mdp: hashedPassword,
            number,
            
        }).returning("*");

        if (newUser.length === 0) {
            return response.status(500)
                .json({ message: "Erreur lors de la création de l'utilisateur." });
        }

        // définir les informations à encoder dans le jeton
        const claims = {
            userId: newUser[0].userId,
            email: newUser[0].email,
        };

        // Créer le token pour le nouvel utilisateur
        const token = jwt.sign(claims, secret);

        return response.status(201)
            .json({ message: "Utilisateur inscrit avec succès.", token });
    } catch (e) {
        return response.status(400).json({ message: e.message });
    }
});

module.exports = router;