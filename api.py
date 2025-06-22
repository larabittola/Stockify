# Archivo: api.py
import sqlite3
import os
# ¡IMPORTANTE! Añadimos render_template
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

app = Flask(__name__)
# Permitimos CORS para que el front-end y back-end se comuniquen
CORS(app) 

# --- La ruta raíz ahora hace esto ---
@app.route('/')
def index():
    # Le decimos a Flask que busque y devuelva el archivo 'index.html' 
    # desde la carpeta 'templates'.
    return render_template('index.html')

# --- Funciones de la Base de Datos ---
def conectar_db():
    """Conecta a la base de datos SQLite y la configura para devolver diccionarios."""
    ruta_carpeta = os.path.dirname(os.path.abspath(__file__))
    ruta_db = os.path.join(ruta_carpeta, "inventario.db")
    conn = sqlite3.connect(ruta_db)
    conn.row_factory = sqlite3.Row 
    return conn

def crear_tabla():
    """Crea la tabla de productos si no existe."""
    conexion = conectar_db()
    cursor = conexion.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            cantidad INTEGER NOT NULL,
            precio REAL NOT NULL
        )
    """)
    conexion.commit()
    conexion.close()

# --- Rutas de la API ("Endpoints") ---

@app.route('/api/productos', methods=['GET'])
def obtener_productos():
    """Devuelve una lista de todos los productos en formato JSON."""
    conexion = conectar_db()
    cursor = conexion.cursor()
    cursor.execute("SELECT * FROM productos ORDER BY id DESC")
    productos_lista = [dict(row) for row in cursor.fetchall()]
    conexion.close()
    return jsonify(productos_lista)

@app.route('/api/productos', methods=['POST'])
def registrar_nuevo_producto():
    """Registra un nuevo producto en la base de datos."""
    datos = request.json
    nombre = datos.get('nombre')
    cantidad = datos.get('cantidad')
    precio = datos.get('precio')
    
    # Validación simple de datos
    if not all([nombre, isinstance(cantidad, int), isinstance(precio, (int, float))]):
        return jsonify({"error": "Faltan datos o los tipos son incorrectos"}), 400

    conexion = conectar_db()
    cursor = conexion.cursor()
    cursor.execute("INSERT INTO productos (nombre, cantidad, precio) VALUES (?, ?, ?)",
                   (nombre, cantidad, precio))
    conexion.commit()
    conexion.close()
    return jsonify({"mensaje": "Producto registrado con éxito"}), 201

@app.route('/api/productos/<int:id_producto>', methods=['DELETE'])
def eliminar_producto_api(id_producto):
    """Elimina un producto de la base de datos por su ID."""
    conexion = conectar_db()
    cursor = conexion.cursor()
    cursor.execute("DELETE FROM productos WHERE id = ?", (id_producto,))
    conexion.commit()
    conexion.close()
    return jsonify({"mensaje": f"Producto con ID {id_producto} eliminado."})

# --- Iniciar el servidor ---
if __name__ == "__main__":
    crear_tabla() 
    print(">>> Iniciando servidor Flask...")
    app.run(debug=True, port=5000)

