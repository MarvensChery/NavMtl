const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../../modules/db");
const {check, validationResult} = require("express-validator");

const router = express.Router();

const secret = "dgjkgevuyetggvdghdfhegchgjdg,dvbmdghkdvghmdvhmshmg";

const userValidationRules = [
    check("nom").not().isEmpty().isLength({ min: 2, max: 25 }),
    check("prenom").not().isEmpty().isLength({ min: 2, max: 25 }),
    check("email").isEmail(),
    check("mdp").isLength({ min: 6 }),
    check("number").isLength({ min: 10, max: 10 }),
];
// Route pour créer un nouvel utilisateur
router.post("/", userValidationRules, async (request, response) => {
    try {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }

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
            userID: newUser[0].userID,
            email: newUser[0].email,
        };
         // Insérer l'ami associé dans la table "friend"
          await db("friend").insert({
            nom: nom,
            prenom: prenom
        });
        
        // Créer le token pour le nouvel utilisateur
        const token = jwt.sign(claims, secret);

        return response.status(201)
            .json({ message: "Utilisateur inscrit avec succès.", token });
    } catch (e) {
        return response.status(400).json({ message: e.message });
    }
});

module.exports = router;