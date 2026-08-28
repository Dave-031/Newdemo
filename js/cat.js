// ---- Taskbar cat: animated sprite you can slide left/right along the taskbar ----
(function setupTaskbarCat() {
    const catEl = document.getElementById('taskbar-cat');
    const taskbarEl = document.getElementById('taskbar');
    if (!catEl || !taskbarEl) return;

    let isDraggingCat = false;
    let dragStartX = 0;
    let catStartLeft = 0;

    // ---- Meow sound options ----
    
    let meowSound;
    let meowSoundUrls = {
        meow1: 'https://cdn.jsdelivr.net/gh/Dave-031/Newdemo@064ed227b7d0d19d24615b1ebf929ca8733b0700/cat_anim/meow3.mp3',
        meow2: 'https://cdn.jsdelivr.net/gh/Dave-031/Newdemo@064ed227b7d0d19d24615b1ebf929ca8733b0700/cat_anim/meow2.mp3',
        meow3: 'https://cdn.jsdelivr.net/gh/Dave-031/Newdemo@064ed227b7d0d19d24615b1ebf929ca8733b0700/cat_anim/meow1.mp3'
    };
    meowSound = new Audio(meowSoundUrls[settings.meowSound] || meowSoundUrls.meow1);
    window.meowSound = meowSound
    function playMeow() {
        if (!settings.enableMeow) return;
        if (!meowSound.paused) return;
        meowSound.play().catch(() => {});
    }

    function clampCatLeft(left) {
        const maxLeft = taskbarEl.clientWidth - catEl.offsetWidth;
        if (left < 0) return 0;
        if (left > maxLeft) return maxLeft;
        return left;
    }

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
        catEl.style.left = clampCatLeft(catStartLeft + deltaX) + 'px';
    });

    document.addEventListener('mouseup', () => {
        if (!isDraggingCat) return;
        isDraggingCat = false;
        catEl.classList.remove('dragging');
    });

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
        catEl.style.left = clampCatLeft(catStartLeft + deltaX) + 'px';
    }, { passive: true });

    document.addEventListener('touchend', () => {
        if (!isDraggingCat) return;
        isDraggingCat = false;
        catEl.classList.remove('dragging');
    });

    catEl.style.left = clampCatLeft(catEl.offsetLeft) + 'px';
})();

