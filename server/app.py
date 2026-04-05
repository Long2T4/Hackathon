from flask import Flask
from flask_cors import CORS
import os
import sys

# Fix imports for Vercel serverless
sys.path.insert(0, os.path.dirname(__file__))

from routes.chat import chat_bp
from routes.clinics import clinics_bp

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

app.register_blueprint(chat_bp, url_prefix='/api')
app.register_blueprint(clinics_bp, url_prefix='/api')

@app.route('/api/health')
def health():
    return {'status': 'ok', 'service': 'MiSalud API'}

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=os.environ.get('FLASK_DEBUG', 'false').lower() == 'true', port=port)
