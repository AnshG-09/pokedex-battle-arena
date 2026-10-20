import { Link } from "react-router-dom";
import { History, Trophy, Swords, TrendingUp, Trash2 } from "lucide-react";
import { useGame } from "../context/GameContext";
import { getPokemonById, pokemon, getSprite } from "../data/pokemon";

export default function BattleHistory() {
  const { history } = useGame();
  const wins = history.filter((b) => b.result === "Victory").length;
  const losses = history.filter((b) => b.result === "Defeat").length;
  const rate = history.length ? Math.round((wins / history.length) * 100) : 0;

  return <>
    <section className="page-title-row"><div><span className="eyebrow">YOUR RECORD</span><h1>Battle <span>history.</span></h1><p>Every win tells a story. Every loss teaches a lesson.</p></div><div className="history-icon"><History size={25} /></div></section>
    <div className="history-stats">
      <div className="history-stat panel"><span className="history-stat-icon"><Swords size={18} /></span><strong>{history.length}</strong><small>Total battles</small></div>
      <div className="history-stat panel"><span className="history-stat-icon win-icon"><Trophy size={18} /></span><strong>{wins}</strong><small>Victories</small></div>
      <div className="history-stat panel"><span className="history-stat-icon loss-icon"><TrendingUp size={18} /></span><strong>{losses}</strong><small>Defeats</small></div>
      <div className="history-stat panel"><span className="history-stat-icon"><TrendingUp size={18} /></span><strong>{rate}%</strong><small>Win rate</small></div>
    </div>
    <section className="panel history-panel"><div className="panel-heading"><div className="heading-icon"><History size={18} /></div><div><h2>Recent matches</h2><p>Your last 50 battle results are saved in this browser.</p></div></div>
      {history.length ? <div className="history-list">{history.map((b) => <article className="history-row" key={b.id}><div className={`history-result-mark ${b.result === "Victory" ? "win" : "loss"}`}>{b.result === "Victory" ? <Trophy size={18} /> : <Swords size={18} />}</div><div className="history-matchup"><strong>{b.result}</strong><span>{new Date(b.date).toLocaleString()}</span><small>{b.difficulty} difficulty</small></div><div className="history-team-block"><small>YOUR TEAM</small><span>{b.playerTeam.join(", ")}</span></div><div className="history-team-block opponent-block"><small>OPPONENT</small><span>{b.opponentTeam.join(", ")}</span></div><span className={`result-chip ${b.result === "Victory" ? "win" : "loss"}`}>{b.result}</span></article>)}</div> :
      <div className="empty-state compact"><div className="empty-state-icon"><History size={30} /></div><h3>No battles logged yet</h3><p>Build a team and enter the arena. Your results will show up here automatically.</p><Link className="button button-primary" to="/team">Build your team</Link></div>}
    </section>
    <p className="history-note">Battle history is stored locally in your browser. Clearing browser storage will clear this record.</p>
  </>;
}
