import csv
import os
import random
import string
from dotenv import load_dotenv
from app import app, db
from src.models import User

load_dotenv()

def generate_password(length=12):
    """Génère un mot de passe aléatoire ou fixe selon l'environnement."""
    if os.getenv('FLASK_ENV') == 'development':
        return 'test123'
    characters = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(random.choice(characters) for _ in range(length))

def validate_row(row):
    """Valide les données d'une ligne CSV."""
    errors = []
    
    # Vérifier si l'adhérent est validé
    if row['Adhérent validé'].strip().lower() != 'oui':
        return ["Adhérent non validé"]
    
    # Vérifier les champs requis
    if not row['Licence'].strip():
        errors.append("Numéro de licence manquant")
    elif not row['Licence'].strip().isdigit():
        errors.append("Le numéro de licence doit être un nombre")
    
    if not row['Nom'].strip():
        errors.append("Nom manquant")
    
    if not row['Prénom'].strip():
        errors.append("Prénom manquant")
    
    if not row['Email'].strip():
        errors.append("Email manquant")
    elif '@' not in row['Email']:
        errors.append("Format d'email invalide")
    
    return errors

def ensure_admin_exists():
    """S'assure qu'un utilisateur admin existe"""
    with app.app_context():
        if not User.query.filter_by(role='admin').first():
            admin = User(
                email='admin@aptbc.org',
                first_name='Admin',
                last_name='APTBC',
                role='admin'
            )
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
            print("\nUtilisateur admin créé :")
            print("Email: admin@aptbc.org")
            print("Mot de passe: admin123")

def import_users(csv_filename):
    csv_file = os.path.join(os.path.dirname(__file__), 'data', csv_filename)
    """Importe les utilisateurs depuis un fichier CSV."""
    print("Début de l'import des utilisateurs...")
    ensure_admin_exists()
    results = {
        'success': [],
        'errors': [],
        'skipped': []
    }
    
    with app.app_context():
        with open(csv_file, 'r', encoding='utf-8-sig') as f:  # utf-8-sig pour gérer le BOM
            reader = csv.DictReader(f, delimiter=';')
            
            for row in reader:
                errors = validate_row(row)
                if errors:
                    results['errors'].append({
                        'line': reader.line_num,
                        'data': row,
                        'errors': errors
                    })
                    continue
                
                # Vérifier si l'utilisateur existe déjà
                existing_user = User.query.filter(
                    (User.license_number == row['Licence']) |
                    (User.email == row['Email'])
                ).first()
                
                # Créer ou mettre à jour l'utilisateur
                password = None
                if existing_user:
                    # Mise à jour des informations
                    existing_user.license_number = row['Licence']
                    existing_user.email = row['Email']
                    existing_user.first_name = row['Prénom']
                    existing_user.last_name = row['Nom']
                    password = generate_password()
                    existing_user.set_password(password)
                    user = existing_user
                else:
                    # Créer le nouvel utilisateur
                    password = generate_password()
                    user = User(
                        license_number=row['Licence'],
                        email=row['Email'],
                        first_name=row['Prénom'],
                        last_name=row['Nom'],
                        role='user'
                    )
                    user.set_password(password)
                
                try:
                    if not existing_user:
                        db.session.add(user)
                    db.session.commit()
                    
                    if password:  # Nouvel utilisateur
                        results['success'].append({
                            'first_name': row['Prénom'],
                            'last_name': row['Nom'],
                            'email': row['Email'],
                            'password': password,
                            'type': 'new'
                        })
                    else:  # Utilisateur mis à jour
                        results['success'].append({
                            'first_name': row['Prénom'],
                            'last_name': row['Nom'],
                            'email': row['Email'],
                            'type': 'updated'
                        })
                except Exception as e:
                    db.session.rollback()
                    results['errors'].append({
                        'line': reader.line_num,
                        'data': row,
                        'errors': [str(e)]
                    })
    
    # Afficher le résumé
    print("\nRésumé de l'import :")
    print(f"Utilisateurs créés : {len(results['success'])}")
    print(f"Erreurs : {len(results['errors'])}")
    print(f"Ignorés : {len(results['skipped'])}")
    
    # Afficher le résultat des opérations
    if results['success']:
        print("\nUtilisateurs traités :")
        for result in results['success']:
            if result['type'] == 'new':
                print(f"[NOUVEAU] {result['first_name']} {result['last_name']} ({result['email']}) : {result['password']}")
            else:
                print(f"[MIS À JOUR] {result['first_name']} {result['last_name']} ({result['email']}) : {result['password']}")
    
    # Afficher les erreurs
    if results['errors']:
        print("\nErreurs :")
        for error in results['errors']:
            print(f"Ligne {error['line']} : {', '.join(error['errors'])}")
    
    return results

if __name__ == '__main__':
    import sys
    import os
    
    if len(sys.argv) != 2:
        print("Usage: python import_users.py <fichier_csv>")
        sys.exit(1)
    
    # Obtenir le chemin absolu du fichier CSV
    csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), sys.argv[1])
    if not os.path.exists(csv_path):
        print(f"Erreur : Le fichier {csv_path} n'existe pas")
        sys.exit(1)
        
    import_users(csv_path)
