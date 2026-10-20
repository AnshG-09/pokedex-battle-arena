import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Swords, RotateCcw, Trophy, AlertTriangle, ArrowRight, Zap } from "lucide-react";
import { pokemon as allPokemon, getSprite } from "../data/pokemon";
import { useGame } from "../context/GameContext";
import { calculateDamage, chooseMove, effectivenessText } from "../utils/battleEngine";
import { moves } from "../data/moves";
import TypeBadge from "../components/TypeBadge";

function makeFighter(p) {
  return { ...p, currentHp: p.stats.hp };
}
function makeOpponentTeam(playerTeam) {
  const excluded = new Set(playerTeam.map((p) => p.id));
  const pool = allPokemon.filter((p) => !excluded.has(p.id));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(6, pool.length)).map(makeFighter);
}
function hpPercent(p) {
  return Math.max(0, (p.currentHp / p.stats.hp) * 100);
}

export default function BattleArena() {
  const { team, saveBattle } = useGame();
  const [playerTeam, setPlayerTeam] = useState([]);
  const [enemyTeam, setEnemyTeam] = useState([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [enemyIndex, setEnemyIndex] = useState(0);
  const [log, setLog] = useState([]);
  const [status, setStatus] = useState("setup");
  const [difficulty, setDifficulty] = useState("Normal");
  const [busy, setBusy] = useState(false);
  const [animation, setAnimation] = useState({ side: "", phase: "", type: "Normal", move: "", key: 0 });
  const [battleMessage, setBattleMessage] = useState("");

  const player = playerTeam[playerIndex];
  const enemy = enemyTeam[enemyIndex];
  const playerAlive = playerTeam.some((p) => p.currentHp > 0);
  const enemyAlive = enemyTeam.some((p) => p.currentHp > 0);

  function startBattle() {
    if (team.length < 2) return;
    setPlayerTeam(team.map(makeFighter));
    setEnemyTeam(makeOpponentTeam(team));
    setPlayerIndex(0);
    setEnemyIndex(0);
    setLog(["A new battle has begun. Choose your move!"]);
    setStatus("active");
    setBusy(false);
  }

  function finishBattle(result, finalLog, players = playerTeam, enemies = enemyTeam) {
    setStatus(result.toLowerCase());
    setBusy(false);
    saveBattle({
      id: Date.now(),
      date: new Date().toISOString(),
      result,
      playerTeam: players.map((p) => p.name),
      opponentTeam: enemies.map((p) => p.name),
      difficulty
    });
    setLog(finalLog);
  }

  function nextAliveIndex(teamList, fromIndex) {
    for (let i = fromIndex + 1; i < teamList.length; i++) if (teamList[i].currentHp > 0) return i;
    return teamList.findIndex((p) => p.currentHp > 0);
  }

  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

  async function attack(moveName) {
    if (status !== "active" || busy || !player || !enemy) return;
    setBusy(true);
    const nextPlayerTeam = playerTeam.map((p) => ({ ...p }));
    const nextEnemyTeam = enemyTeam.map((p) => ({ ...p }));
    const activePlayer = nextPlayerTeam[playerIndex];
    const activeEnemy = nextEnemyTeam[enemyIndex];
    const moveData = moves[moveName] ?? { power: 40, type: "Normal" };
    const nextAnimation = (side, phase, type, move = moveName) => setAnimation((old) => ({ side, phase, type, move, key: old.key + 1 }));

    setBattleMessage(`${activePlayer.name} used ${moveName}!`);
    nextAnimation("player", "attack", moveData.type, moveName);
    await wait(430);
    const result = calculateDamage(activePlayer, activeEnemy, moveName);
    nextAnimation("enemy", "hit", moveData.type, moveName);
    setBattleMessage(result.damage === 0 ? `${activeEnemy.name} was unaffected!` : `${activeEnemy.name} took ${result.damage} damage!`);
    activeEnemy.currentHp = Math.max(0, activeEnemy.currentHp - result.damage);
    setEnemyTeam(nextEnemyTeam);
    let nextLog = [...log, `${activePlayer.name} used ${moveName}!`, result.damage === 0 ? `${activeEnemy.name} was unaffected.` : `${activeEnemy.name} lost ${result.damage} HP.`, effectivenessText(result.multiplier)].filter(Boolean);
    await wait(520);

    if (activeEnemy.currentHp <= 0) {
      nextLog.push(`${activeEnemy.name} fainted!`);
      setPlayerTeam(nextPlayerTeam);
      setEnemyTeam(nextEnemyTeam);
      const nextEnemy = nextAliveIndex(nextEnemyTeam, enemyIndex);
      if (nextEnemy === -1) {
        setAnimation({ side: "enemy", phase: "faint", type: moveData.type, move: moveName, key: Date.now() });
        await wait(400);
        finishBattle("Victory", [...nextLog, "You won the battle!"], nextPlayerTeam, nextEnemyTeam);
        return;
      }
      setEnemyIndex(nextEnemy);
      nextLog.push(`Opponent sent out ${nextEnemyTeam[nextEnemy].name}!`);
      setLog(nextLog.slice(-9));
      setAnimation({ side: "", phase: "", type: "Normal", move: "", key: Date.now() });
      setBattleMessage(`${nextEnemyTeam[nextEnemy].name} enters the arena!`);
      setBusy(false);
      return;
    }

    // Opponent's turn: animate the lunge, then apply damage and animate the hit.
    const enemyMove = difficulty === "Hard"
      ? activeEnemy.moves.reduce((best, candidate) => {
          const candidateResult = calculateDamage(activeEnemy, activePlayer, candidate);
          const bestResult = calculateDamage(activeEnemy, activePlayer, best);
          return candidateResult.damage > bestResult.damage ? candidate : best;
        }, activeEnemy.moves[0])
      : chooseMove(activeEnemy);
    const enemyMoveData = moves[enemyMove] ?? { power: 40, type: "Normal" };
    setBattleMessage(`${activeEnemy.name} used ${enemyMove}!`);
    nextAnimation("enemy", "attack", enemyMoveData.type, enemyMove);
    await wait(430);
    const enemyResult = calculateDamage(activeEnemy, activePlayer, enemyMove);
    nextAnimation("player", "hit", enemyMoveData.type, enemyMove);
    setBattleMessage(enemyResult.damage === 0 ? `${activePlayer.name} was unaffected!` : `${activePlayer.name} took ${enemyResult.damage} damage!`);
    activePlayer.currentHp = Math.max(0, activePlayer.currentHp - enemyResult.damage);
    nextLog.push(`${activeEnemy.name} used ${enemyMove}!`, `${activePlayer.name} lost ${enemyResult.damage} HP.`, effectivenessText(enemyResult.multiplier));
    setPlayerTeam(nextPlayerTeam);
    setEnemyTeam(nextEnemyTeam);
    await wait(520);

    if (activePlayer.currentHp <= 0) {
      nextLog.push(`${activePlayer.name} fainted!`);
      const nextPlayer = nextAliveIndex(nextPlayerTeam, playerIndex);
      if (nextPlayer === -1) {
        setAnimation({ side: "player", phase: "faint", type: enemyMoveData.type, move: enemyMove, key: Date.now() });
        await wait(400);
        finishBattle("Defeat", [...nextLog, "Your team has been defeated."], nextPlayerTeam, nextEnemyTeam);
        return;
      }
      setPlayerIndex(nextPlayer);
      nextLog.push(`Go, ${nextPlayerTeam[nextPlayer].name}!`);
      setBattleMessage(`${nextPlayerTeam[nextPlayer].name}, you're up!`);
    }
    setLog(nextLog.slice(-9));
    setAnimation({ side: "", phase: "", type: "Normal", move: "", key: Date.now() });
    setBusy(false);
  }

  function resetBattle() {
    setStatus("setup");
    setPlayerTeam([]);
    setEnemyTeam([]);
    setLog([]);
    setBusy(false);
    setAnimation({ side: "", phase: "", type: "Normal", move: "", key: Date.now() });
    setBattleMessage("");
  }

  const movesForPlayer = player?.moves ?? [];
  const statsText = useMemo(() => status === "victory" ? "VICTORY" : status === "defeat" ? "DEFEAT" : "LIVE BATTLE", [status]);

  if (team.length < 2) {
    return <div className="empty-state battle-empty"><div className="empty-state-icon"><Swords size={30} /></div><h2>Your arena awaits.</h2><p>You need at least two Pokémon on your team before you can battle.</p><Link className="button button-primary" to="/team">Build your team <ArrowRight size={17} /></Link></div>;
  }

  if (status === "setup") {
    return <section className="battle-setup">
      <div className="battle-setup-art"><div className="battle-sun" /><img src={getSprite(team[0])} alt={team[0].name} /><Swords className="setup-swords" size={38} /></div>
      <div className="battle-setup-copy"><span className="eyebrow"><Zap size={14} /> THE ARENA IS CALLING</span><h1>Ready your<br /><span>Pokémon.</span></h1><p>Your team is assembled. An opponent team will be generated for this match. Choose a difficulty and enter the arena.</p>
        <label className="difficulty-select">Battle difficulty<select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}><option>Easy</option><option>Normal</option><option>Hard</option></select></label>
        <button className="button button-primary button-large" onClick={startBattle}><Swords size={18} /> Start battle</button>
        <div className="setup-team-preview">{team.map((p) => <img key={p.id} src={getSprite(p)} alt={p.name} title={p.name} />)}<span>{team.length} Pokémon ready</span></div>
      </div>
    </section>;
  }

  return <div className="battle-page">
    <div className="battle-heading"><div><span className="eyebrow">POKÉMON COMBAT SYSTEM</span><h1>Battle <span>Arena</span></h1></div><span className={`battle-status ${status !== "active" ? "finished" : ""}`}><i />{statsText}</span></div>
    {status === "victory" || status === "defeat" ? <div className={`result-banner ${status}`}><Trophy size={26} /><div><h2>{status === "victory" ? "Victory is yours!" : "Better luck next time."}</h2><p>{status === "victory" ? "Your team came out on top." : "Your team fought hard. Train and try again."}</p></div><button className="button button-primary" onClick={resetBattle}><RotateCcw size={16} /> Rematch</button></div> : null}
    <section className={`battlefield ${animation.phase ? `battle-animation-active cinematic-${animation.phase} cinematic-${animation.side} move-${(animation.move || "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}` : ""}`} style={{ "--attack-color": ({ Fire: "#ff704d", Water: "#62b7ff", Electric: "#ffe16a", Grass: "#7de27d", Psychic: "#ff7eb6", Ice: "#9beaff", Dragon: "#a18aff", Ghost: "#b59aff", Fighting: "#ff9277", Poison: "#d38aff", Fairy: "#ffb7e5", Steel: "#b8c8d9", Ground: "#d4ae68", Rock: "#d7bd79", Bug: "#c5df67", Flying: "#b3b9ff", Dark: "#b4a7c7" })[animation.type] || "#c4f35b" }}>
      {animation.phase && <><div key={`flash-${animation.key}`} className={`battle-flash ${animation.phase}`} /><div key={`projectile-${animation.key}`} className={`anime-projectile projectile-${animation.type.toLowerCase()} ${animation.phase} ${animation.side}`} aria-hidden="true" /><div key={`speed-${animation.key}`} className="cinematic-speed-lines" /><div key={`slash-${animation.key}`} className={`cinematic-slash ${animation.phase}`} /><div key={`effect-${animation.key}`} className={`impact-effect ${animation.side === "player" ? "impact-player" : "impact-enemy"} ${animation.phase}`}><span /><span /><span /></div></>}
      {battleMessage && <div key={animation.key} className="battle-callout">{battleMessage}</div>}
      <div className="battle-side player-side">
        <div className="fighter-label"><span className="side-tag">YOUR POKÉMON</span><span className="fighter-index">{playerIndex + 1}/{playerTeam.length}</span></div>
        {player && <><div className="fighter-info"><div><h2>{player.name}</h2><div className="type-row">{player.types.map((t) => <TypeBadge key={t} type={t} />)}</div></div><span className="level-tag">LV. 50</span></div><div className="hp-info"><span>HP</span><strong>{player.currentHp} <small>/ {player.stats.hp}</small></strong></div><div className="hp-track"><div className={`hp-fill ${hpPercent(player) < 25 ? "low" : ""}`} style={{ width: `${hpPercent(player)}%` }} /></div><div className={`fighter-art player-art ${animation.side === "player" ? `anim-${animation.phase}` : ""}`}><div className="fighter-shadow" /><img src={getSprite(player)} alt={player.name} /><span className="damage-number" key={`pd-${animation.key}`}>{animation.side === "player" && animation.phase === "hit" ? "HIT!" : ""}</span></div></>}
      </div>
      <div className="battle-vs">VS</div>
      <div className="battle-side enemy-side">
        <div className="fighter-label"><span className="side-tag">OPPONENT</span><span className="fighter-index">{enemyIndex + 1}/{enemyTeam.length}</span></div>
        {enemy && <><div className="fighter-info"><div><h2>{enemy.name}</h2><div className="type-row">{enemy.types.map((t) => <TypeBadge key={t} type={t} />)}</div></div><span className="level-tag">LV. 50</span></div><div className="hp-info"><span>HP</span><strong>{enemy.currentHp} <small>/ {enemy.stats.hp}</small></strong></div><div className="hp-track"><div className={`hp-fill ${hpPercent(enemy) < 25 ? "low" : ""}`} style={{ width: `${hpPercent(enemy)}%` }} /></div><div className={`fighter-art enemy-art ${animation.side === "enemy" ? `anim-${animation.phase}` : ""}`}><div className="fighter-shadow" /><img src={getSprite(enemy)} alt={enemy.name} /><span className="damage-number" key={`ed-${animation.key}`}>{animation.side === "enemy" && animation.phase === "hit" ? "HIT!" : ""}</span></div></>}
      </div>
    </section>
    <section className="battle-controls">
      <div className="moves-panel-inner"><div className="battle-panel-heading"><div><span className="eyebrow">YOUR TURN</span><h2>Choose a move</h2></div><span className="move-count">{movesForPlayer.length} MOVES</span></div>
        <div className="battle-move-grid">{movesForPlayer.map((move) => { const data = moves[move] ?? { power: 40, type: "Normal" }; return <button key={move} className={`move-button type-border-${data.type.toLowerCase()}`} disabled={status !== "active" || busy || !player || player.currentHp <= 0} onClick={() => attack(move)}><span><TypeBadge type={data.type} /><strong>{move}</strong></span><small>POWER <b>{data.power}</b></small></button>; })}</div>
      </div>
      <div className="battle-log panel"><div className="log-heading"><span className="log-live-dot" /><h3>Battle log</h3><span>LIVE</span></div><div className="log-lines">{log.slice(-6).map((line, i) => <p key={`${line}-${i}`} className={line.includes("super effective") ? "log-highlight" : ""}>{line}</p>)}</div></div>
    </section>
    {status === "active" && <p className="battle-hint"><AlertTriangle size={14} /> Damage includes a small random factor. Type matchups can change the outcome.</p>}
    <div className="battle-bottom-actions"><button className="button button-secondary" onClick={resetBattle}><RotateCcw size={16} /> End battle</button><Link className="text-link" to="/team">Manage team <ArrowRight size={15} /></Link></div>
  </div>;
}
