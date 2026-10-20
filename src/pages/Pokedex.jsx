import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { pokemon } from "../data/pokemon";
import { useGame } from "../context/GameContext";
import PokemonCard from "../components/PokemonCard";

const types = ["All types", ...new Set(pokemon.flatMap((p) => p.types))];

export default function Pokedex() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All types");
  const [notice, setNotice] = useState("");
  const { teamIds, addToTeam } = useGame();

  const filtered = useMemo(() => pokemon.filter((p) => {
    const matchesName = p.name.toLowerCase().includes(search.toLowerCase().trim());
    const matchesType = selectedType === "All types" || p.types.includes(selectedType);
    return matchesName && matchesType;
  }), [search, selectedType]);

  function handleAdd(p) {
    const result = addToTeam(p.id);
    setNotice(result.message);
    window.setTimeout(() => setNotice(""), 2200);
  }

  return (
    <>
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={14} /> YOUR NEXT ADVENTURE STARTS HERE</span>
          <h1>Discover your next<br /><span>battle partner.</span></h1>
          <p>Explore Pokémon, build your dream squad, and prove yourself in the arena.</p>
          <div className="hero-metrics">
            <div><strong>{pokemon.length.toString().padStart(2, "0")}</strong><span>Pokémon to discover</span></div>
            <div><strong>06</strong><span>Slots in your team</span></div>
            <div><strong>∞</strong><span>Ways to battle</span></div>
          </div>
        </div>
        <div className="hero-orbit">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" alt="Pikachu" />
          <span className="floating-chip chip-top">#025 · ELECTRIC</span>
          <span className="floating-chip chip-bottom">READY TO BATTLE</span>
        </div>
      </section>

      <section className="section-heading">
        <div><span className="eyebrow">THE COLLECTION</span><h2>Pokédex <span className="muted-count">{filtered.length} found</span></h2></div>
        <p>Every great team starts with one.</p>
      </section>

      <section className="filter-panel">
        <label className="search-box"><Search size={19} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Pokémon by name..." aria-label="Search Pokémon" />{search && <button onClick={() => setSearch("")} aria-label="Clear search">×</button>}</label>
        <label className="select-box"><SlidersHorizontal size={17} /><select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} aria-label="Filter by type">{types.map((type) => <option key={type}>{type}</option>)}</select></label>
      </section>

      {notice && <div className="toast" role="status">{notice}</div>}
      {filtered.length ? <div className="pokemon-grid">{filtered.map((p) => <PokemonCard key={p.id} pokemon={p} isOnTeam={teamIds.includes(p.id)} onAdd={handleAdd} />)}</div> :
        <div className="empty-state"><Search size={32} /><h3>No Pokémon found</h3><p>Try a different name or type filter.</p><button className="button button-secondary" onClick={() => { setSearch(""); setSelectedType("All types"); }}>Clear filters</button></div>}
    </>
  );
}
