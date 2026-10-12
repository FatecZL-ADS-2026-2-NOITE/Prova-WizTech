const L = window.L;
const dados = window.DADOS_MAPA;
const filtros = { area: "todos", categoria: "todos" };
const coresMateriais = {
    "Papel": "papel",
    "Plástico": "plastico",
    "Vidro": "vidro",
    "Metal": "metal",
    "Orgânico": "organico",
    "Rejeito": "rejeito"
};
const mobile = window.matchMedia("(max-width: 640px)").matches;
const limites = mobile ? dados.limites.mobile : dados.limites.desktop;
const mapa = L.map("map", {
    minZoom: dados.zoomMinimo,
    maxZoom: dados.zoomMaximo,
    maxBounds: L.latLngBounds(limites[0], limites[1]),
    maxBoundsViscosity: mobile ? 0.7 : 1
}).setView(dados.centro, dados.zoomInicial);

function formatarDecomposicao(anos) {
    if (anos < 1) {
        const meses = Math.max(1, Math.round(anos * 12));
        return `Aproximadamente ${meses} ${meses === 1 ? "mês" : "meses"}`;
    }

    return `Aproximadamente ${anos} ${anos === 1 ? "ano" : "anos"}`;
}

function criarInformacaoMaterial(rotulo, valor) {
    const paragrafo = document.createElement("p");
    paragrafo.className = "material-info";

    const titulo = document.createElement("strong");
    titulo.textContent = `${rotulo}: `;
    paragrafo.append(titulo, document.createTextNode(valor));
    return paragrafo;
}

function criarCartaoMaterial(material) {
    const cartao = document.createElement("article");
    const classeTipo = coresMateriais[material.tipo] || "outro";
    cartao.className = `material-card material-${classeTipo}`;

    const topo = document.createElement("div");
    topo.className = "material-card-top";

    const tipo = document.createElement("span");
    tipo.className = "material-tipo";
    tipo.textContent = material.tipo;
    topo.append(tipo);

    const status = document.createElement("span");
    status.className = `material-status ${material.reciclavel ? "reciclavel" : "nao-reciclavel"}`;
    status.textContent = material.reciclavel ? "Reciclável" : "Não reciclável";
    topo.append(status);

    const titulo = document.createElement("h3");
    titulo.className = "material-nome";
    titulo.textContent = material.material;

    const dica = document.createElement("p");
    dica.className = "material-dica";
    dica.textContent = material.dica;

    cartao.append(
        topo,
        titulo,
        criarInformacaoMaterial("Onde descartar", material.ondeDescartar),
        criarInformacaoMaterial("Decomposição estimada", formatarDecomposicao(material.decomposicao)),
        dica
    );
    return cartao;
}

function renderizarMateriais() {
    const lista = document.querySelector("#materiais-lista");
    const busca = document.querySelector("#material-busca");
    const filtro = document.querySelector("#material-filtro");
    const contagem = document.querySelector("#materiais-contagem");

    if (!Array.isArray(dados.materiais)) {
        throw new Error("A lista de materiais não está disponível em DADOS_MAPA.");
    }

    const tipos = [...new Set(dados.materiais.map(material => material.tipo))].sort((a, b) =>
        a.localeCompare(b, "pt-BR")
    );
    tipos.forEach(tipo => {
        const opcao = document.createElement("option");
        opcao.value = tipo;
        opcao.textContent = tipo;
        filtro.append(opcao);
    });

    function atualizarLista() {
        const termo = busca.value
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLocaleLowerCase("pt-BR")
            .trim();
        const tipoSelecionado = filtro.value;
        const encontrados = dados.materiais.filter(material => {
            const correspondeTipo = !tipoSelecionado || material.tipo === tipoSelecionado;
            const textoMaterial = [
                material.material,
                material.tipo,
                material.ondeDescartar,
                material.dica
            ].join(" ")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLocaleLowerCase("pt-BR");

            return correspondeTipo && textoMaterial.includes(termo);
        });

        lista.replaceChildren(...encontrados.map(criarCartaoMaterial));
        if (encontrados.length === 0) {
            const vazio = document.createElement("p");
            vazio.className = "material-sem-resultados";
            vazio.textContent = "Nenhum material encontrado. Tente outro termo ou tipo.";
            lista.append(vazio);
        }

        contagem.textContent = `${encontrados.length} ${encontrados.length === 1 ? "material encontrado" : "materiais encontrados"}`;
    }

    busca.addEventListener("input", atualizarLista);
    filtro.addEventListener("change", atualizarLista);
    atualizarLista();
}

renderizarMateriais();

L.tileLayer(dados.tiles.url, {
    attribution: dados.tiles.atribuicao,
    minZoom: dados.zoomMinimo,
    maxZoom: dados.tiles.zoomMaximo,
    maxNativeZoom: dados.tiles.zoomNativoMaximo
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

const iconesMarcador = {
    ecoponto: criarIconeMarcador("#198754", "ecoponto-marker"),
    especifico: criarIconeMarcador("#f2b705", "ponto-especifico-marker")
};

function gerarMudancasPrevistas(ponto) {
    if (ponto.mudancasPrevistas !== true) {
        return "Sem mudanças previstas.";
    }

    const mensagem = ponto.mudancaPrevista ||
        (dados.mudancasPrevistas?.mensagens?.[(Number(ponto.id) - 1) % (dados.mudancasPrevistas?.mensagens?.length || 1)] ||
            "Sem mudanças previstas.");

    return `Mudanças previstas: ${mensagem}`;
}

function criarConteudoPopup(ponto) {
    const tipo = ponto.tipo ? `<br><b>Tipo:</b> ${ponto.tipo}` : "";
    const materiais = ponto.materiais
        ? `<br><b>Materiais aceitos:</b> ${ponto.materiais}`
        : "";
    const listaMateriais = ponto.materiaisLista
        ? `<hr><b>${ponto.materiaisLabel}:</b><br>• ${ponto.materiaisLista.join("<br>• ")}`
        : "";
    const rota = ponto.rota
        ? `<br><a href="${ponto.rota}" target="_blank" rel="noopener noreferrer">` +
          `${ponto.textoRota || "Ver rota"}</a>`
        : "";

    return `<b>${ponto.nome}</b><br>${ponto.endereco}${tipo}${materiais}${listaMateriais}${rota}` +
        `<br><b>Funcionamento:</b> ${ponto.horario}.` +
        `<br><b>Mudanças previstas:</b> ${gerarMudancasPrevistas(ponto)}`;
}

function criarPonto(ponto) {
    const opcoes = iconesMarcador[ponto.categoria]
        ? { icon: iconesMarcador[ponto.categoria] }
        : {};
    const marker = L.marker(ponto.coordenadas, opcoes)
        .bindPopup(criarConteudoPopup(ponto));

    return {
        coords: ponto.coordenadas,
        categoria: ponto.categoria,
        marker
    };
}

const pontosMapa = dados.pontos.map(criarPonto);
window.pontosMapa = pontosMapa;

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

function desenharLimiteArturAlvim() {
    const coordenadas = dados.limiteArturAlvim.coordenadas;
    if (!Array.isArray(coordenadas) || coordenadas.length < 4) {
        throw new Error("As coordenadas locais do limite de Artur Alvim estão inválidas.");
    }

    const poligono = L.polygon(coordenadas, {
        color: "#ff6500",
        weight: 3,
        opacity: 1,
        fillColor: "#ff6500",
        fillOpacity: 0.08,
        lineJoin: "round"
    }).addTo(camadaLimite);
    limitesArturAlvim.push(poligono);

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
        (limitesGeograficos.getNorth() - limitesGeograficos.getSouth()) / dados.coletaEstimada.length;
    const posicao = Math.max(0, Math.min(
        dados.coletaEstimada.length - 1,
        Math.floor((coordenadas.lat - limitesGeograficos.getSouth()) / faixaLatitude)
    ));
    const estimativa = dados.coletaEstimada[posicao];

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
        const distanciaKm = L.latLng(ponto.coords).distanceTo(L.latLng(dados.centro)) / 1000;
        return estaDentroDeArturAlvim(ponto.coords) ||
            distanciaKm <= dados.distanciaProximosKm;
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
desenharLimiteArturAlvim();

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
