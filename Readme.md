# Stockify - Gestor de Inventario Inteligente 🚀

Stockify es una aplicación web full-stack diseñada para simplificar y centralizar la gestión de inventario para PyMEs y emprendedores, transformando datos en decisiones estratégicas.

---

## 📋 Tabla de Contenidos

1.  [Acerca del Proyecto](#acerca-del-proyecto-)
2.  [Funcionalidades Clave](#funcionalidades-clave-)
3.  [Tecnologías Utilizadas](#tecnologías-utilizadas-)
4.  [Cómo Empezar (Instalación)](#cómo-empezar-instalación-)
5.  [Uso de la Aplicación](#uso-de-la-aplicación-)
6.  [Mejoras Futuras](#mejoras-futuras-)
7.  [Licencia](#licencia-)
8.  [Contacto](#contacto-)

---

## 🎯 Acerca del Proyecto

Este proyecto nace para resolver un problema común en pequeños y medianos negocios: la falta de una herramienta sencilla y centralizada para gestionar el inventario. Una mala gestión del stock puede llevar a pérdidas significativas, ya sea por exceso de productos (costos de almacenamiento, obsolescencia) o por quiebre de stock (pérdida de ventas, clientes insatisfechos).

**Stockify** ataca este problema ofreciendo una plataforma web intuitiva donde los usuarios pueden:
* Controlar sus productos y proveedores.
* Visualizar métricas importantes en un dashboard.
* Analizar datos de ventas históricos para tomar decisiones de compra más inteligentes.

Todo esto a través de una interfaz de página única (SPA) rápida y fluida, diseñada para ser accesible sin necesidad de conocimientos técnicos previos.

---

## ✨ Funcionalidades Clave

* **Dashboard Principal:** Vista rápida de métricas clave como valor total del inventario, cantidad de productos y alertas de bajo stock.
* **Gestión de Productos:** Sistema CRUD (Crear, Leer, Actualizar, Borrar) completo para los productos del inventario.
* **Gestión de Proveedores:** Módulo CRUD para registrar y administrar la información de los proveedores.
* **Módulo de Notas:** Un espacio simple para crear, editar y eliminar notas rápidas o recordatorios.
* **Análisis Interactivo de Mercado:**
    * Visualización de gráficos dinámicos generados con Chart.js.
    * Filtro para seleccionar el tipo de análisis (Evolución de ventas, por categoría, etc.).
    * Filtro por año para explorar tendencias en períodos específicos.
* **Navegación Fluida:** Experiencia de Aplicación de Página Única (SPA) que no requiere recargar la página para cambiar de sección.

---

## 💻 Tecnologías Utilizadas

Este proyecto fue construido utilizando un stack full-stack moderno:

**Frontend (Lo que ve el usuario):**
* HTML5
* CSS3
* JavaScript (Vanilla JS, ES6 Modules)
* [Tailwind CSS](https://tailwindcss.com/) - Para el diseño y estilos.
* [Chart.js](https://www.chartjs.org/) - Para la visualización de datos.
* [Lucide Icons](https://lucide.dev/) - Para la iconografía.

**Backend (La lógica del servidor):**
* **Python 3**
* **Flask** - Micro-framework para construir la API REST.
* **Base de Datos:** SQLite

**Arquitectura:**
* Aplicación de Página Única (SPA) con arquitectura Cliente-Servidor.
* Comunicación vía API REST.

---

## 🚀 Cómo Empezar (Instalación)

Para correr este proyecto en tu máquina local, seguí estos simples pasos.

### Prerrequisitos
Asegurate de tener instalado Python 3.
* [Descargar Python](https://www.python.org/downloads/)

### Instalación

1.  **Cloná el repositorio**
    ```sh
    git clone [https://github.com/tu_usuario/tu_repositorio.git](https://github.com/tu_usuario/tu_repositorio.git)
    ```
2.  **Navegá a la carpeta del proyecto**
    ```sh
    cd tu_repositorio
    ```
3.  **Creá y activá un entorno virtual (recomendado)**
    ```sh
    python -m venv venv
    # En Windows:
    venv\Scripts\activate
    # En MacOS/Linux:
    source venv/bin/activate
    ```
4.  **Instalá las dependencias de Python**
    ```sh
    pip install -r requirements.txt
    ```
    *(Nota: Si no tenés un archivo `requirements.txt`, podés crearlo con `pip freeze > requirements.txt` después de instalar flask y flask-cors con `pip install flask flask-cors`)*

5.  **Ejecutá la aplicación**
    ```sh
    python app.py
    ```
    El servidor se iniciará y estará escuchando en `http://127.0.0.1:5000`. La base de datos `inventario.db` se creará automáticamente la primera vez que ejecutes la aplicación.

---

## 📖 Uso de la Aplicación

Una vez que el servidor esté corriendo, simplemente abrí tu navegador y andá a la siguiente dirección:

`http://127.0.0.1:5000`

Desde ahí, podrás navegar por todas las secciones de la aplicación.

---

## 🔮 Mejoras Futuras

El proyecto tiene un gran potencial para crecer. Algunas de las funcionalidades planeadas son:

* **Desarrollo de Módulos Faltantes:** Activar y construir las secciones de "Gastos" y "Facturación".
* **Notificaciones Avanzadas:** Alertas por email para notificar sobre bajo stock.
* **Exportación de Datos:** Funcionalidad para exportar listas de productos o reportes a PDF o CSV.

---

## 📜 Licencia

Distribuido bajo la Licencia MIT. Ver `LICENSE.txt` para más información.

---

## 👤 Contacto

