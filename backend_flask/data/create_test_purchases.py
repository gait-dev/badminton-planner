import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from src.models import db
from src.models.user import User
from src.models.purchase import Purchase
from datetime import datetime, timedelta

with app.app_context():
    # Trouver l'utilisateur Sylvain DRUGUET
    user = User.query.filter_by(first_name='Sylvain', last_name='DRUGUET').first()
    if not user:
        print("Utilisateur Sylvain DRUGUET non trouvé")
        sys.exit(1)

    # Créer des achats variés
    purchases = [
        Purchase(
            user_id=user.id,
            type='feather_shuttles',
            quantity=2,
            amount=15.0,
            paid=True,
            paid_at=datetime.utcnow() - timedelta(days=30)
        ),
        Purchase(
            user_id=user.id,
            type='hybrid_shuttles',
            quantity=1,
            amount=8.0,
            paid=True,
            paid_at=datetime.utcnow() - timedelta(days=15)
        ),
        Purchase(
            user_id=user.id,
            type='plastic_shuttles',
            quantity=3,
            amount=12.0,
            paid=False
        ),
        Purchase(
            user_id=user.id,
            type='tournament_registration',
            quantity=1,
            amount=20.0,
            paid=False
        )
    ]

    for p in purchases:
        db.session.add(p)
    
    try:
        db.session.commit()
        print(f"Achats de test créés avec succès pour {user.first_name} {user.last_name}")
    except Exception as e:
        print(f"Erreur lors de la création des achats : {e}")
        db.session.rollback()
