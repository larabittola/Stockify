document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURACIÓN ---
    const API_URL = 'http://127.0.0.1:5000/api/productos';
    const API_URL_PROVEEDORES = 'http://127.0.0.1:5000/api/proveedores';
    const API_URL_NOTAS = 'http://127.0.0.1:5000/api/notas';
    const LIMITE_BAJO_STOCK = 10;
    const MONEDA = 'ARS';

    // --- ESTADO DE LA APLICACIÓN ---
    let todosLosProductos = [];
    let todosLosProveedores = [];
    let todasLasNotas = [];
    let modoEdicion = false;
    let modoEdicionProveedor = false;
    let modoEdicionNota = false;
    let colorNotaSeleccionado = 'yellow';
    let valorChartInstance = null;
    let cantidadChartInstance = null;

    // --- ELEMENTOS DEL DOM ---
    const navLinks = document.querySelectorAll('.nav-link');
    const dashboardView = document.getElementById('dashboard-view');
    const views = ['dashboard-view', 'productos-lista-view', 'productos-agregar-view', 'productos-baja-view', 'gastos-view', 'proveedores-lista-view', 'proveedores-agregar-view', 'facturacion-view', 'notas-lista-view', 'notas-agregar-view'];
    
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
    
    // Notas
    const dashboardNotasContainer = document.getElementById('dashboard-notas-container');
    const notasGridContainer = document.getElementById('notas-grid-container');
    const btnCrearNota = document.getElementById('btn-crear-nota');
    const formularioNota = document.getElementById('formulario-nota');
    const notaFormTitle = document.getElementById('nota-form-title');
    const inputNotaId = document.getElementById('nota-id');
    const inputNotaTitulo = document.getElementById('nota-titulo');
    const inputNotaContenido = document.getElementById('nota-contenido');
    const inputNotaEtiquetas = document.getElementById('nota-etiquetas');
    const selectNotaImportancia = document.getElementById('nota-importancia');
    const checkNotaFijado = document.getElementById('nota-fijado');
    const notaColoresContainer = document.getElementById('nota-colores');
    const btnCancelarNota = document.getElementById('btn-cancelar-nota');
    const btnSubmitNota = document.getElementById('btn-submit-nota');

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
            link.classList.toggle('active', link.dataset.view === viewId.replace(/-view$/, ''));
        });
        productosToggle.classList.toggle('active', viewId.startsWith('productos-'));
        proveedoresToggle.classList.toggle('active', viewId.startsWith('proveedores-'));
    };
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = link.dataset.view + '-view';
            showView(viewId);
            if (viewId === 'productos-agregar-view') cambiarModoFormulario(false);
            if (viewId === 'proveedores-agregar-view') cambiarModoFormularioProveedor(false);
            if (viewId === 'notas-agregar-view') cambiarModoFormularioNota(false);
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
    const toggleSubmenu = (submenu, toggleButton) => {
        const isClosed = !submenu.style.maxHeight || submenu.style.maxHeight === '0px';
        submenu.style.maxHeight = isClosed ? `${submenu.scrollHeight}px` : '0px';
        toggleButton.querySelector('[data-lucide="chevron-down"]').classList.toggle('rotate-180', isClosed);
    };
    productosToggle.addEventListener('click', () => {
        if (!productosToggle.classList.contains('active')) showView('productos-lista-view');
        toggleSubmenu(productosSubmenu, productosToggle);
    });
    proveedoresToggle.addEventListener('click', () => {
        if (!proveedoresToggle.classList.contains('active')) showView('proveedores-lista-view');
        toggleSubmenu(proveedoresSubmenu, proveedoresToggle);
    });

    // --- INICIALIZACIÓN Y CARGA DE DATOS ---
    const inicializarApp = async () => {
        try {
            await actualizarProveedores();
            await actualizarProductos();
            await actualizarNotas();
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
    const actualizarNotas = async () => {
        try {
            const response = await fetch(API_URL_NOTAS);
            if (!response.ok) throw new Error('No se pudieron cargar las notas');
            todasLasNotas = await response.json();
            renderizarListaNotas(todasLasNotas);
            renderizarNotasDashboard(todasLasNotas);
        } catch(error) {
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
            case 'price_asc': productosAMostrar.sort((a, b) => a.precio - b.precio); break;
            case 'price_desc': productosAMostrar.sort((a, b) => b.precio - a.precio); break;
            case 'name_asc': productosAMostrar.sort((a, b) => a.nombre.localeCompare(b.nombre)); break;
            case 'name_desc': productosAMostrar.sort((a, b) => b.nombre.localeCompare(a.nombre)); break;
            case 'stock_asc': productosAMostrar.sort((a, b) => a.cantidad - b.cantidad); break;
            case 'stock_desc': productosAMostrar.sort((a, b) => b.cantidad - a.cantidad); break;
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
                </td>`;
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
        const productoData = {
            nombre: inputNombre.value.trim(),
            cantidad: parseInt(inputCantidad.value, 10),
            precio: parseFloat(inputPrecio.value),
            id_proveedor: selectProveedorProducto.value ? parseInt(selectProveedorProducto.value, 10) : null
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
            showToast(`Error al guardar: ${error.message}`, true);
        }
    });
    tablaProductosBody.addEventListener('click', async (e) => {
        const btnEditar = e.target.closest('.btn-editar-producto');
        const btnEliminar = e.target.closest('.btn-eliminar-producto');
        if (btnEditar) {
            const productoAEditar = todosLosProductos.find(p => p.id == btnEditar.dataset.id);
            if (productoAEditar) {
                cambiarModoFormulario(true, productoAEditar);
                showView('productos-agregar-view');
            }
        }
        if (btnEliminar) {
            if (confirm(`¿Estás segura de que quieres eliminar este producto?`)) {
                try {
                    await fetch(`${API_URL}/${btnEliminar.dataset.id}`, { method: 'DELETE' });
                    showToast('Producto eliminado.');
                    await actualizarProductos();
                } catch (error) { 
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

    // --- LÓGICA DEL DASHBOARD ---
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
        const canvas = document.getElementById('valorChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
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
        valorChartInstance = new Chart(ctx, { type: 'doughnut', data: { labels, datasets: [{ label: 'Valor del Stock', data, backgroundColor: ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#6b7280'], borderColor: '#f8fafc', borderWidth: 4, hoverOffset: 8 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 15, font: { family: "'Inter', sans-serif" } } } }, cutout: '60%' } });
    };
    const renderCantidadChart = (productos) => {
        const canvas = document.getElementById('cantidadChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (cantidadChartInstance) cantidadChartInstance.destroy();
        productos.sort((a, b) => b.cantidad - a.cantidad);
        const top5 = productos.slice(0, 5);
        cantidadChartInstance = new Chart(ctx, { type: 'bar', data: { labels: top5.map(p => p.nombre), datasets: [{ label: 'Unidades en Stock', data: top5.map(p => p.cantidad), backgroundColor: '#60a5fa', borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, grid: { display: false } }, y: { grid: { display: false } } } } });
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
                    <button class="btn-editar-proveedor text-blue-600 hover:text-blue-800" data-id="${p.id}" title="Editar proveedor"><i data-lucide="square-pen" class="h-5 w-5 pointer-events-none"></i></button>
                    <button class="btn-eliminar-proveedor text-red-600 hover:text-red-800 ml-4" data-id="${p.id}" title="Eliminar proveedor"><i data-lucide="trash-2" class="h-5 w-5 pointer-events-none"></i></button>
                </td>`;
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
        const proveedorData = { nombre, telefono, email, tipo_productos: inputTipoProductosProveedor.value.trim(), calidad_percibida: selectCalidadProveedor.value, notas: inputNotasProveedor.value.trim() };
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
            showToast(`Error al guardar: ${error.message}`, true);
        }
    });
    tablaProveedoresBody.addEventListener('click', async (e) => {
        const btnEditar = e.target.closest('.btn-editar-proveedor');
        const btnEliminar = e.target.closest('.btn-eliminar-proveedor');
        if (btnEditar) {
            const proveedorAEditar = todosLosProveedores.find(p => p.id == btnEditar.dataset.id);
            if(proveedorAEditar) {
                cambiarModoFormularioProveedor(true, proveedorAEditar);
                showView('proveedores-agregar-view');
            }
        }
        if (btnEliminar) {
            if (confirm('¿Seguro que quieres eliminar este proveedor? Esto lo quitará de todos los productos asignados.')) {
                try {
                    await fetch(`${API_URL_PROVEEDORES}/${btnEliminar.dataset.id}`, { method: 'DELETE' });
                    showToast('Proveedor eliminado.');
                    await inicializarApp();
                } catch (error) {
                    showToast('Error al eliminar el proveedor.', true);
                }
            }
        }
    });
    btnCancelarProveedor.addEventListener('click', () => showView('proveedores-lista-view'));
    searchInputProveedor.addEventListener('input', (e) => {
        const textoBusqueda = e.target.value.toLowerCase();
        const proveedoresFiltrados = todosLosProveedores.filter(p => p.nombre.toLowerCase().includes(textoBusqueda));
        cargarTablaProveedores(proveedoresFiltrados);
    });
    
    // --- LÓGICA PARA NOTAS ---
    const renderizarListaNotas = (notas) => {
        notasGridContainer.innerHTML = '';
        if (notas.length === 0) {
            notasGridContainer.innerHTML = '<p class="text-slate-500 col-span-full text-center py-10">Todavía no creaste ninguna nota. ¡Animate a crear la primera!</p>';
            return;
        }
        notas.forEach(nota => {
            const notaCard = document.createElement('div');
            const etiquetasHTML = nota.etiquetas ? nota.etiquetas.split(',').map(tag => `<span class="note-tag tag-color-${nota.color}">${tag.trim()}</span>`).join('') : '';
            notaCard.className = `note-card note-color-${nota.color}`;
            notaCard.dataset.id = nota.id;
            notaCard.innerHTML = `
                <div class="flex-grow pointer-events-none">
                    <div class="flex justify-between items-start">
                        <h4 class="font-bold text-slate-800">${nota.titulo}</h4>
                        ${nota.fijado ? '<i data-lucide="pin" class="h-4 w-4 text-slate-500"></i>' : ''}
                    </div>
                    <p class="text-sm text-slate-600 mt-2 note-content-preview">${nota.contenido}</p>
                </div>
                <div class="mt-4 pt-3 border-t border-black border-opacity-10">
                    <div class="flex flex-wrap mb-2 min-h-[1.5rem] pointer-events-none">${etiquetasHTML}</div>
                    <div class="flex justify-between items-center text-xs text-slate-500">
                        <span class="pointer-events-none">${new Date(nota.fecha_creacion).toLocaleDateString()}</span>
                        <div>
                            <button class="btn-editar-nota p-1 hover:text-blue-600" data-id="${nota.id}"><i data-lucide="edit" class="h-4 w-4"></i></button>
                            <button class="btn-eliminar-nota p-1 hover:text-red-600" data-id="${nota.id}"><i data-lucide="trash" class="h-4 w-4"></i></button>
                        </div>
                    </div>
                </div>`;
            notasGridContainer.appendChild(notaCard);
        });
        lucide.createIcons();
    };
    
    const renderizarNotasDashboard = (notas) => {
        dashboardNotasContainer.innerHTML = '';
        const notasFijadas = notas.filter(n => n.fijado === 1).slice(0, 4);
        if (notasFijadas.length === 0) {
            dashboardNotasContainer.innerHTML = '<div class="flex flex-col items-center justify-center h-full text-center"><i data-lucide="pin-off" class="h-8 w-8 text-slate-300"></i><p class="text-sm text-slate-400 mt-2">No hay notas fijadas.</p></div>';
            lucide.createIcons();
            return;
        }
        notasFijadas.forEach(nota => {
            const notaDiv = document.createElement('div');
            notaDiv.className = `note-card note-color-${nota.color} text-sm cursor-pointer`;
            notaDiv.dataset.id = nota.id;
            notaDiv.innerHTML = `
                <p class="font-semibold text-slate-800">${nota.titulo}</p>
                <p class="text-slate-600 mt-1 dashboard-note-preview">${nota.contenido}</p>
            `;
            dashboardNotasContainer.appendChild(notaDiv);
        });
    };

    dashboardNotasContainer.addEventListener('click', (e) => {
        const notaCard = e.target.closest('.note-card');
        if (notaCard) {
            const id = notaCard.dataset.id;
            const notaAEditar = todasLasNotas.find(n => n.id == id);
            if (notaAEditar) {
                cambiarModoFormularioNota(true, notaAEditar);
                showView('notas-agregar-view');
            }
        }
    });

    const cambiarModoFormularioNota = (editar, nota = {}) => {
        modoEdicionNota = editar;
        formularioNota.reset();
        notaFormTitle.textContent = editar ? 'Editar Nota' : 'Crear Nueva Nota';
        btnSubmitNota.textContent = editar ? 'Guardar Cambios' : 'Crear Nota';
        if (editar) {
            inputNotaId.value = nota.id;
            inputNotaTitulo.value = nota.titulo;
            inputNotaContenido.value = nota.contenido;
            inputNotaEtiquetas.value = nota.etiquetas;
            selectNotaImportancia.value = nota.importancia;
            checkNotaFijado.checked = nota.fijado === 1;
            seleccionarColor(nota.color || 'yellow');
        } else {
            inputNotaId.value = '';
            seleccionarColor('yellow');
        }
    };

    const seleccionarColor = (color) => {
        colorNotaSeleccionado = color;
        notaColoresContainer.querySelectorAll('button').forEach(btn => {
            btn.classList.toggle('ring-2', btn.dataset.color === color);
            btn.classList.toggle('ring-offset-2', btn.dataset.color === color);
            btn.classList.toggle('ring-violet-500', btn.dataset.color === color);
        });
    };
    
    notaColoresContainer.addEventListener('click', (e) => {
        const target = e.target.closest('button[data-color]');
        if (target) {
            seleccionarColor(target.dataset.color);
        }
    });

    btnCrearNota.addEventListener('click', () => {
        cambiarModoFormularioNota(false);
        showView('notas-agregar-view');
    });
    
    btnCancelarNota.addEventListener('click', () => showView('notas-lista-view'));

    formularioNota.addEventListener('submit', async (e) => {
        e.preventDefault();
        const notaData = {
            titulo: inputNotaTitulo.value.trim(),
            contenido: inputNotaContenido.value.trim(),
            etiquetas: inputNotaEtiquetas.value.trim(),
            importancia: parseInt(selectNotaImportancia.value),
            color: colorNotaSeleccionado,
            fijado: checkNotaFijado.checked ? 1 : 0
        };
        const id = inputNotaId.value;
        const url = modoEdicionNota ? `${API_URL_NOTAS}/${id}` : API_URL_NOTAS;
        const method = modoEdicionNota ? 'PUT' : 'POST';
        try {
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(notaData) });
            if (!response.ok) throw new Error((await response.json()).error || 'Ocurrió un error');
            const result = await response.json();
            showToast(result.mensaje);
            await actualizarNotas();
            showView('notas-lista-view');
        } catch (error) {
            showToast(`Error: ${error.message}`, true);
        }
    });

    notasGridContainer.addEventListener('click', (e) => {
        const target = e.target;
        const btnEditar = target.closest('.btn-editar-nota');
        const btnEliminar = target.closest('.btn-eliminar-nota');
        const notaCard = target.closest('.note-card');
        if (btnEditar) {
            e.stopPropagation();
            const id = btnEditar.dataset.id;
            const notaAEditar = todasLasNotas.find(n => n.id == id);
            if (notaAEditar) {
                cambiarModoFormularioNota(true, notaAEditar);
                showView('notas-agregar-view');
            }
            return;
        }
        if (btnEliminar) {
            e.stopPropagation();
            const id = btnEliminar.dataset.id;
            if (confirm('¿Estás segura de que quieres eliminar esta nota?')) {
                fetch(`${API_URL_NOTAS}/${id}`, { method: 'DELETE' })
                    .then(res => { if (!res.ok) throw new Error('No se pudo eliminar'); return res.json(); })
                    .then(data => { showToast(data.mensaje); actualizarNotas(); })
                    .catch(err => showToast(err.message, true));
            }
            return;
        }
        if (notaCard) {
            const id = notaCard.dataset.id;
            const notaAEditar = todasLasNotas.find(n => n.id == id);
            if (notaAEditar) {
                cambiarModoFormularioNota(true, notaAEditar);
                showView('notas-agregar-view');
            }
        }
    });

    // --- ARRANQUE ---
    showView('dashboard-view');
    inicializarApp();
});