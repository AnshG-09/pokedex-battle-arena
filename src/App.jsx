import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { Swords, BookOpen, Users, History, Zap } from "lucide-react";
import Pokedex from "./pages/Pokedex";
import PokemonDetails from "./pages/PokemonDetails";
import TeamBuilder from "./pages/TeamBuilder";
import BattleArena from "./pages/BattleArena";
import BattleHistory from "./pages/BattleHistory";

const navItems = [
  { to: "/", label: "Pokédex", icon: BookOpen, end: true },
  { to: "/team", label: "My Team", icon: Users },
  { to: "/battle", label: "Battle Arena", icon: Swords },
  { to: "/history", label: "Battle History", icon: History },
];

export default function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink to="/" className="brand">
          <span className="brand-mark"><Zap size={21} fill="currentColor" /></span>
          <span>POKÉDEX <b>ARENA</b></span>
        </NavLink>
        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              <Icon size={17} /> <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Pokedex />} />
          <Route path="/pokemon/:id" element={<PokemonDetails />} />
          <Route path="/team" element={<TeamBuilder />} />
          <Route path="/battle" element={<BattleArena />} />
          <Route path="/history" element={<BattleHistory />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="footer">
        <span>Pokédex Arena</span><span>Fan-made project · Pokémon data is for demo purposes</span>
      </footer>
    </div>
  );
}
