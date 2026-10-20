// Simplified type-effectiveness chart for the demo battle engine.
// Unlisted matchups are treated as neutral (1x).
const strongAgainst = {
  Normal: [],
  Fire: ["Grass", "Ice", "Bug", "Steel"],
  Water: ["Fire", "Ground", "Rock"],
  Electric: ["Water", "Flying"],
  Grass: ["Water", "Ground", "Rock"],
  Ice: ["Grass", "Ground", "Flying", "Dragon"],
  Fighting: ["Normal", "Ice", "Rock", "Dark", "Steel"],
  Poison: ["Grass", "Fairy"],
  Ground: ["Fire", "Electric", "Poison", "Rock", "Steel"],
  Flying: ["Grass", "Fighting", "Bug"],
  Psychic: ["Fighting", "Poison"],
  Bug: ["Grass", "Psychic", "Dark"],
  Rock: ["Fire", "Ice", "Flying", "Bug"],
  Ghost: ["Psychic", "Ghost"],
  Dragon: ["Dragon"],
  Dark: ["Psychic", "Ghost"],
  Steel: ["Ice", "Rock", "Fairy"],
  Fairy: ["Fighting", "Dragon", "Dark"]
};

const weakAgainst = {
  Normal: ["Rock", "Steel"],
  Fire: ["Fire", "Water", "Rock", "Dragon"],
  Water: ["Water", "Grass", "Dragon"],
  Electric: ["Electric", "Grass", "Dragon"],
  Grass: ["Fire", "Grass", "Poison", "Flying", "Bug", "Dragon", "Steel"],
  Ice: ["Fire", "Water", "Ice", "Steel"],
  Fighting: ["Poison", "Flying", "Psychic", "Bug", "Fairy"],
  Poison: ["Poison", "Ground", "Rock", "Ghost"],
  Ground: ["Grass", "Bug"],
  Flying: ["Electric", "Rock", "Steel"],
  Psychic: ["Psychic", "Steel"],
  Bug: ["Fire", "Fighting", "Poison", "Flying", "Ghost", "Steel", "Fairy"],
  Rock: ["Fighting", "Ground", "Steel"],
  Ghost: ["Dark"],
  Dragon: ["Steel"],
  Dark: ["Fighting", "Dark", "Fairy"],
  Steel: ["Fire", "Water", "Electric", "Steel"],
  Fairy: ["Fire", "Poison", "Steel"]
};

export function typeEffectiveness(moveType, defenderTypes = []) {
  let multiplier = 1;
  for (const defenderType of defenderTypes) {
    if (strongAgainst[moveType]?.includes(defenderType)) multiplier *= 2;
    if (weakAgainst[moveType]?.includes(defenderType)) multiplier *= 0.5;
  }
  // A few classic immunities.
  if (moveType === "Normal" && defenderTypes.includes("Ghost")) return 0;
  if (moveType === "Fighting" && defenderTypes.includes("Ghost")) return 0;
  if (moveType === "Electric" && defenderTypes.includes("Ground")) return 0;
  if (moveType === "Ground" && defenderTypes.includes("Flying")) return 0;
  if (moveType === "Psychic" && defenderTypes.includes("Dark")) return 0;
  if (moveType === "Dragon" && defenderTypes.includes("Fairy")) return 0;
  return multiplier;
}

export function getDefensiveProfile(types = []) {
  const allTypes = Object.keys(strongAgainst);
  const strengths = [];
  const weaknesses = [];
  const resistances = [];
  for (const attackType of allTypes) {
    const mult = typeEffectiveness(attackType, types);
    if (mult >= 2) weaknesses.push(attackType);
    if (mult > 0 && mult <= 0.5) resistances.push(attackType);
  }
  for (const attackType of allTypes) {
    if (types.some((defType) => strongAgainst[defType]?.includes(attackType))) strengths.push(attackType);
  }
  return { strengths, weaknesses, resistances };
}
