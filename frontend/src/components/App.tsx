import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import Home from '../pages/Home'
import BadmintonPlanner from '../BadmintonPlanner'

function Navigation() {
  const location = useLocation();
  
  // Ne pas afficher la navigation sur la page d'accueil
  if (location.pathname === '/') return null;
  
  return (
    <nav className="bg-aptbc-black text-white p-4">
      <ul className="flex space-x-4">
        <li>
          <Link to="/" className="hover:text-aptbc-green transition-colors">Accueil</Link>
        </li>
        <li>
          <Link to="/tools/planner" className="hover:text-aptbc-green transition-colors">Planificateur</Link>
        </li>
      </ul>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tools/planner" element={<BadmintonPlanner />} />
      </Routes>
    </BrowserRouter>
  )
}
