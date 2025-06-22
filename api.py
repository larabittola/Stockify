# Archivo: api.py
import sqlite3
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

# --- Configuración inicial de Flask ---
app = Flask(__name__)
# CORS(app) permite que cualquier front-end pueda hacerle peticiones a nuestra API
CORS(app) 

# --- Funciones de la Base de Datos ---
def conectar_db():
    """Conecta a la base de datos SQLite y la configura para devolver diccionarios."""
    try:
        ruta_carpeta = os.path.dirname(os.path.abspath(__file__))
        ruta_db = os.path.join(ruta_carpeta, "inventario.db")
        conn = sqlite3.connect(ruta_db)
        conn.row_factory = sqlite3.Row 
        return conn
    except Exception as e:
        print(f"Error al conectar a la base de datos: {e}")
        return None

def crear_tabla():
    """Crea la tabla de productos si no existe."""
    conexion = None
    try:
        conexion = conectar_db()
        if conexion:
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
    except Exception as e:
        print(f"Error al crear la tabla: {e}")
    finally:
        if conexion:
            conexion.close()

# --- Rutas de la API ("Endpoints") ---

# ===================================================================
# NUEVA RUTA DE DIAGNÓSTICO
# Esta es nuestra prueba para ver si el servidor está vivo.
@app.route('/')
def index():
    return "<h1>El servidor Flask está funcionando correctamente!</h1>"
# ===================================================================

# RUTA PARA OBTENER TODOS LOS PRODUCTOS (Read)
@app.route('/api/productos', methods=['GET'])
def obtener_productos():
    conexion = None
    try:
        conexion = conectar_db()
        cursor = conexion.cursor()
        cursor.execute("SELECT * FROM productos ORDER BY id DESC")
        productos_lista = [dict(row) for row in cursor.fetchall()]
        return jsonify(productos_lista)
    except Exception as e:
        print(f"Error en obtener_productos: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conexion:
            conexion.close()

# RUTA PARA CREAR UN NUEVO PRODUCTO (Create)
@app.route('/api/productos', methods=['POST'])
def registrar_nuevo_producto():
    conexion = None
    try:
        datos = request.json
        nombre = datos.get('nombre')
        cantidad = datos.get('cantidad')
        precio = datos.get('precio')

        if not all([nombre, isinstance(cantidad, int), isinstance(precio, (int, float))]):
            return jsonify({"error": "Faltan datos o los tipos son incorrectos"}), 400

        conexion = conectar_db()
        cursor = conexion.cursor()
        cursor.execute("INSERT INTO productos (nombre, cantidad, precio) VALUES (?, ?, ?)",
                       (nombre, cantidad, precio))
        conexion.commit()
        return jsonify({"mensaje": "Producto registrado con éxito"}), 201
    except Exception as e:
        print(f"Error en registrar_nuevo_producto: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conexion:
            conexion.close()

# RUTA PARA ELIMINAR UN PRODUCTO (Delete)
@app.route('/api/productos/<int:id_producto>', methods=['DELETE'])
def eliminar_producto_api(id_producto):
    conexion = None
    try:
        conexion = conectar_db()
        cursor = conexion.cursor()
        cursor.execute("DELETE FROM productos WHERE id = ?", (id_producto,))
        if cursor.rowcount == 0:
            return jsonify({"error": "Producto no encontrado"}), 404
        conexion.commit()
        return jsonify({"mensaje": f"Producto con ID {id_producto} eliminado."})
    except Exception as e:
        print(f"Error en eliminar_producto_api: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conexion:
            conexion.close()

# --- Iniciar el servidor ---
if __name__ == "__main__":
    crear_tabla() 
    print(">>> Iniciando servidor de Flask...")
    app.run(debug=True, port=5000)
