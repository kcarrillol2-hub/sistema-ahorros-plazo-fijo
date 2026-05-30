const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');

const register = async (req, res) => {
  try {

    const { nombre, correo, password } = req.body;

    const existe = await prisma.usuario.findUnique({
      where: { correo }
    });

    if (existe) {
      return res.status(400).json({
        message: "Correo ya registrado"
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        correo,
        password: hash
      }
    });

    res.status(201).json(usuario);

  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = { register };
const jwt = require('jsonwebtoken');
const login = async (req, res) => {

 const { correo, password } = req.body;

 const usuario = await prisma.usuario.findUnique({
   where: { correo }
 });

 if (!usuario) {
   return res.status(401).json({
      message: "Usuario incorrecto"
   });
 }

 const match = await bcrypt.compare(
   password,
   usuario.password
 );

 if (!match) {
   return res.status(401).json({
      message: "Contraseña incorrecta"
   });
 }

 const token = jwt.sign(
   {
      id: usuario.id,
      correo: usuario.correo
   },
   process.env.JWT_SECRET,
   {
      expiresIn: '1d'
   }
 );

 res.json({ token });

};