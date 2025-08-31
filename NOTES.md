# Notes Importantes

## Dépendances

```bash
pip install python-dotenv  # Requis pour charger les variables d'environnement
```

## Configuration

### Backend (.env)
```bash
DATABASE_URL=sqlite:///instance/dev.db
FLASK_ENV=development  # Pour avoir les mots de passe test123
JWT_SECRET_KEY=dev-secret-key
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000
```

## Scripts Utiles

- Démarrer/redémarrer les serveurs : `./manage_servers.sh restart`
- Arrêter les serveurs : `./manage_servers.sh stop`
- Populer la base de données : `cd backend && python import_users.py data/exemple_licencies.csv`

## Mots de Passe

- **Mode Development** (FLASK_ENV=development) :
  - Admin : admin@aptbc.org / admin123
  - Tous les autres utilisateurs : email / test123

- **Mode Production** :
  - Admin : admin@aptbc.org / admin123
  - Autres utilisateurs : mots de passe générés et affichés lors de l'import

## Structure des Fichiers

```
/backend/
  /data/             # CSV des licenciés
  /instance/         # Base de données SQLite
  /src/
    /models/         # Modèles SQLAlchemy
    /routes/         # Routes API
  .env              # Config backend
  import_users.py    # Script d'import

/frontend/
  /src/
    /components/     # Composants React
  .env              # Config frontend
```

## Points Importants

1. Ne jamais modifier `exemple_licencies.csv` une fois placé dans `/backend/data/`
2. La base de données est créée automatiquement dans `/backend/instance/`
3. Les fichiers `.env` sont gitignorés mais requis pour le fonctionnement
4. Format du CSV des licenciés :
   - Séparateur : ';'
   - Colonnes : Adhérent validé, Nom, Prénom, Licence, Age fin de saison, Email, Réductions
   - Seuls les adhérents validés (Oui) sont importés
