const L = window.L;

const iconeVerde = L.divIcon({
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

const iconeAmarelo = L.divIcon({
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

export function criarPontosMapa() {
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

    pontos.forEach((ponto, indice) => {
        adicionarHorario(ponto.marker, horariosEcopontos[indice]);
    });

    return [...pontos, ...pevs, ...pontosEspecificos];
}
