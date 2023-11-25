# API du Backend de NavMtl

## Auteurs

👤 **Marvens Chery** , **Christopher Trang**

- Linkedin: [@marvenschery](https://www.linkedin.com/in/marvenschery/)
- Github: [@MarvensChery](https://github.com/MarvensChery) , [@christrang](https://github.com/christrang)
### En cas de question, n'hésitez pas à me contacter.
![ezgif com-video-to-gif](https://github.com/MarvensChery/NavMtl-Backend/assets/104527699/8a02cd79-7363-4aca-bad8-609432711d8b)

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
# La création de la base de donnée
``` sql
create database navMtl

CREATE TABLE utilisateur (
    userID INT IDENTITY(1,1) PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mdp VARCHAR(255) NOT NULL,
    number INT NOT NULL,
    pfp varbinary(max) NULL,
    lat VARCHAR(255) NULL,
    long VARCHAR(255) NULL
);


CREATE TABLE favoris (
    favorisID INT IDENTITY(1,1) PRIMARY KEY,
    userID INT NOT NULL,
    titre VARCHAR(255) NULL,
    addresse VARCHAR(255) NOT NULL,
    FOREIGN KEY (userID) REFERENCES utilisateur(userID)
);


CREATE TABLE history (
    historyID INT IDENTITY(1,1) PRIMARY KEY,
    userID INT NOT NULL,
    temps DATETIME NOT NULL,
    addresse VARCHAR(255) NOT NULL,
    FOREIGN KEY (userID) REFERENCES utilisateur(userID)
);


CREATE TABLE parametre (
    parametreID INT IDENTITY(1,1) PRIMARY KEY,
    userID INT NOT NULL,
    parametre VARCHAR(255) NOT NULL,
    valeur VARCHAR(255) NOT NULL,
    FOREIGN KEY (userID) REFERENCES utilisateur(userID)
);


CREATE TABLE alerte (
    alerteID INT IDENTITY(1,1) PRIMARY KEY,
    userID INT NOT NULL,
    contenu VARCHAR(255) NOT NULL,
    temps DATETIME NOT NULL,
    lu BIT NOT NULL,
    FOREIGN KEY (userID) REFERENCES utilisateur(userID)
);

CREATE TABLE friend (
    friendID INT IDENTITY(1,1) PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    lat VARCHAR(255) NULL,
    long VARCHAR(255) NULL
);

CREATE TABLE demandeAmis (
    demandeID INT IDENTITY(1,1) PRIMARY KEY,
    expediteurID INT NOT NULL,
    destinataireID INT NOT NULL,
    etat VARCHAR(255) NOT NULL,
    date_demande DATETIME NOT NULL,
    FOREIGN KEY (expediteurID) REFERENCES utilisateur(userID),
    FOREIGN KEY (destinataireID) REFERENCES utilisateur(userID)
);


CREATE TABLE friendship (
    friendshipID INT IDENTITY(1,1) PRIMARY KEY,
    friendID INT NOT NULL,
    userID INT NOT NULL,
    FOREIGN KEY (friendID) REFERENCES friend(friendID),
    FOREIGN KEY (userID) REFERENCES utilisateur(userID)
);


-- CREATE LOGIN marvens   
   -- WITH PASSWORD = '1234mdp';  
--GO 
--CREATE USER marvens FOR LOGIN marvens;
```
