from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models import db
from src.models.purchase import Purchase, PurchaseType
from src.models.user import User
from datetime import datetime
import logging

bp = Blueprint('purchases', __name__)

@bp.route('/api/purchases', methods=['GET'])
@jwt_required()
def list_purchases():
    """Liste les achats de l'utilisateur connecté"""
    current_user_id = get_jwt_identity()
    logging.info(f"Token utilisateur: {current_user_id}")
    
    # Vérifier que l'utilisateur existe
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"msg": "Utilisateur non trouvé"}), 422
    
    purchases = Purchase.query.filter_by(user_id=user.id).all()
    logging.info(f"Achats trouvés: {len(purchases)} pour {user.first_name} {user.last_name}")
    return jsonify([purchase.to_dict() for purchase in purchases])

@bp.route('/api/admin/purchases', methods=['GET'])
@jwt_required()
def list_all_purchases():
    """Liste tous les achats (admin seulement)"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user or current_user.role != 'admin':
        return jsonify({'error': 'Non autorisé'}), 403
    
    purchases = Purchase.query.all()
    return jsonify([{
        **purchase.to_dict(),
        'user': {
            'id': purchase.user.id,
            'email': purchase.user.email,
            'first_name': purchase.user.first_name,
            'last_name': purchase.user.last_name
        }
    } for purchase in purchases])

@bp.route('/api/admin/purchases', methods=['POST'])
@jwt_required()
def create_purchase():
    """Crée un nouvel achat (admin seulement)"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user or current_user.role != 'admin':
        return jsonify({'error': 'Non autorisé'}), 403

    data = request.get_json()
    
    # Validation
    if not all(k in data for k in ['user_id', 'type', 'amount']):
        return jsonify({'error': 'Données manquantes'}), 400
    
    if data['type'] not in dict(PurchaseType.CHOICES):
        return jsonify({'error': 'Type invalide'}), 400

    purchase = Purchase(
        user_id=data['user_id'],
        type=data['type'],
        quantity=data.get('quantity', 1),
        amount=data['amount']
    )
    
    db.session.add(purchase)
    db.session.commit()
    
    return jsonify(purchase.to_dict()), 201

@bp.route('/api/admin/purchases/<int:id>', methods=['PUT'])
@jwt_required()
def update_purchase(id):
    """Met à jour un achat (admin seulement)"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user or current_user.role != 'admin':
        return jsonify({'error': 'Non autorisé'}), 403

    purchase = Purchase.query.get_or_404(id)
    data = request.get_json()
    
    if 'paid' in data:
        purchase.paid = data['paid']
        if data['paid']:
            purchase.paid_at = datetime.utcnow()
    
    if 'payment_url' in data:
        purchase.payment_url = data['payment_url']
    
    db.session.commit()
    return jsonify(purchase.to_dict())
