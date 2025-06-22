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
            nombre TEXT PRIMARY KEY,
            cantidad INTEGER NOT NULL,
            precio REAL NOT NULL
        )
    """)
    conexion.commit()
    conexion.close()

# Registyrar el producto
def registrar_producto(nombre, cantidad, precio):
    conexion = conectar_db()
    cursor = conexion.cursor()
    try:
        cursor.execute("INSERT INTO productos (nombre, cantidad, precio) VALUES (?, ?, ?)", 
                       (nombre, cantidad, precio))
        conexion.commit()
    except sqlite3.IntegrityError:
        print(f"El producto '{nombre}' ya existe.")
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

# Actualiza  producto
def actualizar_producto(nombre, cantidad, precio):
    conexion = conectar_db()
    cursor = conexion.cursor()
    cursor.execute("""
        UPDATE productos
        SET cantidad = ?, precio = ?
        WHERE nombre = ?
    """, (cantidad, precio, nombre))
    conexion.commit()
    conexion.close()

# Elimina producto
def eliminar_producto(nombre):
    conexion = conectar_db()
    cursor = conexion.cursor()
    cursor.execute("DELETE FROM productos WHERE nombre = ?", (nombre,))
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
                    print(f"Nombre: {producto[0]}, Cantidad: {producto[1]}, Precio: {producto[2]:.2f}")
            else:
                print("No hay productos registrados.")
        elif opcion == "3":
            nombre = input("Nombre del producto a actualizar: ")
            try:
                cantidad = int(input("Nueva cantidad: "))
                precio = float(input("Nuevo precio: "))
                if cantidad < 0 or precio < 0:
                    print("La cantidad y el precio deben ser valores positivos.")
                else:
                    actualizar_producto(nombre, cantidad, precio)
            except ValueError:
                print("Por favor, ingrese valores válidos.")
        elif opcion == "4":
            nombre = input("Nombre del producto a eliminar: ")
            confirmacion = input(f"¿Estás seguro de que deseas eliminar '{nombre}'? (s/n): ").lower()
            if confirmacion == 's':
                eliminar_producto(nombre)
                print(f"Producto '{nombre}' eliminado.")
            else:
                print("Eliminación cancelada.")
        elif opcion == "5":
            nombre = input("Nombre del producto a buscar: ")
            productos = buscar_producto(nombre)
            if productos:
                print("Productos encontrados:")
                for producto in productos:
                    print(f"Nombre: {producto[0]}, Cantidad: {producto[1]}, Precio: {producto[2]:.2f}")
            else:
                print("No se encontraron productos.")
        elif opcion == "6":
            try:
                limite = int(input("Ingrese el límite de stock: "))
                productos = reporte_bajo_stock(limite)
                if productos:
                    print("Productos con bajo stock:")
                    for producto in sorted(productos, key=lambda x: x[1]):
                        print(f"Nombre: {producto[0]}, Cantidad: {producto[1]}, Precio: {producto[2]:.2f}")
                else:
                    print(f"No hay productos con stock menor a {limite}.")
            except ValueError:
                print("Por favor, ingrese un valor numérico válido.")
        elif opcion == "7":
            print("Saliendo del sistema...")
            break
        else:
            print("Opción no válida. Intente de nuevo.")

# Ejecutar el menú automaticamente
if __name__ == "__main__":
    menu()
