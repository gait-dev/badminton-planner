import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { UserIcon } from '@heroicons/react/24/outline';

export default function AuthMenu() {
  const { user, logout } = useAuth();

  return (
    <div className="absolute top-4 right-4">
      {user ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {user.first_name || user.email || user.license_number}
          </span>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Déconnexion
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-1.5 rounded-md hover:bg-gray-50"
          >
            <UserIcon className="w-4 h-4" />
            <span>Connexion</span>
          </Link>
          <Link
            to="/register"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-1.5 rounded-md hover:bg-gray-50"
          >
            Inscription
          </Link>
        </div>
      )}
    </div>
  );
}
