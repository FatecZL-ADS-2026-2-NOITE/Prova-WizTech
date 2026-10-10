const centro = [-23.54024, -46.48471];

const limites = L.latLngBounds(
    [-23.565, -46.515],
    [-23.515, -46.455]
);

const map = L.map("map", {
    minZoom: 13,
    maxZoom: 19,
    maxBounds: limites,
    maxBoundsViscosity: 1
}).setView(centro, 15);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19
}).addTo(map);

L.marker(centro)
    .addTo(map)
    .bindPopup("<b>Estação Artur Alvim</b>");

map.on("click", function (e) {
    L.popup()
        .setLatLng(e.latlng)
        .setContent(`
            <b>Local selecionado</b><br>
            Latitude: ${e.latlng.lat.toFixed(6)}<br>
            Longitude: ${e.latlng.lng.toFixed(6)}
        `)
        .openOn(map);
});