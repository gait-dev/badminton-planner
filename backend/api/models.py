from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class User(AbstractUser):
    license_number = models.CharField(max_length=50, unique=True)
    role = models.CharField(max_length=20, default='member')
    age = models.IntegerField(null=True)
    reductions = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Purchase(models.Model):
    PURCHASE_TYPES = [
        ('feather_shuttles', 'Volants plumes'),
        ('hybrid_shuttles', 'Volants hybrides'),
        ('plastic_shuttles', 'Volants plastiques'),
        ('tournament_registration', 'Inscription tournoi'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='purchases')
    type = models.CharField(max_length=50, choices=PURCHASE_TYPES)
    quantity = models.IntegerField(default=1)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid = models.BooleanField(default=False)
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.type} - {self.user.first_name} {self.user.last_name}"

    def to_dict(self):
        return {
            'id': self.id,
            'type': self.type,
            'quantity': self.quantity,
            'amount': float(self.amount),
            'paid': self.paid,
            'paid_at': self.paid_at.isoformat() if self.paid_at else None,
            'created_at': self.created_at.isoformat(),
        }
# Create your models here.
