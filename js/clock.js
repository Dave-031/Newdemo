
function updateClock() {
    const clockElement = document.getElementById('taskbar-clock');
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    clockElement.innerText = `${hours}:${minutes} ${ampm}`;
}
updateClock();
setInterval(updateClock, 1000);
