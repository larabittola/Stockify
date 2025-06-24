import sqlite3
import os
import re
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

# --- Funciones de Validación ---
def es_email_valido(email):
    if not email: return True
    regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(regex, email) is not None

def es_telefono_valido(telefono):
    if not telefono: return True
    numeros = re.sub(r'[^0-9]', '', telefono)
    return len(numeros) >= 6

# --- Ruta principal ---
@app.route('/')
def index():
    return render_template('index.html')

# --- Funciones de la Base de Datos ---
def conectar_db():
    ruta_carpeta = os.path.dirname(os.path.abspath(__file__))
    ruta_db = os.path.join(ruta_carpeta, "inventario.db")
    conn = sqlite3.connect(ruta_db)
    conn.row_factory = sqlite3.Row
    return conn

def crear_tabla():
    conexion = conectar_db()
    cursor = conexion.cursor()
    cursor.execute("PRAGMA foreign_keys = ON")

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS proveedores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            telefono TEXT,
            email TEXT,
            tipo_productos TEXT,
            calidad_percibida TEXT,
            notas TEXT
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            cantidad INTEGER NOT NULL,
            precio REAL NOT NULL,
            id_proveedor INTEGER,
            FOREIGN KEY (id_proveedor) REFERENCES proveedores (id) ON DELETE SET NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS notas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            contenido TEXT NOT NULL,
            etiquetas TEXT,
            color TEXT DEFAULT 'yellow',
            importancia INTEGER DEFAULT 1,
            fijado INTEGER DEFAULT 0,
            fecha_creacion TEXT NOT NULL
        )
    """)

    conexion.commit()
    conexion.close()

# --- Endpoints de la API para PRODUCTOS ---
@app.route('/api/productos', methods=['GET'])
def obtener_productos():
    conexion = conectar_db()
    cursor = conexion.cursor()
    cursor.execute("""
        SELECT p.*, pr.nombre as nombre_proveedor 
        FROM productos p
        LEFT JOIN proveedores pr ON p.id_proveedor = pr.id
        ORDER BY p.id DESC
    """)
    productos_lista = [dict(row) for row in cursor.fetchall()]
    conexion.close()
    return jsonify(productos_lista)

@app.route('/api/productos', methods=['POST'])
def registrar_nuevo_producto():
    datos = request.json
    nombre = datos.get('nombre')
    cantidad = datos.get('cantidad')
    precio = datos.get('precio')
    id_proveedor = datos.get('id_proveedor')
    if not all([nombre, isinstance(cantidad, int), isinstance(precio, (int, float))]):
        return jsonify({"error": "Faltan datos o los tipos son incorrectos"}), 400
    conexion = conectar_db()
    cursor = conexion.cursor()
    cursor.execute("INSERT INTO productos (nombre, cantidad, precio, id_proveedor) VALUES (?, ?, ?, ?)", (nombre, cantidad, precio, id_proveedor))
    conexion.commit()
    conexion.close()
    return jsonify({"mensaje": "Producto registrado con éxito"}), 201

@app.route('/api/productos/<int:id_producto>', methods=['PUT'])
def actualizar_producto(id_producto):
    datos = request.json
    nombre = datos.get('nombre')
    cantidad = datos.get('cantidad')
    precio = datos.get('precio')
    id_proveedor = datos.get('id_proveedor')
    if not all([nombre, isinstance(cantidad, int), isinstance(precio, (int, float))]):
        return jsonify({"error": "Faltan datos o los tipos son incorrectos"}), 400
    conexion = conectar_db()
    cursor = conexion.cursor()
    cursor.execute("UPDATE productos SET nombre = ?, cantidad = ?, precio = ?, id_proveedor = ? WHERE id = ?", (nombre, cantidad, precio, id_proveedor, id_producto))
    if cursor.rowcount == 0:
        conexion.close()
        return jsonify({"error": f"Producto con ID {id_producto} no encontrado."}), 404
    conexion.commit()
    conexion.close()
    return jsonify({"mensaje": "Producto actualizado con éxito."}), 200

@app.route('/api/productos/<int:id_producto>', methods=['DELETE'])
def eliminar_producto(id_producto):
    conexion = conectar_db()
    cursor = conexion.cursor()
    cursor.execute("DELETE FROM productos WHERE id = ?", (id_producto,))
    if cursor.rowcount == 0:
        conexion.close()
        return jsonify({"error": f"Producto con ID {id_producto} no encontrado."}), 404
    conexion.commit()
    conexion.close()
    return jsonify({"mensaje": "Producto eliminado."})

# --- Endpoints de la API para PROVEEDORES ---
@app.route('/api/proveedores', methods=['GET'])
def obtener_proveedores():
    conexion = conectar_db()
    cursor = conexion.cursor()
    cursor.execute("SELECT * FROM proveedores ORDER BY nombre ASC")
    proveedores_lista = [dict(row) for row in cursor.fetchall()]
    conexion.close()
    return jsonify(proveedores_lista)

@app.route('/api/proveedores', methods=['POST'])
def registrar_nuevo_proveedor():
    datos = request.json
    nombre = datos.get('nombre')
    if not nombre: return jsonify({"error": "El nombre es obligatorio"}), 400
    if not es_email_valido(datos.get('email')): return jsonify({"error": "Formato de email inválido"}), 400
    if not es_telefono_valido(datos.get('telefono')): return jsonify({"error": "Formato de teléfono inválido"}), 400
    conexion = conectar_db()
    cursor = conexion.cursor()
    cursor.execute("INSERT INTO proveedores (nombre, telefono, email, tipo_productos, calidad_percibida, notas) VALUES (?, ?, ?, ?, ?, ?)",(datos.get('nombre'), datos.get('telefono'), datos.get('email'), datos.get('tipo_productos'), datos.get('calidad_percibida'), datos.get('notas')))
    conexion.commit()
    conexion.close()
    return jsonify({"mensaje": "Proveedor registrado con éxito"}), 201

@app.route('/api/proveedores/<int:id_proveedor>', methods=['PUT'])
def actualizar_proveedor(id_proveedor):
    datos = request.json
    nombre = datos.get('nombre')
    if not nombre: return jsonify({"error": "El nombre es obligatorio"}), 400
    if not es_email_valido(datos.get('email')): return jsonify({"error": "Formato de email inválido"}), 400
    if not es_telefono_valido(datos.get('telefono')): return jsonify({"error": "Formato de teléfono inválido"}), 400
    conexion = conectar_db()
    cursor = conexion.cursor()
    cursor.execute("UPDATE proveedores SET nombre = ?, telefono = ?, email = ?, tipo_productos = ?, calidad_percibida = ?, notas = ? WHERE id = ?", (datos.get('nombre'), datos.get('telefono'), datos.get('email'), datos.get('tipo_productos'), datos.get('calidad_percibida'), datos.get('notas'), id_proveedor))
    if cursor.rowcount == 0:
        conexion.close()
        return jsonify({"error": f"Proveedor con ID {id_proveedor} no encontrado."}), 404
    conexion.commit()
    conexion.close()
    return jsonify({"mensaje": "Proveedor actualizado con éxito."}), 200

@app.route('/api/proveedores/<int:id_proveedor>', methods=['DELETE'])
def eliminar_proveedor(id_proveedor):
    conexion = conectar_db()
    cursor = conexion.cursor()
    cursor.execute("DELETE FROM proveedores WHERE id = ?", (id_proveedor,))
    if cursor.rowcount == 0:
        conexion.close()
        return jsonify({"error": f"Proveedor con ID {id_proveedor} no encontrado."}), 404
    conexion.commit()
    conexion.close()
    return jsonify({"mensaje": "Proveedor eliminado."})

# --- Endpoints de la API para NOTAS ---
@app.route('/api/notas', methods=['GET'])
def obtener_notas():
    conexion = conectar_db()
    cursor = conexion.cursor()
    cursor.execute("SELECT * FROM notas ORDER BY fijado DESC, fecha_creacion DESC")
    notas_lista = [dict(row) for row in cursor.fetchall()]
    conexion.close()
    return jsonify(notas_lista)

@app.route('/api/notas', methods=['POST'])
def crear_nota():
    datos = request.json
    titulo = datos.get('titulo')
    contenido = datos.get('contenido')
    
    if not titulo or not contenido:
        return jsonify({"error": "El título y el contenido son obligatorios"}), 400
    
    fecha_actual = datetime.now().isoformat()

    conexion = conectar_db()
    cursor = conexion.cursor()
    cursor.execute(
        "INSERT INTO notas (titulo, contenido, etiquetas, color, importancia, fijado, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (titulo, contenido, datos.get('etiquetas'), datos.get('color', 'yellow'), datos.get('importancia', 1), datos.get('fijado', 0), fecha_actual)
    )
    conexion.commit()
    conexion.close()
    return jsonify({"mensaje": "Nota creada con éxito"}), 201

@app.route('/api/notas/<int:id_nota>', methods=['PUT'])
def actualizar_nota(id_nota):
    datos = request.json
    titulo = datos.get('titulo')
    contenido = datos.get('contenido')

    if not titulo or not contenido:
        return jsonify({"error": "El título y el contenido son obligatorios"}), 400

    conexion = conectar_db()
    cursor = conexion.cursor()
    cursor.execute(
        "UPDATE notas SET titulo = ?, contenido = ?, etiquetas = ?, color = ?, importancia = ?, fijado = ? WHERE id = ?",
        (titulo, contenido, datos.get('etiquetas'), datos.get('color'), datos.get('importancia'), datos.get('fijado'), id_nota)
    )
    if cursor.rowcount == 0:
        conexion.close()
        return jsonify({"error": f"Nota con ID {id_nota} no encontrada."}), 404
    conexion.commit()
    conexion.close()
    return jsonify({"mensaje": "Nota actualizada con éxito."}), 200

@app.route('/api/notas/<int:id_nota>', methods=['DELETE'])
def eliminar_nota(id_nota):
    conexion = conectar_db()
    cursor = conexion.cursor()
    cursor.execute("DELETE FROM notas WHERE id = ?", (id_nota,))
    if cursor.rowcount == 0:
        conexion.close()
        return jsonify({"error": f"Nota con ID {id_nota} no encontrada."}), 404
    conexion.commit()
    conexion.close()
    return jsonify({"mensaje": "Nota eliminada."})

# --- Iniciar el servidor ---
if __name__ == "__main__":
    crear_tabla()
    print(">>> Iniciando servidor Flask...")
    app.run(debug=True, port=5000)