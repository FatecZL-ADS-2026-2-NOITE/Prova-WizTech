import { carregarLimiteArturAlvim, pontoDentroDoPoligono } from "./map-boundary.mjs";
import { criarPontosMapa } from "./map-points.mjs";

const L = window.L;
const centro = [-23.54024, -46.48471];
const filtros = { area: "todos", categoria: "todos" };
const mobile = window.matchMedia("(max-width: 640px)").matches;
const limitesMapa = mobile
    ? L.latLngBounds([-23.590, -46.560], [-23.500, -46.420])
    : L.latLngBounds([-23.565, -46.515], [-23.515, -46.455]);

const mapa = L.map("map", {
    minZoom: 14,
    maxZoom: 20,
    maxBounds: limitesMapa,
    maxBoundsViscosity: mobile ? 0.7 : 1
}).setView(centro, 15);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    minZoom: 14,
    maxZoom: 20,
    maxNativeZoom: 19
}).addTo(mapa);

window.addEventListener("resize", () => mapa.invalidateSize());

const camadaLimite = L.featureGroup().addTo(mapa);
const limitesArturAlvim = [];
const pontosMapa = criarPontosMapa();
window.pontosMapa = pontosMapa;

function estaDentroDeArturAlvim(coordenadas) {
    return limitesArturAlvim.some(poligono =>
        pontoDentroDoPoligono(coordenadas, poligono.getLatLngs()[0])
    );
}

function obterEstimativaColeta(coordenadas) {
    if (limitesArturAlvim.length === 0) {
        return "<small>As estimativas de coleta não estão disponíveis no momento.</small>";
    }

    const limitesGeograficos = L.latLngBounds([]);
    limitesArturAlvim.forEach(poligono => limitesGeograficos.extend(poligono.getBounds()));

    const faixaLatitude =
        (limitesGeograficos.getNorth() - limitesGeograficos.getSouth()) / 3;
    const posicao = Math.max(0, Math.min(
        2,
        Math.floor((coordenadas.lat - limitesGeograficos.getSouth()) / faixaLatitude)
    ));
    const estimativas = [
        { regiao: "Sul", dias: "quarta e sábado", horario: "das 13h às 16h" },
        { regiao: "Centro", dias: "terça e sexta", horario: "das 10h às 13h" },
        { regiao: "Norte", dias: "segunda e quinta", horario: "das 7h às 10h" }
    ];
    const estimativa = estimativas[posicao];

    return `<b>Região ${estimativa.regiao} — coleta seletiva</b><br>` +
        `<b>Dias estimados:</b> ${estimativa.dias}<br>` +
        `<b>Horário estimado:</b> ${estimativa.horario}<br>` +
        `<small>Previsão aproximada; confirme os dias e horários da sua rua.</small>`;
}

function pontoEstaVisivel(ponto) {
    const correspondeCategoria = filtros.categoria === "todos" ||
        ponto.categoria === filtros.categoria;

    if (!correspondeCategoria) {
        return false;
    }

    if (filtros.area === "artur-alvim") {
        return estaDentroDeArturAlvim(ponto.coords);
    }

    if (filtros.area === "proximos") {
        const distanciaKm = L.latLng(ponto.coords).distanceTo(L.latLng(centro)) / 1000;
        return estaDentroDeArturAlvim(ponto.coords) || distanciaKm <= 2.1;
    }

    return true;
}

function aplicarFiltros() {
    pontosMapa.forEach(ponto => {
        const visivel = pontoEstaVisivel(ponto);

        if (visivel && !mapa.hasLayer(ponto.marker)) {
            mapa.addLayer(ponto.marker);
        } else if (!visivel && mapa.hasLayer(ponto.marker)) {
            mapa.removeLayer(ponto.marker);
        }
    });
}

function configurarFiltros() {
    document.querySelectorAll(".filter-btn").forEach(botao => {
        botao.addEventListener("click", () => {
            const grupo = botao.dataset.filterGroup;
            document.querySelectorAll(
                `.filter-btn[data-filter-group="${grupo}"]`
            ).forEach(item => item.classList.toggle("active", item === botao));

            filtros[grupo] = botao.dataset.filter;
            aplicarFiltros();
        });
    });
}

async function iniciarLimiteDoBairro() {
    try {
        limitesArturAlvim.push(
            ...await carregarLimiteArturAlvim(mapa, camadaLimite)
        );
        aplicarFiltros();
    } catch (erro) {
        console.error("Erro ao carregar o limite de Artur Alvim:", erro);
    }
}

pontosMapa.forEach(ponto => mapa.addLayer(ponto.marker));
configurarFiltros();
aplicarFiltros();
iniciarLimiteDoBairro();

mapa.on("click", evento => {
    if (estaDentroDeArturAlvim(evento.latlng)) {
        L.popup()
            .setLatLng(evento.latlng)
            .setContent(
                `<b>Artur Alvim</b><br>Delimitação administrativa<hr>` +
                obterEstimativaColeta(evento.latlng)
            )
            .openOn(mapa);
        return;
    }

    L.popup()
        .setLatLng(evento.latlng)
        .setContent(`
            <b>Local selecionado</b><br>
            Latitude: ${evento.latlng.lat.toFixed(6)}<br>
            Longitude: ${evento.latlng.lng.toFixed(6)}
        `)
        .openOn(mapa);
});
