import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import PurchaseList from '../../components/admin/PurchaseList';
import AddPurchaseForm from '../../components/admin/AddPurchaseForm';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export default function AdminPurchases() {
  const [users, setUsers] = useState<User[]>([]);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await getToken();
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      }
    };

    fetchUsers();
  }, [getToken]);

  const handlePurchaseAdded = () => {
    // Force le rechargement de la liste des achats
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Gestion des achats</h1>
            <p className="mt-1 text-sm text-gray-500">
              Ajoutez et gérez les achats des membres du club
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Liste des achats</h2>
                  <PurchaseList />
                </div>
              </div>
            </div>

            <div>
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Ajouter un achat</h2>
                  <AddPurchaseForm users={users} onPurchaseAdded={handlePurchaseAdded} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
