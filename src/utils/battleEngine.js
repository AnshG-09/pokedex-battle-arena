import { moves } from "../data/moves";
import { typeEffectiveness } from "../data/typeChart";

export function calculateDamage(attacker, defender, moveName) {
  const move = moves[moveName] ?? { power: 40, type: "Normal" };
  const multiplier = typeEffectiveness(move.type, defender.types);
  const randomFactor = 0.85 + Math.random() * 0.15;
  const raw = (attacker.stats.attack / Math.max(1, defender.stats.defense)) *
    move.power * multiplier * randomFactor;
  return { damage: multiplier === 0 ? 0 : Math.max(1, Math.floor(raw)), multiplier, move };
}

export function effectivenessText(multiplier) {
  if (multiplier === 0) return "It had no effect...";
  if (multiplier >= 2) return "It's super effective!";
  if (multiplier <= 0.5) return "It's not very effective.";
  return "";
}

export function chooseMove(pokemon) {
  const options = pokemon.moves?.length ? pokemon.moves : ["Tackle"];
  return options[Math.floor(Math.random() * options.length)];
}
