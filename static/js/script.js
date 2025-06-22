document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURACIÓN ---
    const API_URL = 'http://127.0.0.1:5000/api/productos';
    const LIMITE_BAJO_STOCK = 10;

    // --- ELEMENTOS DEL DOM ---
    const navLinks = document.querySelectorAll('.nav-link');
    const productosToggle = document.getElementById('productos-toggle');
    const productosSubmenu = document.getElementById('productos-submenu');
    
    const views = ['dashboard-view', 'productos-lista-view', 'productos-baja-view', 'gastos-view', 'proveedores-view', 'facturacion-view', 'notas-view'];
    
    const formulario = document.getElementById('formulario-producto');
    const tablaProductosBody = document.getElementById('tabla-productos');
    const tablaProductosBajaBody = document.getElementById('tabla-productos-baja');
    
    const statTotalProductos = document.getElementById('stat-total-productos');
    const statValorInventario = document.getElementById('stat-valor-inventario');
    const statBajoStock = document.getElementById('stat-bajo-stock');

    // --- LÓGICA DE NAVEGACIÓN ---
    const showView = (viewId) => {
        views.forEach(id => document.getElementById(id)?.classList.add('hidden'));
        document.getElementById(viewId)?.classList.remove('hidden');

        navLinks.forEach(link => {
            const linkView = link.dataset.view;
            const parentToggle = link.closest('div')?.previousElementSibling;

            // Lógica para marcar el link activo
            const isActive = linkView === viewId.replace('-view', '');
            link.classList.toggle('active', isActive);

            // Si un submenú está activo, también marca el botón principal
            if (parentToggle?.id === 'productos-toggle' && (viewId === 'productos-lista-view' || viewId === 'productos-baja-view')) {
                parentToggle.classList.add('active');
            } else if (parentToggle?.id === 'productos-toggle') {
                parentToggle.classList.remove('active');
            }
        });
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = link.dataset.view + '-view';
            showView(viewId);
        });
    });

    productosToggle.addEventListener('click', () => {
        const isClosed = productosSubmenu.style.maxHeight === '0px' || !productosSubmenu.style.maxHeight;
        productosSubmenu.style.maxHeight = isClosed ? `${productosSubmenu.scrollHeight}px` : '0px';
        productosToggle.querySelector('[data-lucide="chevron-down"]').classList.toggle('rotate-180', isClosed);
    });

    // --- LÓGICA DE DATOS ---
    const inicializarApp = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('No se pudo conectar con la API');
            const productos = await response.json();
            
            actualizarDashboard(productos);
            cargarTablaProductos(productos);
            cargarTablaBajoStock(productos);
        } catch (error) {
            console.error("Error al inicializar:", error);
            document.body.innerHTML = `<div class="h-screen w-screen flex items-center justify-center bg-red-100 text-red-700">Error: No se pudo conectar con el servidor.</div>`;
        }
    };

    const actualizarDashboard = (productos) => {
        statTotalProductos.textContent = productos.length;
        const valorInventario = productos.reduce((total, p) => total + (p.cantidad * p.precio), 0);
        statValorInventario.textContent = `$${valorInventario.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        const bajoStock = productos.filter(p => p.cantidad < LIMITE_BAJO_STOCK).length;
        statBajoStock.textContent = bajoStock;
    };

    const cargarTablaProductos = (productos) => {
        tablaProductosBody.innerHTML = '';
        if (productos.length === 0) {
            tablaProductosBody.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-slate-500">Aún no hay productos ¡Añade el primero!</td></tr>';
            return;
        }
        productos.forEach(p => {
            tablaProductosBody.innerHTML += `<tr><td class="px-6 py-4 text-sm font-medium text-slate-800">${p.nombre}</td><td class="px-6 py-4 text-sm text-slate-500">${p.cantidad}</td><td class="px-6 py-4 text-sm text-slate-500">$${p.precio.toFixed(2)}</td><td class="px-6 py-4 text-sm font-medium"><button class="text-red-500 hover:text-red-700 font-semibold btn-eliminar" data-id="${p.id}">Eliminar</button></td></tr>`;
        });
    };
    
    const cargarTablaBajoStock = (productos) => {
        const productosFiltrados = productos.filter(p => p.cantidad < LIMITE_BAJO_STOCK);
        tablaProductosBajaBody.innerHTML = '';
        if (productosFiltrados.length === 0) {
            tablaProductosBajaBody.innerHTML = '<tr><td colspan="3" class="text-center py-8 text-slate-500">¡Genial! No hay productos con bajo stock.</td></tr>';
            return;
        }
        productosFiltrados.forEach(p => {
            tablaProductosBajaBody.innerHTML += `<tr class="hover:bg-amber-50"><td class="px-6 py-4 text-sm font-medium text-slate-800">${p.nombre}</td><td class="px-6 py-4 text-sm font-bold text-amber-600">${p.cantidad}</td><td class="px-6 py-4 text-sm text-slate-500">$${p.precio.toFixed(2)}</td></tr>`;
        });
    };

    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nuevoProducto = {
            nombre: document.getElementById('nombre').value.trim(),
            cantidad: parseInt(document.getElementById('cantidad').value, 10),
            precio: parseFloat(document.getElementById('precio').value)
        };
        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoProducto)
            });
            formulario.reset();
            inicializarApp();
        } catch (error) { console.error('Error al registrar:', error); }
    });

    tablaProductosBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('btn-eliminar')) {
            const id = e.target.dataset.id;
            if (confirm(`¿Eliminar producto ID ${id}?`)) {
                try {
                    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                    inicializarApp();
                } catch (error) { console.error('Error al eliminar:', error); }
            }
        }
    });

    // --- ARRANQUE ---
    showView('dashboard-view');
    inicializarApp();
});
