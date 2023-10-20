const { Router } = require("express");
const { spawn } = require("child_process");
const path = require("path");
const pythonFilePath = path.join(__dirname, "panneau", "panneau.py");
console.log(pythonFilePath); // This will print the full path.


function runPanneauScript() {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn("python", ["router/panneau/panneau.py"]);
      let dataString = "";

      pythonProcess.stdout.on("data", (data) => {
        dataString += data.toString();
      });

      pythonProcess.stdout.on("end", () => {
        resolve(dataString);
      });

      pythonProcess.stderr.on("data", (error) => {
        reject(error.toString());
      });
    });
}



const authMiddleware = require("../modules/auth-middleware");
const auth = require("./auth");
const user = require("./user");
const users = require("./users");
const inscription = require("./inscription");
const modifUser = require("./user");
const delUser = require("./user");
const history = require("./history/userHistory");
const delHistory = require("./history/userHistory");
const allfavoris = require("./favoris/allFavoris");
const userfavoris = require("./favoris/userFavoris");
const parametre = require("./parametre");
const alerte = require("./alerte");
const friend = require("./friend");
  



const router = Router();
router.use("/auth", auth);
router.use("/user", authMiddleware, user);
router.use("/users", users);
router.use("/inscription", inscription);
router.use("/user/modifUser", modifUser);
router.use("/user/delUser", delUser);
router.use("/history", authMiddleware, history);
router.use("/history/delHistory", delHistory);
router.use("/favorise",allfavoris);
router.use("/favoris",authMiddleware, userfavoris);
router.use("/parametre",authMiddleware, parametre);
router.use("/alerte",authMiddleware, alerte);
router.use("/friend",authMiddleware, friend);
router.get("/panneau/run", async (req, res) => {
    try {
      const result = await runPanneauScript();
      res.send(result);
    } catch (error) {
      res.status(500).send(error);
    }
  });

module.exports = router;
