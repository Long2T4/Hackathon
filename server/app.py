from flask import Flask
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from routes.chat import chat_bp
from routes.clinics import clinics_bp
import os
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["30 per minute"],
    storage_uri="memory://",
)

app.config['LIMITER'] = limiter
app.register_blueprint(chat_bp, url_prefix='/api')
app.register_blueprint(clinics_bp, url_prefix='/api')

@app.route('/api/health')
def health():
    return {'status': 'ok', 'service': 'MiSalud API'}

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=os.environ.get('FLASK_DEBUG', 'false').lower() == 'true', port=port)
