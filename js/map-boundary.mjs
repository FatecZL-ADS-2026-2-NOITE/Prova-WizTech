const L = window.L;

function normalizarLatLng(latlng) {
    if (Array.isArray(latlng)) {
        return L.latLng(latlng[0], latlng[1]);
    }

    if (latlng && typeof latlng.lat === "number" && typeof latlng.lng === "number") {
        return L.latLng(latlng.lat, latlng.lng);
    }

    return null;
}

export function pontoDentroDoPoligono(latlng, coordenadas) {
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

function conectarCaminhos(caminhos) {
    const aneis = [];

    while (caminhos.length > 0) {
        const anel = caminhos.shift();
        let conectado = true;

        while (conectado) {
            conectado = false;
            const inicio = anel[0];
            const fim = anel[anel.length - 1];
            const iguais = (a, b) => a[0] === b[0] && a[1] === b[1];

            for (let i = 0; i < caminhos.length; i++) {
                const caminho = caminhos[i];
                const primeiro = caminho[0];
                const ultimo = caminho[caminho.length - 1];

                if (iguais(fim, primeiro)) {
                    anel.push(...caminho.slice(1));
                } else if (iguais(fim, ultimo)) {
                    anel.push(...caminho.reverse().slice(1));
                } else if (iguais(inicio, ultimo)) {
                    anel.unshift(...caminho.slice(0, -1));
                } else if (iguais(inicio, primeiro)) {
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
        if (iguaisCoordenadas(primeiro, ultimo) && anel.length >= 4) {
            aneis.push(anel);
        }
    }

    return aneis;
}

function iguaisCoordenadas(a, b) {
    return a[0] === b[0] && a[1] === b[1];
}

export async function carregarLimiteArturAlvim(map, camadaLimite) {
    const url = "https://www.openstreetmap.org/api/0.6/relation/3049500/full";
    const resposta = await fetch(url);

    if (!resposta.ok) {
        throw new Error(`Erro HTTP ${resposta.status} ao carregar o limite de Artur Alvim.`);
    }

    const documento = new DOMParser().parseFromString(
        await resposta.text(),
        "application/xml"
    );

    if (documento.querySelector("parsererror")) {
        throw new Error("Não foi possível interpretar o XML do limite de Artur Alvim.");
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

    if (aneis.length === 0) {
        throw new Error("Não foi possível formar o contorno administrativo de Artur Alvim.");
    }

    return aneis.map(anel => L.polygon(anel, {
        color: "#ff6500",
        weight: 3,
        opacity: 1,
        fillColor: "#ff6500",
        fillOpacity: 0.08,
        lineJoin: "round"
    }).addTo(camadaLimite));
}
