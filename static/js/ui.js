// --- MANEJA TODA LA MANIPULACIÓN DEL DOM Y RENDERIZADO DE LA UI ---

export const MONEDA = 'ARS';
export const LIMITE_BAJO_STOCK = 10;
let valorChartInstance = null;
let cantidadChartInstance = null;

// --- Funciones Utilitarias de UI ---
export const formatoMoneda = (valor) => valor.toLocaleString('es-AR', { style: 'currency', currency: MONEDA });

export function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.textContent = message;
    const bgColor = isError ? 'bg-red-600' : 'bg-slate-800';
    toast.className = `fixed bottom-5 left-1/2 -translate-x-1/2 ${bgColor} text-white px-5 py-3 rounded-lg shadow-xl transition-all duration-300 opacity-0 transform translate-y-4 z-50`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.remove('opacity-0', 'translate-y-4'), 10);
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-4');
        toast.addEventListener('transitionend', () => toast.remove());
    }, 3000);
}

export function showView(viewId, dom) {
    dom.views.forEach(id => document.getElementById(id)?.classList.add('hidden'));
    const viewToShow = document.getElementById(viewId);
    if (viewToShow) viewToShow.classList.remove('hidden');

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.view === viewId.replace(/-view$/, ''));
    });
    
    dom.productosToggle.classList.toggle('active', viewId.startsWith('productos-'));
    dom.proveedoresToggle.classList.toggle('active', viewId.startsWith('proveedores-'));
}

export function toggleSubmenu(submenu, toggleButton) {
    const isClosed = !submenu.style.maxHeight || submenu.style.maxHeight === '0px';
    submenu.style.maxHeight = isClosed ? `${submenu.scrollHeight}px` : '0px';
    toggleButton.querySelector('[data-lucide="chevron-down"]').classList.toggle('rotate-180', isClosed);
}


// --- Renderizado de Tablas ---
export function renderizarTablaProductos(productos, tablaBody) {
    tablaBody.innerHTML = '';
    if (productos.length === 0) {
        tablaBody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-slate-500">No se encontraron productos.</td></tr>';
        return;
    }
    productos.forEach(p => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-slate-50';
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">${p.nombre}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${p.nombre_proveedor || '<span class="italic text-slate-400">Sin asignar</span>'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${p.cantidad}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${formatoMoneda(p.precio)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button aria-label="Editar producto" class="btn-editar-producto text-blue-600 hover:text-blue-800" data-id="${p.id}" title="Editar producto"><i data-lucide="square-pen" class="h-5 w-5 pointer-events-none"></i></button>
                <button aria-label="Eliminar producto" class="btn-eliminar-producto text-red-600 hover:text-red-800 ml-4" data-id="${p.id}" title="Eliminar producto"><i data-lucide="trash-2" class="h-5 w-5 pointer-events-none"></i></button>
            </td>`;
        tablaBody.appendChild(row);
    });
    lucide.createIcons();
}

export function renderizarTablaBajoStock(productos, tablaBody) {
    const productosFiltrados = productos.filter(p => p.cantidad < LIMITE_BAJO_STOCK);
    tablaBody.innerHTML = '';
    if (productosFiltrados.length === 0) {
        tablaBody.innerHTML = '<tr><td colspan="3" class="text-center py-8 text-slate-500">¡Genial! No hay productos con bajo stock.</td></tr>';
        return;
    }
    productosFiltrados.forEach(p => {
        tablaBody.innerHTML += `<tr class="hover:bg-amber-50"><td class="px-6 py-4 text-sm font-medium text-slate-800">${p.nombre}</td><td class="px-6 py-4 text-sm font-bold text-amber-600">${p.cantidad}</td><td class="px-6 py-4 text-sm text-slate-500">${formatoMoneda(p.precio)}</td></tr>`;
    });
}

export function renderizarTablaProveedores(proveedores, tablaBody) {
    tablaBody.innerHTML = '';
    if (proveedores.length === 0) {
        tablaBody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-slate-500">No se encontraron proveedores.</td></tr>';
        return;
    }
    proveedores.forEach(p => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-slate-50';
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">${p.nombre}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${p.tipo_productos || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${p.email || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${p.telefono || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button aria-label="Editar proveedor" class="btn-editar-proveedor text-blue-600 hover:text-blue-800" data-id="${p.id}" title="Editar proveedor"><i data-lucide="square-pen" class="h-5 w-5 pointer-events-none"></i></button>
                <button aria-label="Eliminar proveedor" class="btn-eliminar-proveedor text-red-600 hover:text-red-800 ml-4" data-id="${p.id}" title="Eliminar proveedor"><i data-lucide="trash-2" class="h-5 w-5 pointer-events-none"></i></button>
            </td>`;
        tablaBody.appendChild(row);
    });
    lucide.createIcons();
}

// --- Formularios ---
export function cambiarModoFormularioProducto(editar, dom, producto = {}) {
    dom.formularioProducto.reset();
    dom.formTitle.textContent = editar ? 'Editar Producto' : 'Agregar Nuevo Producto';
    if (editar) {
        dom.inputId.value = producto.id;
        dom.inputNombre.value = producto.nombre;
        dom.inputCantidad.value = producto.cantidad;
        dom.inputPrecio.value = producto.precio;
        dom.selectProveedorProducto.value = producto.id_proveedor || "";
        dom.btnSubmit.textContent = 'Guardar Cambios';
    } else {
        dom.inputId.value = '';
        dom.btnSubmit.textContent = 'Añadir Producto';
    }
}

export function cambiarModoFormularioProveedor(editar, dom, proveedor = {}) {
    dom.formularioProveedor.reset();
    dom.proveedorFormTitle.textContent = editar ? 'Editar Proveedor' : 'Añadir Nuevo Proveedor';
    if (editar) {
        dom.inputIdProveedor.value = proveedor.id;
        dom.inputNombreProveedor.value = proveedor.nombre;
        dom.inputTelefonoProveedor.value = proveedor.telefono;
        dom.inputEmailProveedor.value = proveedor.email;
        dom.inputTipoProductosProveedor.value = proveedor.tipo_productos;
        dom.selectCalidadProveedor.value = proveedor.calidad_percibida || "";
        dom.inputNotasProveedor.value = proveedor.notas;
        dom.btnSubmitProveedor.textContent = 'Guardar Cambios';
    } else {
        dom.inputIdProveedor.value = '';
        dom.btnSubmitProveedor.textContent = 'Añadir Proveedor';
    }
}

export function cambiarModoFormularioNota(editar, dom, nota = {}) {
    dom.formularioNota.reset();
    dom.notaFormTitle.textContent = editar ? 'Editar Nota' : 'Crear Nueva Nota';
    dom.btnSubmitNota.textContent = editar ? 'Guardar Cambios' : 'Crear Nota';
    if (editar) {
        dom.inputNotaId.value = nota.id;
        dom.inputNotaTitulo.value = nota.titulo;
        dom.inputNotaContenido.value = nota.contenido;
        dom.inputNotaEtiquetas.value = nota.etiquetas;
        dom.selectNotaImportancia.value = nota.importancia;
        dom.checkNotaFijado.checked = nota.fijado === 1;
        seleccionarColor(nota.color || 'yellow', dom.notaColoresContainer);
    } else {
        dom.inputNotaId.value = '';
        seleccionarColor('yellow', dom.notaColoresContainer);
    }
}

export function seleccionarColor(color, container) {
    container.querySelectorAll('button').forEach(btn => {
        const isSelected = btn.dataset.color === color;
        btn.classList.toggle('ring-2', isSelected);
        btn.classList.toggle('ring-offset-2', isSelected);
        btn.classList.toggle('ring-violet-500', isSelected);
    });
    return color;
}


// --- Dashboard ---
export function actualizarDashboard(productos, dom) {
    if (!productos || productos.length === 0) {
        dom.statTotalProductos.textContent = '0';
        dom.statValorInventario.textContent = formatoMoneda(0);
        dom.statBajoStock.textContent = '0';
        dom.statMasValioso.textContent = 'N/A';
        dom.statMasValiosoValor.textContent = 'Valor: ' + formatoMoneda(0);
        dom.statMayorStock.textContent = 'N/A';
        dom.statMayorStockCantidad.textContent = 'Unidades: 0';
        dom.statPrecioPromedio.textContent = formatoMoneda(0);
        return;
    }

    dom.statTotalProductos.textContent = productos.length;
    const valorInventario = productos.reduce((total, p) => total + (p.cantidad * p.precio), 0);
    dom.statValorInventario.textContent = formatoMoneda(valorInventario);
    const bajoStockCount = productos.filter(p => p.cantidad < LIMITE_BAJO_STOCK).length;
    dom.statBajoStock.textContent = bajoStockCount;
    const productoMasValioso = productos.reduce((max, p) => (p.cantidad * p.precio) > (max.cantidad * max.precio) ? p : max, productos[0]);
    dom.statMasValioso.textContent = productoMasValioso.nombre;
    dom.statMasValiosoValor.textContent = 'Valor: ' + formatoMoneda(productoMasValioso.cantidad * productoMasValioso.precio);
    const productoMayorStock = productos.reduce((max, p) => p.cantidad > max.cantidad ? p : max, productos[0]);
    dom.statMayorStock.textContent = productoMayorStock.nombre;
    dom.statMayorStockCantidad.textContent = `Unidades: ${productoMayorStock.cantidad}`;
    const precioPromedio = productos.reduce((sum, p) => sum + p.precio, 0) / productos.length;
    dom.statPrecioPromedio.textContent = formatoMoneda(precioPromedio);
}

export function renderValorChart(productos) {
    const canvas = document.getElementById('valorChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (valorChartInstance) valorChartInstance.destroy();
    
    if (productos.length === 0) return;

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
}

export function renderCantidadChart(productos) {
    const canvas = document.getElementById('cantidadChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (cantidadChartInstance) cantidadChartInstance.destroy();

    if (productos.length === 0) return;

    productos.sort((a, b) => b.cantidad - a.cantidad);
    const top5 = productos.slice(0, 5);
    cantidadChartInstance = new Chart(ctx, { type: 'bar', data: { labels: top5.map(p => p.nombre), datasets: [{ label: 'Unidades en Stock', data: top5.map(p => p.cantidad), backgroundColor: '#60a5fa', borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, grid: { display: false } }, y: { grid: { display: false } } } } });
}

// --- Proveedores ---
export function popularDropdownProveedores(proveedores, selectElement) {
    selectElement.innerHTML = '<option value="">-- Sin Asignar --</option>';
    proveedores.forEach(p => {
        const option = document.createElement('option');
        option.value = p.id;
        option.textContent = p.nombre;
        selectElement.appendChild(option);
    });
}

// --- Notas ---
export function renderizarListaNotas(notas, container) {
    container.innerHTML = '';
    if (notas.length === 0) {
        container.innerHTML = '<p class="text-slate-500 col-span-full text-center py-10">Todavía no creaste ninguna nota. ¡Animate a crear la primera!</p>';
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
                        <button aria-label="Editar nota" class="btn-editar-nota p-1 hover:text-blue-600" data-id="${nota.id}"><i data-lucide="edit" class="h-4 w-4"></i></button>
                        <button aria-label="Eliminar nota" class="btn-eliminar-nota p-1 hover:text-red-600" data-id="${nota.id}"><i data-lucide="trash" class="h-4 w-4"></i></button>
                    </div>
                </div>
            </div>`;
        container.appendChild(notaCard);
    });
    lucide.createIcons();
}

export function renderizarNotasDashboard(notas, container) {
    container.innerHTML = '';
    const notasFijadas = notas.filter(n => n.fijado === 1).slice(0, 4);
    if (notasFijadas.length === 0) {
        container.innerHTML = '<div class="flex flex-col items-center justify-center h-full text-center"><i data-lucide="pin-off" class="h-8 w-8 text-slate-300"></i><p class="text-sm text-slate-400 mt-2">No hay notas fijadas.</p></div>';
        lucide.createIcons();
        return;
    }
    notasFijadas.forEach(nota => {
        const notaDiv = document.createElement('div');
        notaDiv.className = `note-card note-color-${nota.color} text-sm cursor-pointer`;
        notaDiv.dataset.id = nota.id;
        notaDiv.innerHTML = `
            <p class="font-semibold text-slate-800">${nota.titulo}</p>
            <p class="text-slate-600 mt-1 dashboard-note-preview">${nota.contenido}</p>`;
        container.appendChild(notaDiv);
    });
}