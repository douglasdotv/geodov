# GeoStats

[![en](https://img.shields.io/badge/lang-en-red.svg)](README.md) [![pt-br](https://img.shields.io/badge/lang-pt--br-green.svg)](README.pt-br.md)

Este é um projeto para registrar locais que visitei no [GeoGuessr](https://www.geoguessr.com/).

### Como Funciona

Um userscript captura os palpites e suas respectivas localizações enquanto se joga, armazenando as informações relevantes em um banco de dados. Esses dados são, então, exibidos em uma [aplicação web](https://geostats.info), a qual oferece um histórico detalhado de rounds (mostrando, para cada um, o tipo de jogo, o palpite, a localização real, a distância e o tempo gasto), além de um mapa com todos os locais visitados e algumas estatísticas por país.

### Ferramentas Utilizadas

- JavaScript
- TypeScript
- Next.js
- Supabase
- Tailwind CSS
- MapLibre GL JS
