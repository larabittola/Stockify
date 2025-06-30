// --- MANEJA TODA LA COMUNICACIÓN CON EL BACKEND ---

const BASE_URL = 'http://127.0.0.1:5000/api';
const API_URL_PRODUCTOS = `${BASE_URL}/productos`;
const API_URL_PROVEEDORES = `${BASE_URL}/proveedores`;
const API_URL_NOTAS = `${BASE_URL}/notas`;

async function handleResponse(response) {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error de red o respuesta no válida' }));
        throw new Error(errorData.error || 'Ocurrió un error desconocido');
    }
    return response.json();
}

const apiRequest = (url, method, data) => {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    if (data) {
        options.body = JSON.stringify(data);
    }
    return fetch(url, options).then(handleResponse);
};

// --- PRODUCTOS ---
export const fetchProductos = () => apiRequest(API_URL_PRODUCTOS, 'GET');
export const addProducto = (data) => apiRequest(API_URL_PRODUCTOS, 'POST', data);
export const updateProducto = (id, data) => apiRequest(`${API_URL_PRODUCTOS}/${id}`, 'PUT', data);
export const deleteProducto = (id) => apiRequest(`${API_URL_PRODUCTOS}/${id}`, 'DELETE');

// --- PROVEEDORES ---
export const fetchProveedores = () => apiRequest(API_URL_PROVEEDORES, 'GET');
export const addProveedor = (data) => apiRequest(API_URL_PROVEEDORES, 'POST', data);
export const updateProveedor = (id, data) => apiRequest(`${API_URL_PROVEEDORES}/${id}`, 'PUT', data);
export const deleteProveedor = (id) => apiRequest(`${API_URL_PROVEEDORES}/${id}`, 'DELETE');

// --- NOTAS ---
export const fetchNotas = () => apiRequest(API_URL_NOTAS, 'GET');
export const addNota = (data) => apiRequest(API_URL_NOTAS, 'POST', data);
export const updateNota = (id, data) => apiRequest(`${API_URL_NOTAS}/${id}`, 'PUT', data);
export const deleteNota = (id) => apiRequest(`${API_URL_NOTAS}/${id}`, 'DELETE');