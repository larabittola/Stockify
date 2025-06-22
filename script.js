// script.js

document.addEventListener('DOMContentLoaded', () => {
    // URL de nuestra API de Flask. Debe ser exacta.
    const API_URL = 'http://127.0.0.1:5000/api/productos';

    // Selección de elementos del DOM (el HTML)
    const tablaProductosBody = document.getElementById('tabla-productos');
    const formulario = document.getElementById('formulario-producto');
    const nombreInput = document.getElementById('nombre');
    const cantidadInput = document.getElementById('cantidad');
    const precioInput = document.getElementById('precio');

    /**
     * Función para obtener y mostrar todos los productos en la tabla.
     */
    const obtenerProductos = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                // Si la respuesta no es 200-299, lanza un error.
                throw new Error(`Error del servidor: ${response.status}`);
            }
            const productos = await response.json();
            
            // Limpiar la tabla antes de volver a llenarla
            tablaProductosBody.innerHTML = '';

            if (productos.length === 0) {
                tablaProductosBody.innerHTML = '<tr><td colspan="5" class="text-center">No hay productos registrados.</td></tr>';
                return;
            }

            // Llenar la tabla con los datos de cada producto
            productos.forEach(producto => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${producto.id}</td>
                    <td>${producto.nombre}</td>
                    <td>${producto.cantidad}</td>
                    <td>$${parseFloat(producto.precio).toFixed(2)}</td>
                    <td class="acciones-btn">
                        <button class="btn btn-danger btn-sm btn-eliminar" data-id="${producto.id}">Eliminar</button>
                    </td>
                `;
                tablaProductosBody.appendChild(fila);
            });

        } catch (error) {
            console.error('Error al obtener productos:', error);
            tablaProductosBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error al cargar productos. Revisa la consola (F12).</td></tr>`;
        }
    };

    /**
     * Función para registrar un nuevo producto usando los datos del formulario.
     */
    const registrarProducto = async (event) => {
        event.preventDefault(); // Evita que el formulario recargue la página

        const nuevoProducto = {
            nombre: nombreInput.value.trim(),
            cantidad: parseInt(cantidadInput.value, 10),
            precio: parseFloat(precioInput.value)
        };
        
        // Validación simple
        if (!nuevoProducto.nombre || isNaN(nuevoProducto.cantidad) || isNaN(nuevoProducto.precio)) {
            alert('Por favor, completa todos los campos correctamente.');
            return;
        }

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(nuevoProducto)
            });

            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }

            // Limpiar el formulario y recargar la lista de productos
            formulario.reset();
            await obtenerProductos();

        } catch (error) {
            console.error('Error al registrar el producto:', error);
            alert('No se pudo registrar el producto.');
        }
    };

    /**
     * Función para eliminar un producto. Se activa con los botones de la tabla.
     */
    const eliminarProducto = async (id) => {
        if (!confirm(`¿Estás seguro de que quieres eliminar el producto con ID ${id}?`)) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }
            
            // Si todo salió bien, recargamos la lista de productos.
            await obtenerProductos();

        } catch (error) {
            console.error('Error al eliminar el producto:', error);
            alert('No se pudo eliminar el producto.');
        }
    };

    // --- EVENT LISTENERS (Escuchadores de eventos) ---

    // 1. Escuchar cuando el formulario se envía
    formulario.addEventListener('submit', registrarProducto);
    
    // 2. Escuchar clics en la tabla para delegar el evento a los botones de eliminar
    tablaProductosBody.addEventListener('click', (event) => {
        // Verificamos si el clic fue en un botón con la clase 'btn-eliminar'
        if (event.target.classList.contains('btn-eliminar')) {
            // Obtenemos el ID del producto desde el atributo 'data-id'
            const id = event.target.dataset.id;
            eliminarProducto(id);
        }
    });

    // 3. Cargar todos los productos cuando la página se carga por primera vez
    obtenerProductos();
});
