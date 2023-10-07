const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");

// Définissez la route pour exécuter le script Python
router.get("/python-route", (req, res) => {
  // Exécutez le script Python en tant que sous-processus
  const pythonProcess = spawn("python", ["router\\panneau.py"]);

  // Écoutez les données de sortie du script Python
  pythonProcess.stdout.on("data", (data) => {
    // Vous pouvez envoyer la sortie du script Python en réponse à la requête HTTP
    res.send(data.toString());
  });

  // Gérez les erreurs possibles
  pythonProcess.on("error", (error) => {
    console.error("Erreur lors de l'exécution du script Python :", error);
    res.status(500).send("Erreur lors de l'exécution du script Python.");
  });
});

module.exports = router;
