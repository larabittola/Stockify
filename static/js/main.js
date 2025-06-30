// --- EL PUNTO DE ENTRADA DE LA APLICACIÓN ---
import * as api from './api.js';
import * as ui from './ui.js';
import { inicializarEventos } from './events.js';
import { inicializarGraficos } from './charts.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- ESTADO GLOBAL DE LA APLICACIÓN ---
    const state = {
        todosLosProductos: [],
        todosLosProveedores: [],
        todasLasNotas: [],
        modoEdicion: false,
        modoEdicionProveedor: false,
        modoEdicionNota: false,
        colorNotaSeleccionado: 'yellow',
        actualizarDatosCompletos: null,
    };

    // --- SELECTORES DEL DOM ---
    const dom = {
        // Vistas
        views: ['dashboard-view', 'powerbi-view', 'productos-lista-view', 'productos-agregar-view', 'productos-baja-view', 'gastos-view', 'proveedores-lista-view', 'proveedores-agregar-view', 'facturacion-view', 'notas-lista-view', 'notas-agregar-view'],
        dashboardView: document.getElementById('dashboard-view'),
        // Navegación
        navLinks: document.querySelectorAll('.nav-link'),
        productosToggle: document.getElementById('productos-toggle'),
        productosSubmenu: document.getElementById('productos-submenu'),
        proveedoresToggle: document.getElementById('proveedores-toggle'),
        proveedoresSubmenu: document.getElementById('proveedores-submenu'),
        // Dashboard Stats
        statTotalProductos: document.getElementById('stat-total-productos'),
        statValorInventario: document.getElementById('stat-valor-inventario'),
        statBajoStock: document.getElementById('stat-bajo-stock'),
        statMasValioso: document.getElementById('stat-mas-valioso'),
        statMasValiosoValor: document.getElementById('stat-mas-valioso-valor'),
        statMayorStock: document.getElementById('stat-mayor-stock'),
        statMayorStockCantidad: document.getElementById('stat-mayor-stock-cantidad'),
        statPrecioPromedio: document.getElementById('stat-precio-promedio'),
        // Productos
        tablaProductosBody: document.getElementById('tabla-productos'),
        tablaProductosBajaBody: document.getElementById('tabla-productos-baja'),
        searchInputProducto: document.getElementById('producto-search'),
        filtroProductos: document.getElementById('producto-filtro'),
        btnAgregarProductoDesdeLista: document.getElementById('btn-agregar-producto-desde-lista'),
        // Formulario Productos
        formularioProducto: document.getElementById('formulario-producto'),
        formTitle: document.getElementById('form-title'),
        inputId: document.getElementById('producto-id'),
        inputNombre: document.getElementById('nombre'),
        inputCantidad: document.getElementById('cantidad'),
        inputPrecio: document.getElementById('precio'),
        selectProveedorProducto: document.getElementById('producto-proveedor'),
        btnSubmit: document.getElementById('btn-submit-producto'),
        btnCancelar: document.getElementById('btn-cancelar'),
        // Proveedores
        tablaProveedoresBody: document.getElementById('tabla-proveedores'),
        searchInputProveedor: document.getElementById('proveedor-search'),
        // Formulario Proveedores
        formularioProveedor: document.getElementById('formulario-proveedor'),
        proveedorFormTitle: document.getElementById('proveedor-form-title'),
        inputIdProveedor: document.getElementById('proveedor-id'),
        inputNombreProveedor: document.getElementById('proveedor-nombre'),
        inputTelefonoProveedor: document.getElementById('proveedor-telefono'),
        inputEmailProveedor: document.getElementById('proveedor-email'),
        inputTipoProductosProveedor: document.getElementById('proveedor-tipo-productos'),
        selectCalidadProveedor: document.getElementById('proveedor-calidad'),
        inputNotasProveedor: document.getElementById('proveedor-notas'),
        btnSubmitProveedor: document.getElementById('btn-submit-proveedor'),
        btnCancelarProveedor: document.getElementById('btn-cancelar-proveedor'),
        // Notas
        dashboardNotasContainer: document.getElementById('dashboard-notas-container'),
        notasGridContainer: document.getElementById('notas-grid-container'),
        btnCrearNota: document.getElementById('btn-crear-nota'),
        // Formulario Notas
        formularioNota: document.getElementById('formulario-nota'),
        notaFormTitle: document.getElementById('nota-form-title'),
        inputNotaId: document.getElementById('nota-id'),
        inputNotaTitulo: document.getElementById('nota-titulo'),
        inputNotaContenido: document.getElementById('nota-contenido'),
        inputNotaEtiquetas: document.getElementById('nota-etiquetas'),
        selectNotaImportancia: document.getElementById('nota-importancia'),
        checkNotaFijado: document.getElementById('nota-fijado'),
        notaColoresContainer: document.getElementById('nota-colores'),
        btnCancelarNota: document.getElementById('btn-cancelar-nota'),
        btnSubmitNota: document.getElementById('btn-submit-nota'),
    };

    // --- Lógica de la Aplicación ---
    async function actualizarDatos() {
        try {
            const [productos, proveedores, notas] = await Promise.all([
                api.fetchProductos(),
                api.fetchProveedores(),
                api.fetchNotas()
            ]);

            state.todosLosProductos = productos;
            state.todosLosProveedores = proveedores;
            state.todasLasNotas = notas;

            // Renderizar todo con los nuevos datos
            ui.renderizarTablaProductos(state.todosLosProductos, dom.tablaProductosBody);
            ui.renderizarTablaBajoStock(state.todosLosProductos, dom.tablaProductosBajaBody);
            ui.actualizarDashboard(state.todosLosProductos, dom);
            ui.renderValorChart(state.todosLosProductos);
            ui.renderCantidadChart(state.todosLosProductos);
            
            ui.popularDropdownProveedores(state.todosLosProveedores, dom.selectProveedorProducto);
            ui.renderizarTablaProveedores(state.todosLosProveedores, dom.tablaProveedoresBody);

            ui.renderizarListaNotas(state.todasLasNotas, dom.notasGridContainer);
            ui.renderizarNotasDashboard(state.todasLasNotas, dom.dashboardNotasContainer);

        } catch (error) {
            console.error("Error al actualizar los datos:", error);
            ui.showToast(error.message, true);
        }
    }

    async function inicializarApp() {
        state.actualizarDatosCompletos = actualizarDatos;
        
        await actualizarDatos(); 
        inicializarEventos(dom, state);
        inicializarGraficos();
        
        ui.showView('dashboard-view', dom);
    }

    // --- Arrancar la aplicación ---
    inicializarApp();
});