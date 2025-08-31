import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface Purchase {
  id: number;
  type: string;
  type_display: string;
  quantity: number;
  amount: number;
  paid: boolean;
  created_at: string;
  paid_at: string | null;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export default function PurchaseList() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const token = await getToken();
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/purchases/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setPurchases(data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des achats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [getToken]);

  const markAsPaid = async (id: number) => {
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/purchases/${id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paid: true })
      });
      
      if (response.ok) {
        setPurchases(purchases.map(p => 
          p.id === id ? { ...p, paid: true, paid_at: new Date().toISOString() } : p
        ));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membre</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {purchases.map((purchase) => (
            <tr key={purchase.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                {purchase.user.first_name} {purchase.user.last_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{purchase.type_display}</td>
              <td className="px-6 py-4 whitespace-nowrap">{purchase.quantity}</td>
              <td className="px-6 py-4 whitespace-nowrap">{purchase.amount}€</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {new Date(purchase.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  purchase.paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {purchase.paid ? 'Payé' : 'Non payé'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {!purchase.paid && (
                  <button
                    onClick={() => markAsPaid(purchase.id)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Marquer comme payé
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
