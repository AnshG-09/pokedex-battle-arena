import { Link } from "react-router-dom";
import { Plus, Check, ArrowUpRight } from "lucide-react";
import { getSprite } from "../data/pokemon";
import TypeBadge from "./TypeBadge";

export default function PokemonCard({ pokemon, isOnTeam, onAdd }) {
  return (
    <article className="pokemon-card" style={{ "--card-accent": pokemon.color }}>
      <div className="card-topline">
        <span className="pokemon-number">#{String(pokemon.id === 4481 ? 212 : pokemon.id).padStart(3, "0")}</span>
        <span className="card-dot" />
      </div>
      <Link to={`/pokemon/${pokemon.id}`} className="pokemon-art-link" aria-label={`View ${pokemon.name} details`}>
        <div className="pokemon-art-wrap">
          <div className="art-glow" />
          <img className="pokemon-art" src={getSprite(pokemon)} alt={pokemon.name} loading="lazy" />
        </div>
      </Link>
      <div className="pokemon-card-info">
        <div className="pokemon-name-row">
          <h3>{pokemon.name}</h3>
          <Link to={`/pokemon/${pokemon.id}`} className="icon-link" aria-label={`Details for ${pokemon.name}`}><ArrowUpRight size={17} /></Link>
        </div>
        <div className="type-row">{pokemon.types.map((type) => <TypeBadge key={type} type={type} />)}</div>
        <div className="mini-stats">
          <span><small>HP</small><b>{pokemon.stats.hp}</b></span>
          <span><small>ATK</small><b>{pokemon.stats.attack}</b></span>
          <span><small>DEF</small><b>{pokemon.stats.defense}</b></span>
          <span><small>SPD</small><b>{pokemon.stats.speed}</b></span>
        </div>
        <button className={`button ${isOnTeam ? "button-muted" : "button-primary"} card-add-button`} onClick={() => onAdd(pokemon)}>
          {isOnTeam ? <Check size={16} /> : <Plus size={16} />}{isOnTeam ? "On your team" : "Add to team"}
        </button>
      </div>
    </article>
  );
}
