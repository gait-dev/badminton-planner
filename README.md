# Planificateur de Rotations Badminton

Application web pour optimiser les rotations d'équipes lors des matchs de badminton en interclub.

## Fonctionnalités

- Gestion des équipes et des joueurs
- Configuration des matchs (2 simples hommes, 2 simples dames, 1 double hommes, 1 double dames, 2 mixtes)
- Calcul automatique des meilleures rotations possibles
- Respect des contraintes :
  - 20 minutes de pause minimum entre les matchs d'un même joueur
  - Impossibilité de jouer plusieurs simples pour un même joueur

## Structure du Projet

- `frontend/` : Application React/TypeScript
- `backend/` : API Python avec algorithme d'optimisation

## Installation

### Frontend
```bash
cd frontend
npm install
npm start
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```
