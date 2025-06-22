document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURACIÓN ---
    const API_URL = 'http://127.0.0.1:5000/api/productos';
    const API_URL_PROVEEDORES = 'http://127.0.0.1:5000/api/proveedores';
    const LIMITE_BAJO_STOCK = 10;
    const MONEDA = 'ARS';

    // --- ESTADO DE LA APLICACIÓN ---
    let modoEdicion = false;
    let modoEdicionProveedor = false;
    let valorChartInstance = null;
    let cantidadChartInstance = null;

    // --- ELEMENTOS DEL DOM ---
    const navLinks = document.querySelectorAll('.nav-link');
    const productosToggle = document.getElementById('productos-toggle');
    const productosSubmenu = document.getElementById('productos-submenu');
    const dashboardView = document.getElementById('dashboard-view');
    
    const views = ['dashboard-view', 'productos-lista-view', 'productos-baja-view', 'gastos-view', 'proveedores-view', 'facturacion-view', 'notas-view'];
    
    // Elementos de Productos
    const formulario = document.getElementById('formulario-producto');
    const inputId = document.getElementById('producto-id');
    const inputNombre = document.getElementById('nombre');
    const inputCantidad = document.getElementById('cantidad');
    const inputPrecio = document.getElementById('precio');
    const btnSubmit = document.getElementById('btn-submit-producto');
    const btnCancelar = document.getElementById('btn-cancelar');
    const tablaProductosBody = document.getElementById('tabla-productos');
    const tablaProductosBajaBody = document.getElementById('tabla-productos-baja');
    
    // Elementos del Dashboard
    const statTotalProductos = document.getElementById('stat-total-productos');
    const statValorInventario = document.getElementById('stat-valor-inventario');
    const statBajoStock = document.getElementById('stat-bajo-stock');
    const statMasValioso = document.getElementById('stat-mas-valioso');
    const statMasValiosoValor = document.getElementById('stat-mas-valioso-valor');
    const statMayorStock = document.getElementById('stat-mayor-stock');
    const statMayorStockCantidad = document.getElementById('stat-mayor-stock-cantidad');
    const statPrecioPromedio = document.getElementById('stat-precio-promedio');

    // Elementos del DOM para Proveedores
    const formularioProveedor = document.getElementById('formulario-proveedor');
    const inputIdProveedor = document.getElementById('proveedor-id');
    const inputNombreProveedor = document.getElementById('proveedor-nombre');
    const inputTelefonoProveedor = document.getElementById('proveedor-telefono');
    const inputEmailProveedor = document.getElementById('proveedor-email');
    const btnSubmitProveedor = document.getElementById('btn-submit-proveedor');
    const btnCancelarProveedor = document.getElementById('btn-cancelar-proveedor');
    const tablaProveedoresBody = document.getElementById('tabla-proveedores');


    // --- FUNCIONES UTILITARIAS ---
    const formatoMoneda = (valor) => {
        return valor.toLocaleString('es-AR', { style: 'currency', currency: MONEDA });
    };

    const showToast = (message) => {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.className = 'fixed bottom-5 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-5 py-3 rounded-lg shadow-xl transition-all duration-300 opacity-0 transform translate-y-4';
        
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.remove('opacity-0', 'translate-y-4');
        }, 10);

        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-4');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
    };

    // --- LÓGICA DE NAVEGACIÓN ---
    const showView = (viewId) => {
        views.forEach(id => document.getElementById(id)?.classList.add('hidden'));
        const viewToShow = document.getElementById(viewId);
        if (viewToShow) {
            viewToShow.classList.remove('hidden');
        }

        navLinks.forEach(link => {
            const linkView = link.dataset.view;
            link.classList.toggle('active', linkView === viewId.replace('-view', ''));
        });

        const isProductosView = viewId === 'productos-lista-view' || viewId === 'productos-baja-view';
        productosToggle.classList.toggle('active', isProductosView);
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = link.dataset.view + '-view';
            showView(viewId);
        });
    });

    dashboardView.addEventListener('click', (e) => {
        const targetLink = e.target.closest('[data-view-target]');
        if (targetLink) {
            e.preventDefault();
            const viewId = targetLink.dataset.viewTarget + '-view';
            showView(viewId);
        }
    });

    productosToggle.addEventListener('click', () => {
        showView('productos-lista-view');
        const isClosed = productosSubmenu.style.maxHeight === '0px' || !productosSubmenu.style.maxHeight;
        productosSubmenu.style.maxHeight = isClosed ? `${productosSubmenu.scrollHeight}px` : '0px';
        productosToggle.querySelector('[data-lucide="chevron-down"]').classList.toggle('rotate-180', isClosed);
    });

    const inicializarApp = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('No se pudo conectar con la API');
            const productos = await response.json();
            
            actualizarDashboard(productos);
            cargarTablaProductos(productos);
            cargarTablaBajoStock(productos);
            renderValorChart(productos);
            renderCantidadChart(productos);
            
            await actualizarProveedores(); // Cargar proveedores al inicio

            lucide.createIcons();
        } catch (error) {
            console.error("Error al inicializar:", error);
            document.body.innerHTML = `<div class="h-screen w-screen flex items-center justify-center bg-red-100 text-red-700">Error: No se pudo conectar con el servidor.</div>`;
        }
    };

    // --- LÓGICA DE PRODUCTOS (Dashboard, Gráficos, Tablas, Formularios) ---

    const actualizarDashboard = (productos) => {
        if (productos.length === 0) {
            statTotalProductos.textContent = '0';
            statValorInventario.textContent = formatoMoneda(0);
            statBajoStock.textContent = '0';
            statMasValioso.textContent = 'N/A';
            statMasValiosoValor.textContent = 'Valor: ' + formatoMoneda(0);
            statMayorStock.textContent = 'N/A';
            statMayorStockCantidad.textContent = 'Unidades: 0';
            statPrecioPromedio.textContent = formatoMoneda(0);
            return;
        }
        statTotalProductos.textContent = productos.length;
        const valorInventario = productos.reduce((total, p) => total + (p.cantidad * p.precio), 0);
        statValorInventario.textContent = formatoMoneda(valorInventario);
        const bajoStockCount = productos.filter(p => p.cantidad < LIMITE_BAJO_STOCK).length;
        statBajoStock.textContent = bajoStockCount;
        const productoMasValioso = productos.reduce((max, p) => (p.cantidad * p.precio) > (max.cantidad * max.precio) ? p : max, productos[0]);
        statMasValioso.textContent = productoMasValioso.nombre;
        statMasValiosoValor.textContent = 'Valor: ' + formatoMoneda(productoMasValioso.cantidad * productoMasValioso.precio);
        const productoMayorStock = productos.reduce((max, p) => p.cantidad > max.cantidad ? p : max, productos[0]);
        statMayorStock.textContent = productoMayorStock.nombre;
        statMayorStockCantidad.textContent = `Unidades: ${productoMayorStock.cantidad}`;
        const precioPromedio = productos.reduce((sum, p) => sum + p.precio, 0) / productos.length;
        statPrecioPromedio.textContent = formatoMoneda(precioPromedio);
    };

    const renderValorChart = (productos) => {
        const ctx = document.getElementById('valorChart').getContext('2d');
        if (valorChartInstance) {
            valorChartInstance.destroy();
        }
        const productosConValor = productos.map(p => ({ ...p, valorTotal: p.cantidad * p.precio }));
        productosConValor.sort((a, b) => b.valorTotal - a.valorTotal);
        const top5 = productosConValor.slice(0, 5);
        const otrosValor = productosConValor.slice(5).reduce((sum, p) => sum + p.valorTotal, 0);
        const labels = top5.map(p => p.nombre);
        const data = top5.map(p => p.valorTotal);
        if (otrosValor > 0) {
            labels.push('Otros');
            data.push(otrosValor);
        }
        valorChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Valor del Stock',
                    data: data,
                    backgroundColor: ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#6b7280'],
                    borderColor: '#f8fafc',
                    borderWidth: 4,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { padding: 15, font: { family: "'Inter', sans-serif" } } }
                },
                cutout: '60%'
            }
        });
    };

    const renderCantidadChart = (productos) => {
        const ctx = document.getElementById('cantidadChart').getContext('2d');
        if (cantidadChartInstance) {
            cantidadChartInstance.destroy();
        }
        productos.sort((a, b) => b.cantidad - a.cantidad);
        const top5 = productos.slice(0, 5);
        cantidadChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: top5.map(p => p.nombre),
                datasets: [{
                    label: 'Unidades en Stock',
                    data: top5.map(p => p.cantidad),
                    backgroundColor: '#60a5fa',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: { legend: { display: false } },
                scales: { x: { beginAtZero: true, grid: { display: false } }, y: { grid: { display: false } } }
            }
        });
    };

    const cargarTablaProductos = (productos) => {
        tablaProductosBody.innerHTML = '';
        if (productos.length === 0) {
            tablaProductosBody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-slate-500">Aún no hay productos ¡Añade el primero!</td></tr>';
            return;
        }
        productos.forEach(p => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 text-sm font-medium text-slate-800">${p.nombre}</td>
                <td class="px-6 py-4 text-sm text-slate-500">${p.cantidad}</td>
                <td class="px-6 py-4 text-sm text-slate-500">${formatoMoneda(p.precio)}</td>
                <td class="px-6 py-4 text-sm font-medium flex items-center gap-x-4">
                    <button class="btn-editar text-blue-600 hover:text-blue-800" data-id="${p.id}" data-nombre="${p.nombre}" data-cantidad="${p.cantidad}" data-precio="${p.precio}" title="Editar producto"><i data-lucide="square-pen" class="h-5 w-5 pointer-events-none"></i></button>
                    <button class="btn-eliminar text-red-600 hover:text-red-800" data-id="${p.id}" title="Eliminar producto"><i data-lucide="trash-2" class="h-5 w-5 pointer-events-none"></i></button>
                </td>
            `;
            tablaProductosBody.appendChild(row);
        });
        lucide.createIcons();
    };
    
    const cargarTablaBajoStock = (productos) => {
        const productosFiltrados = productos.filter(p => p.cantidad < LIMITE_BAJO_STOCK);
        tablaProductosBajaBody.innerHTML = '';
        if (productosFiltrados.length === 0) {
            tablaProductosBajaBody.innerHTML = '<tr><td colspan="3" class="text-center py-8 text-slate-500">¡Genial! No hay productos con bajo stock.</td></tr>';
            return;
        }
        productosFiltrados.forEach(p => {
            tablaProductosBajaBody.innerHTML += `<tr class="hover:bg-amber-50"><td class="px-6 py-4 text-sm font-medium text-slate-800">${p.nombre}</td><td class="px-6 py-4 text-sm font-bold text-amber-600">${p.cantidad}</td><td class="px-6 py-4 text-sm text-slate-500">${formatoMoneda(p.precio)}</td></tr>`;
        });
    };

    const cambiarModoFormulario = (editar, producto = {}) => {
        modoEdicion = editar;
        if (modoEdicion) {
            inputId.value = producto.id;
            inputNombre.value = producto.nombre;
            inputCantidad.value = producto.cantidad;
            inputPrecio.value = producto.precio;
            btnSubmit.textContent = 'Guardar Cambios';
            btnSubmit.classList.replace('bg-violet-600', 'bg-blue-600');
            btnSubmit.classList.replace('hover:bg-violet-700', 'hover:bg-blue-700');
            btnCancelar.classList.remove('hidden');
            formulario.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            formulario.reset();
            inputId.value = '';
            btnSubmit.textContent = 'Añadir Producto';
            btnSubmit.classList.replace('bg-blue-600', 'bg-violet-600');
            btnSubmit.classList.replace('hover:bg-blue-700', 'hover:bg-violet-700');
            btnCancelar.classList.add('hidden');
        }
    };
    
    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();
        const productoData = {
            nombre: inputNombre.value.trim(),
            cantidad: parseInt(inputCantidad.value, 10),
            precio: parseFloat(inputPrecio.value)
        };
        try {
            let response;
            if (modoEdicion) {
                const id = inputId.value;
                response = await fetch(`${API_URL}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productoData) });
            } else {
                response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productoData) });
            }
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ocurrió un error');
            }
            cambiarModoFormulario(false);
            await inicializarApp(); // Recarga todo para mantener la consistencia
        } catch (error) { 
            console.error('Error al guardar el producto:', error); 
            showToast(`Error al guardar: ${error.message}`);
        }
    });

    tablaProductosBody.addEventListener('click', async (e) => {
        const boton = e.target.closest('button');
        if (!boton) return;
        const id = boton.dataset.id;
        if (boton.classList.contains('btn-editar')) {
            const producto = {
                id: id,
                nombre: boton.dataset.nombre,
                cantidad: parseInt(boton.dataset.cantidad, 10),
                precio: parseFloat(boton.dataset.precio)
            };
            cambiarModoFormulario(true, producto);
        }
        if (boton.classList.contains('btn-eliminar')) {
            if (confirm(`¿Estás segura de que quieres eliminar este producto?`)) {
                try {
                    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                    if (modoEdicion && inputId.value === id) {
                        cambiarModoFormulario(false);
                    }
                    showToast('Producto eliminado.');
                    await inicializarApp();
                } catch (error) { 
                    console.error('Error al eliminar:', error); 
                    showToast('Error al eliminar el producto.');
                }
            }
        }
    });

    btnCancelar.addEventListener('click', () => {
        cambiarModoFormulario(false);
    });

    // --- LÓGICA PARA PROVEEDORES ---

    const cargarTablaProveedores = (proveedores) => {
        tablaProveedoresBody.innerHTML = '';
        if (proveedores.length === 0) {
            tablaProveedoresBody.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-slate-500">Aún no hay proveedores.</td></tr>';
            return;
        }
        proveedores.forEach(p => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 text-sm font-medium text-slate-800">${p.nombre}</td>
                <td class="px-6 py-4 text-sm text-slate-500">${p.telefono || 'N/A'}</td>
                <td class="px-6 py-4 text-sm text-slate-500">${p.email || 'N/A'}</td>
                <td class="px-6 py-4 text-sm font-medium flex items-center gap-x-4">
                    <button class="btn-editar-proveedor text-blue-600 hover:text-blue-800" data-id="${p.id}" data-nombre="${p.nombre}" data-telefono="${p.telefono || ''}" data-email="${p.email || ''}" title="Editar proveedor"><i data-lucide="square-pen" class="h-5 w-5 pointer-events-none"></i></button>
                    <button class="btn-eliminar-proveedor text-red-600 hover:text-red-800" data-id="${p.id}" title="Eliminar proveedor"><i data-lucide="trash-2" class="h-5 w-5 pointer-events-none"></i></button>
                </td>
            `;
            tablaProveedoresBody.appendChild(row);
        });
        lucide.createIcons();
    };

    const cambiarModoFormularioProveedor = (editar, proveedor = {}) => {
        modoEdicionProveedor = editar;
        if (modoEdicionProveedor) {
            inputIdProveedor.value = proveedor.id;
            inputNombreProveedor.value = proveedor.nombre;
            inputTelefonoProveedor.value = proveedor.telefono;
            inputEmailProveedor.value = proveedor.email;
            btnSubmitProveedor.textContent = 'Guardar Cambios';
            btnSubmitProveedor.classList.replace('bg-violet-600', 'bg-blue-600');
            btnCancelarProveedor.classList.remove('hidden');
        } else {
            formularioProveedor.reset();
            inputIdProveedor.value = '';
            btnSubmitProveedor.textContent = 'Añadir Proveedor';
            btnSubmitProveedor.classList.replace('bg-blue-600', 'bg-violet-600');
            btnCancelarProveedor.classList.add('hidden');
        }
    };

    const actualizarProveedores = async () => {
        try {
            const response = await fetch(API_URL_PROVEEDORES);
            if (!response.ok) throw new Error('No se pudieron cargar los proveedores');
            const proveedores = await response.json();
            cargarTablaProveedores(proveedores);
        } catch (error) {
            console.error("Error al actualizar proveedores:", error);
            showToast("Error al cargar los proveedores.");
        }
    };

    // --- EVENTOS PARA PROVEEDORES ---

    formularioProveedor.addEventListener('submit', async (e) => {
        e.preventDefault();
        const proveedorData = {
            nombre: inputNombreProveedor.value.trim(),
            telefono: inputTelefonoProveedor.value.trim(),
            email: inputEmailProveedor.value.trim()
        };

        try {
            let response;
            if (modoEdicionProveedor) {
                const id = inputIdProveedor.value;
                response = await fetch(`${API_URL_PROVEEDORES}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(proveedorData) });
            } else {
                response = await fetch(API_URL_PROVEEDORES, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(proveedorData) });
            }
            if (!response.ok) throw new Error('La respuesta del servidor no fue OK');
            
            showToast(modoEdicionProveedor ? 'Proveedor actualizado.' : 'Proveedor añadido.');
            cambiarModoFormularioProveedor(false);
            await actualizarProveedores();
        } catch (error) {
            console.error('Error al guardar proveedor:', error);
            showToast('Error al guardar el proveedor.');
        }
    });

    tablaProveedoresBody.addEventListener('click', async (e) => {
        const boton = e.target.closest('button');
        if (!boton) return;

        const id = boton.dataset.id;
        if (boton.classList.contains('btn-editar-proveedor')) {
            const proveedor = {
                id: id,
                nombre: boton.dataset.nombre,
                telefono: boton.dataset.telefono,
                email: boton.dataset.email
            };
            cambiarModoFormularioProveedor(true, proveedor);
            formularioProveedor.scrollIntoView({ behavior: 'smooth' });
        }

        if (boton.classList.contains('btn-eliminar-proveedor')) {
            if (confirm('¿Seguro que quieres eliminar este proveedor?')) {
                try {
                    const response = await fetch(`${API_URL_PROVEEDORES}/${id}`, { method: 'DELETE' });
                    if (!response.ok) throw new Error('No se pudo eliminar');
                    showToast('Proveedor eliminado.');
                    await actualizarProveedores();
                } catch (error) {
                    console.error('Error al eliminar proveedor:', error);
                    showToast('Error al eliminar el proveedor.');
                }
            }
        }
    });
    
    btnCancelarProveedor.addEventListener('click', () => {
        cambiarModoFormularioProveedor(false);
    });

    // --- ARRANQUE ---
    showView('dashboard-view');
    inicializarApp();
});