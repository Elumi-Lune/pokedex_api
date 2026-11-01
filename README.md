# TP Pokédex - Node.js

## Présentation

J'ai réalisé une petite API Pokédex avec **Node.js** et **Express**.
Elle lit les Pokémon dans un fichier JSON et permet de les rechercher.
J'ai aussi créé une page web simple pour voir leurs noms, leurs types, leur sprite et leurs statistiques.

C'est le **TP 02** (routes de l'API) avec la limitation de requêtes du **TP 02 Bis**.

## Comment j'ai fait

1. J'ai créé le dossier `BACKEND` avec `index.js` pour le serveur.
2. J'ai récupéré les dossiers `DATA` et `FILES` fournis pour le TP.
3. J'ai utilisé `fs.readFileSync` et `JSON.parse` pour lire `DATA/pokedex.json`.
4. J'ai créé les routes avec `app.get` dans Express. J'ai aussi corrigé quelques noms français décalés à la fin du JSON.
5. J'ai ajouté la fonction `limitRequests` pour éviter trop de requêtes par IP.
6. J'ai fait la petite page en HTML, CSS et JavaScript pour tester l'API.

## Dossiers du projet

```text
BACKEND/
├── DATA/
│   ├── items.json
│   ├── moves.json
│   ├── pokedex.json
│   └── types.json
│
├── FILES/
│   ├── images/
│   ├── sprites/
│   └── thumbnails/
│
├── public/
│   ├── assets/
│   │   ├── css/
│   │   │   └── style.css
│   │   └── js/
│   │       └── script.js
│   └── index.html
│
├── index.js
├── package.json
└── README.md
```

**Important :** le ZIP fourni contient seulement **5 Pokémon de démonstration** et pas les 809 du cours. Les dossiers d'images sont vides. Avant de rendre le TP, il faut **remplacer les quatre JSON dans `DATA` et copier les images du cours dans `FILES`**. Les fichiers sont à récupérer sur le NAS, dans `COURSNC\B2\03-Node\TP Pokedex`. Le vrai Pokédex doit contenir 809 Pokémon.

## Installer et lancer

Dans un terminal, dans le dossier `BACKEND` :

```bash
npm install
node --watch index.js
```

Ou pour le lancer normalement :

```bash
npm start
```

Sur une VM Debian / Ubuntu, si Node.js n'est pas installé :

```bash
sudo apt install nodejs npm -y
```

Dans le navigateur, ouvrir `http://127.0.0.1:5001`.

## Les routes de l'API

Toutes les routes commencent par `/api/v1/`.

| Route | Ce qu'elle fait |
| --- | --- |
| `/api/v1/pokemons` | Affiche tous les Pokémon |
| `/api/v1/pokemons/random` | Donne un Pokémon au hasard |
| `/api/v1/pokemons/25` | Cherche le Pokémon numéro 25 |
| `/api/v1/pokemons/Pikachu` | Cherche un Pokémon par son nom |

Les deux recherches utilisent le même chemin `/:recherche`. Le code vérifie si le paramètre est un numéro ou un nom.
Si le Pokémon n'existe pas, l'API renvoie le **code 404**.

## Limitation des requêtes (TP 02 Bis)

La fonction `limitRequests` garde les dates des requêtes pour chaque adresse IP.
Elle autorise **10 requêtes par minute**. Au-delà, l'API renvoie le **code 429**.
Les requêtes anciennes sont retirées du compteur.

## Page web

J'ai gardé une présentation sobre : un champ de recherche, les boutons « Au hasard » et « Tous les Pokémon », et une fiche avec les informations du Pokémon.
Pendant qu'on écrit un nom, le site propose des noms proches. Le JavaScript utilise les routes de mon API.
Le sprite est pris dans le dossier `FILES/sprites`. Si besoin, la page essaie aussi `thumbnails` puis `images`.
