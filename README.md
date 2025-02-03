# GeoStats

[![en](https://img.shields.io/badge/lang-en-red.svg)](README.md) [![pt-br](https://img.shields.io/badge/lang-pt--br-green.svg)](README.pt-br.md)

This is a project to record locations that I have visited in [GeoGuessr](https://www.geoguessr.com/).

### How It Works

A userscript captures guesses and their respective locations during gameplay, storing the relevant information in a database. This data is then displayed in a [web application](https://geostats.info), which provides a detailed history of each round (showing the game type, the guess, the actual location, the distance, and the time taken), as well as a map with all visited locations and some statistics by country.

### Tools Used

- JavaScript
- TypeScript
- Next.js
- Supabase
- Tailwind CSS
- MapLibre GL JS
