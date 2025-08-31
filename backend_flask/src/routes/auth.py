from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta
from ..models import db, User

auth = Blueprint('auth', __name__)

@auth.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data.get('email') and not data.get('license_number'):
        return jsonify({'error': 'Email ou numéro de licence requis'}), 400
    
    if data.get('email') and User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email déjà utilisé'}), 400
        
    if data.get('license_number') and User.query.filter_by(license_number=data['license_number']).first():
        return jsonify({'error': 'Numéro de licence déjà utilisé'}), 400
        
    user = User(
        email=data.get('email'),
        license_number=data.get('license_number'),
        first_name=data.get('first_name', ''),
        last_name=data.get('last_name', '')
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'Utilisateur créé avec succès'}), 201

@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    identifier = data.get('identifier')
    
    if '@' in identifier:
        user = User.query.filter_by(email=identifier).first()
    else:
        user = User.query.filter_by(license_number=identifier).first()
    
    if user and user.check_password(data['password']):
        access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(days=1)
        )
        return jsonify({
            'token': access_token,
            'user': {
                'id': user.id,
                'email': user.email,
                'license_number': user.license_number,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role
            }
        })
    
    return jsonify({'error': 'Identifiant ou mot de passe incorrect'}), 401

@auth.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    return jsonify({
        'id': user.id,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'role': user.role
    })
