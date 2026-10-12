# AcheLixo · Guia de Coleta Seletiva

Projeto do Desafio PI · FATEC ZL · Análise e Desenvolvimento de Sistemas
Projeto Integrador · Prof. Rodrigo dos Santos Faustino

**Time:** WizTech

**Cliente (fictício):** Associação de Moradores do Jardim Camila

---

## Sobre o projeto

A Associação de Moradores recebe reclamações de descarte errado toda semana, e a informação sobre onde e como descartar está espalhada entre grupos de moradores e avisos locais.

O **AcheLixo** reúne tudo em um só lugar: o morador vê no mapa os pontos de coleta do bairro e descobre o que cada tipo de ponto aceita.

---

## Funcionalidades

- Mapa interativo com informações dos pontos de coleta do bairro
- Filtro por região (Todas, Artur Alvim e Próximos)
- Filtro por tipo de ponto (Ecopontos, PEVs e Coleta específica)
- Legenda com a cor de cada tipo de ponto no mapa
- Delimitação de Artur Alvim e estimativa de coleta ao selecionar uma região do mapa
- Seção "Onde descartar cada tipo de resíduo?", com descrição e foto de cada tipo de ponto
- Guia de materiais com cartões que mostram categoria, reciclabilidade, local de descarte, tempo estimado de decomposição e dica
- Busca de materiais por nome, tipo, local de descarte ou dica, sem diferenciar acentos
- Filtro de materiais por tipo, combinável com a busca, e indicação da quantidade de resultados
- Ícone do ponto de coleta que leva à descrição do resíduo
- Menu de navegação (Início, Mapa, Tipos de Lixos, Materiais e Créditos)
- **Diferencial do projeto:** cores próprias identificam as categorias dos pontos no mapa e os tipos de resíduos nos cartões de materiais

---

## Integrantes e contribuições

| Integrante | O que fez |
|---|---|
| Mario Batista | Estrutura HTML (`index.html`) |
| Gabriel Ken Kudo Lima | CSS (`style.css`) |
| Renato Luis Ferreira dos Santos | Interação com JavaScript (`script.js`) |
| Gabriel Delatim Marcondes de Jesus | Modelagem (`Modelagem.md`), README e `dados.js` |
| Samuel Elvis Lima | Entrevista e requisitos (`docs/requisitos`) |

---

## Como abrir o site

1. Baixe ou clone o repositório.
2. Confirme que a pasta `leaflet/dist` está no projeto. Ela contém a cópia local da biblioteca Leaflet; não é necessário instalar Node.js ou executar `npm install`.
3. Dê duplo clique em `index.html`.

É preciso estar conectado à internet para carregar o mapa.

---

## Estrutura do repositório

```
index.html          estrutura da página
style.css           estilos
dados.js            dados do mapa e dos pontos de coleta
script.js           lógica do site
README.md
assets/
  fotos-descarte/   imagens da seção de descarte
leaflet/
  dist/              biblioteca Leaflet e seus estilos
docs/
  requisitos.pdf    documento de requisitos
  entidades.md      lista de entidades e atributos
```

---

## Dados

O `dados.js` define `DADOS_MAPA`, com:

- **`pontos`:** 15 pontos de coleta (9 ecopontos, 4 PEVs e 2 pontos específicos)
- **`materiais`:** materiais e orientações de descarte exibidos no guia pesquisável e filtrável
- **`coletaEstimada`:** dias e horários estimados da coleta por região (Sul, Centro e Norte)
- **Configurações do mapa:** centro, zoom, limites, coordenadas locais do limite de Artur Alvim e fonte dos tiles

Propriedades de cada ponto:

| Propriedade | Tipo | Exemplo |
|---|---|---|
| id | número | `1` |
| ativo | verdadeiro/falso | `true` |
| categoria | texto | `"ecoponto"`, `"pev"` ou `"especifico"` |
| nome | texto | `"Ecoponto Vila Matilde"` |
| tipo | texto | `"Ecoponto municipal"` |
| endereco | texto | `"Rua Mateus de Siqueira, 375"` |
| coordenadas | lista de 2 números | `[-23.5370, -46.5240]` |
| horario | texto | `"Segunda a sexta, das 8h às 17h"` |
| rota | texto | link do Google Maps |
| materiais, materiaisLabel, materiaisLista, textoRota | texto ou lista | opcionais, conforme a categoria |

Para incluir um novo ponto, basta acrescentar um objeto em `pontos`, sem alterar o HTML.

---

## Modelagem

A lista de entidades, atributos e relações está em [`Modelagem.md`](Modelagem.md): **Material**, **TipoResiduo**, **PontoColeta**, **CategoriaPonto**, **PontoTipo** e **ColetaEstimada**.

---

## Tecnologias

- HTML5
- CSS3
- JavaScript
- Biblioteca [Leaflet](https://leafletjs.com/) para o mapa interativo, conforme sugestão do professor

---

## Observações e fontes

- A entrevista com o cliente é fictícia, com autorização do professor.
- Os dias e horários de coleta (`coletaEstimada`) são estimativas.
- Os pontos de coleta ficam na região de Artur Alvim e arredores.
- Mapa: © OpenStreetMap contributors.
