// TP 02 et 02 Bis - Serveur API Pokédex
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// Emplacement des données Pokémon.
const fichierPokedex = path.join(__dirname, 'DATA', 'pokedex.json');

// Dans le fichier du cours, quelques noms français sont décalés vers la fin.
// On utilise le numéro pour afficher le bon nom.
const nomsCorriges = {
    780: 'Draïeul', 781: 'Sinistrail', 782: 'Bébécaille',
    783: 'Écaïd', 784: 'Ékaïser', 785: 'Tokorico',
    786: 'Tokopiyon', 787: 'Tokotoro', 788: 'Tokopisco',
    789: 'Cosmog', 790: 'Cosmovum', 791: 'Solgaleo',
    792: 'Lunala', 793: 'Zéroïd', 794: 'Mouscoto',
    795: 'Cancrelove', 796: 'Câblifère', 797: 'Bamboiselle',
    798: 'Katagami', 799: 'Engloutyran', 800: 'Necrozma',
    801: 'Magearna', 802: 'Marshadow', 803: 'Vémini',
    804: 'Mandrillon', 805: 'Ama-Ama', 806: 'Pierroteknik',
    807: 'Zeraora', 808: 'Meltan', 809: 'Melmetal'
};

// Lit le fichier JSON et renvoie un tableau.
function lirePokemons() {
    const fichier = fs.readFileSync(fichierPokedex, 'utf8');
    const pokemons = JSON.parse(fichier);
    for (const pokemon of pokemons) {
        if (nomsCorriges[pokemon.id] && typeof pokemon.name === 'object') {
            pokemon.name.french = nomsCorriges[pokemon.id];
        }
    }
    return pokemons;
}

// TP 02 Bis : limite le nombre de requêtes par adresse IP.
function limitRequests(requete, limite = 10, duree = 60000) {
    const ip = requete.ip;
    const maintenant = Date.now();

    if (!requete.app.locals.requestCounts) {
        requete.app.locals.requestCounts = {};
    }
    if (!requete.app.locals.requestCounts[ip]) {
        requete.app.locals.requestCounts[ip] = [];
    }

    // On oublie les anciennes requêtes.
    const dates = requete.app.locals.requestCounts[ip];
    requete.app.locals.requestCounts[ip] = dates.filter(
        date => maintenant - date < duree
    );

    if (requete.app.locals.requestCounts[ip].length >= limite) {
        return false;
    }

    requete.app.locals.requestCounts[ip].push(maintenant);
    return true;
}

// On applique la limite aux routes de l'API.
app.use('/api/v1', (requete, reponse, suivant) => {
    if (!limitRequests(requete)) {
        return reponse.status(429).json({ message: 'Trop de requêtes. Réessaie dans une minute.' });
    }
    suivant();
});

// La page et les images sont accessibles depuis le navigateur.
app.use(express.static(path.join(__dirname, 'public')));
app.use('/sprites', express.static(path.join(__dirname, 'FILES', 'sprites')));
app.use('/thumbnails', express.static(path.join(__dirname, 'FILES', 'thumbnails')));
app.use('/images', express.static(path.join(__dirname, 'FILES', 'images')));

// Route 1 : renvoyer tous les Pokémon.
app.get('/api/v1/pokemons', (requete, reponse) => {
    reponse.json(lirePokemons());
});

// Route 2 : renvoyer un Pokémon au hasard.
// Cette route doit être placée avant la recherche par nom.
app.get('/api/v1/pokemons/random', (requete, reponse) => {
    const pokemons = lirePokemons();
    const position = Math.floor(Math.random() * pokemons.length);
    reponse.json(pokemons[position]);
});

// Routes 3 et 4 : chercher par numéro ou par nom.
// Les deux ont la même forme d'URL, on distingue chiffre et texte.
app.get('/api/v1/pokemons/:recherche', (requete, reponse) => {
    const recherche = requete.params.recherche;
    const pokemons = lirePokemons();
    let pokemon;

    if (/^\d+$/.test(recherche)) {
        pokemon = pokemons.find(p => p.id === Number(recherche));
    } else {
        pokemon = pokemons.find(p => {
            const nomFrancais = typeof p.name === 'object' ? p.name.french : p.name;
            const nomAnglais = typeof p.name === 'object' ? p.name.english : p.name;
            return nomFrancais?.toLowerCase() === recherche.toLowerCase()
                || nomAnglais?.toLowerCase() === recherche.toLowerCase();
        });
    }

    if (!pokemon) {
        return reponse.status(404).json({ message: 'Pokémon introuvable.' });
    }

    reponse.json(pokemon);
});

// Démarrage du serveur.
app.listen(PORT, '0.0.0.0', () => {
    console.log('Serveur Pokédex lancé sur le port ' + PORT);
});
