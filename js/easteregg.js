
const EGG_IMAGES_PER_TRIGGER = 2;
let eggAnimationActive = false; // Locked while any triggered images are still on screen
let eggImagesInFlight = 0;

function pickRandomUniqueUrls(count) {
    const pool = EGG_ROLL_IMAGE_URLS.filter(url => url && url.trim() !== '');
    if (pool.length === 0) return [];

    // Shuffle a copy of the pool (Fisher-Yates) and take the first `count`
    // entries so the 2 images picked each trigger are random and distinct
    // (unless the pool itself is smaller than `count`).
    const shuffled = pool.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, Math.min(count, shuffled.length));
}
function spawnSingleEggImage(url) {
    const isRoll = Math.random() < 0.5;
    const duration = 3.5 + Math.random() * 2; // 3.5s - 5.5s, so the two images don't move in lockstep

    const img = document.createElement('img');
    img.src = url;
    img.alt = '';
    img.style.animationDuration = `${duration}s`;

    if (isRoll) {
        img.className = 'egg-roll-image';
        img.style.top = `${10 + Math.random() * 75}%`; // random vertical spot
    } else {
        img.className = 'egg-fall-image';
        img.style.left = `${5 + Math.random() * 85}%`; // random horizontal spot
    }

    document.body.appendChild(img);
    eggImagesInFlight++;

    // Clean up once this image finishes its run across/down the screen.
    // animationend is the normal path; the timeout is a safety net (e.g.
    // a broken image URL that never properly starts/finishes the animation).
    const cleanup = () => {
        if (img.isConnected) img.remove();
        eggImagesInFlight = Math.max(0, eggImagesInFlight - 1);
        if (eggImagesInFlight === 0) eggAnimationActive = false;
    };
    img.addEventListener('animationend', cleanup);
    setTimeout(cleanup, (duration * 1000) + 500);
}
function spawnEggRollImage() {
    if (eggAnimationActive) return; // Already running — never overlap triggers.

    const urls = pickRandomUniqueUrls(EGG_IMAGES_PER_TRIGGER);
    if (urls.length === 0) return; // No URLs filled in — silently do nothing, keeps it secret.

    eggAnimationActive = true;
    urls.forEach(url => spawnSingleEggImage(url));
}
(function () {
    const startBtn = document.getElementById('start-btn');
    if (!startBtn) return;

    const CLICKS_NEEDED = 10;
    const CLICK_WINDOW_MS = 4000; // clicks reset the count if they're spaced out this much
    let clickCount = 0;
    let resetTimer = null;

    startBtn.addEventListener('click', () => {
        // Ignore clicks entirely while images are still on screen — this is
        // what stops someone from mashing the button fast and stacking up
        // multiple overlapping triggers. They have to wait for the current
        // run to finish, then click 10 fresh times.
        if (eggAnimationActive) return;

        clickCount++;
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => { clickCount = 0; }, CLICK_WINDOW_MS);

        if (clickCount >= CLICKS_NEEDED) {
            clickCount = 0;
            clearTimeout(resetTimer);
            spawnEggRollImage();
        }
    });
})();