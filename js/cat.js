// ---- Taskbar cat: animated sprite you can slide left/right along the taskbar ----
(function setupTaskbarCat() {
    const catEl = document.getElementById('taskbar-cat');
    const taskbarEl = document.getElementById('taskbar');
    if (!catEl || !taskbarEl) return;

    let isDraggingCat = false;
    let dragStartX = 0;
    let catStartLeft = 0;

    // ---- Meow sound options ----
    // Paste your 3 meow sound links here. "meow1" already has the original
    // sound as a default; just fill in the empty strings for meow2 / meow3.
    let meowSound;
    let meowSoundUrls = {
        meow1: 'https://cdn.jsdelivr.net/gh/Dave-031/Newdemo@064ed227b7d0d19d24615b1ebf929ca8733b0700/cat_anim/meow3.mp3',
        meow2: 'https://cdn.jsdelivr.net/gh/Dave-031/Newdemo@064ed227b7d0d19d24615b1ebf929ca8733b0700/cat_anim/meow2.mp3', // <-- paste link for Meow 2 here
        meow3: 'https://cdn.jsdelivr.net/gh/Dave-031/Newdemo@064ed227b7d0d19d24615b1ebf929ca8733b0700/cat_anim/meow1.mp3'  // <-- paste link for Meow 3 here
    };

    meowSound = new Audio(meowSoundUrls[settings.meowSound] || meowSoundUrls.meow1);

    function playMeow() {
        if (!settings.enableMeow) return;

        // Prevent the sound from clipping or restarting if it's already playing
        if (!meowSound.paused) return;

        meowSound.play().catch(() => {});
    }

    function clampCatLeft(left) {
        const maxLeft = taskbarEl.clientWidth - catEl.offsetWidth;
        if (left < 0) return 0;
        if (left > maxLeft) return maxLeft;
        return left;
    }

    // Keep the cat inside the taskbar if the window gets resized
    window.addEventListener('resize', () => {
        catEl.style.left = clampCatLeft(catEl.offsetLeft) + 'px';
    });

    catEl.addEventListener('mousedown', (e) => {
        isDraggingCat = true;
        dragStartX = e.clientX;
        catStartLeft = catEl.offsetLeft;
        catEl.classList.add('dragging');
        playMeow();
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDraggingCat) return;
        const deltaX = e.clientX - dragStartX;
        const newLeft = clampCatLeft(catStartLeft + deltaX);
        catEl.style.left = newLeft + 'px';
    });

    document.addEventListener('mouseup', () => {
        if (!isDraggingCat) return;
        isDraggingCat = false;
        catEl.classList.remove('dragging');
    });

    // Touch support so it can be dragged on mobile too
    catEl.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        isDraggingCat = true;
        dragStartX = touch.clientX;
        catStartLeft = catEl.offsetLeft;
        catEl.classList.add('dragging');
        playMeow();
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (!isDraggingCat) return;
        const touch = e.touches[0];
        const deltaX = touch.clientX - dragStartX;
        const newLeft = clampCatLeft(catStartLeft + deltaX);
        catEl.style.left = newLeft + 'px';
    }, { passive: true });

    document.addEventListener('touchend', () => {
        if (!isDraggingCat) return;
        isDraggingCat = false;
        catEl.classList.remove('dragging');
    });

    // Make sure the cat starts inside taskbar bounds
    catEl.style.left = clampCatLeft(catEl.offsetLeft) + 'px';
})();

function ChangeCatTheme(theme) {
    
}
function updateCatSettings() {
    const catEl = document.getElementById('taskbar-cat');
    if (catEl) {
        catEl.style.display = 'block'; // Cat is always visible — do not gate this on settings.showCat
        catEl.style.setProperty('--cat-scale', settings.catScale);
        catEl.style.bottom = ''; // Clears any buggy inline math from the last step
    }
}
    // ---- Meow sound options ----
    // Paste your 3 meow sound links here. "meow1" already has the original
    // sound as a default; just fill in the empty strings for meow2 / meow3.
    let meowSound;
    let meowSoundUrls = {
        meow1: 'https://cdn.jsdelivr.net/gh/Dave-031/Newdemo@064ed227b7d0d19d24615b1ebf929ca8733b0700/cat_anim/meow3.mp3',
        meow2: 'https://cdn.jsdelivr.net/gh/Dave-031/Newdemo@064ed227b7d0d19d24615b1ebf929ca8733b0700/cat_anim/meow2.mp3', // <-- paste link for Meow 2 here
        meow3: 'https://cdn.jsdelivr.net/gh/Dave-031/Newdemo@064ed227b7d0d19d24615b1ebf929ca8733b0700/cat_anim/meow1.mp3'  // <-- paste link for Meow 3 here
    };

    meowSound = new Audio(meowSoundUrls[settings.meowSound] || meowSoundUrls.meow1);

    function playMeow() {
        if (!settings.enableMeow) return;

        // Prevent the sound from clipping or restarting if it's already playing
        if (!meowSound.paused) return;

        meowSound.play().catch(() => {});
    }

    function clampCatLeft(left) {
        const maxLeft = taskbarEl.clientWidth - catEl.offsetWidth;
        if (left < 0) return 0;
        if (left > maxLeft) return maxLeft;
        return left;
    }

    // Keep the cat inside the taskbar if the window gets resized
    window.addEventListener('resize', () => {
        catEl.style.left = clampCatLeft(catEl.offsetLeft) + 'px';
    });

    catEl.addEventListener('mousedown', (e) => {
        isDraggingCat = true;
        dragStartX = e.clientX;
        catStartLeft = catEl.offsetLeft;
        catEl.classList.add('dragging');
        playMeow();
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDraggingCat) return;
        const deltaX = e.clientX - dragStartX;
        const newLeft = clampCatLeft(catStartLeft + deltaX);
        catEl.style.left = newLeft + 'px';
    });

    document.addEventListener('mouseup', () => {
        if (!isDraggingCat) return;
        isDraggingCat = false;
        catEl.classList.remove('dragging');
    });

    // Touch support so it can be dragged on mobile too
    catEl.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        isDraggingCat = true;
        dragStartX = touch.clientX;
        catStartLeft = catEl.offsetLeft;
        catEl.classList.add('dragging');
        playMeow();
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (!isDraggingCat) return;
        const touch = e.touches[0];
        const deltaX = touch.clientX - dragStartX;
        const newLeft = clampCatLeft(catStartLeft + deltaX);
        catEl.style.left = newLeft + 'px';
    }, { passive: true });

    document.addEventListener('touchend', () => {
        if (!isDraggingCat) return;
        isDraggingCat = false;
        catEl.classList.remove('dragging');
    });

    // Make sure the cat starts inside taskbar bounds
    catEl.style.left = clampCatLeft(catEl.offsetLeft) + 'px';
})();

