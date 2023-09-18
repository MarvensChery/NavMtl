const express = require("express");
const db = require("../../modules/db");

const router = express.Router();

/*
 * Pour tester:
 * curl -H http://localhost:3000/favoris
 */
router.get("/", async (request, response) => {
    try {
        const favoris = await db("favoris");
        if (!favoris) {
            return response.status(404)
                .json({ message: "Aucun Favoris" });
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

module.exports = router;