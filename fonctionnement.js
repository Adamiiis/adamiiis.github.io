const TACHES_ADAM = ["1", "2", "3", "4"];
const TACHES_MEL = ["1", "2", "3", "4"];

const CLE_AUJOURDHUI = new Date().toISOString().split('T')[0];
let archivesPubliques = { adam: {}, mel: {} };

async function chargerEtat() {
  try {
    const reponse = await fetch('./historique.json');
    const donnees = await reponse.json();
    archivesPubliques = {
      adam: donnees.adam || {},
      mel: donnees.mel || {}
    };
  } catch (erreur) {
    archivesPubliques = { adam: {}, mel: {} };
  }

  initialiserPersonne('adam', TACHES_ADAM);
  initialiserPersonne('mel', TACHES_MEL);

  afficher();
}

function initialiserPersonne(cle, tachesDefaut) {
  const derniereDate = localStorage.getItem(`date_${cle}`);
  let donneesActuelles = JSON.parse(localStorage.getItem(`taches_${cle}`) || 'null');

  if (!donneesActuelles || derniereDate !== CLE_AUJOURDHUI) {
    donneesActuelles = tachesDefaut.map(titre => ({ titre, terminee: false }));
    localStorage.setItem(`taches_${cle}`, JSON.stringify(donneesActuelles));
    localStorage.setItem(`date_${cle}`, CLE_AUJOURDHUI);
  }
}

function basculerTache(cle, index) {
  const taches = JSON.parse(localStorage.getItem(`taches_${cle}`));
  taches[index].terminee = !taches[index].terminee;
  localStorage.setItem(`taches_${cle}`, JSON.stringify(taches));
  afficher();
}

function archiverPersonne(cle) {
  const tachesDefaut = cle === 'adam' ? TACHES_ADAM : TACHES_MEL;
  const taches = JSON.parse(localStorage.getItem(`taches_${cle}`));
  const dateActive = localStorage.getItem(`date_${cle}`) || CLE_AUJOURDHUI;

  archivesPubliques[cle][dateActive] = taches;
  telechargerJSON(archivesPubliques, 'historique.json');

  const nouvellesTaches = tachesDefaut.map(titre => ({ titre, terminee: false }));
  localStorage.setItem(`taches_${cle}`, JSON.stringify(nouvellesTaches));
  localStorage.setItem(`date_${cle}`, CLE_AUJOURDHUI);

  afficher();
}

function telechargerJSON(donnees, nomFichier) {
  const blob = new Blob([JSON.stringify(donnees, null, 2)], { type: 'application/json' });
  const lien = document.createElement('a');
  lien.href = URL.createObjectURL(blob);
  lien.download = nomFichier;
  lien.click();
}

function afficher() {
  document.getElementById('aujourdhui').innerText = `Tâches du ${CLE_AUJOURDHUI}`;

  afficherColonne('adam', 'aFaireAdam', 'historiqueAdam');
  afficherColonne('mel', 'aFaireMel', 'historiqueMel');
}

function afficherColonne(cle, idAFaire, idHistorique) {
  const taches = JSON.parse(localStorage.getItem(`taches_${cle}`) || '[]');
  const divAFaire = document.getElementById(idAFaire);

  divAFaire.innerHTML = taches.map((t, i) => `
    <div class="element-tache">
      <input type="checkbox" ${t.terminee ? 'checked' : ''} onchange="basculerTache('${cle}', ${i})">
      <span class="${t.terminee ? 'barre' : ''}">${t.titre}</span>
    </div>
  `).join('');

  const divHistorique = document.getElementById(idHistorique);
  const dates = Object.keys(archivesPubliques[cle] || {}).sort().reverse();

  if (dates.length === 0) {
    divHistorique.innerHTML = "<p>Aucune archive.</p>";
  } else {
    divHistorique.innerHTML = dates.map(date => `
      <div class="carte-archive">
        <strong>${date}</strong>
        <ul>
          ${archivesPubliques[cle][date].map(item => `
            <li class="${item.terminee ? 'barre' : ''}">
              ${item.terminee ? '✅' : '❌'} ${item.titre}
            </li>
          `).join('')}
        </ul>
      </div>
    `).join('');
  }
}

chargerEtat();
