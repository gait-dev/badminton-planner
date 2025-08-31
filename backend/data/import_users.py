import os
import sys
import csv
import django
from pathlib import Path

# Configurer Django
sys.path.append(str(Path(__file__).resolve().parent.parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'badminton_planner.settings')
django.setup()

from api.models import User
from django.contrib.auth.hashers import make_password

def import_users(csv_file):
    """Importe les utilisateurs depuis un fichier CSV"""
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f, delimiter=';')
        
        # Créer l'admin s'il n'existe pas
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@aptbc.org',
                password='admin123',
                first_name='Admin',
                last_name='APTBC',
                role='admin'
            )
            print("Admin créé avec succès")

        # Importer les utilisateurs
        for row in reader:
            if row['Adhérent validé'].lower() != 'oui':
                continue

            # Générer le nom d'utilisateur
            username = f"{row['Prénom'].lower()}.{row['Nom'].lower()}"
            
            # Créer l'utilisateur s'il n'existe pas
            if not User.objects.filter(license_number=row['Licence']).exists():
                password = 'test123' if os.environ.get('DJANGO_DEBUG') == 'True' else None
                if not password:
                    # En prod, générer un mot de passe aléatoire
                    import random
                    import string
                    chars = string.ascii_letters + string.digits
                    password = ''.join(random.choice(chars) for _ in range(10))
                
                User.objects.create_user(
                    username=username,
                    email=row['Email'],
                    password=password,  # create_user gère automatiquement le hashage
                    first_name=row['Prénom'],
                    last_name=row['Nom'],
                    license_number=row['Licence'],
                    age=int(row['Age fin de saison']) if row['Age fin de saison'] else None,
                    reductions=row['Réductions'],
                    role='member'
                )
                print(f"Utilisateur créé : {username} (mot de passe: {password})")

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python import_users.py <csv_file>")
        sys.exit(1)
    
    csv_file = sys.argv[1]
    if not os.path.exists(csv_file):
        print(f"Fichier non trouvé : {csv_file}")
        sys.exit(1)
    
    import_users(csv_file)
    print("Import terminé")
