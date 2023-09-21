# API du Backend de NavMtl

Cette API gère les données qui sont présente dans notre base de donné

## Installation

1. Clonez ce dépôt sur votre machine locale.
2. Exécutez `npm install` pour installer les dépendances.
3. Configurez votre base de données dans le module ".env".
4. Assurez-vous d'avoir un secret sécurisé pour la génération de jetons JWT.

## Utilisation

1. Télécharger les dépendance avec ` npm install`
2. Exécutez l'application en utilisant `npm start`.
3. Lints et fixes files ou bug `npm run lint`

## Package.json

```json
{
    "name": "basecodebackend",
    "version": "1.0.0",
    "description": "exemple API",
    "main": "index.js",
    "scripts": {
        "start": "node index.js",
        "lint": "npx eslint ./**/*.js --fix"
    },
    "author": "you",
    "license": "ISC",
    "dependencies": {
        "bcrypt": "^5.1.1",
        "body-parser": "^1.20.2",
        "cors": "^2.8.5",
        "dotenv": "^16.3.1",
        "express": "^4.18.2",
        "express-validator": "^7.0.1",
        "jsonwebtoken": "9.0.2",
        "knex": "2.5.1",
        "mssql": "^10.0.0"
    },
    "devDependencies": {
        "eslint": "^8.49.0",
        "eslint-config-airbnb-base": "^15.0.0",
        "eslint-plugin-import": "^2.28.1"
    }
}
```
# Tout les users

- GET `/users` : Récupère la liste des utilisateurs enregistrés.

## Exemple d'utilisation avec cURL

Pour obtenir la liste des utilisateurs, vous pouvez utiliser cURL : http://localhost:3000/users

## Réponses de l'API

- 200 OK : La requête a réussi, et la liste des utilisateurs est renvoyée.
- 400 Bad Request : Il y a eu une erreur de traitement de la demande.
- 404 Not Found : L'utilisateur ou la ressource demandée est introuvable.



# Un User

- GET `/user` : Récupère les détails d'un utilisateur.
- PUT `/user/modifUser` : Modifie les détails d'un utilisateur.
- DELETE `/user/delUser` : Supprime un utilisateur.

## Exemple d'utilisation avec cURL

Pour récupérer les détails d'un utilisateur (remplacez "TOKEN" par votre jeton d'authentification) : curl -H "Authorization: Bearer TOKEN" http://localhost:3000/user

Pour modifier un utilisateur : curl -X PUT -H "Authorization: Bearer TOKEN" -d '{ "nom": "NouveauNom", "prenom": "NouveauPrenom", ... }' http://localhost:3000/user/modifUser 

Pour supprimer un utilisateur : curl -X DELETE -H "Authorization: Bearer TOKEN" http://localhost:3000/user/delUser

## Réponses de l'API

exemple pour récupérer les détails d'un utilisateur
``` json
{
    "userID": 123,
    "nom": "NomUtilisateur",
    "prenom": "PrenomUtilisateur",
    "email": "email@example.com",
    "mdp": "motdepassehashé",
    "number": "555-123-4567",
    "lat": 45.123456,
    "long": -73.987654
}
```
 exemple pour modifier un utilisateur
 ```json
{
    "message": "Utilisateur mis à jour avec succès.",
    "user": {
        "userID": 123,
        "nom": "NouveauNom",
        "prenom": "NouveauPrenom",
        "email": "nouveauemail@example.com",
        "mdp": "nouveaumotdepassehashé",
        "number": "555-987-6543",
        "lat": 46.789012,
        "long": -74.567890
    }
}
```
exemple pour supprimer un utilisateur
``` json
{
    "message": "Utilisateur supprimé avec succès."
}
```
- 200 OK : La requête a réussi, et les données d'utilisateur sont renvoyées.
- 400 Bad Request : Il y a eu une erreur de traitement de la demande.
- 404 Not Found : L'utilisateur ou la ressource demandée est introuvable.

# Parametre

- GET `/parametre` : Récupère les paramètres de l'utilisateur actuel.
- PUT `/parametre/:parametreID` : Modifie un paramètre utilisateur existant.
- DELETE `/parametre/:parametreID` : Supprime un paramètre utilisateur existant.
- POST `/parametre` : Crée un nouveau paramètre utilisateur.
## Exemple d'utilisation avec cURL

Pour récupérer les paramètres d'un utilisateur (remplacez "TOKEN" par votre jeton d'authentification) :

curl -H "Authorization: Bearer TOKEN" http://localhost:3000/parametre


Pour modifier un paramètre utilisateur (remplacez "PARAMETRE_ID" par l'ID du paramètre) : curl -X PUT -H "Authorization: Bearer TOKEN" -d '{ "parametre": "NouveauParametre", "valeur": "NouvelleValeur" }' http://localhost:3000/parametre/PARAMETRE_ID

Pour supprimer un paramètre utilisateur (remplacez "PARAMETRE_ID" par l'ID du paramètre) : curl -X DELETE -H "Authorization: Bearer TOKEN" http://localhost:3000/parametre/PARAMETRE_ID
## Réponses de l'API
Exemple de réponse JSON pour l'endpoint GET `/parametre` :
```json
[
    {
        "parametreID": 1,
        "userID": 123,
        "parametre": "Parametre1",
        "valeur": "Valeur1"
    },
    {
        "parametreID": 2,
        "userID": 123,
        "parametre": "Parametre2",
        "valeur": "Valeur2"
    }
]
```
Exemple de réponse JSON pour l'endpoint POST /parametre :

``` json
{
    "message": "Paramètre créé avec succès."
}
```
Exemple de réponse JSON pour l'endpoint PUT /parametre/:parametreID :

``` json

{
    "message": "Paramètre mis à jour avec succès.",
    "user": {
        "parametreID": 1,
        "userID": 123,
        "parametre": "Parametre1",
        "valeur": "NouvelleValeur"
    }
}
```
Exemple de réponse JSON pour l'endpoint DELETE /parametre/:parametreID :

```json
{
    "message": "Paramètre supprimé avec succès."
}
```

- 200 OK : La requête a réussi, et les données du paramètre sont renvoyées.
- 201 Created : Le paramètre a été créé avec succès.
- 400 Bad Request : Il y a eu une erreur de traitement de la demande.
- 404 Not Found : Le paramètre ou la ressource demandée est introuvable.
# History

- POST `/users` : Crée un nouvel utilisateur avec les données fournies.
## Exemple d'utilisation avec cURL

Pour créer un nouvel utilisateur (remplacez "EMAIL", "MOT_DE_PASSE", "NOM", "PRENOM" et "NUMERO" par les données appropriées) : curl -X POST -d '{ "nom": "NOM", "prenom": "PRENOM", "email": "EMAIL", "mdp": "MOT_DE_PASSE", "number": "NUMERO" }' http://localhost:3000/inscription

## Validation des Données

Les données fournies lors de l'inscription sont validées avec les règles suivantes :

- Le nom et le prénom doivent avoir une longueur comprise entre 2 et 25 caractères.
- L'email doit être au format d'email valide.
- Le mot de passe doit avoir une longueur minimale de 6 caractères.
- Le numéro doit avoir une longueur de 10 caractères.

## Réponses de l'API

- 201 Created : L'utilisateur a été créé avec succès, et un jeton d'authentification est renvoyé.
- 400 Bad Request : Il y a eu une erreur de validation des données ou une erreur de création de l'utilisateur.
- 500 Internal Server Error : Il y a eu une erreur lors de la création de l'utilisateur dans la base de données.

  
Exemple de réponse JSON pour l'endpoint post /inscription :

```json
{
    "message": "Utilisateur inscrit avec succès.",
    "token": "votre_token_jwt"
}
```
## Endpoints

- GET `/history` : Récupère l'historique de l'utilisateur.
- POST `/history` : Ajoute une nouvelle entrée à l'historique de l'utilisateur.
- DELETE `/history/:historyID` : Supprime une entrée spécifique de l'historique de l'utilisateur.
## Exemple d'utilisation avec cURL

Pour récupérer l'historique de l'utilisateur (remplacez "VOTRE_TOKEN" par un jeton d'authentification valide) : curl -H "Authorization: Bearer VOTRE_TOKEN" http://localhost:3000/history

Pour ajouter une nouvelle entrée à l'historique de l'utilisateur : curl -X POST -H "Authorization: Bearer VOTRE_TOKEN" -d '{ "addresse": "Nouvelle Adresse", "temps": "Nouveau Temps" }' http://localhost:3000/history

Pour supprimer une entrée spécifique de l'historique de l'utilisateur (remplacez "ID_DE_L_HISTORIQUE" par l'ID réel de l'entrée) : curl -X DELETE -H "Authorization: Bearer VOTRE_TOKEN" http://localhost:3000/history/ID_DE_L_HISTORIQUE

 Réponses de l'API

- 200 OK : La requête a réussi, et les données d'historique sont renvoyées.
- 201 Created : Une nouvelle entrée a été ajoutée à l'historique avec succès.
- 400 Bad Request : Il y a eu une erreur de traitement de la demande.
- 404 Not Found : L'entrée d'historique spécifiée n'a pas été trouvée.
- 500 Internal Server Error : Il y a eu une erreur lors de l'accès à la base de données.

Réponse de succès pour la récupération de l'historique (HTTP 200 OK) :
```json
[
    {
        "historyID": 1,
        "addresse": "123 Rue de l'Exemple",
        "temps": "2023-09-20 10:30:00"
    },
    {
        "historyID": 2,
        "addresse": "456 Rue de l'Exemple",
        "temps": "2023-09-19 15:45:00"
    }
]
```
Réponse de succès pour l'ajout d'une nouvelle entrée à l'historique (HTTP 201 Created) :
```json
{
    "message": "Historique créé avec succès."
}
```
Réponse de succès pour la suppression d'une entrée spécifique de l'historique (HTTP 200 OK) :
```json
{
    "message": "Historique supprimé avec succès."
}
```
Réponse d'erreur lorsque l'historique est vide (HTTP 404 Not Found) :
```json
{
    "message": "Aucun historique trouvé."
}
```
Réponse d'erreur en cas d'entrée d'historique spécifique non trouvée (HTTP 404 Not Found) :
```json
{
    "message": "Historique inconnu."
}
```
Réponse d'erreur en cas d'échec de la création de l'historique (HTTP 400 Bad Request) :
```json
{
    "message": "Erreur lors de la création de l'historique."
}
```
Réponse d'erreur en cas d'échec de la suppression de l'historique (HTTP 400 Bad Request) :
```json
{
    "message": "Erreur lors de la suppression de l'historique."
}
```
