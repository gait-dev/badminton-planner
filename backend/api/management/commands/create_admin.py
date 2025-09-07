from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Crée un utilisateur administrateur'

    def handle(self, *args, **kwargs):
        if not User.objects.filter(username='admin').exists():
            admin = User.objects.create_superuser(
                username='admin',
                email='admin@aptbc.fr',
                password='adminaptbc2024',
                first_name='Admin',
                last_name='APTBC',
                role='admin'
            )
            admin.license_number = 'ADMIN2024'
            admin.save()
            self.stdout.write(self.style.SUCCESS('Utilisateur admin créé avec succès'))
