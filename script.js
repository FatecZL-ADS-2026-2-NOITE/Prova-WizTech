const centro = [-23.54024, -46.48471];

const limites = L.latLngBounds(
    [-23.565, -46.515],
    [-23.515, -46.455]
);

const map = L.map("map", {
    minZoom: 14,
    maxZoom: 22,
    maxBounds: limites,
    maxBoundsViscosity: 1
}).setView(centro, 15);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    minZoom: 14,
    maxZoom: 19,
    maxNativeZoom: 19
}).addTo(map);

const camadaLimite = L.featureGroup().addTo(map);

async function carregarLimiteArturAlvim() {
    const url = "https://www.openstreetmap.org/api/0.6/relation/3049500/full";

    try {
        const resposta = await fetch(url);

        if (!resposta.ok) {
            throw new Error(`Erro HTTP ${resposta.status}`);
        }

        const textoXML = await resposta.text();

        const documento = new DOMParser().parseFromString(
            textoXML,
            "application/xml"
        );

        if (documento.querySelector("parsererror")) {
            throw new Error("Não foi possível interpretar o XML.");
        }

        const nos = new Map();

        documento.querySelectorAll("node").forEach(no => {
            nos.set(no.getAttribute("id"), [
                Number(no.getAttribute("lat")),
                Number(no.getAttribute("lon"))
            ]);
        });

        const vias = new Map();

        documento.querySelectorAll("way").forEach(via => {
            const id = via.getAttribute("id");

            const pontos = Array.from(via.querySelectorAll("nd"))
                .map(nd => nos.get(nd.getAttribute("ref")))
                .filter(Boolean);

            vias.set(id, pontos);
        });

        const membros = Array.from(
            documento.querySelectorAll(
                'relation[id="3049500"] > member[type="way"][role="outer"]'
            )
        );

        const caminhos = membros
            .map(membro => vias.get(membro.getAttribute("ref")))
            .filter(caminho => caminho && caminho.length >= 2)
            .map(caminho => [...caminho]);

        if (caminhos.length === 0) {
            throw new Error("Nenhum trecho do limite foi encontrado.");
        }

        const aneis = [];

        while (caminhos.length > 0) {
            let anel = caminhos.shift();
            let conectado = true;

            while (conectado) {
                conectado = false;

                const inicio = anel[0];
                const fim = anel[anel.length - 1];

                const igual = (a, b) =>
                    a[0] === b[0] && a[1] === b[1];

                for (let i = 0; i < caminhos.length; i++) {
                    const caminho = caminhos[i];
                    const primeiro = caminho[0];
                    const ultimo = caminho[caminho.length - 1];

                    if (igual(fim, primeiro)) {
                        anel.push(...caminho.slice(1));
                    } else if (igual(fim, ultimo)) {
                        anel.push(...caminho.reverse().slice(1));
                    } else if (igual(inicio, ultimo)) {
                        anel.unshift(...caminho.slice(0, -1));
                    } else if (igual(inicio, primeiro)) {
                        anel.unshift(...caminho.reverse().slice(0, -1));
                    } else {
                        continue;
                    }

                    caminhos.splice(i, 1);
                    conectado = true;
                    break;
                }
            }

            const primeiro = anel[0];
            const ultimo = anel[anel.length - 1];

            if (
                primeiro[0] === ultimo[0] &&
                primeiro[1] === ultimo[1] &&
                anel.length >= 4
            ) {
                aneis.push(anel);
            } else {
                console.warn("Um trecho do limite não formou um anel fechado.");
            }
        }

        if (aneis.length === 0) {
            throw new Error("Não foi possível fechar o contorno administrativo.");
        }

        aneis.forEach(anel => {
            L.polygon(anel, {
                color: "#ff6500",
                weight: 3,
                opacity: 1,
                fillColor: "#ff6500",
                fillOpacity: 0.08,
                lineJoin: "round"
            })
                .bindPopup(
                    "<b>Artur Alvim</b><br>Delimitação administrativa"
                )
                .addTo(camadaLimite);
        });

    } catch (erro) {
        console.error("Erro ao carregar o limite de Artur Alvim:", erro);
    }
}

carregarLimiteArturAlvim();

// Ecoponto COHAB Artur Alvim
const cohab = [-23.5408, -46.4790];

L.marker(cohab)
    .addTo(map)
    .bindPopup(`
        <b>Ecoponto COHAB Artur Alvim</b><br>
        Avenida Padre Estanislau de Campos, 56<br>
        <b>Tipo:</b> Ecoponto municipal<br>
        <a href="https://www.google.com/maps/search/?api=1&query=Ecoponto+COHAB+Artur+Alvim+Sao+Paulo"
           target="_blank" rel="noopener noreferrer">
            Ver rota
        </a>
    `);

// Ecoponto Franquinho
const franquinho = [-23.5400, -46.4730];

L.marker(franquinho)
    .addTo(map)
    .bindPopup(`
        <b>Ecoponto Franquinho</b><br>
        Rua Praia de Mucuripe, 685<br>
        Jardim Artur Alvim<br>
        <b>Tipo:</b> Ecoponto municipal<br>
        <a href="https://www.google.com/maps/search/?api=1&query=Ecoponto+Franquinho+Sao+Paulo"
           target="_blank" rel="noopener noreferrer">
            Ver rota
        </a>
    `);

// Ecoponto Jardim São Nicolau
const jardimSaoNicolau = [-23.5355, -46.4830];

L.marker(jardimSaoNicolau)
    .addTo(map)
    .bindPopup(`
        <b>Ecoponto Jardim São Nicolau</b><br>
        Rua Agreste de Itabaiana, 590<br>
        Jardim Artur Alvim, São Paulo - SP<br>
        <b>Tipo:</b> Ponto de descarte<br>
        <a href="https://www.google.com/maps/search/?api=1&query=Rua+Agreste+de+Itabaiana+590+Sao+Paulo"
           target="_blank" rel="noopener noreferrer">
            Ver localização
        </a>
    `);


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