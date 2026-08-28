
document.addEventListener('dblclick', (e) => {
    const icon = e.target.closest('.desktop-icon[data-target="win-pcgames"]');
    if (!icon) return;

    // Intercept before the icon's own dblclick handlers can open the window
    e.stopPropagation();
    e.preventDefault();

    const proceed = confirm("WARNING:THESE ARE NOT PLAYABLE ON CHROMEBOOKS ONLY FOR COMPUTERS IN CLASSES WITH THEM.");
    if (!proceed) {
        icon.classList.remove('selected');
        return;
    }

    // Same open logic used by the normal icon dblclick handlers
    const targetId = icon.dataset.target;
    const windowEl = document.getElementById(targetId);
    const taskBtn = standardWindowMap.get(targetId);

    if (windowEl && taskBtn) {
        windowEl.style.display = 'flex';
        if (windowEl.dataset.userMoved !== 'true') {
            cascadePosition(windowEl);
        }
        if (!document.getElementById('taskbar-items-container').contains(taskBtn)) {
            document.getElementById('taskbar-items-container').appendChild(taskBtn);
        }
        highestZ++;
        windowEl.style.zIndex = highestZ;
    }
    icon.classList.remove('selected');
}, true); // <-- capture: true is essential here
// Start with a clean desktop — windows are positioned but stay closed
// until the user double-clicks a desktop icon to open one.
applyDefaultLayout({ open: false });

document.addEventListener("DOMContentLoaded", function() {

    // Opens a blank window immediately (so the browser doesn't treat it as a
    // blocked popup once the fetch resolves later), then fetches the game's
    // actual HTML from jsdelivr and writes it into that window. A <base> tag
    // pointing back at the source folder is injected so any relative
    // image/script/css paths inside that HTML still resolve correctly even
    // though the page is now living at "about:blank".
    function openGameInNewWindow(url) {
        const newWin = window.open('about:blank', '_blank');
        if (!newWin) {
            // Popup blocked — fall back to a normal navigation.
            window.location.href = url;
            return;
        }

        newWin.document.write('<!doctype html><title>Loading\u2026</title><body style="font-family: sans-serif; padding: 20px;">Loading game\u2026</body>');

        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error('HTTP ' + response.status);
                return response.text();
            })
            .then(html => {
                const baseHref = url.substring(0, url.lastIndexOf('/') + 1);
                const baseTag = `<base href="${baseHref}">`;
                const headMatch = html.match(/<head[^>]*>/i);
                const withBase = headMatch
                    ? html.slice(0, headMatch.index + headMatch[0].length) + baseTag + html.slice(headMatch.index + headMatch[0].length)
                    : baseTag + html;

                newWin.document.open();
                newWin.document.write(withBase);
                newWin.document.close();
            })
            .catch(error => {
                console.error(`Error loading game HTML from ${url}:`, error);
                newWin.document.open();
                newWin.document.write('<!doctype html><title>Error</title><body style="font-family: sans-serif; padding: 20px; color: red;">Failed to load game.</body>');
                newWin.document.close();
            });
    }

    // Shared setup for both the PC GAMES grid and the GAMES grid.
    // Fetches one or more game-list JSON sources (jsonUrls can be a single
    // URL string, or an array of URLs — e.g. a main list plus a secondary
    // list with more games, both in the same format). All sources are
    // fetched, merged together, filtered against `ignoreList` (entries can
    // be a game's name or its link/url — see GAMES_IGNORE_LIST /
    // PCGAMES_IGNORE_LIST above), and always sorted alphabetically by name
    // before rendering into `listElId`. `searchElId` filters the rendered
    // cards by name as you type. `openMode` controls what a click does:
    // 'navigate' (default) sends the current tab to game.link, while
    // 'fetchHtml' fetches that game's HTML and loads it into a fresh
    // about:blank window via openGameInNewWindow().
    function setupGameGrid(jsonUrls, listElId, searchElId, ignoreList, openMode) {
        const urls = Array.isArray(jsonUrls) ? jsonUrls : [jsonUrls];
        const listEl = document.getElementById(listElId);
        const searchEl = document.getElementById(searchElId);
        const ignored = new Set(
            (ignoreList || []).map(entry => (entry || '').trim().toLowerCase())
        );
        let gameData = [];

        function renderGrid(filterText) {
            const term = (filterText || '').trim().toLowerCase();
            listEl.innerHTML = '';

            const filtered = !term
                ? gameData
                : gameData.filter(game => (game.name || '').toLowerCase().includes(term));

            if (filtered.length === 0) {
                listEl.innerHTML = '<span style="font-size: 12px; color: #444;">No games match your search.</span>';
                return;
            }

            filtered.forEach(game => {
                // Create main game container
                // (styling lives in styles.css as .pcgame-card so it can re-skin per theme)
                const gameDiv = document.createElement("div");
                gameDiv.className = "pcgame-card";

                // Add click event for the link
                gameDiv.onclick = () => {
                    if (openMode === 'fetchHtml') {
                        openGameInNewWindow(game.link);
                    } else {
                        window.location.href = game.link;
                    }
                };

                // Create image element
                const img = document.createElement("img");
                img.src = game.image;
                img.alt = game.name;
                img.className = "pcgame-thumb";

                // Create title element
                const titleSpan = document.createElement("span");
                titleSpan.textContent = game.name;
                titleSpan.className = "pcgame-title";

                // Construct the card and add it to the list
                gameDiv.appendChild(img);
                gameDiv.appendChild(titleSpan);
                listEl.appendChild(gameDiv);
            });
        }

        Promise.all(urls.map(url =>
            fetch(url)
                .then(response => response.json())
                .then(games => Array.isArray(games) ? games : [])
                .catch(error => {
                    // A single source failing (e.g. the secondary JSON being
                    // temporarily unreachable) shouldn't blank out the whole
                    // grid — just log it and treat that source as empty.
                    console.error(`Error loading games from ${url}:`, error);
                    return null;
                })
        )).then(results => {
            const succeeded = results.some(r => r !== null);
            const raw = results.filter(r => r !== null).flat();

            if (!succeeded) {
                listEl.innerHTML = '<span style="color: red; font-size: 12px;">Failed to load game directory.</span>';
                return;
            }

            gameData = raw
                .filter(game => {
                    if (ignored.size === 0) return true;
                    const nameKey = (game.name || '').trim().toLowerCase();
                    const linkKey = (game.url || '').trim().toLowerCase();
                    return !ignored.has(nameKey) && !ignored.has(linkKey);
                })
                .map(game => ({
                    name: game.name,
                    image: (game.cover || '').replace('{COVER_URL}', COVER_URL),
                    link: (game.url || '').replace('{HTML_URL}', HTML_URL)
                }))
                // Always alphabetical, regardless of how many sources were merged in.
                .sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));

            renderGrid(searchEl ? searchEl.value : '');
        });

        if (searchEl) {
            searchEl.addEventListener('input', () => renderGrid(searchEl.value));
        }
    }

    // PC GAMES: single JSON source, same format as zones.json below.
    // Replace '1.json' with your actual JSON endpoint/file path for PC GAMES.
    // Clicking a card navigates the current tab to game.link (default openMode).
    setupGameGrid('https://cdn.jsdelivr.net/gh/Dave-031/Newdemo@61871cd81ef62f9240929d24fbdde7c5bc48a16c/pcGames.json', 'pcgames-list', 'pcgames-search', PCGAMES_IGNORE_LIST);

    // GAMES window: now driven entirely by the zone-viewer script at the
    // bottom of this file (search '#searchBar' / '#container' section below).
    // It fetches zones.json AND testing.json, merges them, filters out
    // anything in GAMES_IGNORE_LIST (matched by name or url), renders the
    // #container grid, and opens a clicked game in the in-page #zoneViewer
    // window (or the YT Playables popup) instead of a new tab.
});