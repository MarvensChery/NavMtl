const express = require("express");
const db = require("../../modules/db");
const authMiddleware = require("../../modules/auth-middleware");

const router = express.Router();

/*
 * Pour tester:
 * curl -H http://localhost:3000/history
 */

router.get("/", async (request, response) => {
    try {
        const history = await db("history");
        if (!history) {
            return response.status(404)
                .json({ message: "Aucun history" });
        }
        const data = history.map((e) => ({
            historyID: e.userID,
            addresse: e.email,
        }));
        return response.status(200)
            .json(data);
    } catch (error) {
        console.log(error.message);
        return response.status(400)
            .json({ message: error.message });
    }
});

router.post("/", authMiddleware, async (request, response) => {
    try {
        const userID = request.user.userID;
        const { addresse } = request.body;
        const history = await db("history")
            .where("userID", userID)
            .andWhere("addresse", addresse)
            .first();
        if (history) {
            return response.status(400)
                .json({ message: "history déjà existant." });
        }
        const newHistory = await db("history")
            .insert({
                userID,
                addresse,
            });
            if (!newHistory) {
                return response.status(400)
                    .json({ message: "Erreur lors de la création du history." });
            }
            return response.status(200)
                .json({ message: "history créé." });
    } catch (error) {
        console.log(error.message);
        return response.status(400)
            .json({ message: error.message });
    }
});

router.delete("/:historyID", authMiddleware, async (request, response) => {
    try {
        const historyID = request.params.historyID;
        const history = await db("history")
            .where("historyID", historyID);
        if (!history) {
            return response.status(404)
                .json({ message: "history inconnu." });
        }
        await db("history")
            .where("historyID", historyID)
            .del();
        return response.status(200)
            .json({ message: "history supprimé." });
    } catch (error) {
        console.log(error.message);
        return response.status(400)
            .json({ message: error.message });
    }
});

module.exports = router;