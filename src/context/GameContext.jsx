import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { pokemon } from "../data/pokemon";

const GameContext = createContext(null);
const readStorage = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

export function GameProvider({ children }) {
  const [teamIds, setTeamIds] = useState(() => readStorage("pokedex-team", []));
  const [history, setHistory] = useState(() => readStorage("pokedex-history", []));
  const team = useMemo(() => teamIds.map((id) => pokemon.find((p) => p.id === id)).filter(Boolean), [teamIds]);

  useEffect(() => localStorage.setItem("pokedex-team", JSON.stringify(teamIds)), [teamIds]);
  useEffect(() => localStorage.setItem("pokedex-history", JSON.stringify(history)), [history]);

  function addToTeam(id) {
    if (teamIds.includes(id)) return { ok: false, message: "Already on your team." };
    if (teamIds.length >= 6) return { ok: false, message: "Your team is full. Remove a Pokémon first." };
    setTeamIds((current) => current.length < 6 && !current.includes(id) ? [...current, id] : current);
    return { ok: true, message: "Added to your team!" };
  }

  function removeFromTeam(id) {
    setTeamIds((current) => current.filter((teamId) => teamId !== id));
  }

  function saveBattle(record) {
    setHistory((current) => [record, ...current].slice(0, 50));
  }

  const value = { team, teamIds, history, addToTeam, removeFromTeam, saveBattle };
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const value = useContext(GameContext);
  if (!value) throw new Error("useGame must be used inside GameProvider");
  return value;
}
