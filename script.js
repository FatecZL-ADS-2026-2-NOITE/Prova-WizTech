const L = window.L;
const dados = window.DADOS_MAPA;
const filtros = { area: "todos", categoria: "todos" };
const coresMateriais = {
    Papel: "papel", "Plástico": "plastico", Vidro: "vidro",
    Metal: "metal", "Orgânico": "organico", Rejeito: "rejeito"
};
const mobile = window.matchMedia("(max-width: 640px)").matches;
const limites = mobile ? dados.limites.mobile : dados.limites.desktop;
const mapa = L.map("map", {
    minZoom: dados.zoomMinimo,
    maxZoom: dados.zoomMaximo,
    maxBounds: L.latLngBounds(limites[0], limites[1]),
    maxBoundsViscosity: mobile ? 0.7 : 1
}).setView(dados.centro, dados.zoomInicial);

const criarElemento = (tag, classe, texto) => {
    const elemento = document.createElement(tag);
    if (classe) elemento.className = classe;
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
};              

function formatarDecomposicao(anos) {
    const quantidade = anos < 1 ? Math.max(1, Math.round(anos * 12)) : anos;
    const unidade = anos < 1 ? "mês" : "ano";
    return `Aproximadamente ${quantidade} ${unidade}${quantidade === 1 ? "" : "s"}`;
}

function criarInformacaoMaterial(rotulo, valor) {
    const paragrafo = criarElemento("p", "material-info");
    paragrafo.append(criarElemento("strong", "", `${rotulo}: `), document.createTextNode(valor));
    return paragrafo;
}

function criarCartaoMaterial(material) {
    const cartao = criarElemento("article", `material-card material-${coresMateriais[material.tipo] || "outro"}`);
    const topo = criarElemento("div", "material-card-top");
    topo.append(
        criarElemento("span", "material-tipo", material.tipo),
        criarElemento("span", `material-status ${material.reciclavel ? "reciclavel" : "nao-reciclavel"}`,
            material.reciclavel ? "Reciclável" : "Não reciclável")
    );
    cartao.append(
        topo,
        criarElemento("h3", "material-nome", material.material),
        criarInformacaoMaterial("Onde descartar", material.ondeDescartar),
        criarInformacaoMaterial("Decomposição estimada", formatarDecomposicao(material.decomposicao)),
        criarElemento("p", "material-dica", material.dica)
    );
    return cartao;
}

const normalizarTexto = texto => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");

function renderizarMateriais() {
    const lista = document.querySelector("#materiais-lista");
    const busca = document.querySelector("#material-busca");
    const filtro = document.querySelector("#material-filtro");
    const contagem = document.querySelector("#materiais-contagem");

    const tipos = [...new Set(dados.materiais.map(material => material.tipo))].sort((a, b) =>
        a.localeCompare(b, "pt-BR")
    );
    tipos.forEach(tipo => filtro.append(new Option(tipo, tipo)));

    function atualizarLista() {
        const termo = normalizarTexto(busca.value.trim());
        const tipoSelecionado = filtro.value;
        const encontrados = dados.materiais.filter(material => {
            const textoMaterial = normalizarTexto([
                material.material, material.tipo, material.ondeDescartar, material.dica
            ].join(" "));
            return (!tipoSelecionado || material.tipo === tipoSelecionado) && textoMaterial.includes(termo);
        });

        lista.replaceChildren(...encontrados.map(criarCartaoMaterial));
        if (encontrados.length === 0) {
            lista.append(criarElemento("p", "material-sem-resultados",
                "Nenhum material encontrado. Tente outro termo ou tipo."));
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
    return {
        coords: ponto.coordenadas,
        categoria: ponto.categoria,
        marker: L.marker(ponto.coordenadas, iconesMarcador[ponto.categoria]
            ? { icon: iconesMarcador[ponto.categoria] } : {}).bindPopup(criarConteudoPopup(ponto))
    };
}

const pontosMapa = dados.pontos.map(criarPonto);
window.pontosMapa = pontosMapa;

const normalizarLatLng = latlng => Array.isArray(latlng) ? L.latLng(latlng[0], latlng[1]) :
    typeof latlng?.lat === "number" && typeof latlng?.lng === "number" ? L.latLng(latlng.lat, latlng.lng) : null;

function pontoDentroDoPoligono(latlng, coordenadas) {
    const ponto = normalizarLatLng(latlng);
    const vertices = Array.isArray(coordenadas) ? coordenadas.map(normalizarLatLng).filter(Boolean) : [];
    if (!ponto || vertices.length === 0) {
        return false;
    }
    let dentro = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
        const atual = vertices[i], anterior = vertices[j];
        if ((atual.lng > ponto.lng) !== (anterior.lng > ponto.lng) &&
            ponto.lat < ((anterior.lat - atual.lat) * (ponto.lng - atual.lng)) /
            (anterior.lng - atual.lng + Number.EPSILON) + atual.lat) dentro = !dentro;
    }
    return dentro;
}

function desenharLimiteArturAlvim() {
    const coordenadas = dados.limiteArturAlvim.coordenadas;
    if (!Array.isArray(coordenadas) || coordenadas.length < 4) {
        throw new Error("As coordenadas locais do limite de Artur Alvim estão inválidas.");
    }
    limitesArturAlvim.push(L.polygon(coordenadas, {
        color: "#ff6500", weight: 3, opacity: 1, fillColor: "#ff6500", fillOpacity: 0.08, lineJoin: "round"
    }).addTo(camadaLimite));
    aplicarFiltros();
}

const estaDentroDeArturAlvim = coordenadas => limitesArturAlvim.some(poligono =>
    pontoDentroDoPoligono(coordenadas, poligono.getLatLngs()[0]));

function obterEstimativaColeta(coordenadas) {
    if (!limitesArturAlvim.length) return "<small>As estimativas de coleta não estão disponíveis no momento.</small>";
    const limites = L.latLngBounds([]);
    limitesArturAlvim.forEach(poligono => limites.extend(poligono.getBounds()));
    const faixa = (limites.getNorth() - limites.getSouth()) / dados.coletaEstimada.length;
    const posicao = Math.max(0, Math.min(dados.coletaEstimada.length - 1,
        Math.floor((coordenadas.lat - limites.getSouth()) / faixa)));
    const estimativa = dados.coletaEstimada[posicao];
    return `<b>Região ${estimativa.regiao} — coleta seletiva</b><br>` +
        `<b>Dias estimados:</b> ${estimativa.dias}<br>` +
        `<b>Horário estimado:</b> ${estimativa.horario}<br>` +
        `<small>Previsão aproximada; confirme os dias e horários da sua rua.</small>`;
}

function pontoEstaVisivel(ponto) {
    if (filtros.categoria !== "todos" && ponto.categoria !== filtros.categoria) return false;
    if (filtros.area === "artur-alvim") return estaDentroDeArturAlvim(ponto.coords);
    if (filtros.area === "proximos") return estaDentroDeArturAlvim(ponto.coords) ||
        L.latLng(ponto.coords).distanceTo(L.latLng(dados.centro)) / 1000 <= dados.distanciaProximosKm;
    return true;
}

function aplicarFiltros() {
    pontosMapa.forEach(ponto => {
        const visivel = pontoEstaVisivel(ponto);
        if (visivel !== mapa.hasLayer(ponto.marker)) {
            visivel ? mapa.addLayer(ponto.marker) : mapa.removeLayer(ponto.marker);
        }
    });
}

function configurarFiltros() {
    document.querySelectorAll(".filter-btn").forEach(botao => botao.addEventListener("click", () => {
        const grupo = botao.dataset.filterGroup;
        document.querySelectorAll(`.filter-btn[data-filter-group="${grupo}"]`)
            .forEach(item => item.classList.toggle("active", item === botao));
        filtros[grupo] = botao.dataset.filter;
        aplicarFiltros();
    }));
}

pontosMapa.forEach(ponto => mapa.addLayer(ponto.marker));
configurarFiltros();
aplicarFiltros();
desenharLimiteArturAlvim();

mapa.on("click", evento => {
    const dentro = estaDentroDeArturAlvim(evento.latlng);
    const conteudo = dentro
        ? `<b>Artur Alvim</b><br>Delimitação administrativa<hr>${obterEstimativaColeta(evento.latlng)}`
        : `<b>Local selecionado</b><br>Latitude: ${evento.latlng.lat.toFixed(6)}<br>Longitude: ${evento.latlng.lng.toFixed(6)}`;
    L.popup().setLatLng(evento.latlng).setContent(conteudo).openOn(mapa);
});
