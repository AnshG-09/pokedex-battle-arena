# Pokédex Battle Arena

A responsive Pokémon exploration and turn-based battle game built with React, Vite, and plain CSS.

## Features

- Browse and search a sample Pokédex.
- Filter Pokémon by type.
- View Pokémon stats, moves, strengths, and weaknesses.
- Build a team of up to six Pokémon.
- Battle a computer-generated opponent team.
- Turn-based attacks, HP bars, type effectiveness, and battle log.
- Choose Easy, Normal, or Hard difficulty.
- Save team selections and battle history in browser `localStorage`.
- Responsive layout for mobile and desktop.

## Getting started

Requirements: Node.js (LTS recommended) and npm.

```bash
npm install
npm run dev
```

Open the local address Vite prints in the terminal.

## Production build

```bash
npm run build
npm run preview
```

## Data

The app's sample Pokémon and moves are in `src/data/`. Pokémon artwork is loaded from the public PokeAPI sprite repository, while stats and move data used by the demo are stored locally. The optional next step is to fetch real records from PokéAPI and normalize them to the app's data shape.

## Deploy

Import this repository into Vercel or Netlify. For Vercel, use build command `npm run build` and output directory `dist`.

## Screenshot

After running the app, capture a screenshot of the Pokédex page and add it to the repository, for example at `public/screenshot.png`. Then embed it here:

```markdown
![Pokédex Battle Arena screenshot](public/screenshot.png)
```

## Disclaimer

Pokémon and related names/artwork belong to their respective owners. This is a fan-made educational demo.


## Ultimate cinematic edition
- Expanded roster to more than 200 classic Pokémon entries, using official-artwork sprite URLs keyed by Pokédex number.
- Added additional elemental moves and move-specific projectile styling (Fire Blast, Hydro Pump, Thunderbolt, Solar Beam, Ice Beam, Dragon Claw, Aura Sphere, and more).
- Added cinematic projectile trails, impact vignettes, lunge motion, speed lines, and reduced-motion support.
- Pokémon stats/types for newly generated roster entries are game-balanced placeholder values; official artwork is loaded from PokeAPI's public sprite repository.


## Enemy team size fix
Opponent teams now contain up to six Pokémon (normally six), independently of the player's team size. Defeated opponents are replaced by the next living Pokémon until all six have fainted.
