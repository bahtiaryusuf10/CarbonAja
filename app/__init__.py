from flask import Flask
from flask_restx import Api
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

api = Api(app, version='1.0', title='My API', description='An example API')

if __name__ == '__main__':
    app.run(debug=True)

from app.Routers.routes import careCarb
# Add the namespace to the API
api.add_namespace(careCarb)