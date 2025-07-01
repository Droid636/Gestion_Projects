from flask import Flask, send_from_directory
from flask_cors import CORS
from routes import api
import os

FRONTEND_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../frontend'))

app = Flask(__name__, static_folder=FRONTEND_PATH)
CORS(app)

app.register_blueprint(api, url_prefix='/api')

@app.route('/')
def root():
    return send_from_directory(FRONTEND_PATH, 'login.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(FRONTEND_PATH, path)

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
