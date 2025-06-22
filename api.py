import sqlite3
import os
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 

# --- Ruta principal que sirve el frontend ---
@app.route('/')
def index():
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
    """Crea las tablas de la base de datos si no existen."""
    conexion = conectar_db()
    cursor = conexion.cursor()
    
    # Tabla de productos (ya existente)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            cantidad INTEGER NOT NULL,
            precio REAL NOT NULL
        )
    """)
    
    # --- NUEVO: Tabla de proveedores ---
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS proveedores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            telefono TEXT,
            email TEXT
        )
    """)

    conexion.commit()
    conexion.close()

# --- Endpoints de la API para PRODUCTOS ---

@app.route('/api/productos', methods=['GET'])
def obtener_productos():
    """Devuelve una lista de todos los productos."""
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
    
    if not all([nombre, isinstance(cantidad, int), isinstance(precio, (int, float))]):
        return jsonify({"error": "Faltan datos o los tipos son incorrectos"}), 400

    conexion = conectar_db()
    cursor = conexion.cursor()
    cursor.execute("INSERT INTO productos (nombre, cantidad, precio) VALUES (?, ?, ?)",
                   (nombre, cantidad, precio))
    conexion.commit()
    conexion.close()
    return jsonify({"mensaje": "Producto registrado con éxito"}), 201

@app.route('/api/productos/<int:id_producto>', methods=['PUT'])
def actualizar_producto(id_producto):
    """Actualiza un producto existente por su ID."""
    datos = request.json
    nombre = datos.get('nombre')
    cantidad = datos.get('cantidad')
    precio = datos.get('precio')

    if not all([nombre, isinstance(cantidad, int), isinstance(precio, (int, float))]):
        return jsonify({"error": "Faltan datos o los tipos son incorrectos"}), 400

    conexion = conectar_db()
    cursor = conexion.cursor()
    cursor.execute("UPDATE productos SET nombre = ?, cantidad = ?, precio = ? WHERE id = ?",
                   (nombre, cantidad, precio, id_producto))
    
    if cursor.rowcount == 0:
        conexion.close()
        return jsonify({"error": f"Producto con ID {id_producto} no encontrado."}), 404
    
    conexion.commit()
    conexion.close()
    return jsonify({"mensaje": f"Producto con ID {id_producto} actualizado con éxito."}), 200

@app.route('/api/productos/<int:id_producto>', methods=['DELETE'])
def eliminar_producto(id_producto):
    """Elimina un producto de la base de datos por su ID."""
    conexion = conectar_db()
    cursor = conexion.cursor()
    cursor.execute("DELETE FROM productos WHERE id = ?", (id_producto,))

    if cursor.rowcount == 0:
        conexion.close()
        return jsonify({"error": f"Producto con ID {id_producto} no encontrado."}), 404

    conexion.commit()
    conexion.close()
    return jsonify({"mensaje": f"Producto con ID {id_producto} eliminado."})

# --- Endpoints de la API para PROVEEDORES ---

@app.route('/api/proveedores', methods=['GET'])
def obtener_proveedores():
    """Devuelve una lista de todos los proveedores."""
    conexion = conectar_db()
    cursor = conexion.cursor()
    cursor.execute("SELECT * FROM proveedores ORDER BY nombre ASC")
    proveedores_lista = [dict(row) for row in cursor.fetchall()]
    conexion.close()
    return jsonify(proveedores_lista)

@app.route('/api/proveedores', methods=['POST'])
def registrar_nuevo_proveedor():
    """Registra un nuevo proveedor."""
    datos = request.json
    nombre = datos.get('nombre')
    telefono = datos.get('telefono')
    email = datos.get('email')
    
    if not nombre:
        return jsonify({"error": "El nombre es obligatorio"}), 400

    conexion = conectar_db()
    cursor = conexion.cursor()
    cursor.execute("INSERT INTO proveedores (nombre, telefono, email) VALUES (?, ?, ?)",
                   (nombre, telefono, email))
    conexion.commit()
    conexion.close()
    return jsonify({"mensaje": "Proveedor registrado con éxito"}), 201

@app.route('/api/proveedores/<int:id_proveedor>', methods=['PUT'])
def actualizar_proveedor(id_proveedor):
    """Actualiza un proveedor existente."""
    datos = request.json
    nombre = datos.get('nombre')
    telefono = datos.get('telefono')
    email = datos.get('email')

    if not nombre:
        return jsonify({"error": "El nombre es obligatorio"}), 400

    conexion = conectar_db()
    cursor = conexion.cursor()
    cursor.execute("UPDATE proveedores SET nombre = ?, telefono = ?, email = ? WHERE id = ?",
                   (nombre, telefono, email, id_proveedor))
    
    if cursor.rowcount == 0:
        conexion.close()
        return jsonify({"error": f"Proveedor con ID {id_proveedor} no encontrado."}), 404
    
    conexion.commit()
    conexion.close()
    return jsonify({"mensaje": "Proveedor actualizado con éxito."}), 200

@app.route('/api/proveedores/<int:id_proveedor>', methods=['DELETE'])
def eliminar_proveedor(id_proveedor):
    """Elimina un proveedor."""
    conexion = conectar_db()
    cursor = conexion.cursor()
    cursor.execute("DELETE FROM proveedores WHERE id = ?", (id_proveedor,))

    if cursor.rowcount == 0:
        conexion.close()
        return jsonify({"error": f"Proveedor con ID {id_proveedor} no encontrado."}), 404

    conexion.commit()
    conexion.close()
    return jsonify({"mensaje": f"Proveedor con ID {id_proveedor} eliminado."})


# --- Iniciar el servidor ---
if __name__ == "__main__":
    crear_tabla() 
    print(">>> Iniciando servidor Flask...")
    app.run(debug=True, port=5000)