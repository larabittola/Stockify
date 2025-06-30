// --- MANEJA TODOS LOS EVENT LISTENERS DE LA APLICACIÓN ---
import * as api from './api.js';
import * as ui from './ui.js';

export function inicializarEventos(dom, state) {

    // --- Navegación General ---
    dom.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = link.dataset.view;
            if (view) {
                const viewId = view + '-view';
                ui.showView(viewId, dom);
                if (view === 'productos-agregar') {
                    state.modoEdicion = false;
                    ui.cambiarModoFormularioProducto(false, dom);
                }
                if (view === 'proveedores-agregar') {
                    state.modoEdicionProveedor = false;
                    ui.cambiarModoFormularioProveedor(false, dom);
                }
                 if (view === 'notas-agregar') {
                    state.modoEdicionNota = false;
                    ui.cambiarModoFormularioNota(false, dom);
                }
            }
        });
    });

    dom.dashboardView.addEventListener('click', (e) => {
        const targetLink = e.target.closest('[data-view-target]');
        if (targetLink) {
            e.preventDefault();
            const viewId = targetLink.dataset.viewTarget + '-view';
            ui.showView(viewId, dom);
        }
    });

    dom.productosToggle.addEventListener('click', () => ui.toggleSubmenu(dom.productosSubmenu, dom.productosToggle));
    dom.proveedoresToggle.addEventListener('click', () => ui.toggleSubmenu(dom.proveedoresSubmenu, dom.proveedoresToggle));

    // --- Eventos de Productos ---
    const renderizarProductosFiltrados = () => {
        let productosAMostrar = [...state.todosLosProductos];
        const textoBusqueda = dom.searchInputProducto.value.toLowerCase();
        if (textoBusqueda) {
            productosAMostrar = productosAMostrar.filter(p => 
                p.nombre.toLowerCase().includes(textoBusqueda) ||
                (p.nombre_proveedor && p.nombre_proveedor.toLowerCase().includes(textoBusqueda))
            );
        }
        const tipoFiltro = dom.filtroProductos.value;
        switch(tipoFiltro) {
            case 'price_asc': productosAMostrar.sort((a, b) => a.precio - b.precio); break;
            case 'price_desc': productosAMostrar.sort((a, b) => b.precio - a.precio); break;
            case 'name_asc': productosAMostrar.sort((a, b) => a.nombre.localeCompare(b.nombre)); break;
            case 'name_desc': productosAMostrar.sort((a, b) => b.nombre.localeCompare(a.nombre)); break;
            case 'stock_asc': productosAMostrar.sort((a, b) => a.cantidad - b.cantidad); break;
            case 'stock_desc': productosAMostrar.sort((a, b) => b.cantidad - a.cantidad); break;
        }
        ui.renderizarTablaProductos(productosAMostrar, dom.tablaProductosBody);
    };

    dom.searchInputProducto.addEventListener('input', renderizarProductosFiltrados);
    dom.filtroProductos.addEventListener('change', renderizarProductosFiltrados);

    dom.btnAgregarProductoDesdeLista.addEventListener('click', () => {
        state.modoEdicion = false;
        ui.cambiarModoFormularioProducto(false, dom);
        ui.showView('productos-agregar-view', dom);
    });

    dom.tablaProductosBody.addEventListener('click', async (e) => {
        const btnEditar = e.target.closest('.btn-editar-producto');
        const btnEliminar = e.target.closest('.btn-eliminar-producto');

        if (btnEditar) {
            const productoAEditar = state.todosLosProductos.find(p => p.id == btnEditar.dataset.id);
            if (productoAEditar) {
                state.modoEdicion = true;
                ui.cambiarModoFormularioProducto(true, dom, productoAEditar);
                ui.showView('productos-agregar-view', dom);
            }
        }
        if (btnEliminar) {
            if (confirm('¿Estás segura de que quieres eliminar este producto?')) {
                try {
                    await api.deleteProducto(btnEliminar.dataset.id);
                    ui.showToast('Producto eliminado.');
                    await state.actualizarDatosCompletos();
                } catch (error) { 
                    ui.showToast(error.message, true);
                }
            }
        }
    });

    dom.formularioProducto.addEventListener('submit', async (e) => {
        e.preventDefault();
        const productoData = {
            nombre: dom.inputNombre.value.trim(),
            cantidad: parseInt(dom.inputCantidad.value, 10),
            precio: parseFloat(dom.inputPrecio.value),
            id_proveedor: dom.selectProveedorProducto.value ? parseInt(dom.selectProveedorProducto.value, 10) : null
        };
        try {
            const promise = state.modoEdicion
                ? api.updateProducto(dom.inputId.value, productoData)
                : api.addProducto(productoData);
            
            const result = await promise;
            ui.showToast(result.mensaje);
            await state.actualizarDatosCompletos();
            ui.showView('productos-lista-view', dom);
        } catch (error) { 
            ui.showToast(error.message, true);
        }
    });
    dom.btnCancelar.addEventListener('click', () => ui.showView('productos-lista-view', dom));
    
    // --- Eventos de Proveedores ---
    dom.searchInputProveedor.addEventListener('input', (e) => {
        const textoBusqueda = e.target.value.toLowerCase();
        const proveedoresFiltrados = state.todosLosProveedores.filter(p => p.nombre.toLowerCase().includes(textoBusqueda));
        ui.renderizarTablaProveedores(proveedoresFiltrados, dom.tablaProveedoresBody);
    });

    dom.tablaProveedoresBody.addEventListener('click', async (e) => {
         const btnEditar = e.target.closest('.btn-editar-proveedor');
         const btnEliminar = e.target.closest('.btn-eliminar-proveedor');
         if (btnEditar) {
            const proveedorAEditar = state.todosLosProveedores.find(p => p.id == btnEditar.dataset.id);
            if(proveedorAEditar) {
                state.modoEdicionProveedor = true;
                ui.cambiarModoFormularioProveedor(true, dom, proveedorAEditar);
                ui.showView('proveedores-agregar-view', dom);
            }
         }
         if (btnEliminar) {
            if (confirm('¿Seguro que quieres eliminar este proveedor? Esto lo quitará de todos los productos asignados.')) {
                try {
                    await api.deleteProveedor(btnEliminar.dataset.id);
                    ui.showToast('Proveedor eliminado.');
                    await state.actualizarDatosCompletos();
                } catch (error) {
                    ui.showToast(error.message, true);
                }
            }
         }
    });

    dom.formularioProveedor.addEventListener('submit', async (e) => {
        e.preventDefault();
        const proveedorData = {
            nombre: dom.inputNombreProveedor.value.trim(),
            telefono: dom.inputTelefonoProveedor.value.trim(),
            email: dom.inputEmailProveedor.value.trim(),
            tipo_productos: dom.inputTipoProductosProveedor.value.trim(),
            calidad_percibida: dom.selectCalidadProveedor.value,
            notas: dom.inputNotasProveedor.value.trim()
        };
        try {
            const promise = state.modoEdicionProveedor
                ? api.updateProveedor(dom.inputIdProveedor.value, proveedorData)
                : api.addProveedor(proveedorData);
            const result = await promise;
            ui.showToast(result.mensaje);
            await state.actualizarDatosCompletos();
            ui.showView('proveedores-lista-view', dom);
        } catch (error) {
            ui.showToast(error.message, true);
        }
    });
    dom.btnCancelarProveedor.addEventListener('click', () => ui.showView('proveedores-lista-view', dom));

    // --- Eventos de Notas ---
    dom.btnCrearNota.addEventListener('click', () => {
        state.modoEdicionNota = false;
        ui.cambiarModoFormularioNota(false, dom);
        ui.showView('notas-agregar-view', dom);
    });

    dom.notaColoresContainer.addEventListener('click', (e) => {
        const target = e.target.closest('button[data-color]');
        if (target) {
            state.colorNotaSeleccionado = ui.seleccionarColor(target.dataset.color, dom.notaColoresContainer);
        }
    });
    
    dom.formularioNota.addEventListener('submit', async (e) => {
        e.preventDefault();
        const notaData = {
            titulo: dom.inputNotaTitulo.value.trim(),
            contenido: dom.inputNotaContenido.value.trim(),
            etiquetas: dom.inputNotaEtiquetas.value.trim(),
            importancia: parseInt(dom.selectNotaImportancia.value),
            color: state.colorNotaSeleccionado,
            fijado: dom.checkNotaFijado.checked ? 1 : 0
        };
        try {
            const promise = state.modoEdicionNota
                ? api.updateNota(dom.inputNotaId.value, notaData)
                : api.addNota(notaData);
            const result = await promise;
            ui.showToast(result.mensaje);
            await state.actualizarDatosCompletos();
            ui.showView('notas-lista-view', dom);
        } catch (error) {
            ui.showToast(error.message, true);
        }
    });

    dom.btnCancelarNota.addEventListener('click', () => ui.showView('notas-lista-view', dom));
    
    const manejarClickEnNota = (e) => {
        const btnEditar = e.target.closest('.btn-editar-nota');
        const btnEliminar = e.target.closest('.btn-eliminar-nota');
        const notaCard = e.target.closest('.note-card');

        if (btnEditar) {
            e.stopPropagation();
            const notaAEditar = state.todasLasNotas.find(n => n.id == btnEditar.dataset.id);
            if (notaAEditar) {
                state.modoEdicionNota = true;
                ui.cambiarModoFormularioNota(true, dom, notaAEditar);
                ui.showView('notas-agregar-view', dom);
            }
            return;
        }

        if (btnEliminar) {
            e.stopPropagation();
            if (confirm('¿Estás segura de que quieres eliminar esta nota?')) {
                api.deleteNota(btnEliminar.dataset.id)
                    .then(data => {
                        ui.showToast(data.mensaje);
                        state.actualizarDatosCompletos();
                    })
                    .catch(err => ui.showToast(err.message, true));
            }
            return;
        }

        if (notaCard) {
            const notaAEditar = state.todasLasNotas.find(n => n.id == notaCard.dataset.id);
            if (notaAEditar) {
                state.modoEdicionNota = true;
                ui.cambiarModoFormularioNota(true, dom, notaAEditar);
                ui.showView('notas-agregar-view', dom);
            }
        }
    };
    
    dom.notasGridContainer.addEventListener('click', manejarClickEnNota);
    dom.dashboardNotasContainer.addEventListener('click', manejarClickEnNota);
}