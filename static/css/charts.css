// --- VARIABLES GLOBALES ---
let datosCompletos = [];
let graficoActivo = null;

// --- LÓGICA DE CARGA DE DATOS ---
async function cargarDatos() {
    try {
        const response = await fetch('/static/data/ventas-supermercados-2024-02.csv');
        if (!response.ok) throw new Error('No se pudo encontrar el archivo CSV');
        const textoCsv = await response.text();
        const filas = textoCsv.trim().split('\n').slice(1);
        datosCompletos = filas.map(fila => {
            const v = fila.split(',');
            return {
                indice_tiempo: v[0],
                ventas_precios_corrientes: parseFloat(v[1]) || 0,
                salon_ventas: parseFloat(v[4]) || 0,
                canales_on_line: parseFloat(v[5]) || 0,
                efectivo: parseFloat(v[7]) || 0,
                tarjetas_debito: parseFloat(v[8]) || 0,
                tarjetas_credito: parseFloat(v[9]) || 0,
                otros_medios: parseFloat(v[10]) || 0,
                bebidas: parseFloat(v[13]) || 0,
                almacen: parseFloat(v[14]) || 0,
                panaderia: parseFloat(v[15]) || 0,
                lacteos: parseFloat(v[16]) || 0,
                carnes: parseFloat(v[17]) || 0,
                limpieza: parseFloat(v[20]) || 0
            };
        }).filter(d => d.indice_tiempo);
    } catch (error) {
        console.error("Error al cargar los datos:", error);
    }
}

// --- LÓGICA CENTRAL: DIBUJA EL GRÁFICO SEGÚN LOS FILTROS ---
function actualizarVista() {
    const tipoGrafico = document.getElementById('filtro-grafico').value;
    const anioSeleccionado = document.getElementById('filtro-fecha').value;
    const ctx = document.getElementById('graficoPrincipal')?.getContext('2d');
    if (!ctx) return;

    const datosFiltrados = anioSeleccionado === 'todos' 
        ? datosCompletos 
        : datosCompletos.filter(d => d.indice_tiempo.startsWith(anioSeleccionado));

    if (graficoActivo) {
        graficoActivo.destroy();
    }

    let config;
    switch (tipoGrafico) {
        case 'evolucion':
            config = {
                type: 'line',
                data: {
                    labels: datosFiltrados.map(d => d.indice_tiempo),
                    datasets: [{
                        label: 'Ventas Totales',
                        data: datosFiltrados.map(d => d.ventas_precios_corrientes),
                        borderColor: '#8b5cf6', // violet-500
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        fill: true,
                        tension: 0.3
                    }]
                }
            };
            break;

        case 'tendencia_mensual':
            const ventasMensuales = {};
            datosFiltrados.forEach(d => {
                const mesAnio = d.indice_tiempo.substring(0, 7);
                ventasMensuales[mesAnio] = (ventasMensuales[mesAnio] || 0) + d.ventas_precios_corrientes;
            });
            const mesesOrdenados = Object.keys(ventasMensuales).sort();
            config = {
                type: 'line',
                data: {
                    labels: mesesOrdenados,
                    datasets: [{
                        label: 'Ventas Mensuales',
                        data: mesesOrdenados.map(mes => ventasMensuales[mes]),
                        borderColor: '#4f46e5', // indigo-600
                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        fill: true,
                        tension: 0.3
                    }]
                }
            };
            break;

        case 'categorias':
            const categorias = { 'Almacén': 0, 'Bebidas': 0, 'Carnes': 0, 'Lácteos': 0, 'Panadería': 0, 'Limpieza': 0 };
            datosFiltrados.forEach(d => {
                categorias['Almacén'] += d.almacen;
                categorias['Bebidas'] += d.bebidas;
                categorias['Carnes'] += d.carnes;
                categorias['Lácteos'] += d.lacteos;
                categorias['Panadería'] += d.panaderia;
                categorias['Limpieza'] += d.limpieza;
            });
            config = {
                type: 'bar',
                data: {
                    labels: Object.keys(categorias),
                    datasets: [{
                        label: 'Ventas por Categoría',
                        data: Object.values(categorias),
                        // Paleta de violetas y púrpuras
                        backgroundColor: ['#a855f7', '#9333ea', '#7e22ce', '#6d28d9', '#5b21b6', '#4c1d95']
                    }]
                },
                options: { indexAxis: 'y' }
            };
            break;

        case 'canales':
            const totalSalon = datosFiltrados.reduce((sum, d) => sum + d.salon_ventas, 0);
            const totalOnline = datosFiltrados.reduce((sum, d) => sum + d.canales_on_line, 0);
            config = {
                type: 'doughnut',
                data: {
                    labels: ['Ventas en Locales Físicos', 'Ventas Online'],
                    datasets: [{
                        data: [totalSalon, totalOnline],
                        // Paleta violeta y fucsia
                        backgroundColor: ['#8b5cf6', '#d946ef']
                    }]
                }
            };
            break;

        case 'pagos':
            const pagos = { 'Efectivo': 0, 'T. Débito': 0, 'T. Crédito': 0, 'Otros': 0 };
            datosFiltrados.forEach(d => {
                pagos['Efectivo'] += d.efectivo;
                pagos['T. Débito'] += d.tarjetas_debito;
                pagos['T. Crédito'] += d.tarjetas_credito;
                pagos['Otros'] += d.otros_medios;
            });
            config = {
                type: 'pie',
                data: {
                    labels: Object.keys(pagos),
                    datasets: [{
                        data: Object.values(pagos),
                        // Paleta de violeta, índigo y rosas
                        backgroundColor: ['#a78bfa', '#6366f1', '#f472b6', '#c084fc']
                    }]
                }
            };
            break;
    }

    const finalOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    font: {
                        family: "'Inter', sans-serif"
                    }
                }
            }
        },
        ...config.options
    };

    graficoActivo = new Chart(ctx, {
        type: config.type,
        data: config.data,
        options: finalOptions
    });
}

// --- LÓGICA DE INICIALIZACIÓN ---
function popularFiltroFecha() {
    const filtro = document.getElementById('filtro-fecha');
    if (!filtro) return;
    const anios = [...new Set(datosCompletos.map(d => d.indice_tiempo.substring(0, 4)))];
    filtro.innerHTML = '<option value="todos">Todos los Años</option>';
    anios.sort((a, b) => b - a).forEach(anio => {
        filtro.innerHTML += `<option value="${anio}">${anio}</option>`;
    });
}

export async function inicializarGraficos() {
    await cargarDatos();
    if (datosCompletos.length === 0) return;

    popularFiltroFecha();
    actualizarVista();

    document.getElementById('filtro-grafico')?.addEventListener('change', actualizarVista);
    document.getElementById('filtro-fecha')?.addEventListener('change', actualizarVista);
}