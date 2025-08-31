import os
import sys
import django
from pathlib import Path
from datetime import datetime, timedelta
from environ import Env

# Configurer Django
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

# Charger les variables d'environnement
env = Env()
env_file = BASE_DIR / '.env'
if env_file.exists():
    env.read_env(str(env_file))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'badminton_planner.settings')
django.setup()

from api.models import User, Purchase
from django.utils import timezone

def create_test_purchases():
    # Trouver l'utilisateur Sylvain DRUGUET
    user = User.objects.filter(first_name='Sylvain', last_name='DRUGUET').first()
    if not user:
        print("Utilisateur Sylvain DRUGUET non trouvé")
        sys.exit(1)

    # Créer des achats variés
    purchases = [
        Purchase(
            user=user,
            type='feather_shuttles',
            quantity=2,
            amount=15.0,
            paid=True,
            paid_at=timezone.now() - timedelta(days=30)
        ),
        Purchase(
            user=user,
            type='hybrid_shuttles',
            quantity=1,
            amount=8.0,
            paid=True,
            paid_at=timezone.now() - timedelta(days=15)
        ),
        Purchase(
            user=user,
            type='plastic_shuttles',
            quantity=3,
            amount=12.0,
            paid=False
        ),
        Purchase(
            user=user,
            type='tournament_registration',
            quantity=1,
            amount=20.0,
            paid=False
        )
    ]

    for p in purchases:
        p.save()
    
    print(f"Achats de test créés avec succès pour {user.first_name} {user.last_name}")

if __name__ == '__main__':
    create_test_purchases()
