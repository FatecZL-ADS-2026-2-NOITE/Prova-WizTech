window.DADOS_MAPA = {
    centro: [-23.54024, -46.48471],
    zoomInicial: 15,
    zoomMinimo: 14,
    zoomMaximo: 20,
    distanciaProximosKm: 2.1,
    limites: {
        mobile: [[-23.590, -46.560], [-23.500, -46.420]],
        desktop: [[-23.565, -46.515], [-23.515, -46.455]]
    },
    tiles: {
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        atribuicao: "&copy; OpenStreetMap contributors",
        zoomMaximo: 20,
        zoomNativoMaximo: 19
    },
    limiteArturAlvim: {
        url: "https://www.openstreetmap.org/api/0.6/relation/3049500/full",
        relationId: "3049500"
    },
    coletaEstimada: [
        { regiao: "Sul", dias: "quarta e sábado", horario: "das 13h às 16h" },
        { regiao: "Centro", dias: "terça e sexta", horario: "das 10h às 13h" },
        { regiao: "Norte", dias: "segunda e quinta", horario: "das 7h às 10h" }
    ],
    pontos: [
        {
            id: 1,
            ativo: true,
            categoria: "ecoponto",
            coordenadas: [-23.5408, -46.4790],
            nome: "Ecoponto COHAB Artur Alvim",
            endereco: "Avenida Padre Estanislau de Campos, 56",
            tipo: "Ecoponto municipal",
            horario: "Segunda a sábado, das 8h às 17h",
            rota: "https://www.google.com/maps/search/?api=1&query=Ecoponto+COHAB+Artur+Alvim+Sao+Paulo"
        },
        {
            id: 2,
            ativo: true,
            categoria: "ecoponto",
            coordenadas: [-23.5400, -46.4730],
            nome: "Ecoponto Franquinho",
            endereco: "Rua Praia de Mucuripe, 685, Jardim Artur Alvim",
            tipo: "Ecoponto municipal",
            horario: "Segunda a sexta, das 8h às 17h",
            rota: "https://www.google.com/maps/search/?api=1&query=Ecoponto+Franquinho+Sao+Paulo"
        },
        {
            id: 3,
            ativo: true,
            categoria: "ecoponto",
            coordenadas: [-23.5355, -46.4830],
            nome: "Ecoponto Jardim São Nicolau",
            endereco: "Rua Agreste de Itabaiana, 590, Jardim Artur Alvim, São Paulo - SP",
            tipo: "Ponto de descarte",
            horario: "Segunda a sábado, das 8h às 18h",
            rota: "https://www.google.com/maps/search/?api=1&query=Rua+Agreste+de+Itabaiana+590+Sao+Paulo",
            textoRota: "Ver localização"
        },
        {
            id: 4,
            ativo: true,
            categoria: "ecoponto",
            coordenadas: [-23.5630, -46.4900],
            nome: "Ecoponto Cidade Líder",
            endereco: "Rua Charles Manguin, esquina com Rua Francesco Melzi",
            tipo: "Ecoponto municipal",
            horario: "Segunda a sexta, das 8h às 17h",
            rota: "https://www.google.com/maps/search/?api=1&query=Ecoponto+Cidade+Lider+Sao+Paulo"
        },
        {
            id: 5,
            ativo: true,
            categoria: "ecoponto",
            coordenadas: [-23.5460, -46.4380],
            nome: "Ecoponto José Bonifácio",
            endereco: "Rua Ana Perena, altura do nº 110",
            tipo: "Ecoponto municipal",
            horario: "Segunda a sábado, das 8h às 17h",
            rota: "https://www.google.com/maps/search/?api=1&query=Ecoponto+Jose+Bonifacio+Rua+Ana+Perena+Sao+Paulo"
        },
        {
            id: 6,
            ativo: true,
            categoria: "ecoponto",
            coordenadas: [-23.5480, -46.4530],
            nome: "Ecoponto Vila Carmosina",
            endereco: "Avenida Francisco Tranchesi, altura do nº 71",
            tipo: "Ecoponto municipal",
            horario: "Segunda a sexta, das 8h às 17h",
            rota: "https://www.google.com/maps/search/?api=1&query=Ecoponto+Vila+Carmosina+Sao+Paulo"
        },
        {
            id: 7,
            ativo: true,
            categoria: "ecoponto",
            coordenadas: [-23.5260, -46.4900],
            nome: "Ecoponto Vila Santa Teresinha",
            endereco: "Rua Major Vitorino de Souza Rocha, 90",
            tipo: "Ecoponto municipal",
            horario: "Segunda a sábado, das 8h às 18h",
            rota: "https://www.google.com/maps/search/?api=1&query=Ecoponto+Vila+Santa+Teresinha+Sao+Paulo"
        },
        {
            id: 8,
            ativo: true,
            categoria: "ecoponto",
            coordenadas: [-23.5370, -46.5240],
            nome: "Ecoponto Vila Matilde",
            endereco: "Rua Mateus de Siqueira, 375, Jardim Triana, São Paulo - SP",
            tipo: "Ecoponto municipal",
            horario: "Segunda a sexta, das 8h às 17h",
            rota: "https://www.google.com/maps/search/?api=1&query=Ecoponto+Vila+Matilde+Rua+Mateus+de+Siqueira+375"
        },
        {
            id: 9,
            ativo: true,
            categoria: "ecoponto",
            coordenadas: [-23.5100, -46.5250],
            nome: "Ecoponto Tiquatira",
            endereco: "Avenida Governador Carvalho Pinto, Jardim Jaú, São Paulo - SP",
            tipo: "Ecoponto municipal",
            horario: "Segunda a sábado, das 8h às 18h",
            rota: "https://www.google.com/maps/search/?api=1&query=Ecoponto+Tiquatira+Sao+Paulo"
        },
        {
            id: 10,
            ativo: true,
            categoria: "pev",
            coordenadas: [-23.5460, -46.4380],
            nome: "PEV - CE José Bonifácio",
            endereco: "Rua Ana Perena, 110",
            tipo: "Recicláveis",
            materiais: "Plástico, papel, papelão, vidro e metal",
            horario: "Segunda a sábado, das 8h às 17h",
            rota: "https://www.google.com/maps/search/?api=1&query=Rua+Ana+Perena+110+Sao+Paulo",
            textoRota: "Ver localização"
        },
        {
            id: 11,
            ativo: true,
            categoria: "pev",
            coordenadas: [-23.5580, -46.4850],
            nome: "PEV - CDC Líder",
            endereco: "Rua Casemiro Nisskiniz, 157",
            tipo: "Ponto de entrega voluntária",
            materiais: "Plástico, papel, papelão, vidro e metal",
            horario: "Segunda a sexta, das 8h às 17h",
            rota: "https://www.google.com/maps/search/?api=1&query=Rua+Casemiro+Nisskiniz+157+Sao+Paulo",
            textoRota: "Ver localização"
        },
        {
            id: 12,
            ativo: true,
            categoria: "pev",
            coordenadas: [-23.5520, -46.4780],
            nome: "PEV - CDC Araújo",
            endereco: "Rua Bernardino Prudenti, 194",
            tipo: "Ponto de entrega voluntária",
            materiais: "Plástico, papel, papelão, vidro e metal",
            horario: "Segunda a sábado, das 8h às 17h",
            rota: "https://www.google.com/maps/search/?api=1&query=Rua+Bernardino+Prudenti+194+Sao+Paulo",
            textoRota: "Ver localização"
        },
        {
            id: 13,
            ativo: true,
            categoria: "pev",
            coordenadas: [-23.5500, -46.4800],
            nome: "PEV - CDC União do Morro de Santa Tereza",
            endereco: "Rua Astolfo Marques, 330",
            tipo: "Ponto de entrega voluntária",
            materiais: "Plástico, papel, papelão, vidro e metal",
            horario: "Segunda a sexta, das 8h às 17h",
            rota: "https://www.google.com/maps/search/?api=1&query=Rua+Astolfo+Marques+330+Sao+Paulo",
            textoRota: "Ver localização"
        },
        {
            id: 14,
            ativo: true,
            categoria: "especifico",
            coordenadas: [-23.5410, -46.4580],
            nome: "Assaí Itaquera",
            endereco: "Avenida Sylvio Torres, 190, Conjunto Habitacional Padre José de Anchieta",
            materiaisLabel: "Materiais coletados",
            materiaisLista: ["Óleo de cozinha usado", "Pilhas e baterias", "Lâmpadas"],
            horario: "Segunda a sábado, das 7h às 22h",
            rota: "https://www.google.com/maps/search/?api=1&query=Assai+Itaquera+Avenida+Sylvio+Torres+190"
        },
        {
            id: 15,
            ativo: true,
            categoria: "especifico",
            coordenadas: [-23.5408, -46.4615],
            nome: "Subprefeitura de Itaquera",
            endereco: "Rua Augusto Carlos Baumann, 851",
            materiaisLabel: "Materiais divulgados",
            materiaisLista: ["Papel e papelão", "Plásticos", "Metais e vidro", "Óleo de cozinha usado", "Pilhas e baterias"],
            horario: "Segunda a sexta, das 8h às 17h",
            rota: "https://www.google.com/maps/search/?api=1&query=Rua+Augusto+Carlos+Baumann+851+Itaquera"
        }
    ]
};
