import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Plus, Shield, Swords, Gauge, Heart } from "lucide-react";
import { getPokemonById, getSprite } from "../data/pokemon";
import { getDefensiveProfile } from "../data/typeChart";
import { useGame } from "../context/GameContext";
import TypeBadge from "../components/TypeBadge";
import StatBar from "../components/StatBar";
import { useState } from "react";

export default function PokemonDetails() {
  const { id } = useParams();
  const p = getPokemonById(id);
  const { teamIds, addToTeam } = useGame();
  const [notice, setNotice] = useState("");
  const navigate = useNavigate();

  if (!p) return <div className="empty-state"><h2>Pokémon not found</h2><Link className="button button-primary" to="/">Back to Pokédex</Link></div>;
  const profile = getDefensiveProfile(p.types);
  const isOnTeam = teamIds.includes(p.id);

  function handleAdd() {
    const result = addToTeam(p.id);
    setNotice(result.message);
    window.setTimeout(() => setNotice(""), 2200);
  }

  return (
    <div className="detail-page">
      <button className="back-link" onClick={() => navigate(-1)}><ArrowLeft size={17} /> Back to Pokédex</button>
      {notice && <div className="toast">{notice}</div>}
      <section className="detail-hero" style={{ "--card-accent": p.color }}>
        <div className="detail-art"><div className="detail-art-circle" /><img src={getSprite(p)} alt={p.name} /></div>
        <div className="detail-intro">
          <span className="eyebrow">POKÉDEX ENTRY #{String(p.id === 4481 ? 212 : p.id).padStart(3, "0")}</span>
          <h1>{p.name}</h1>
          <div className="type-row">{p.types.map((t) => <TypeBadge key={t} type={t} />)}</div>
          <p>{p.description}</p>
          <button className={`button ${isOnTeam ? "button-muted" : "button-primary"}`} onClick={handleAdd}>{isOnTeam ? <Check size={17} /> : <Plus size={17} />}{isOnTeam ? "Already on your team" : "Add to my team"}</button>
        </div>
      </section>

      <div className="detail-columns">
        <section className="panel stats-panel">
          <div className="panel-heading"><div className="heading-icon"><Swords size={18} /></div><div><h2>Base stats</h2><p>Battle-ready breakdown</p></div></div>
          <div className="stat-list">
            <StatBar label="HP" value={p.stats.hp} />
            <StatBar label="Attack" value={p.stats.attack} />
            <StatBar label="Defense" value={p.stats.defense} />
            <StatBar label="Speed" value={p.stats.speed} />
          </div>
          <div className="stat-total"><span>Total base stats</span><strong>{Object.values(p.stats).reduce((a, b) => a + b, 0)}</strong></div>
        </section>
        <section className="panel type-panel">
          <div className="panel-heading"><div className="heading-icon"><Shield size={18} /></div><div><h2>Type matchup</h2><p>Know what to watch out for</p></div></div>
          <h3 className="matchup-label weakness-label">Weak against</h3>
          <div className="matchup-types">{profile.weaknesses.length ? profile.weaknesses.map((t) => <TypeBadge key={t} type={t} />) : <span className="subtle-text">No listed weaknesses</span>}</div>
          <h3 className="matchup-label strength-label">Resists</h3>
          <div className="matchup-types">{profile.resistances.length ? profile.resistances.map((t) => <TypeBadge key={t} type={t} />) : <span className="subtle-text">No listed resistances</span>}</div>
          <div className="matchup-note"><Gauge size={17} /> Type effectiveness affects damage in battle.</div>
        </section>
      </div>
      <section className="panel moves-panel">
        <div className="panel-heading"><div className="heading-icon"><Heart size={18} /></div><div><h2>Available moves</h2><p>Moves this Pokémon can use in the demo</p></div></div>
        <div className="move-list">{p.moves.map((move) => <div className="move-pill" key={move}><span>{move}</span></div>)}</div>
      </section>
    </div>
  );
}
