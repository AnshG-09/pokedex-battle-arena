import { Link } from "react-router-dom";
import { ArrowRight, Plus, Trash2, Users, ShieldCheck } from "lucide-react";
import { pokemon, getSprite } from "../data/pokemon";
import { useGame } from "../context/GameContext";
import TypeBadge from "../components/TypeBadge";

export default function TeamBuilder() {
  const { team, teamIds, removeFromTeam } = useGame();
  const available = pokemon.filter((p) => !teamIds.includes(p.id));

  return (
    <>
      <section className="page-title-row"><div><span className="eyebrow">SQUAD MANAGEMENT</span><h1>Build your <span>dream team.</span></h1><p>Choose up to six Pokémon. A balanced team gives you more options in battle.</p></div><div className="team-counter"><Users size={19} /><strong>{team.length}<small>/6</small></strong><span>team slots filled</span></div></section>
      <section className="panel team-panel">
        <div className="panel-heading"><div className="heading-icon"><ShieldCheck size={18} /></div><div><h2>Your battle squad</h2><p>{team.length === 6 ? "Your team is ready for battle." : `${6 - team.length} open slot${6 - team.length === 1 ? "" : "s"} remaining`}</p></div></div>
        {team.length ? <div className="team-grid">{team.map((p, index) => <article className="team-member" key={p.id} style={{ "--card-accent": p.color }}><span className="slot-number">SLOT 0{index + 1}</span><button className="remove-button" onClick={() => removeFromTeam(p.id)} aria-label={`Remove ${p.name}`}><Trash2 size={16} /></button><img src={getSprite(p)} alt={p.name} /><h3>{p.name}</h3><div className="type-row">{p.types.map((t) => <TypeBadge key={t} type={t} />)}</div><div className="team-member-stats"><span>HP <b>{p.stats.hp}</b></span><span>ATK <b>{p.stats.attack}</b></span><span>DEF <b>{p.stats.defense}</b></span></div></article>)}
        {Array.from({ length: 6 - team.length }, (_, i) => <div className="empty-slot" key={`empty-${i}`}><span className="empty-slot-icon"><Plus size={22} /></span><strong>Open slot</strong><small>Add a Pokémon below</small></div>)}</div> :
          <div className="empty-state compact"><Users size={32} /><h3>Your team is waiting</h3><p>Add Pokémon from the collection below to get started.</p><Link to="/" className="button button-primary">Browse Pokédex <ArrowRight size={16} /></Link></div>}
        <div className="team-footer"><span>{team.length < 2 ? "Add at least 2 Pokémon to start a battle." : "Your squad is ready when you are."}</span><Link className={`button ${team.length >= 2 ? "button-primary" : "button-disabled"}`} to={team.length >= 2 ? "/battle" : "/team"}>Go to battle <ArrowRight size={17} /></Link></div>
      </section>
      <section className="section-heading"><div><span className="eyebrow">ROSTER</span><h2>Add to your team</h2></div><span className="subtle-text">{available.length} available</span></section>
      {available.length ? <div className="compact-roster">{available.map((p) => <div className="roster-row" key={p.id}><img src={getSprite(p)} alt="" /><div className="roster-info"><strong>{p.name}</strong><div className="type-row">{p.types.map((t) => <TypeBadge key={t} type={t} />)}</div></div><button className="icon-button" onClick={() => { if (team.length < 6) { const event = new CustomEvent("team-add", { detail: p.id }); window.dispatchEvent(event); } }} disabled={team.length >= 6} aria-label={`Add ${p.name}`}><Plus size={18} /></button></div>)}</div> : <div className="empty-state compact"><h3>You've collected them all!</h3></div>}
      <TeamAddListener />
    </>
  );
}

// The listener delegates the add action through the same context used by the rest of the app.
import { useEffect } from "react";
function TeamAddListener() {
  const { addToTeam } = useGame();
  useEffect(() => {
    const handler = (event) => addToTeam(event.detail);
    window.addEventListener("team-add", handler);
    return () => window.removeEventListener("team-add", handler);
  }, [addToTeam]);
  return null;
}
