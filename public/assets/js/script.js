// Les Pokémon servent à afficher les suggestions de recherche.
let tousLesPokemons = [];

const champ = document.getElementById('recherche');
const suggestions = document.getElementById('suggestions');
const message = document.getElementById('message');

function nomFrancais(pokemon) {
    return typeof pokemon.name === 'object'
        ? (pokemon.name.french || pokemon.name.english)
        : pokemon.name;
}

function nomAnglais(pokemon) {
    return typeof pokemon.name === 'object' ? pokemon.name.english : pokemon.name;
}

// Enlève les accents et passe le texte en minuscules.
function simplifier(texte) {
    return (texte || '').toLowerCase().normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

// Renvoie vrai si une seule lettre est oubliée ou incorrecte.
function petiteFaute(texte, nom) {
    if (texte.length < 4 || Math.abs(texte.length - nom.length) > 1) return false;
    let i = 0;
    let j = 0;
    let erreurs = 0;

    while (i < texte.length && j < nom.length) {
        if (texte[i] === nom[j]) {
            i++;
            j++;
        } else {
            erreurs++;
            if (erreurs > 1) return false;
            if (texte.length <= nom.length) j++;
            if (texte.length >= nom.length) i++;
        }
    }
    return erreurs + (texte.length - i) + (nom.length - j) <= 1;
}

// Les noms qui commencent par le texte sont proposés en premier.
function trouverSuggestions(texte) {
    const saisie = simplifier(texte.trim());
    if (!saisie) return [];

    return tousLesPokemons.map(pokemon => {
        const noms = [simplifier(nomFrancais(pokemon)), simplifier(nomAnglais(pokemon))];
        let score = 9;

        for (const nom of noms) {
            if (nom === saisie || String(pokemon.id) === saisie) score = 0;
            else if (nom.startsWith(saisie)) score = Math.min(score, 1);
            else if (nom.includes(saisie)) score = Math.min(score, 2);
            else if (petiteFaute(saisie, nom)) score = Math.min(score, 3);
        }
        return { pokemon, score };
    }).filter(element => element.score < 9)
        .sort((a, b) => a.score - b.score || a.pokemon.id - b.pokemon.id)
        .slice(0, 7).map(element => element.pokemon);
}

function afficherSuggestions() {
    suggestions.innerHTML = '';
    const liste = trouverSuggestions(champ.value);

    for (const pokemon of liste) {
        const bouton = document.createElement('button');
        const nom = document.createElement('span');
        const numero = document.createElement('small');
        nom.textContent = nomFrancais(pokemon);
        numero.textContent = '#' + pokemon.id;
        bouton.append(nom, numero);
        bouton.addEventListener('click', () => {
            champ.value = nomFrancais(pokemon);
            suggestions.hidden = true;
            chercherPokemon(pokemon.id);
        });
        suggestions.appendChild(bouton);
    }
    suggestions.hidden = liste.length === 0;
}

// Les couleurs des types servent pour la fiche et les statistiques.
const couleursTypes = {
    Normal: '#9099a1', Fire: '#ec663b', Water: '#428bd4',
    Electric: '#c49c15', Grass: '#43a568', Ice: '#55a9c0',
    Fighting: '#bd5546', Poison: '#9656af', Ground: '#b88b51',
    Flying: '#728dc5', Psychic: '#ba538f', Bug: '#82a43d',
    Rock: '#a28d5c', Ghost: '#7263a9', Dragon: '#656ac8',
    Dark: '#68616c', Steel: '#7196a6', Fairy: '#d66da8'
};

const fondsTypes = {
    Normal: '#eef0f1', Fire: '#fff0e8', Water: '#e8f2fd',
    Electric: '#fcf4d8', Grass: '#e6f4e9', Ice: '#e6f6f9',
    Fighting: '#f9eae6', Poison: '#f3eaf8', Ground: '#f4eee5',
    Flying: '#eaf0fa', Psychic: '#f8eaf2', Bug: '#edf3e3',
    Rock: '#f1ede5', Ghost: '#edebf7', Dragon: '#e9eafb',
    Dark: '#eeeeef', Steel: '#e9f0f3', Fairy: '#faebf4'
};

// On essaie les noms avec et sans zéro : 064.png ou 64.png.
function cheminsImages(dossier, numero, fin = '') {
    const numeroAvecZeros = String(numero).padStart(3, '0');
    return [
        '/' + dossier + '/' + numeroAvecZeros + fin + '.png',
        '/' + dossier + '/' + numero + fin + '.png'
    ];
}

// Essaie les chemins dans l'ordre si un fichier n'existe pas.
function chargerImage(image, chemins, texte, quandAbsente) {
    let position = 0;
    image.hidden = false;
    image.alt = texte;
    image.onerror = () => {
        position++;
        if (position < chemins.length) {
            image.src = chemins[position];
        } else {
            image.hidden = true;
            if (quandAbsente) quandAbsente();
        }
    };
    image.src = chemins[position];
}

// Affiche l'illustration au centre, la miniature et le sprite dans le coin.
function afficherImages(numero, nom) {
    const image = document.getElementById('image');
    const vide = document.getElementById('aucune-image');
    const petitesImages = document.getElementById('petites-images');
    const blocMiniature = document.getElementById('bloc-miniature');
    const blocSprite = document.getElementById('bloc-sprite');

    vide.hidden = true;
    petitesImages.hidden = false;
    blocMiniature.hidden = false;
    blocSprite.hidden = false;

    // Grande image au milieu : FILES/images.
    chargerImage(image, [
        ...cheminsImages('images', numero),
        ...cheminsImages('thumbnails', numero)
    ], 'Image de ' + nom, () => {
        vide.hidden = false;
        vide.textContent = 'Image non disponible';
    });

    // En haut à droite : FILES/thumbnails et FILES/sprites.
    chargerImage(
        document.getElementById('miniature'),
        cheminsImages('thumbnails', numero),
        'Miniature de ' + nom,
        () => { blocMiniature.hidden = true; }
    );
    chargerImage(
        document.getElementById('mini-sprite'),
        cheminsImages('sprites', numero, 'MS'),
        'Sprite de ' + nom,
        () => { blocSprite.hidden = true; }
    );
}

function afficherPokemon(pokemon) {
    const nom = nomFrancais(pokemon);
    document.getElementById('numero').textContent = 'N° ' + String(pokemon.id).padStart(3, '0');
    document.getElementById('nom').textContent = nom;
    document.getElementById('nom-anglais').textContent = nomAnglais(pokemon) !== nom ? nomAnglais(pokemon) : '';

    // La couleur principale dépend du premier type.
    const premierType = (pokemon.type || [])[0];
    const fiche = document.querySelector('.fiche');
    fiche.style.setProperty('--couleur-type', couleursTypes[premierType] || '#bb3535');
    fiche.style.setProperty('--fond-type', fondsTypes[premierType] || '#e9f0f1');

    // Les types du Pokémon.
    const types = document.getElementById('types');
    types.innerHTML = '';
    for (const type of pokemon.type || []) {
        const etiquette = document.createElement('span');
        etiquette.className = 'type';
        etiquette.textContent = type;
        etiquette.style.background = couleursTypes[type] || '#9099a1';
        types.appendChild(etiquette);
    }

    // Les six statistiques du fichier JSON.
    const statistiques = document.getElementById('statistiques');
    statistiques.innerHTML = '';
    const valeurs = [
        ['PV', 'HP'], ['Attaque', 'Attack'], ['Défense', 'Defense'],
        ['Att. Spé.', 'Sp. Attack'], ['Déf. Spé.', 'Sp. Defense'], ['Vitesse', 'Speed']
    ];

    for (const [titre, cle] of valeurs) {
        const valeur = pokemon.base?.[cle];
        if (valeur === undefined) continue;
        const ligne = document.createElement('div');
        ligne.className = 'stat';
        const texte = document.createElement('span');
        texte.textContent = titre;
        const barre = document.createElement('div');
        barre.className = 'barre';
        const remplissage = document.createElement('span');
        remplissage.style.width = Math.min(valeur / 160 * 100, 100) + '%';
        barre.appendChild(remplissage);
        const nombre = document.createElement('span');
        nombre.className = 'valeur';
        nombre.textContent = valeur;
        ligne.append(texte, barre, nombre);
        statistiques.appendChild(ligne);
    }
    if (!statistiques.children.length) statistiques.textContent = 'Statistiques non disponibles.';

    afficherImages(pokemon.id, nom);
}

// Appelle l'API et affiche le résultat.
async function appelerApi(adresse) {
    try {
        const reponse = await fetch(adresse);
        const resultat = await reponse.json();
        if (!reponse.ok) {
            message.textContent = 'Erreur ' + reponse.status + ' : ' + resultat.message;
            return null;
        }
        return resultat;
    } catch (erreur) {
        message.textContent = 'Impossible de joindre le serveur.';
        return null;
    }
}

async function chercherPokemon(recherche) {
    suggestions.hidden = true;
    const pokemon = await appelerApi('/api/v1/pokemons/' + encodeURIComponent(recherche));
    if (!pokemon) return;
    afficherPokemon(pokemon);
    message.textContent = 'Pokémon trouvé : ' + nomFrancais(pokemon);
}

async function chercherDepuisChamp() {
    const texte = champ.value.trim();
    if (!texte) return;
    const noms = trouverSuggestions(texte);
    // Si le nom est approximatif, on choisit la première suggestion.
    if (noms.length && !/^\d+$/.test(texte)) {
        champ.value = nomFrancais(noms[0]);
        chercherPokemon(noms[0].id);
    } else {
        chercherPokemon(texte);
    }
}

async function pokemonAuHasard() {
    suggestions.hidden = true;
    const pokemon = await appelerApi('/api/v1/pokemons/random');
    if (!pokemon) return;
    afficherPokemon(pokemon);
    champ.value = nomFrancais(pokemon);
    message.textContent = 'Un Pokémon choisi au hasard.';
}

async function afficherTous() {
    suggestions.hidden = true;
    const pokemons = await appelerApi('/api/v1/pokemons');
    if (!pokemons) return;
    tousLesPokemons = pokemons;
    document.getElementById('section-liste').hidden = false;
    document.getElementById('nombre').textContent = pokemons.length + ' Pokémon';
    const liste = document.getElementById('liste-pokemons');
    liste.innerHTML = '';

    for (const pokemon of pokemons) {
        const bouton = document.createElement('button');
        const numero = document.createElement('span');
        numero.textContent = '#' + String(pokemon.id).padStart(3, '0');
        bouton.append(numero, document.createTextNode(nomFrancais(pokemon)));
        bouton.addEventListener('click', () => {
            champ.value = nomFrancais(pokemon);
            chercherPokemon(pokemon.id);
        });
        liste.appendChild(bouton);
    }
    message.textContent = 'Liste des ' + pokemons.length + ' Pokémon affichée.';
}

champ.addEventListener('input', afficherSuggestions);
champ.addEventListener('keydown', evenement => {
    if (evenement.key === 'Enter') {
        chercherDepuisChamp();
    }
});
document.addEventListener('click', evenement => {
    if (!evenement.target.closest('.champ')) suggestions.hidden = true;
});
document.getElementById('chercher').addEventListener('click', chercherDepuisChamp);
document.getElementById('hasard').addEventListener('click', pokemonAuHasard);
document.getElementById('tous').addEventListener('click', afficherTous);

// On charge la liste au démarrage pour pouvoir proposer les noms.
async function demarrer() {
    const pokemons = await appelerApi('/api/v1/pokemons');
    if (pokemons) tousLesPokemons = pokemons;
}
demarrer();
