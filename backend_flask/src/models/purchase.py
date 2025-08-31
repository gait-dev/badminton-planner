from src.models import db
from datetime import datetime

class PurchaseType:
    FEATHER_SHUTTLES = 'feather_shuttles'
    HYBRID_SHUTTLES = 'hybrid_shuttles'
    RESTRING = 'restring'

    CHOICES = [
        (FEATHER_SHUTTLES, 'Volants plumes'),
        (HYBRID_SHUTTLES, 'Volants hybrides'),
        (RESTRING, 'Recordage')
    ]

class Purchase(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    type = db.Column(db.String(20), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    amount = db.Column(db.Float, nullable=False)
    paid = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    paid_at = db.Column(db.DateTime)
    payment_url = db.Column(db.String(255))
    user = db.relationship('User', back_populates='purchases')

    def to_dict(self):
        return {
            'id': self.id,
            'type': self.type,
            'type_display': dict(PurchaseType.CHOICES).get(self.type),
            'quantity': self.quantity,
            'amount': self.amount,
            'paid': self.paid,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
            'paid_at': self.paid_at.strftime('%Y-%m-%d %H:%M:%S') if self.paid_at else None,
            'payment_url': self.payment_url
        }
