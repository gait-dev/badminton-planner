import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Purchase {
  id: number;
  type: string;
  type_display: string;
  quantity: number;
  amount: number;
  created_at: string;
  paid_at?: string;
  payment_url?: string;
  paid: boolean;
}

export default function Profile() {
  const { user, getToken } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [allPurchases, setAllPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!user) return;
      try {
        const token = await getToken();
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/purchases/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('Response:', response.status, response.statusText);
        if (response.ok) {
          const data = await response.json();
          setAllPurchases(data);
          setPurchases(data.filter((p: Purchase) => !p.paid));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des achats:', error);
        if (error instanceof Error) {
          console.error('Error details:', error.message, error.stack);
        }
      }
    };

    fetchPurchases();
  }, [user, getToken]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Veuillez vous connecter pour voir votre profil.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => window.history.back()}
          className="mb-4 flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour
        </button>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Mon Profil</h2>
              <p className="mt-1 text-sm text-gray-500">Informations personnelles</p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Prénom</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.first_name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nom</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.last_name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Numéro de licence</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.license_number}</dd>
                </div>
              </dl>
            </div>

            {purchases.length > 0 && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900">Achats impayés</h3>
                <div className="mt-4 space-y-4">
                  {purchases.map((purchase) => (
                    <div key={purchase.id} className="bg-red-50 p-4 rounded-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-medium text-red-800">
                            {purchase.type_display} ({purchase.quantity})
                          </h4>
                          <p className="mt-1 text-sm text-red-700">
                            Montant : {purchase.amount}€
                          </p>
                          <p className="mt-1 text-xs text-red-600">
                            Date : {new Date(purchase.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {purchase.payment_url && (
                          <a
                            href={purchase.payment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-red-800 hover:text-red-900 bg-red-100 px-3 py-1 rounded-md"
                          >
                            Payer
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900">Historique des achats</h3>
              <div className="mt-4 space-y-4">
                {allPurchases.map((purchase) => (
                  <div key={purchase.id} className={`${purchase.paid ? 'bg-green-50' : 'bg-red-50'} p-4 rounded-md`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className={`text-sm font-medium ${purchase.paid ? 'text-green-800' : 'text-red-800'}`}>
                          {purchase.type_display} ({purchase.quantity})
                        </h4>
                        <p className={`mt-1 text-sm ${purchase.paid ? 'text-green-700' : 'text-red-700'}`}>
                          Montant : {purchase.amount}€
                        </p>
                        <p className={`mt-1 text-xs ${purchase.paid ? 'text-green-600' : 'text-red-600'}`}>
                          Date : {new Date(purchase.created_at).toLocaleDateString()}
                        </p>
                        {purchase.paid && purchase.paid_at && (
                          <p className="mt-1 text-xs text-green-600">
                            Payé le : {new Date(purchase.paid_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {!purchase.paid && purchase.payment_url && (
                        <a
                          href={purchase.payment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-red-800 hover:text-red-900 bg-red-100 px-3 py-1 rounded-md"
                        >
                          Payer
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
