// what does this do its never called???
function resolveUrl(template, base) {
    return template.replace('{HTML_URL}', base);
}




HTMLCanvasElement.prototype.toDataURL = function (...args) {
    return "";
};

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register(new URL('sw.js', location.href).href).catch(() => {});
}


//do nothing on page load
