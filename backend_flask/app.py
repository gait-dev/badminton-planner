from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta
from src.models import db
from src.routes.auth import auth
from src.routes.purchases import bp as purchases_bp
import os
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

app = Flask(__name__)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///dev.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)

# Extensions
CORS(app, resources={r"/api/*": {
    "origins": ["http://localhost:5173", "http://192.168.1.30:5173", "https://aptbc.org", "https://www.aptbc.org", "https://api.aptbc.org"],
    "supports_credentials": True,
    "allow_headers": ["Content-Type", "Authorization"],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}})
db.init_app(app)
jwt = JWTManager(app)

# Blueprints
app.register_blueprint(auth, url_prefix='/api/auth')
app.register_blueprint(purchases_bp)

@app.route('/api/teams', methods=['GET', 'POST'])
def teams():
    if request.method == 'POST':
        data = request.json
        # TODO: Sauvegarder l'équipe
        return jsonify({"message": "Équipe créée"}), 201
    else:
        # TODO: Retourner la liste des équipes
        return jsonify([])

@app.route('/api/calculate-rotations', methods=['POST'])
def calculate_rotations():
    data = request.json
    # TODO: Implémenter l'algorithme de calcul des rotations
    return jsonify({
        "rotations": []
    })

if __name__ == '__main__':
    app.run(debug=True)
