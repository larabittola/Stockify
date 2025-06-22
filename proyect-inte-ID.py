import sqlite3
import os

# Crea/conecta a la base de datos
def conectar_db():
   ruta_carpeta = os.path.dirname(os.path.abspath(__file__))
   ruta_db = os.path.join(ruta_carpeta, "inventario.db")
   return sqlite3.connect(ruta_db)



# Crea la tabla de productos
def crear_tabla():
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

# Registrar producto
def registrar_producto(nombre, cantidad, precio):
    conexion = conectar_db()
    cursor = conexion.cursor()
    try:
        cursor.execute("INSERT INTO productos (nombre, cantidad, precio) VALUES (?, ?, ?)", 
                       (nombre, cantidad, precio))
        conexion.commit()
    except sqlite3.IntegrityError:
        print(f"Error al registrar el producto '{nombre}'.")
    finally:
        conexion.close()

# Visualizar productos
def visualizar_productos():
    conexion = conectar_db()
    cursor = conexion.cursor()
    cursor.execute("SELECT * FROM productos")
    productos = cursor.fetchall()
    conexion.close()
    return productos

# Actualizar producto
def actualizar_producto(id_producto, cantidad, precio):
    conexion = conectar_db()
    cursor = conexion.cursor()
    cursor.execute("""
        UPDATE productos
        SET cantidad = ?, precio = ?
        WHERE id = ?
    """, (cantidad, precio, id_producto))
    conexion.commit()
    conexion.close()

# Eliminar producto
def eliminar_producto(id_producto):
    conexion = conectar_db()
    cursor = conexion.cursor()
    cursor.execute("DELETE FROM productos WHERE id = ?", (id_producto,))
    conexion.commit()
    conexion.close()

# Buscar productos por nombre
def buscar_producto(nombre):
    conexion = conectar_db()
    cursor = conexion.cursor()
    cursor.execute("SELECT * FROM productos WHERE nombre LIKE ?", (f"%{nombre}%",))
    productos = cursor.fetchall()
    conexion.close()
    return productos

# Reporte de productos con bajo stock
def reporte_bajo_stock(limite=5):
    conexion = conectar_db()
    cursor = conexion.cursor()
    cursor.execute("SELECT * FROM productos WHERE cantidad < ?", (limite,))
    productos = cursor.fetchall()
    conexion.close()
    return productos

# Menú principal
def menu():
    crear_tabla()
    while True:
        print("\nGestión de Inventario")
        print("1. Registrar producto")
        print("2. Visualizar productos")
        print("3. Actualizar producto")
        print("4. Eliminar producto")
        print("5. Buscar producto")
        print("6. Reporte de bajo stock")
        print("7. Salir")
        
        opcion = input("Seleccione una opción: ")
        
        if opcion == "1":
            nombre = input("Nombre del producto: ")
            try:
                cantidad = int(input("Cantidad: "))
                precio = float(input("Precio: "))
                if cantidad < 0 or precio < 0:
                    print("La cantidad y el precio deben ser valores positivos.")
                else:
                    registrar_producto(nombre, cantidad, precio)
            except ValueError:
                print("Por favor, ingrese valores válidos.")
        elif opcion == "2":
            productos = visualizar_productos()
            if productos:
                print("Lista de productos:")
                for producto in productos:
                    print(f"ID: {producto[0]}, Nombre: {producto[1]}, Cantidad: {producto[2]}, Precio: {producto[3]:.2f}")
            else:
                print("No hay productos registrados.")
        elif opcion == "3":
            try:
                id_producto = int(input("ID del producto a actualizar: "))
                cantidad = int(input("Nueva cantidad: "))
                precio = float(input("Nuevo precio: "))
                if cantidad < 0 or precio < 0:
                    print("La cantidad y el precio deben ser valores positivos.")
                else:
                    actualizar_producto(id_producto, cantidad, precio)
            except ValueError:
                print("Por favor, ingrese valores válidos.")
        elif opcion == "4":
            try:
                id_producto = int(input("ID del producto a eliminar: "))
                confirmacion = input(f"¿Estás seguro de que deseas eliminar el producto con ID '{id_producto}'? (s/n): ").lower()
                if confirmacion == 's':
                    eliminar_producto(id_producto)
                    print(f"Producto con ID '{id_producto}' eliminado.")
                else:
                    print("Eliminación cancelada.")
            except ValueError:
                print("Por favor, ingrese un ID válido.")
        elif opcion == "5":
            nombre = input("Nombre del producto a buscar: ")
            productos = buscar_producto(nombre)
            if productos:
                print("Productos encontrados:")
                for producto in productos:
                    print(f"ID: {producto[0]}, Nombre: {producto[1]}, Cantidad: {producto[2]}, Precio: {producto[3]:.2f}")
            else:
                print("No se encontraron productos.")
        elif opcion == "6":
            try:
                limite = int(input("Ingrese el límite de stock: "))
                productos = reporte_bajo_stock(limite)
                if productos:
                    print("Productos con bajo stock:")
                    for producto in sorted(productos, key=lambda x: x[2]):
                        print(f"ID: {producto[0]}, Nombre: {producto[1]}, Cantidad: {producto[2]}, Precio: {producto[3]:.2f}")
                else:
                    print(f"No hay productos con stock menor a {limite}.")
            except ValueError:
                print("Por favor, ingrese un valor numérico válido.")
        elif opcion == "7":
            print("Saliendo del sistema...")
            break
        else:
            print("Opción no válida. Intente de nuevo.")

# Ejecutar el menú automáticamente
if __name__ == "__main__":
    menu()
