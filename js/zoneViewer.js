
// ============================================================
// GAMES window — zone viewer
// Drives #searchBar / #container in the GAMES window, plus the
// #zoneViewer game window and the #popupOverlay YT Playables popup.
// Loads zones.json + testing.json (see listZones) and respects
// GAMES_IGNORE_LIST from the top of this file.
// ============================================================
const container = document.getElementById('container');
const zoneViewer = document.getElementById('zoneViewer');
let zoneFrame = document.getElementById('zoneFrame');
const searchBar = document.getElementById('searchBar');
let zonesURL = "https://cdn.jsdelivr.net/gh/freebuisness/assets@main/zones.json";
// Secondary source, same format as zones.json — merged in alongside it below.
let testingURL = "https://cdn.jsdelivr.net/gh/Dave-031/Newdemo@1e4feb06cf41793be1cd80031cb26e38856f8df2/testing.json";
const coverURL = "https://cdn.jsdelivr.net/gh/freebuisness/covers@main/";
const htmlURL = "https://cdn.jsdelivr.net/gh/freebuisness/html@main/";

function zoneURL(u) {
    return (u + "").replace("{COVER_URL}", coverURL).replace("{HTML_URL}", htmlURL);
}
let zones = [];

async function listZones() {
    try {
        // Fetch zones.json + testing.json and merge them, same pattern as
        // setupGameGrid's multi-source merge above. One source failing
        // (e.g. testing.json being temporarily unreachable) doesn't blank
        // out the whole grid — it just falls back to whatever succeeded.
        const sources = [zonesURL, testingURL];
        const results = await Promise.all(sources.map(url =>
            fetch(url + "?t=" + Date.now())
                .then(response => response.json())
                .then(json => Array.isArray(json) ? json : [])
                .catch(error => {
                    console.error(`Error loading zones from ${url}:`, error);
                    return null;
                })
        ));

        const succeeded = results.some(r => r !== null);
        if (!succeeded) throw new Error('Failed to load zones.json and testing.json');

        const merged = results.filter(r => r !== null).flat();

        // Apply GAMES_IGNORE_LIST — entries can be a game's exact name or
        // its link/url (matching is case-insensitive, whitespace-trimmed).
        const ignored = new Set(
            GAMES_IGNORE_LIST.map(entry => (entry || '').trim().toLowerCase())
        );
        zones = ignored.size === 0
            ? merged
            : merged.filter(zone => {
                const nameKey = (zone.name || '').trim().toLowerCase();
                const urlKey = (zone.url || '').trim().toLowerCase();
                return !ignored.has(nameKey) && !ignored.has(urlKey);
            });
        
        // Default sort by ID
        zones.sort((a, b) => a.id - b.id);
        zones.sort((a, b) => (a.id === -1 ? -1 : b.id === -1 ? 1 : 0));
        
        displayZones(zones);

    } catch (error) {
        console.error(error);
        container.innerHTML = `Error loading zones: ${error}`;
    }
}

function displayZones(zonesToDisplay) {
    container.innerHTML = "";
    zonesToDisplay.forEach((file, index) => {
        const zoneItem = document.createElement("div");
        zoneItem.className = "zone-item";
        zoneItem.onclick = () => openZone(file);
        
        const img = document.createElement("img");
        img.dataset.src = zoneURL(file.cover);
        img.alt = file.name;
        img.loading = "lazy";
        img.className = "lazy-zone-img";
        zoneItem.appendChild(img);
        
        const button = document.createElement("button");
        const label = document.createElement("span");
        label.className = "zone-title-text";
        label.textContent = file.name;
        button.appendChild(label);
        button.onclick = (event) => {
            event.stopPropagation();
            openZone(file);
        };
        zoneItem.appendChild(button);
        container.appendChild(zoneItem);   
    });
    
    if (container.innerHTML === "") {
        container.innerHTML = "No zones found.";
    }

    const lazyImages = document.querySelectorAll('img.lazy-zone-img');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !zoneViewer.hidden) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove("lazy-zone-img");
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: "100px", 
        threshold: 0.1
    });

    lazyImages.forEach(img => {
        imageObserver.observe(img);
    });
}

function filterZones() {
    const query = searchBar.value.toLowerCase();
    const filteredZones = zones.filter(zone => zone.name.toLowerCase().includes(query));
    displayZones(filteredZones);
}

const BASE_TAG_RE = /<base\b[^>]*>/i;
const BASE_HREF_RE = /<base\b[^>]*\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s">]+))[^>]*>/i;

function zoneBaseFor(url, html) {
    const folder = url.substring(0, url.lastIndexOf('/') + 1);
    let root;
    try { root = new URL(folder, document.baseURI).href; } catch (e) { root = folder; }
    const m = html.match(BASE_HREF_RE);
    const declared = m ? (m[1] !== undefined ? m[1] : m[2] !== undefined ? m[2] : m[3]) : "";
    if (!declared) return root;
    try { return new URL(declared, root).href; } catch (e) { return root; }
}

function injectZoneBase(html, url) {
    const tag = '<base href="' + zoneBaseFor(url, html) + '">';
    if (BASE_TAG_RE.test(html)) return html.replace(BASE_TAG_RE, tag);
    if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, function (m) { return m + tag; });
    if (/<html[^>]*>/i.test(html)) return html.replace(/<html[^>]*>/i, function (m) { return m + tag; });
    return tag + html;
}

function openZone(file) {
    if (file.url.startsWith("http")) {
        window.open(file.url, "_blank");
    } else {
        const url = zoneURL(file.url);
        fetch(url+"?t="+Date.now()).then(response => response.text()).then(html => {
            if (/ytgame/i.test(html)) {
                document.getElementById('popupTitle').textContent = file.name;
                const pb = document.getElementById('popupBody');
                pb.contentEditable = false;
                // Plain <p>/<button> markup on purpose — #popupOverlay's CSS
                // (styles.css, themed per data-theme) styles these directly,
                // same as every other themed window on the site.
                pb.innerHTML = '<p>This is a YouTube Playables game, so it only works in its own tab. It\'ll open in a <strong>new tab</strong>.</p>'
                    + '<button id="ytOpenBtn">Open in New Tab</button>';
                document.getElementById('ytOpenBtn').onclick = function () {
                    const newWindow = window.open("about:blank", "_blank");
                    if (!newWindow) {
                        alert("Your browser blocked the popup. Allow popups for this site and try again.");
                        return;
                    }
                    newWindow.document.open();
                    newWindow.document.write(injectZoneBase(html, url));
                    newWindow.document.close();
                    closePopup();
                };
                document.getElementById('popupOverlay').style.display = "flex";
                return;
            }
            html = injectZoneBase(html, url);
            if (zoneFrame.contentDocument === null) {
                zoneFrame = document.createElement("iframe");
                zoneFrame.id = "zoneFrame";
                zoneViewer.appendChild(zoneFrame);
            }
            zoneFrame.contentDocument.open();
            zoneFrame.contentDocument.write(html);
            zoneFrame.contentDocument.close();
            document.getElementById('zoneName').textContent = file.name;
            document.getElementById('zoneId').textContent = file.id;
            
            zoneViewer.style.display = "flex";
            try {
                const url = new URL(window.location);
                url.searchParams.set('id', file.id);
                history.pushState(null, '', url.toString());
            } catch(error){}
            zoneViewer.hidden = true;
        }).catch(error => alert("Failed to load zone: " + error));
    }
}

function aboutBlank() {
    const newWindow = window.open("about:blank", "_blank");
    let zone = zoneURL(zones.find(zone => zone.id + '' === document.getElementById('zoneId').textContent).url);
    fetch(zone+"?t="+Date.now()).then(response => response.text()).then(html => {
        html = injectZoneBase(html, zone);
        if (newWindow) {
            newWindow.document.open();
            newWindow.document.write(html);
            newWindow.document.close();
        }
    })
}

function closeZone() {
    zoneViewer.hidden = false;
    zoneViewer.style.display = "none";
    zoneViewer.removeChild(zoneFrame);
    try {
        const url = new URL(window.location);
        url.searchParams.delete('id');
        history.pushState(null, '', url.toString());
    } catch(error){}
}

function fullscreenZone() {
    if (zoneFrame.requestFullscreen) {
        zoneFrame.requestFullscreen();
    } else if (zoneFrame.mozRequestFullScreen) {
        zoneFrame.mozRequestFullScreen();
    } else if (zoneFrame.webkitRequestFullscreen) {
        zoneFrame.webkitRequestFullscreen();
    } else if (zoneFrame.msRequestFullscreen) {
        zoneFrame.msRequestFullscreen();
    }
}

function closePopup() {
    document.getElementById('popupOverlay').style.display = "none";
}