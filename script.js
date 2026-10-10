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

function criarIconeMarcador(cor, classe) {
    return L.divIcon({
        className: classe,
        html: `<svg width="32" height="42" viewBox="0 0 32 42" aria-hidden="true">
            <path fill="${cor}" stroke="#fff" stroke-width="2"
                d="M16 1C7.7 1 1 7.7 1 16c0 11 15 25 15 25s15-14 15-25C31 7.7 24.3 1 16 1z"/>
            <circle cx="16" cy="16" r="5" fill="#fff"/>
        </svg>`,
        iconSize: [32, 42],
        iconAnchor: [16, 42],
        popupAnchor: [0, -40]
    });
}

const iconeVerde = criarIconeMarcador("#198754", "ecoponto-marker");
const iconeAmarelo = criarIconeMarcador("#f2b705", "ponto-especifico-marker");

function criarEcoponto(coords, popup) {
    return {
        coords,
        categoria: "ecoponto",
        marker: L.marker(coords, { icon: iconeVerde }).bindPopup(popup)
    };
}

function criarPontoEspecifico(coords, popup) {
    return L.marker(coords, { icon: iconeAmarelo }).bindPopup(popup);
}

function adicionarHorario(marcador, horario) {
    const popup = marcador.getPopup();
    popup.setContent(`${popup.getContent()}<br><b>Funcionamento:</b> ${horario}.`);
}

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

function iguaisCoordenadas(a, b) {
    return a[0] === b[0] && a[1] === b[1];
}

function conectarCaminhos(caminhos) {
    const aneis = [];

    while (caminhos.length > 0) {
        const anel = caminhos.shift();
        let conectado = true;

        while (conectado) {
            conectado = false;
            const inicio = anel[0];
            const fim = anel[anel.length - 1];

            for (let i = 0; i < caminhos.length; i++) {
                const caminho = caminhos[i];
                const primeiro = caminho[0];
                const ultimo = caminho[caminho.length - 1];

                if (iguaisCoordenadas(fim, primeiro)) {
                    anel.push(...caminho.slice(1));
                } else if (iguaisCoordenadas(fim, ultimo)) {
                    anel.push(...caminho.reverse().slice(1));
                } else if (iguaisCoordenadas(inicio, ultimo)) {
                    anel.unshift(...caminho.slice(0, -1));
                } else if (iguaisCoordenadas(inicio, primeiro)) {
                    anel.unshift(...caminho.reverse().slice(0, -1));
                } else {
                    continue;
                }

                caminhos.splice(i, 1);
                conectado = true;
                break;
            }
        }

        if (iguaisCoordenadas(anel[0], anel[anel.length - 1]) && anel.length >= 4) {
            aneis.push(anel);
        }
    }

    return aneis;
}

async function carregarLimiteArturAlvim() {
    const url = "https://www.openstreetmap.org/api/0.6/relation/3049500/full";
    const resposta = await fetch(url);

    const documento = new DOMParser().parseFromString(
        await resposta.text(),
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
        const pontos = Array.from(via.querySelectorAll("nd"))
            .map(nd => nos.get(nd.getAttribute("ref")))
            .filter(Boolean);
        vias.set(via.getAttribute("id"), pontos);
    });

    const caminhos = Array.from(documento.querySelectorAll(
        'relation[id="3049500"] > member[type="way"][role="outer"]'
    ))
        .map(membro => vias.get(membro.getAttribute("ref")))
        .filter(caminho => caminho && caminho.length >= 2)
        .map(caminho => [...caminho]);
    const aneis = conectarCaminhos(caminhos);

    aneis.forEach(anel => {
        const poligono = L.polygon(anel, {
            color: "#ff6500",
            weight: 3,
            opacity: 1,
            fillColor: "#ff6500",
            fillOpacity: 0.08,
            lineJoin: "round"
        }).addTo(camadaLimite);

        limitesArturAlvim.push(poligono);
    });

    aplicarFiltros();
}

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

const pontos = [
    criarEcoponto([-23.5408, -46.4790], `
        <b>Ecoponto COHAB Artur Alvim</b><br>
        Avenida Padre Estanislau de Campos, 56<br>
        <b>Tipo:</b> Ecoponto municipal<br>
        <a href="https://www.google.com/maps/search/?api=1&query=Ecoponto+COHAB+Artur+Alvim+Sao+Paulo"
           target="_blank" rel="noopener noreferrer">Ver rota</a>
    `),
    criarEcoponto([-23.5400, -46.4730], `
        <b>Ecoponto Franquinho</b><br>
        Rua Praia de Mucuripe, 685<br>
        Jardim Artur Alvim<br>
        <b>Tipo:</b> Ecoponto municipal<br>
        <a href="https://www.google.com/maps/search/?api=1&query=Ecoponto+Franquinho+Sao+Paulo"
           target="_blank" rel="noopener noreferrer">Ver rota</a>
    `),
    criarEcoponto([-23.5355, -46.4830], `
        <b>Ecoponto Jardim São Nicolau</b><br>
        Rua Agreste de Itabaiana, 590<br>
        Jardim Artur Alvim, São Paulo - SP<br>
        <b>Tipo:</b> Ponto de descarte<br>
        <a href="https://www.google.com/maps/search/?api=1&query=Rua+Agreste+de+Itabaiana+590+Sao+Paulo"
           target="_blank" rel="noopener noreferrer">Ver localização</a>
    `),
    criarEcoponto([-23.5630, -46.4900], `
        <b>Ecoponto Cidade Líder</b><br>
        Rua Charles Manguin, esquina com Rua Francesco Melzi<br>
        <b>Tipo:</b> Ecoponto municipal<br>
        <a href="https://www.google.com/maps/search/?api=1&query=Ecoponto+Cidade+Lider+Sao+Paulo"
           target="_blank" rel="noopener noreferrer">Ver rota</a>
    `),
    criarEcoponto([-23.5460, -46.4380], `
        <b>Ecoponto José Bonifácio</b><br>
        Rua Ana Perena, altura do nº 110<br>
        <b>Tipo:</b> Ecoponto municipal<br>
        <a href="https://www.google.com/maps/search/?api=1&query=Ecoponto+Jose+Bonifacio+Rua+Ana+Perena+Sao+Paulo"
           target="_blank" rel="noopener noreferrer">Ver rota</a>
    `),
    criarEcoponto([-23.5480, -46.4530], `
        <b>Ecoponto Vila Carmosina</b><br>
        Avenida Francisco Tranchesi, altura do nº 71<br>
        <b>Tipo:</b> Ecoponto municipal<br>
        <a href="https://www.google.com/maps/search/?api=1&query=Ecoponto+Vila+Carmosina+Sao+Paulo"
           target="_blank" rel="noopener noreferrer">Ver rota</a>
    `),
    criarEcoponto([-23.5260, -46.4900], `
        <b>Ecoponto Vila Santa Teresinha</b><br>
        Rua Major Vitorino de Souza Rocha, 90<br>
        <b>Tipo:</b> Ecoponto municipal<br>
        <a href="https://www.google.com/maps/search/?api=1&query=Ecoponto+Vila+Santa+Teresinha+Sao+Paulo"
           target="_blank" rel="noopener noreferrer">Ver rota</a>
    `),
    criarEcoponto([-23.5370, -46.5240], `
        <b>Ecoponto Vila Matilde</b><br>
        Rua Mateus de Siqueira, 375<br>
        Jardim Triana, São Paulo - SP<br>
        <b>Tipo:</b> Ecoponto municipal<br>
        <a href="https://www.google.com/maps/search/?api=1&query=Ecoponto+Vila+Matilde+Rua+Mateus+de+Siqueira+375"
           target="_blank" rel="noopener noreferrer">Ver rota</a>
    `),
    criarEcoponto([-23.5100, -46.5250], `
        <b>Ecoponto Tiquatira</b><br>
        Avenida Governador Carvalho Pinto<br>
        Jardim Jaú, São Paulo - SP<br>
        <b>Tipo:</b> Ecoponto municipal<br>
        <a href="https://www.google.com/maps/search/?api=1&query=Ecoponto+Tiquatira+Sao+Paulo"
           target="_blank" rel="noopener noreferrer">Ver rota</a>
    `)
];

const pevs = [
    {
        coords: [-23.5460, -46.4380],
        horario: "Segunda a sábado, das 8h às 17h",
        popup: `
            <b>PEV - CE José Bonifácio</b><br>
            Rua Ana Perena, 110<br>
            <b>Tipo:</b> Recicláveis<br>
            <b>Materiais aceitos:</b> Plástico, papel, papelão, vidro e metal<br>
            <a href="https://www.google.com/maps/search/?api=1&query=Rua+Ana+Perena+110+Sao+Paulo"
               target="_blank" rel="noopener noreferrer">Ver localização</a>
        `
    },
    {
        coords: [-23.5580, -46.4850],
        horario: "Segunda a sexta, das 8h às 17h",
        popup: `
            <b>PEV - CDC Líder</b><br>
            Rua Casemiro Nisskiniz, 157<br>
            <b>Tipo:</b> Ponto de entrega voluntária<br>
            <b>Materiais aceitos:</b> Plástico, papel, papelão, vidro e metal<br>
            <a href="https://www.google.com/maps/search/?api=1&query=Rua+Casemiro+Nisskiniz+157+Sao+Paulo"
               target="_blank" rel="noopener noreferrer">Ver localização</a>
        `
    },
    {
        coords: [-23.5520, -46.4780],
        horario: "Segunda a sábado, das 8h às 17h",
        popup: `
            <b>PEV - CDC Araújo</b><br>
            Rua Bernardino Prudenti, 194<br>
            <b>Tipo:</b> Ponto de entrega voluntária<br>
            <b>Materiais aceitos:</b> Plástico, papel, papelão, vidro e metal<br>
            <a href="https://www.google.com/maps/search/?api=1&query=Rua+Bernardino+Prudenti+194+Sao+Paulo"
               target="_blank" rel="noopener noreferrer">Ver localização</a>
        `
    },
    {
        coords: [-23.5500, -46.4800],
        horario: "Segunda a sexta, das 8h às 17h",
        popup: `
            <b>PEV - CDC União do Morro de Santa Tereza</b><br>
            Rua Astolfo Marques, 330<br>
            <b>Tipo:</b> Ponto de entrega voluntária<br>
            <b>Materiais aceitos:</b> Plástico, papel, papelão, vidro e metal<br>
            <a href="https://www.google.com/maps/search/?api=1&query=Rua+Astolfo+Marques+330+Sao+Paulo"
               target="_blank" rel="noopener noreferrer">Ver localização</a>
        `
    }
].map(pev => {
    const marker = L.marker(pev.coords).bindPopup(pev.popup);
    adicionarHorario(marker, pev.horario);
    return { coords: pev.coords, categoria: "pev", marker };
});

const pontosEspecificos = [
    {
        coords: [-23.5410, -46.4580],
        horario: "Segunda a sábado, das 7h às 22h",
        popup: `
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
               target="_blank" rel="noopener noreferrer">Ver rota</a>
        `
    },
    {
        coords: [-23.5408, -46.4615],
        horario: "Segunda a sexta, das 8h às 17h",
        popup: `
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
               target="_blank" rel="noopener noreferrer">Ver rota</a>
        `
    }
].map(ponto => {
    const marker = criarPontoEspecifico(ponto.coords, ponto.popup);
    adicionarHorario(marker, ponto.horario);
    return { coords: ponto.coords, categoria: "especifico", marker };
});

const horariosEcopontos = [
    "Segunda a sábado, das 8h às 17h",
    "Segunda a sexta, das 8h às 17h",
    "Segunda a sábado, das 8h às 18h",
    "Segunda a sexta, das 8h às 17h",
    "Segunda a sábado, das 8h às 17h",
    "Segunda a sexta, das 8h às 17h",
    "Segunda a sábado, das 8h às 18h",
    "Segunda a sexta, das 8h às 17h",
    "Segunda a sábado, das 8h às 18h"
];
pontos.forEach((ponto, indice) => adicionarHorario(ponto.marker, horariosEcopontos[indice]));

const pontosMapa = [...pontos, ...pevs, ...pontosEspecificos];

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

pontosMapa.forEach(ponto => mapa.addLayer(ponto.marker));
configurarFiltros();
aplicarFiltros();

carregarLimiteArturAlvim().catch(erro => {
    console.error("Erro ao carregar o limite de Artur Alvim:", erro);
});

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
