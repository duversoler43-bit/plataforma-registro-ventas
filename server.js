const path = require('path');
const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/api/recuperar-usuario', (req, res) => {
  const { correo } = req.body;
  if (!correo) {
    return res.status(400).json({ mensaje: 'Debes ingresar un correo electrónico.' });
  }
  return res.json({ mensaje: `Si ${correo} está registrado, enviamos la información de tu usuario.` });
});

app.post('/api/recuperar-contrasena', (req, res) => {
  const { correo } = req.body;
  if (!correo) {
    return res.status(400).json({ mensaje: 'Debes ingresar un correo electrónico.' });
  }
  return res.json({ mensaje: `Se enviaron las instrucciones de recuperación a ${correo}.` });
});

app.post('/api/verificar-cuenta', (req, res) => {
  const { correo, codigo } = req.body;
  if (!correo || !codigo) {
    return res.status(400).json({ mensaje: 'Ingresa el correo y el código de verificación.' });
  }
  return res.json({ mensaje: `Cuenta asociada a ${correo} verificada con el código ${codigo}.` });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

