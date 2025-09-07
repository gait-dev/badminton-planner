import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Select from 'react-select';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  license_number: string;
}

interface AddPurchaseFormProps {
  users: User[];
  onPurchaseAdded: () => void;
}

const PURCHASE_TYPES = [
  { id: 'feather_shuttles', label: 'Volants plumes', defaultAmount: 20 },
  { id: 'hybrid_shuttles', label: 'Volants hybrides', defaultAmount: 15 },
  { id: 'restring', label: 'Recordage', defaultAmount: 15 }
];

export default function AddPurchaseForm({ users, onPurchaseAdded }: AddPurchaseFormProps) {
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [type, setType] = useState<string>(PURCHASE_TYPES[0].id);
  const [quantity, setQuantity] = useState<number>(1);
  const [amount, setAmount] = useState<number>(PURCHASE_TYPES[0].defaultAmount);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const { getToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/purchases/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: parseInt(selectedUser),
          type,
          quantity,
          amount: amount * quantity
        })
      });

      if (response.ok) {
        setMessage('Achat créé avec succès');
        setSelectedUser("");
        setType(PURCHASE_TYPES[0].id);
        setQuantity(1);
        setAmount(PURCHASE_TYPES[0].defaultAmount);
        onPurchaseAdded();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error('Erreur lors de l\'ajout:', err);
      setError('Erreur lors de la création de l\'achat');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleTypeChange = (newType: string) => {
    setType(newType);
    const selectedType = PURCHASE_TYPES.find(t => t.id === newType);
    if (selectedType) {
      setAmount(selectedType.defaultAmount);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      {message && <div className="p-4 bg-green-100 text-green-700 rounded-md">{message}</div>}
      {error && <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}

      <div>
        <label htmlFor="user" className="block text-sm font-medium text-gray-700">Membre</label>
        <div className="mt-1">
          <Select
            id="user"
            value={users.find(u => u.id.toString() === selectedUser)}
            onChange={(option) => setSelectedUser(option?.id.toString() || "")}
            options={users}
            getOptionLabel={(user) => `${user.first_name} ${user.last_name} - ${user.license_number}`}
            getOptionValue={(user) => user.id.toString()}
            placeholder="Rechercher un membre..."
            noOptionsMessage={() => "Aucun membre trouvé"}
            className="react-select"
            classNamePrefix="react-select"
            required
            isClearable
          />
        </div>
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Type d'achat
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => handleTypeChange(e.target.value)}
          required
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          {PURCHASE_TYPES.map((type) => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
          Quantité
        </label>
        <input
          type="number"
          id="quantity"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          required
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        />
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Prix unitaire (€)
        </label>
        <input
          type="number"
          id="amount"
          min="0"
          step="0.5"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value))}
          required
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        />
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Ajouter l'achat
        </button>
      </div>
    </form>
  );
}
