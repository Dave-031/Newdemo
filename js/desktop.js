
// --- DESKTOP ICONS LOGIC ---
const gridWidth = 90;
const gridHeight = 100;
const desktopIcons = document.querySelectorAll('.desktop-icon');

// 1. Initialize their starting positions in a grid (top to bottom, left to right)
let startX = 10;
let startY = 10;
const maxScreenHeight = window.innerHeight - 80;

desktopIcons.forEach((icon) => {
    icon.style.left = `${startX}px`;
    icon.style.top = `${startY}px`;

    startY += gridHeight;
    // Move to the next column if we hit the bottom of the screen
    if (startY > maxScreenHeight) {
        startY = 10;
        startX += gridWidth;
    }
});

// 2. Drag and Snap logic
let draggedIcon = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

desktopIcons.forEach(icon => {
    // Single click: Select the icon
    icon.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; // Only allow left-click dragging

        document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
        icon.classList.add('selected');

        // Start Drag
        draggedIcon = icon;
        const rect = icon.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;

        icon.style.zIndex = 2; // Slight bump to stay above other icons while dragging
        e.stopPropagation();
    });

    // Double click: Open the window
    icon.addEventListener('dblclick', () => {
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
    });
});

// Handle moving the mouse
document.addEventListener('mousemove', (e) => {
    if (!draggedIcon) return;

    // Move the icon freely with the mouse
    const newLeft = e.clientX - dragOffsetX;
    const newTop = e.clientY - dragOffsetY;

    draggedIcon.style.left = `${newLeft}px`;
    draggedIcon.style.top = `${newTop}px`;
});

// Handle releasing the mouse and snapping to grid
// Helper function to check if a grid slot is already taken
function isSlotOccupied(x, y, currentIcon) {
    const icons = document.querySelectorAll('.desktop-icon');
    for (let i = 0; i < icons.length; i++) {
        if (icons[i] === currentIcon) continue;

        const iconLeft = parseInt(icons[i].style.left, 10);
        const iconTop = parseInt(icons[i].style.top, 10);

        // If an icon is found at these exact coordinates, the slot is taken
        if (iconLeft === x && iconTop === y) {
            return true;
        }
    }
    return false;
}

// Handle releasing the mouse and snapping to grid (UPDATED)
document.addEventListener('mouseup', (e) => {
    if (!draggedIcon) return;

    const rect = draggedIcon.getBoundingClientRect();

    // Calculate nearest grid slot
    let snappedX = Math.round((rect.left - 10) / gridWidth) * gridWidth + 10;
    let snappedY = Math.round((rect.top - 10) / gridHeight) * gridHeight + 10;

    // Prevent dragging off the top or left of the screen
    if (snappedX < 10) snappedX = 10;
    if (snappedY < 10) snappedY = 10;

    // --- NEW: Collision detection to prevent stacking ---
    const maxScreenHeight = window.innerHeight - 80;

    // While the target slot is taken, find the next open slot
    while (isSlotOccupied(snappedX, snappedY, draggedIcon)) {
        snappedY += gridHeight; // Move down one slot

        // If we hit the bottom of the screen, move to the top of the next column
        if (snappedY > maxScreenHeight) {
            snappedY = 10;
            snappedX += gridWidth;
        }
    }
    // ----------------------------------------------------

    // Apply the final empty snapped position
    draggedIcon.style.left = `${snappedX}px`;
    draggedIcon.style.top = `${snappedY}px`;
    draggedIcon.style.zIndex = ''; // Reset z-index

    draggedIcon = null;
});

// Deselect icons if you click the empty desktop background
document.body.addEventListener('mousedown', (e) => {
    if (!e.target.closest('.desktop-icon')) {
        document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
    }
});
