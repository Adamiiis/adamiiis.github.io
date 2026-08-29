const TACHES_PAR_DEFAUT = [
  "1",
  "2",
  "3",
  "4"
];

const CLE_AUJOURDHUI = new Date().toISOString().split('T')[0];

function chargerEtat() {
  const derniereDate = localStorage.getItem('derniere_date_active');
  let donneesActuelles = JSON.parse(localStorage.getItem('taches_actuelles') || 'null');

  if (derniereDate && derniereDate !== CLE_AUJOURDHUI && donneesActuelles) {
    sauvegarderDansArchive(derniereDate, donneesActuelles);
    donneesActuelles = null;
  }

  if (!donneesActuelles) {
    donneesActuelles = TACHES_PAR_DEFAUT.map(titre => ({ titre, terminee: false }));
    localStorage.setItem('taches_actuelles', JSON.stringify(donneesActuelles));
    localStorage.setItem('derniere_date_active', CLE_AUJOURDHUI);
  }

  afficher();
}

function basculerTache(index) {
  const taches = JSON.parse(localStorage.getItem('taches_actuelles'));
  taches[index].terminee = !taches[index].terminee;
  localStorage.setItem('taches_actuelles', JSON.stringify(taches));
  afficher();
}

function archiverEtRecommencer() {
  const taches = JSON.parse(localStorage.getItem('taches_actuelles'));
  const dateActive = localStorage.getItem('derniere_date_active') || CLE_AUJOURDHUI;
  
  sauvegarderDansArchive(dateActive, taches);

  const nouvellesTaches = TACHES_PAR_DEFAUT.map(titre => ({ titre, terminee: false }));
  localStorage.setItem('taches_actuelles', JSON.stringify(nouvellesTaches));
  localStorage.setItem('derniere_date_active', CLE_AUJOURDHUI);
  afficher();
}

function sauvegarderDansArchive(dateTexte, taches) {
  const historique = JSON.parse(localStorage.getItem('historique_taches') || '{}');
  historique[dateTexte] = taches;
  localStorage.setItem('historique_taches', JSON.stringify(historique));
}

function afficher() {
  document.getElementById('aujourdhui').innerText = `Tâches du ${CLE_AUJOURDHUI}`;
  const taches = JSON.parse(localStorage.getItem('taches_actuelles') || '[]');
  
  const listeElement = document.getElementById('aFaire');
  listeElement.innerHTML = taches.map((t, i) => `
    <div class="element-tache">
      <input type="checkbox" ${t.terminee ? 'checked' : ''} onchange="basculerTache(${i})">
      <span style="${t.terminee ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${t.titre}</span>
    </div>
  `).join('');

  const historique = JSON.parse(localStorage.getItem('historique_taches') || '{}');
  const elementHistorique = document.getElementById('historique');
  const dates = Object.keys(historique).sort().reverse();
  
  if (dates.length === 0) {
    elementHistorique.innerHTML = "<p>Aucune archive pour l'instant.</p>";
  } else {
    elementHistorique.innerHTML = dates.map(date => `
      <div class="carte-archive">
        <strong>${date}</strong>
        <ul>
          ${historique[date].map(item => `
            <li style="${item.terminee ? 'text-decoration: line-through;' : ''}">
              ${item.terminee ? '✅' : '❌'} ${item.titre}
            </li>
          `).join('')}
        </ul>
      </div>
    `).join('');
  }
}

chargerEtat();
