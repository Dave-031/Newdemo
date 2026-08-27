(function setupChangelogs() {
    const CHANGELOG_URL = 'https://gist.githubusercontent.com/Dave-031/2137f840bf18a9b43b722f0bacaab332/raw/changelogs.json';

    const listEl = document.getElementById('changelog-list');
    const statusEl = document.getElementById('changelog-status');
    const searchEl = document.getElementById('changelog-search');
    if (!listEl || !searchEl) return;

    let changelogData = [];

    function renderChangelogs(filterText) {
        const term = (filterText || '').trim().toLowerCase();
        listEl.innerHTML = '';

        const filtered = !term ? changelogData : changelogData.filter(entry => {
            const haystack = [entry.version || '', entry.date || '', ...(entry.changes || [])].join(' ').toLowerCase();
            return haystack.includes(term);
        });

        if (filtered.length === 0) {
            const emptyMsg = document.createElement('p');
            emptyMsg.style.fontSize = '30px';
            emptyMsg.style.color = '#444';
            emptyMsg.style.margin = '0';
            emptyMsg.innerText = 'No changelog entries match your search.';
            listEl.appendChild(emptyMsg);
            return;
        }

        filtered.forEach(entry => {
            const fieldset = document.createElement('fieldset');
            fieldset.style.margin = '0';
            fieldset.style.padding = '10px 12px';
            fieldset.style.flexShrink = '0';

            const legend = document.createElement('legend');
            legend.style.fontWeight = 'bold';
            legend.style.fontSize = '17px';
            legend.innerText = (entry.version || '') + ' — ' + (entry.date || '');
            fieldset.appendChild(legend);

            const ul = document.createElement('ul');
            ul.style.margin = '4px 0 0 0';
            ul.style.paddingLeft = '18px';
            ul.style.fontSize = '14px';
            ul.style.lineHeight = '1.5';

            (entry.changes || []).forEach(change => {
                const li = document.createElement('li');
                li.innerText = change;
                ul.appendChild(li);
            });

            fieldset.appendChild(ul);
            listEl.appendChild(fieldset);
        });
    }

      function loadChangelogs() {
          fetch(CHANGELOG_URL)
              .then(res => {
                  if (!res.ok) throw new Error('Bad response');
                  return res.json();
              })
              .then(data => {
                  changelogData = Array.isArray(data) ? data : [];
                  if (statusEl) statusEl.style.display = 'none';
                  renderChangelogs(searchEl.value);
              })
              .catch(() => {
                  changelogData = [];
                  listEl.innerHTML = '';
                  if (statusEl) {
                      statusEl.style.display = 'block';
                      statusEl.innerText = 'Failed to fetch.';
                  }
              });
      }

    searchEl.addEventListener('input', () => renderChangelogs(searchEl.value));

    loadChangelogs();
})();