
const path = require('path');
const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración del servidor
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// ==========================================
// SERVICIOS DE RECUPERACIÓN Y VERIFICACIÓN
// ==========================================

// Recuperar usuario
app.post('/api/recuperar-usuario', (req, res) => {
    const { correo } = req.body;

    if (!correo) {
        return res.status(400).json({
            mensaje: 'Debes ingresar un correo electrónico.'
        });
    }

    return res.json({
        mensaje: `Si ${correo} está registrado, enviamos la información de tu usuario.`
    });
});

// Recuperar contraseña
app.post('/api/recuperar-contrasena', (req, res) => {
    const { correo } = req.body;

    if (!correo) {
        return res.status(400).json({
            mensaje: 'Debes ingresar un correo electrónico.'
        });
    }

    return res.json({
        mensaje: `Se enviaron las instrucciones de recuperación a ${correo}.`
    });
});

// Verificar cuenta
app.post('/api/verificar-cuenta', (req, res) => {
    const { correo, codigo } = req.body;

    if (!correo || !codigo) {
        return res.status(400).json({
            mensaje: 'Ingresa el correo y el código de verificación.'
        });
    }

    return res.json({
        mensaje: `Cuenta asociada a ${correo} verificada con el código ${codigo}.`
    });
});

// ==========================================
// API PARA ADMINISTRAR LAS VENTAS
// ==========================================

// Almacenamiento temporal de las ventas
let ventas = [];
let siguienteId = 1;

// Validar los datos recibidos
function datosVentaValidos(datos) {
    if (!datos || typeof datos !== 'object') {
        return false;
    }

    const {
        cliente,
        producto,
        cantidad,
        precioUnitario,
        fecha
    } = datos;

    let fechaValida = false;

    if (
        typeof fecha === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(fecha)
    ) {
        const fechaObjeto = new Date(`${fecha}T00:00:00Z`);

        fechaValida =
            !Number.isNaN(fechaObjeto.getTime()) &&
            fechaObjeto.toISOString().slice(0, 10) === fecha;
    }

    return (
        typeof cliente === 'string' &&
        cliente.trim() !== '' &&
        typeof producto === 'string' &&
        producto.trim() !== '' &&
        Number.isInteger(cantidad) &&
        cantidad > 0 &&
        typeof precioUnitario === 'number' &&
        Number.isFinite(precioUnitario) &&
        precioUnitario > 0 &&
        fechaValida
    );
}

// GET: Consultar todas las ventas
app.get('/api/ventas', (req, res) => {
    res.status(200).json(ventas);
});

// GET: Consultar una venta por su identificador
app.get('/api/ventas/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            mensaje: 'El identificador no es válido.'
        });
    }

    const venta = ventas.find(v => v.id === id);

    if (!venta) {
        return res.status(404).json({
            mensaje: 'No se encontró la venta.'
        });
    }

    return res.status(200).json(venta);
});

// POST: Registrar una nueva venta
app.post('/api/ventas', (req, res) => {
    if (!datosVentaValidos(req.body)) {
        return res.status(400).json({
            mensaje: 'Revise los datos ingresados.'
        });
    }

    const {
        cliente,
        producto,
        cantidad,
        precioUnitario,
        fecha
    } = req.body;

    const nuevaVenta = {
        id: siguienteId++,
        cliente: cliente.trim(),
        producto: producto.trim(),
        cantidad,
        precioUnitario,
        fecha,
        total: cantidad * precioUnitario
    };

    ventas.push(nuevaVenta);

    return res.status(201).json({
        mensaje: 'Venta registrada correctamente.',
        venta: nuevaVenta
    });
});

// PUT: Actualizar una venta
app.put('/api/ventas/:id', (req, res) => {
    const id = Number(req.params.id);

    const indice = ventas.findIndex(v => v.id === id);

    if (indice === -1) {
        return res.status(404).json({
            mensaje: 'No se encontró la venta.'
        });
    }

    if (!datosVentaValidos(req.body)) {
        return res.status(400).json({
            mensaje: 'Los datos ingresados no son válidos.'
        });
    }

    const {
        cliente,
        producto,
        cantidad,
        precioUnitario,
        fecha
    } = req.body;

    ventas[indice] = {
        id,
        cliente: cliente.trim(),
        producto: producto.trim(),
        cantidad,
        precioUnitario,
        fecha,
        total: cantidad * precioUnitario
    };

    return res.status(200).json({
        mensaje: 'Venta actualizada correctamente.',
        venta: ventas[indice]
    });
});

// DELETE: Eliminar una venta
app.delete('/api/ventas/:id', (req, res) => {
    const id = Number(req.params.id);

    const cantidadInicial = ventas.length;

    ventas = ventas.filter(v => v.id !== id);

    if (ventas.length === cantidadInicial) {
        return res.status(404).json({
            mensaje: 'No se encontró la venta.'
        });
    }

    return res.status(200).json({
        mensaje: 'Venta eliminada correctamente.'
    });
});

// ==========================================
// INICIAR EL SERVIDOR
// ==========================================

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
