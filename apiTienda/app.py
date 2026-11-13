
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import *


# Se crea el objeto de tipo Flask
api = Flask(__name__)


# Se crea un objeto cors
cors = CORS(api)


# Se crea la cadena de conexión a mysql
cadenaConexion = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"

api.config['SQLALCHEMY_DATABASE_URI'] = cadenaConexion


# Se crea un objeto SQLAlchemy asociado a Flask
db = SQLAlchemy(api)


# Importamos todo lo que tenga el archivo routes.py
from routes.routes import *


if __name__ == '__main__':

    with api.app_context():

        # Se crean las tablas del modelo si no existen
        db.create_all()

    # Se ejecuta la aplicación Flask
    api.run(port=5000, debug=True)
