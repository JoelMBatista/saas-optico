# SaaS Óptico - MVP

Plataforma B2B integral para la gestión de ópticas.

## Requisitos Previos

Este proyecto utiliza **React + Vite**. Necesitas tener instalado **Node.js** en tu sistema.
[Descargar Node.js](https://nodejs.org/)

## Instalación

1. Abre una terminal en esta carpeta.
2. Instala las dependencias:
   ```bash
   npm install
   ```

## Ejecución

Para iniciar el servidor de desarrollo:
```bash
npm run dev
```

Abre tu navegador en `http://localhost:5173`.

## Módulos Implementados

### 1. Inventario
- Vista de tabla con estado de stock (In Stock, Low Stock, etc.).
- Métricas principales (Total Assets, Low Stock).

### 2. CRM & Rx
- Listado de pacientes.
- Formulario de **Receta Clínica (Rx)** con validación de campos.

### 3. Motor Óptico
- Calculadora de **Transposición** (Esfera, Cilindro, Eje).
- Algoritmo de cálculo implementado en el frontend.

### 4. Automatización
- Dashboard de gestión de flujos (WhatsApp, Email).
- Visualización de estadísticas de envío.

## Tecnologías

- **React.js**: Librería de UI.
- **Vite**: Build tool rápido.
- **Vanilla CSS**: Sistema de diseño personalizado (Variables CSS) basado en "Zendenta" (Image1).
- **Lucide React**: Iconografía moderna.
