import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import Home from '../pages/Home'
import BadmintonPlanner from '../BadmintonPlanner'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import Login from './auth/Login'
import Register from './auth/Register'
import Profile from '../pages/Profile'
import AdminPurchases from '../pages/admin/Purchases'

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Ne pas afficher la navigation sur la page d'accueil, le profil et le login
  if (location.pathname === '/' || location.pathname === '/profile' || location.pathname === '/login') return null;
  
  return (
    <nav className="bg-aptbc-black text-white p-4">
      <ul className="flex space-x-4 justify-between">
        <div className="flex space-x-4">
          <li>
            <Link to="/" className="hover:text-aptbc-green transition-colors">Accueil</Link>
          </li>
          <li>
            <Link to="/tools/planner" className="hover:text-aptbc-green transition-colors">Planificateur</Link>
          </li>
          {user?.role === 'admin' && (
            <li>
              <Link to="/admin/purchases" className="hover:text-aptbc-green transition-colors">Gestion des achats</Link>
            </li>
          )}
        </div>
        {user && (
          <div className="flex space-x-4 items-center">
            <li>
              <Link to="/profile" className="hover:text-aptbc-green transition-colors">Mon Profil</Link>
            </li>
            <li>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="hover:text-aptbc-green transition-colors"
              >
                Déconnexion
              </button>
            </li>
          </div>
        )}
      </ul>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tools/planner" element={<BadmintonPlanner />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin/purchases" element={<AdminPurchases />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
