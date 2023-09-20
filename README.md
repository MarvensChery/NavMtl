# API du Backend de NavMtl

Cette API gère les données qui sont présente dans notre base de donné

## Configuration requise

- Node.js 
- Express.js 
- Base de données SQL 

## Installation

1. Clonez ce dépôt sur votre machine locale.
2. Exécutez `npm install` pour installer les dépendances.
3. Configurez votre base de données dans le module "db.js".

## Utilisation

1. Exécutez l'application en utilisant `npm start`.
2. Lints et fixes files `npm run lint`



## Endpoints

- GET `/users` : Récupère la liste des utilisateurs enregistrés.

## Exemple d'utilisation avec cURL

Pour obtenir la liste des utilisateurs, vous pouvez utiliser cURL : http://localhost:3000/users

## Réponses de l'API

- 200 OK : La requête a réussi, et la liste des utilisateurs est renvoyée.
- 400 Bad Request : Il y a eu une erreur de traitement de la demande.
- 404 Not Found : L'utilisateur ou la ressource demandée est introuvable.



## Endpoints

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

## Endpoints

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
