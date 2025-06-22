document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURACIÓN ---
    const API_URL = 'http://127.0.0.1:5000/api/productos';
    const API_URL_PROVEEDORES = 'http://127.0.0.1:5000/api/proveedores';
    const LIMITE_BAJO_STOCK = 10;
    const MONEDA = 'ARS';

    // --- ESTADO DE LA APLICACIÓN ---
    let modoEdicion = false;
    let modoEdicionProveedor = false;
    let todosLosProveedores = [];
    let todosLosProductos = [];
    let valorChartInstance = null;
    let cantidadChartInstance = null;

    // --- ELEMENTOS DEL DOM ---
    const navLinks = document.querySelectorAll('.nav-link');
    const dashboardView = document.getElementById('dashboard-view');
    const views = ['dashboard-view', 'productos-lista-view', 'productos-agregar-view', 'productos-baja-view', 'gastos-view', 'proveedores-lista-view', 'proveedores-agregar-view', 'facturacion-view', 'notas-view'];
    
    const productosToggle = document.getElementById('productos-toggle');
    const productosSubmenu = document.getElementById('productos-submenu');
    const proveedoresToggle = document.getElementById('proveedores-toggle');
    const proveedoresSubmenu = document.getElementById('proveedores-submenu');
    
    // Productos
    const btnAgregarProductoDesdeLista = document.getElementById('btn-agregar-producto-desde-lista');
    const searchInputProducto = document.getElementById('producto-search');
    const filtroProductos = document.getElementById('producto-filtro');
    const formulario = document.getElementById('formulario-producto');
    const formTitle = document.getElementById('form-title');
    const inputId = document.getElementById('producto-id');
    const inputNombre = document.getElementById('nombre');
    const inputCantidad = document.getElementById('cantidad');
    const inputPrecio = document.getElementById('precio');
    const selectProveedorProducto = document.getElementById('producto-proveedor');
    const btnSubmit = document.getElementById('btn-submit-producto');
    const btnCancelar = document.getElementById('btn-cancelar');
    const tablaProductosBody = document.getElementById('tabla-productos');
    const tablaProductosBajaBody = document.getElementById('tabla-productos-baja');
    
    // Dashboard
    const statTotalProductos = document.getElementById('stat-total-productos');
    const statValorInventario = document.getElementById('stat-valor-inventario');
    const statBajoStock = document.getElementById('stat-bajo-stock');
    const statMasValioso = document.getElementById('stat-mas-valioso');
    const statMasValiosoValor = document.getElementById('stat-mas-valioso-valor');
    const statMayorStock = document.getElementById('stat-mayor-stock');
    const statMayorStockCantidad = document.getElementById('stat-mayor-stock-cantidad');
    const statPrecioPromedio = document.getElementById('stat-precio-promedio');

    // Proveedores
    const proveedorFormTitle = document.getElementById('proveedor-form-title');
    const formularioProveedor = document.getElementById('formulario-proveedor');
    const inputIdProveedor = document.getElementById('proveedor-id');
    const inputNombreProveedor = document.getElementById('proveedor-nombre');
    const inputTelefonoProveedor = document.getElementById('proveedor-telefono');
    const inputEmailProveedor = document.getElementById('proveedor-email');
    const inputTipoProductosProveedor = document.getElementById('proveedor-tipo-productos');
    const selectCalidadProveedor = document.getElementById('proveedor-calidad');
    const inputNotasProveedor = document.getElementById('proveedor-notas');
    const btnSubmitProveedor = document.getElementById('btn-submit-proveedor');
    const btnCancelarProveedor = document.getElementById('btn-cancelar-proveedor');
    const tablaProveedoresBody = document.getElementById('tabla-proveedores');
    const searchInputProveedor = document.getElementById('proveedor-search');

    // --- FUNCIONES UTILITARIAS ---
    const formatoMoneda = (valor) => valor.toLocaleString('es-AR', { style: 'currency', currency: MONEDA });

    const showToast = (message, isError = false) => {
        const toast = document.createElement('div');
        toast.textContent = message;
        const bgColor = isError ? 'bg-red-600' : 'bg-slate-800';
        toast.className = `fixed bottom-5 left-1/2 -translate-x-1/2 ${bgColor} text-white px-5 py-3 rounded-lg shadow-xl transition-all duration-300 opacity-0 transform translate-y-4`;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.remove('opacity-0', 'translate-y-4'), 10);
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-4');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
    };
    
    const esEmailValido = (email) => {
        if (!email) return true;
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    };

    const esTelefonoValido = (telefono) => {
        if (!telefono) return true;
        const numeros = telefono.replace(/[^0-9]/g, '');
        return numeros.length >= 6;
    };

    // --- LÓGICA DE NAVEGACIÓN ---
    const showView = (viewId) => {
        views.forEach(id => document.getElementById(id)?.classList.add('hidden'));
        const viewToShow = document.getElementById(viewId);
        if (viewToShow) viewToShow.classList.remove('hidden');

        document.querySelectorAll('.nav-link').forEach(link => {
            const linkView = link.dataset.view;
            link.classList.toggle('active', linkView === viewId.replace(/-view$/, ''));
        });

        productosToggle.classList.toggle('active', viewId.startsWith('productos-'));
        proveedoresToggle.classList.toggle('active', viewId.startsWith('proveedores-'));
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = link.dataset.view + '-view';
            showView(viewId);
            if (viewId === 'productos-agregar-view') {
                cambiarModoFormulario(false);
            }
            if (viewId === 'proveedores-agregar-view') {
                cambiarModoFormularioProveedor(false);
            }
        });
    });

    // BLOQUE DE CÓDIGO REINCORPORADO
    dashboardView.addEventListener('click', (e) => {
        const targetLink = e.target.closest('[data-view-target]');
        if (targetLink) {
            e.preventDefault();
            const viewId = targetLink.dataset.viewTarget + '-view';
            showView(viewId);
        }
    });

    const toggleSubmenu = (submenu, toggleButton) => {
        const isClosed = !submenu.style.maxHeight || submenu.style.maxHeight === '0px';
        submenu.style.maxHeight = isClosed ? `${submenu.scrollHeight}px` : '0px';
        toggleButton.querySelector('[data-lucide="chevron-down"]').classList.toggle('rotate-180', isClosed);
    };

    productosToggle.addEventListener('click', () => {
        if (!productosToggle.classList.contains('active')) {
            showView('productos-lista-view');
        }
        toggleSubmenu(productosSubmenu, productosToggle);
    });
    
    proveedoresToggle.addEventListener('click', () => {
        if (!proveedoresToggle.classList.contains('active')) {
            showView('proveedores-lista-view');
        }
        toggleSubmenu(proveedoresSubmenu, proveedoresToggle);
    });

    // --- INICIALIZACIÓN Y CARGA DE DATOS ---
    const inicializarApp = async () => {
        try {
            await actualizarProveedores();
            await actualizarProductos();
            lucide.createIcons();
        } catch (error) {
            console.error("Error al inicializar:", error);
            showToast("Error fatal al cargar la aplicación.", true);
        }
    };

    const actualizarProductos = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('No se pudo conectar con la API de productos');
            todosLosProductos = await response.json();
            
            renderizarTablaProductos();
            actualizarDashboard(todosLosProductos);
            cargarTablaBajoStock(todosLosProductos);
            renderValorChart(todosLosProductos);
            renderCantidadChart(todosLosProductos);
        } catch(error) {
            showToast(error.message, true);
        }
    };

    const actualizarProveedores = async () => {
        try {
            const response = await fetch(API_URL_PROVEEDORES);
            if (!response.ok) throw new Error('No se pudieron cargar los proveedores');
            todosLosProveedores = await response.json();
            cargarTablaProveedores(todosLosProveedores);
            popularDropdownProveedores(todosLosProveedores);
        } catch (error) {
            showToast(error.message, true);
        }
    };

    // --- LÓGICA DE PRODUCTOS ---
    const renderizarTablaProductos = () => {
        let productosAMostrar = [...todosLosProductos];
        
        const textoBusqueda = searchInputProducto.value.toLowerCase();
        if (textoBusqueda) {
            productosAMostrar = productosAMostrar.filter(p => 
                p.nombre.toLowerCase().includes(textoBusqueda) ||
                (p.nombre_proveedor && p.nombre_proveedor.toLowerCase().includes(textoBusqueda))
            );
        }

        const tipoFiltro = filtroProductos.value;
        switch(tipoFiltro) {
            case 'price_asc':
                productosAMostrar.sort((a, b) => a.precio - b.precio);
                break;
            case 'price_desc':
                productosAMostrar.sort((a, b) => b.precio - a.precio);
                break;
            case 'name_asc':
                productosAMostrar.sort((a, b) => a.nombre.localeCompare(b.nombre));
                break;
            case 'name_desc':
                productosAMostrar.sort((a, b) => b.nombre.localeCompare(a.nombre));
                break;
            case 'stock_asc':
                productosAMostrar.sort((a, b) => a.cantidad - b.cantidad);
                break;
            case 'stock_desc':
                productosAMostrar.sort((a, b) => b.cantidad - a.cantidad);
                break;
        }
        
        cargarTablaProductos(productosAMostrar);
    };

    const cargarTablaProductos = (productos) => {
        tablaProductosBody.innerHTML = '';
        if (productos.length === 0) {
            tablaProductosBody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-slate-500">No se encontraron productos.</td></tr>';
            return;
        }
        productos.forEach(p => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">${p.nombre}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${p.nombre_proveedor || '<span class="italic text-slate-400">Sin asignar</span>'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${p.cantidad}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${formatoMoneda(p.precio)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="btn-editar-producto text-blue-600 hover:text-blue-800" data-id="${p.id}" title="Editar producto"><i data-lucide="square-pen" class="h-5 w-5 pointer-events-none"></i></button>
                    <button class="btn-eliminar-producto text-red-600 hover:text-red-800 ml-4" data-id="${p.id}" title="Eliminar producto"><i data-lucide="trash-2" class="h-5 w-5 pointer-events-none"></i></button>
                </td>
            `;
            tablaProductosBody.appendChild(row);
        });
        lucide.createIcons();
    };
    
    const cambiarModoFormulario = (editar, producto = {}) => {
        modoEdicion = editar;
        formTitle.textContent = editar ? 'Editar Producto' : 'Agregar Nuevo Producto';
        if (editar) {
            inputId.value = producto.id;
            inputNombre.value = producto.nombre;
            inputCantidad.value = producto.cantidad;
            inputPrecio.value = producto.precio;
            selectProveedorProducto.value = producto.id_proveedor || "";
            btnSubmit.textContent = 'Guardar Cambios';
            btnSubmit.classList.replace('bg-violet-600', 'bg-blue-600');
        } else {
            formulario.reset();
            inputId.value = '';
            selectProveedorProducto.value = '';
            btnSubmit.textContent = 'Añadir Producto';
            btnSubmit.classList.replace('bg-blue-600', 'bg-violet-600');
        }
    };
    
    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();
        const idProveedorSeleccionado = selectProveedorProducto.value;
        const productoData = {
            nombre: inputNombre.value.trim(),
            cantidad: parseInt(inputCantidad.value, 10),
            precio: parseFloat(inputPrecio.value),
            id_proveedor: idProveedorSeleccionado ? parseInt(idProveedorSeleccionado, 10) : null
        };
        
        try {
            const url = modoEdicion ? `${API_URL}/${inputId.value}` : API_URL;
            const method = modoEdicion ? 'PUT' : 'POST';

            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productoData) });

            if (!response.ok) throw new Error((await response.json()).error || 'Ocurrió un error');
            
            const resultData = await response.json();
            showToast(resultData.mensaje);
            await actualizarProductos();
            showView('productos-lista-view');
        } catch (error) { 
            console.error('Error al guardar el producto:', error);
            showToast(`Error al guardar: ${error.message}`, true);
        }
    });

    tablaProductosBody.addEventListener('click', async (e) => {
        const btnEditar = e.target.closest('.btn-editar-producto');
        const btnEliminar = e.target.closest('.btn-eliminar-producto');

        if (btnEditar) {
            const id = btnEditar.dataset.id;
            const productoAEditar = todosLosProductos.find(p => p.id == id);
            if (productoAEditar) {
                cambiarModoFormulario(true, productoAEditar);
                showView('productos-agregar-view');
            }
        }

        if (btnEliminar) {
            const id = btnEliminar.dataset.id;
            if (confirm(`¿Estás segura de que quieres eliminar este producto?`)) {
                try {
                    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                    showToast('Producto eliminado.');
                    await actualizarProductos();
                } catch (error) { 
                    console.error('Error al eliminar:', error);
                    showToast('Error al eliminar el producto.', true);
                }
            }
        }
    });

    btnCancelar.addEventListener('click', () => showView('productos-lista-view'));

    btnAgregarProductoDesdeLista.addEventListener('click', () => {
        cambiarModoFormulario(false);
        showView('productos-agregar-view');
    });

    searchInputProducto.addEventListener('input', renderizarTablaProductos);
    filtroProductos.addEventListener('change', renderizarTablaProductos);

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

    const actualizarDashboard = (productos) => {
        if (!productos || productos.length === 0) {
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
        if (valorChartInstance) valorChartInstance.destroy();
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
                plugins: { legend: { position: 'bottom', labels: { padding: 15, font: { family: "'Inter', sans-serif" } } } },
                cutout: '60%'
            }
        });
    };

    const renderCantidadChart = (productos) => {
        const ctx = document.getElementById('cantidadChart').getContext('2d');
        if (cantidadChartInstance) cantidadChartInstance.destroy();
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

    // --- LÓGICA PARA PROVEEDORES ---
    const popularDropdownProveedores = (proveedores) => {
        selectProveedorProducto.innerHTML = '<option value="">-- Sin Asignar --</option>';
        proveedores.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = p.nombre;
            selectProveedorProducto.appendChild(option);
        });
    };

    const cargarTablaProveedores = (proveedores) => {
        tablaProveedoresBody.innerHTML = '';
        if (proveedores.length === 0) {
            tablaProveedoresBody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-slate-500">No se encontraron proveedores.</td></tr>';
            return;
        }
        proveedores.forEach(p => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">${p.nombre}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${p.tipo_productos || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${p.email || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${p.telefono || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="btn-editar-proveedor text-blue-600 hover:text-blue-800"
                        data-id="${p.id}"
                        title="Editar proveedor"><i data-lucide="square-pen" class="h-5 w-5 pointer-events-none"></i></button>
                    <button class="btn-eliminar-proveedor text-red-600 hover:text-red-800 ml-4" data-id="${p.id}" title="Eliminar proveedor"><i data-lucide="trash-2" class="h-5 w-5 pointer-events-none"></i></button>
                </td>
            `;
            tablaProveedoresBody.appendChild(row);
        });
        lucide.createIcons();
    };

    const cambiarModoFormularioProveedor = (editar, proveedor = {}) => {
        modoEdicionProveedor = editar;
        proveedorFormTitle.textContent = editar ? 'Editar Proveedor' : 'Añadir Nuevo Proveedor';
        if (editar) {
            inputIdProveedor.value = proveedor.id;
            inputNombreProveedor.value = proveedor.nombre;
            inputTelefonoProveedor.value = proveedor.telefono;
            inputEmailProveedor.value = proveedor.email;
            inputTipoProductosProveedor.value = proveedor.tipo_productos;
            selectCalidadProveedor.value = proveedor.calidad_percibida || "";
            inputNotasProveedor.value = proveedor.notas;
            btnSubmitProveedor.textContent = 'Guardar Cambios';
            btnSubmitProveedor.classList.replace('bg-violet-600', 'bg-blue-600');
        } else {
            formularioProveedor.reset();
            inputIdProveedor.value = '';
            btnSubmitProveedor.textContent = 'Añadir Proveedor';
            btnSubmitProveedor.classList.replace('bg-blue-600', 'bg-violet-600');
        }
    };

    formularioProveedor.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = inputNombreProveedor.value.trim();
        const email = inputEmailProveedor.value.trim();
        const telefono = inputTelefonoProveedor.value.trim();

        if (!nombre) return showToast("El nombre del proveedor es obligatorio.", true);
        if (!esEmailValido(email)) return showToast("Por favor, introduce un correo electrónico válido.", true);
        if (!esTelefonoValido(telefono)) return showToast("Por favor, introduce un teléfono válido.", true);

        const proveedorData = {
            nombre, telefono, email,
            tipo_productos: inputTipoProductosProveedor.value.trim(),
            calidad_percibida: selectCalidadProveedor.value,
            notas: inputNotasProveedor.value.trim()
        };

        try {
            const url = modoEdicionProveedor ? `${API_URL_PROVEEDORES}/${inputIdProveedor.value}` : API_URL_PROVEEDORES;
            const method = modoEdicionProveedor ? 'PUT' : 'POST';

            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(proveedorData) });
            
            if (!response.ok) throw new Error((await response.json()).error || 'Ocurrió un error');
            
            const resultData = await response.json();
            showToast(resultData.mensaje);
            await actualizarProveedores();
            showView('proveedores-lista-view');
        } catch (error) {
            console.error('Error al guardar proveedor:', error);
            showToast(`Error al guardar: ${error.message}`, true);
        }
    });

    tablaProveedoresBody.addEventListener('click', async (e) => {
        const btnEditar = e.target.closest('.btn-editar-proveedor');
        const btnEliminar = e.target.closest('.btn-eliminar-proveedor');

        if (btnEditar) {
            const id = btnEditar.dataset.id;
            const proveedorAEditar = todosLosProveedores.find(p => p.id == id);
            if(proveedorAEditar) {
                cambiarModoFormularioProveedor(true, proveedorAEditar);
                showView('proveedores-agregar-view');
            }
        }

        if (btnEliminar) {
            const id = btnEliminar.dataset.id;
            if (confirm('¿Seguro que quieres eliminar este proveedor? Esto lo quitará de todos los productos asignados.')) {
                try {
                    await fetch(`${API_URL_PROVEEDORES}/${id}`, { method: 'DELETE' });
                    showToast('Proveedor eliminado.');
                    await inicializarApp();
                } catch (error) {
                    console.error('Error al eliminar proveedor:', error);
                    showToast('Error al eliminar el proveedor.', true);
                }
            }
        }
    });
    
    btnCancelarProveedor.addEventListener('click', () => showView('proveedores-lista-view'));

    searchInputProveedor.addEventListener('input', (e) => {
        const textoBusqueda = e.target.value.toLowerCase();
        const proveedoresFiltrados = todosLosProveedores.filter(p => 
            p.nombre.toLowerCase().includes(textoBusqueda)
        );
        cargarTablaProveedores(proveedoresFiltrados);
    });

    // --- ARRANQUE ---
    showView('dashboard-view');
    inicializarApp();
});