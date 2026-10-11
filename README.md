Guia de Coleta Seletiva · Jardim Camila

Projeto do Desafio PI· FATEC ZL · Análise e Desenvolvimento de Sistemas Projeto Integrador · Prof. Rodrigo dos Santos Faustino

Time: WizTech Cliente (fictício): Associação de Moradores do Jardim Camila

Sobre o projeto

A Associação de Moradores recebe reclamações de descarte errado toda semana, e a informação sobre onde e como descartar está espalhada entre grupos de moradores e avisos locais. Este site reúne tudo em um só lugar: o morador vê no mapa os pontos de coleta do bairro e descobre o que cada tipo de resíduo aceita.

Funcionalidades
-Mapa interativo com informações dos pontos de coleta do bairro 
<br>
-Filtro por tipo de resíduo (Papel, Plástico, Vidro, Metal, Orgânico e Rejeito)
<br>
-Descrições dos tipos de resíduo no fim da página
<br>
-Ícone do ponto de coleta que leva à descrição do resíduo
<br>
-Diferencial do projeto: cada tipo de resíduo recebe a cor oficial da coleta seletiva, definida pelo JavaScript a partir da propriedade tipo
<br>
Tipo	Cor
Papel	Azul
Plástico	Vermelho
Vidro	Verde
Metal	Amarelo
Orgânico	Marrom
Rejeito	Cinza
Integrantes e contribuições
Integrante	O que fez
<br>
Mario	Estrutura HTML (index.html)
<br>
Gabriel Ken	CSS (style.css)
<br>
Renato	Interação com JavaScript (script.js)
<br>
Gabriel Delatim	Modelagem (docs/entidades.md), README e dados.js
<br>
Samuel Elvis	Entrevista e requisitos (docs/requisitos)
<br>

Como abrir o site
Baixe ou clone o repositório.
Dê duplo clique em index.html.

Estrutura do repositório
index.html      estrutura da página
style.css       estilos
dados.js        dados do mapa e dos pontos de coleta
script.js       somente a lógica
README.md
docs/
  requisitos.pdf    documento de requisitos
  entidades.md      lista de entidades e atributos
Dados

O dados.js define DADOS_MAPA, com:

pontos: 15 pontos de coleta (9 ecopontos, 4 PEVs e 2 pontos específicos)
coletaEstimada: dias e horários estimados da coleta por região (Sul, Centro e Norte)
Configurações do mapa: centro, zoom, limites e fonte dos tiles

Propriedades de cada ponto:

Propriedade	Tipo	Exemplo
id	número	1
ativo	verdadeiro/falso	true
categoria	texto	"ecoponto", "pev" ou "especifico"
nome	texto	"Ecoponto Vila Matilde"
tipo	texto	"Ecoponto municipal"
endereco	texto	"Rua Mateus de Siqueira, 375"
coordenadas	lista de 2 números	[-23.5370, -46.5240]
horario	texto	"Segunda a sexta, das 8h às 17h"
rota	texto	link do Google Maps
materiais, materiaisLabel, materiaisLista, textoRota	texto / lista	opcionais, conforme a categoria

Para incluir um novo ponto, basta acrescentar um objeto em pontos, sem alterar o HTML.

Modelagem

A lista de entidades, atributos e relações está em docs/entidades.md: PontoColeta, CategoriaPonto, TipoResiduo, ColetaEstimada e a entidade associativa PontoTipo (relação N para N entre pontos e tipos de resíduo).

Tecnologias

HTML5, CSS3 e JavaScript com biblioteca Leaflet para o mapa interativo conforme sugestão do professor.
