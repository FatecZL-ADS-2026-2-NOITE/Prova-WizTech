const centro = [-23.54024, -46.48471];
const filtroAtual = { area: "todos", categoria: "todos" };
const mobile = window.matchMedia("(max-width: 640px)").matches;

const limites = mobile
    ? L.latLngBounds(
        [-23.590, -46.560],
        [-23.500, -46.420]
    )
    : L.latLngBounds(
        [-23.565, -46.515],
        [-23.515, -46.455]
    );

const map = L.map("map", {
    minZoom: 14,
    maxZoom: 20,
    maxBounds: limites,
    maxBoundsViscosity: mobile ? 0.7 : 1
}).setView(centro, 15);

const iconeMarcadorVerde = L.divIcon({
    className: "ecoponto-marker",
    html: `<svg width="32" height="42" viewBox="0 0 32 42" aria-hidden="true">
        <path fill="#198754" stroke="#fff" stroke-width="2"
            d="M16 1C7.7 1 1 7.7 1 16c0 11 15 25 15 25s15-14 15-25C31 7.7 24.3 1 16 1z"/>
        <circle cx="16" cy="16" r="5" fill="#fff"/>
    </svg>`,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -40]
});

const iconeMarcadorAmarelo = L.divIcon({
    className: "ponto-especifico-marker",
    html: `<svg width="32" height="42" viewBox="0 0 32 42" aria-hidden="true">
        <path fill="#f2b705" stroke="#fff" stroke-width="2"
            d="M16 1C7.7 1 1 7.7 1 16c0 11 15 25 15 25s15-14 15-25C31 7.7 24.3 1 16 1z"/>
        <circle cx="16" cy="16" r="5" fill="#fff"/>
    </svg>`,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -40]
});

function criarMarcadorVerde(coordenadas) {
    return L.marker(coordenadas, { icon: iconeMarcadorVerde });
}

function criarMarcadorAmarelo(coordenadas) {
    return L.marker(coordenadas, { icon: iconeMarcadorAmarelo });
}

window.addEventListener("resize", () => {
    map.invalidateSize();
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    minZoom: 14,
    maxZoom: 20,
    maxNativeZoom: 19
}).addTo(map);

const camadaLimite = L.featureGroup().addTo(map);
const limitesArturAlvim = [];

function normalizarLatLng(latlng) {
    if (Array.isArray(latlng)) {
        return L.latLng(latlng[0], latlng[1]);
    }

    if (latlng && typeof latlng.lat === "number" && typeof latlng.lng === "number") { 
        return L.latLng(latlng.lat, latlng.lng);
    }

    return null;
}

function pontoDentroDoPoligono(latlng, coordenadas) {
    const ponto = normalizarLatLng(latlng);
    const vertices = Array.isArray(coordenadas)
        ? coordenadas.map(normalizarLatLng).filter(Boolean)
        : [];

    if (!ponto || vertices.length === 0) {
        return false;
    }

    let dentro = false;

    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
        const xi = vertices[i].lat;
        const yi = vertices[i].lng;
        const xj = vertices[j].lat;
        const yj = vertices[j].lng;

        const interseccao = ((yi > ponto.lng) !== (yj > ponto.lng)) &&
            (ponto.lat < ((xj - xi) * (ponto.lng - yi)) / (yj - yi + Number.EPSILON) + xi);

        if (interseccao) {
            dentro = !dentro;
        }
    }

    return dentro;
}

function pontoProximoDaArea(latlng, distanciaMaximaKm = 2.1) {
    const ponto = normalizarLatLng(latlng);
    if (!ponto) {
        return false;
    }

    const distanciaKm = ponto.distanceTo(L.latLng(centro)) / 1000;
    return distanciaKm <= distanciaMaximaKm;
}

function aplicarFiltroPontos() {
    const pontos = window.pontosMapa || [];

    pontos.forEach(ponto => {
        let visivel = filtroAtual.categoria === "todos" ||
            ponto.categoria === filtroAtual.categoria;

        if (visivel && filtroAtual.area === "artur-alvim") {
            visivel = limitesArturAlvim.some(poligono => {
                const coordenadas = poligono.getLatLngs()[0];
                return pontoDentroDoPoligono(ponto.coords, coordenadas);
            });
        }

        if (visivel && filtroAtual.area === "proximos") {
            const dentroDaArea = limitesArturAlvim.some(poligono => {
                const coordenadas = poligono.getLatLngs()[0];
                return pontoDentroDoPoligono(ponto.coords, coordenadas);
            });
            visivel = dentroDaArea || pontoProximoDaArea(ponto.coords);
        }

        if (visivel && !map.hasLayer(ponto.marker)) {
            map.addLayer(ponto.marker);
        }

        if (!visivel && map.hasLayer(ponto.marker)) {
            map.removeLayer(ponto.marker);
        }
    });
}

function configurarFiltros() {
    document.querySelectorAll(".filter-btn").forEach(botao => {
        botao.addEventListener("click", () => {
            const grupo = botao.dataset.filterGroup;
            document.querySelectorAll(`.filter-btn[data-filter-group="${grupo}"]`).forEach(item => {
                item.classList.toggle("active", item === botao);
            });

            filtroAtual[grupo] = botao.dataset.filter;
            aplicarFiltroPontos();
        });
    });
}

async function carregarLimiteArturAlvim() {
    const url = "https://www.openstreetmap.org/api/0.6/relation/3049500/full";

    try {
        const resposta = await fetch(url);

        const textoXML = await resposta.text();

        const documento = new DOMParser().parseFromString(
            textoXML,
            "application/xml"
        );

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
            } 
        }

        aneis.forEach(anel => {
            const poligono = L.polygon(anel, {
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

            limitesArturAlvim.push(poligono);
        });

        aplicarFiltroPontos();

    } catch (erro) {
        console.error("Erro ao carregar o limite de Artur Alvim:", erro);
    }
}

carregarLimiteArturAlvim();

const pontosMapa = [
    {
        coords: [-23.5408, -46.4790],
        categoria: "ecoponto",
        marker: criarMarcadorVerde([-23.5408, -46.4790]).bindPopup(`
            <b>Ecoponto COHAB Artur Alvim</b><br>
            Avenida Padre Estanislau de Campos, 56<br>
            <b>Tipo:</b> Ecoponto municipal<br>
            <a href="https://www.google.com/maps/search/?api=1&query=Ecoponto+COHAB+Artur+Alvim+Sao+Paulo"
               target="_blank" rel="noopener noreferrer">
                Ver rota
            </a>
        `)
    },
    {
        coords: [-23.5400, -46.4730],
        categoria: "ecoponto",
        marker: criarMarcadorVerde([-23.5400, -46.4730]).bindPopup(`
            <b>Ecoponto Franquinho</b><br>
            Rua Praia de Mucuripe, 685<br>
            Jardim Artur Alvim<br>
            <b>Tipo:</b> Ecoponto municipal<br>
            <a href="https://www.google.com/maps/search/?api=1&query=Ecoponto+Franquinho+Sao+Paulo"
               target="_blank" rel="noopener noreferrer">
                Ver rota
            </a>
        `)
    },
    {
        coords: [-23.5355, -46.4830],
        categoria: "ecoponto",
        marker: criarMarcadorVerde([-23.5355, -46.4830]).bindPopup(`
            <b>Ecoponto Jardim São Nicolau</b><br>
            Rua Agreste de Itabaiana, 590<br>
            Jardim Artur Alvim, São Paulo - SP<br>
            <b>Tipo:</b> Ponto de descarte<br>
            <a href="https://www.google.com/maps/search/?api=1&query=Rua+Agreste+de+Itabaiana+590+Sao+Paulo"
               target="_blank" rel="noopener noreferrer">
                Ver localização
            </a>
        `)
    },
    {
        coords: [-23.5630, -46.4900],
        categoria: "ecoponto",
        marker: criarMarcadorVerde([-23.5630, -46.4900]).bindPopup(`
            <b>Ecoponto Cidade Líder</b><br>
            Rua Charles Manguin, esquina com Rua Francesco Melzi<br>
            <b>Tipo:</b> Ecoponto municipal<br>
            <a href="https://www.google.com/maps/search/?api=1&query=Ecoponto+Cidade+Lider+Sao+Paulo"
               target="_blank" rel="noopener noreferrer">
                Ver rota
            </a>
        `)
    },
    {
        coords: [-23.5460, -46.4380],
        categoria: "ecoponto",
        marker: criarMarcadorVerde([-23.5460, -46.4380]).bindPopup(`
            <b>Ecoponto José Bonifácio</b><br>
            Rua Ana Perena, altura do nº 110<br>
            <b>Tipo:</b> Ecoponto municipal<br>
            <a href="https://www.google.com/maps/search/?api=1&query=Ecoponto+Jose+Bonifacio+Rua+Ana+Perena+Sao+Paulo"
               target="_blank" rel="noopener noreferrer">
                Ver rota
            </a>
        `)
    },
    {
        coords: [-23.5480, -46.4530],
        categoria: "ecoponto",
        marker: criarMarcadorVerde([-23.5480, -46.4530]).bindPopup(`
            <b>Ecoponto Vila Carmosina</b><br>
            Avenida Francisco Tranchesi, altura do nº 71<br>
            <b>Tipo:</b> Ecoponto municipal<br>
            <a href="https://www.google.com/maps/search/?api=1&query=Ecoponto+Vila+Carmosina+Sao+Paulo"
               target="_blank" rel="noopener noreferrer">
                Ver rota
            </a>
        `)
    },
    {
        coords: [-23.5260, -46.4900],
        categoria: "ecoponto",
        marker: criarMarcadorVerde([-23.5260, -46.4900]).bindPopup(`
            <b>Ecoponto Vila Santa Teresinha</b><br>
            Rua Major Vitorino de Souza Rocha, 90<br>
            <b>Tipo:</b> Ecoponto municipal<br>
            <a href="https://www.google.com/maps/search/?api=1&query=Ecoponto+Vila+Santa+Teresinha+Sao+Paulo"
               target="_blank" rel="noopener noreferrer">
                Ver rota
            </a>
        `)
    },
    {
        coords: [-23.5370, -46.5240],
        categoria: "ecoponto",
        marker: criarMarcadorVerde([-23.5370, -46.5240]).bindPopup(`
            <b>Ecoponto Vila Matilde</b><br>
            Rua Mateus de Siqueira, 375<br>
            Jardim Triana, São Paulo - SP<br>
            <b>Tipo:</b> Ecoponto municipal<br>
            <a href="https://www.google.com/maps/search/?api=1&query=Ecoponto+Vila+Matilde+Rua+Mateus+de+Siqueira+375"
               target="_blank" rel="noopener noreferrer">
                Ver rota
            </a>
        `)
    },
    {
        coords: [-23.5100, -46.5250],
        categoria: "ecoponto",
        marker: criarMarcadorVerde([-23.5100, -46.5250]).bindPopup(`
            <b>Ecoponto Tiquatira</b><br>
            Avenida Governador Carvalho Pinto<br>
            Jardim Jaú, São Paulo - SP<br>
            <b>Tipo:</b> Ecoponto municipal<br>
            <a href="https://www.google.com/maps/search/?api=1&query=Ecoponto+Tiquatira+Sao+Paulo"
               target="_blank" rel="noopener noreferrer">
                Ver rota
            </a>
        `)
    }
];

// PEV - CE José Bonifácio
const pevCeJoseBonifacio = L.marker([-23.5460, -46.4380])
    .addTo(map)
    .bindPopup(`
        <b>PEV - CE José Bonifácio</b><br>
        Rua Ana Perena, 110<br>
        <b>Tipo:</b> Recicláveis<br>
        <b>Materiais aceitos:</b> Plástico, papel, papelão, vidro e metal<br>
        <a href="https://www.google.com/maps/search/?api=1&query=Rua+Ana+Perena+110+Sao+Paulo"
           target="_blank" rel="noopener noreferrer">
            Ver localização
        </a>
    `);

// PEV - CDC Líder
const pevCdcLider = L.marker([-23.5580, -46.4850])
    .addTo(map)
    .bindPopup(`
        <b>PEV - CDC Líder</b><br>
        Rua Casemiro Nisskiniz, 157<br>
        <b>Tipo:</b> Ponto de entrega voluntária<br>
        <b>Materiais aceitos:</b> Plástico, papel, papelão, vidro e metal<br>
        <a href="https://www.google.com/maps/search/?api=1&query=Rua+Casemiro+Nisskiniz+157+Sao+Paulo"
           target="_blank" rel="noopener noreferrer">
            Ver localização
        </a>
    `);

// PEV - CDC Araújo
const pevCdcAraujo = L.marker([-23.5520, -46.4780])
    .addTo(map)
    .bindPopup(`
        <b>PEV - CDC Araújo</b><br>
        Rua Bernardino Prudenti, 194<br>
        <b>Tipo:</b> Ponto de entrega voluntária<br>
        <b>Materiais aceitos:</b> Plástico, papel, papelão, vidro e metal<br>
        <a href="https://www.google.com/maps/search/?api=1&query=Rua+Bernardino+Prudenti+194+Sao+Paulo"
           target="_blank" rel="noopener noreferrer">
            Ver localização
        </a>
    `);

// PEV - CDC União do Morro de Santa Tereza
const pevUniaoMorro = L.marker([-23.5500, -46.4800])
    .addTo(map)
    .bindPopup(`
        <b>PEV - CDC União do Morro de Santa Tereza</b><br>
        Rua Astolfo Marques, 330<br>
        <b>Tipo:</b> Ponto de entrega voluntária<br>
        <b>Materiais aceitos:</b> Plástico, papel, papelão, vidro e metal<br>
        <a href="https://www.google.com/maps/search/?api=1&query=Rua+Astolfo+Marques+330+Sao+Paulo"
           target="_blank" rel="noopener noreferrer">
            Ver localização
        </a>
    `);

// 1. Assaí Itaquera — óleo, pilhas, baterias e lâmpadas
const assaiItaquera = criarMarcadorAmarelo([-23.5410, -46.4580])
    .addTo(map)
    .bindPopup(`
        <b>Assaí Itaquera</b><br>
        Avenida Sylvio Torres, 190<br>
        Conjunto Habitacional Padre José de Anchieta<br>
        <hr>
        <b>Materiais coletados:</b><br>
        • Óleo de cozinha usado<br>
        • Pilhas e baterias<br>
        • Lâmpadas<br>
        <hr>
        <a href="https://www.google.com/maps/search/?api=1&query=Assai+Itaquera+Avenida+Sylvio+Torres+190"
           target="_blank" rel="noopener noreferrer">
            Ver rota
        </a>
    `);


// Subprefeitura de Itaquera — ponto divulgado em registro antigo
const subprefeituraItaquera = criarMarcadorAmarelo([-23.5408, -46.4615])
    .addTo(map)
    .bindPopup(`
        <b>Subprefeitura de Itaquera</b><br>
        Rua Augusto Carlos Baumann, 851<br>
        <hr>
        <b>Materiais divulgados:</b><br>
        • Papel e papelão<br>
        • Plásticos<br>
        • Metais e vidro<br>
        • Óleo de cozinha usado<br>
        • Pilhas e baterias<br>
        <hr>
        <a href="https://www.google.com/maps/search/?api=1&query=Rua+Augusto+Carlos+Baumann+851+Itaquera"
           target="_blank" rel="noopener noreferrer">
            Ver rota
        </a>
    `);



pontosMapa.push(
    { coords: [-23.5460, -46.4380], categoria: "pev", marker: pevCeJoseBonifacio },
    { coords: [-23.5580, -46.4850], categoria: "pev", marker: pevCdcLider },
    { coords: [-23.5520, -46.4780], categoria: "pev", marker: pevCdcAraujo },
    { coords: [-23.5500, -46.4800], categoria: "pev", marker: pevUniaoMorro },
    { coords: [-23.5410, -46.4580], categoria: "especifico", marker: assaiItaquera },
    { coords: [-23.5408, -46.4615], categoria: "especifico", marker: subprefeituraItaquera }
);

window.pontosMapa = pontosMapa;

pontosMapa.forEach(ponto => {
    map.addLayer(ponto.marker);
});

configurarFiltros();
aplicarFiltroPontos();

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