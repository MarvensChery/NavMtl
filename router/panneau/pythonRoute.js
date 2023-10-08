const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");

// Définissez la route asynchrone pour exécuter le script Python
router.get("/", async (req, res) => {
  try {
    // Exécutez le script Python en tant que sous-processus
    const pythonProcess = spawn("python", ["router/panneau/panneau.py"]);

    // Créez une promesse pour attendre que le processus Python se termine
    const promise = new Promise((resolve, reject) => {
      pythonProcess.on("error", (error) => {
        console.error("Erreur lors de l'exécution du script Python :", error);
        reject(error);
      });

      pythonProcess.stdout.on("data", (data) => {
        resolve(data.toString());
      });

      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          reject(`Le script Python s'est terminé avec le code de sortie ${code}`);
        }
      });
    });

    // Attendez que la promesse se résolve et renvoyez les données en réponse
    const result = await promise;
    res.send(result);
  } catch (error) {
    res.status(500).send("Erreur lors de l'exécution du script Python.");
  }
});

module.exports = router;

