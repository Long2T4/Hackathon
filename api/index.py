import sys
import os

# Ensure the api directory itself is on the path so routes/services import correctly
sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask
from flask_cors import CORS
from routes.chat import chat_bp
from routes.clinics import clinics_bp

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

app.register_blueprint(chat_bp, url_prefix='/api')
app.register_blueprint(clinics_bp, url_prefix='/api')

@app.route('/api/health')
def health():
    return {'status': 'ok', 'service': 'MiSalud API'}
