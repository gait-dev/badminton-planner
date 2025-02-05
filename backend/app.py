from flask import Flask, request, jsonify
from flask_cors import CORS
from typing import List, Dict
import json

app = Flask(__name__)
CORS(app)

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
