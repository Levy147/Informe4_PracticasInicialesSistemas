const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Crear un nuevo usuario
  static async create(userData) {
    try {
      const { carnet, nombres, apellidos, email, password } = userData;
      
      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const [result] = await pool.execute(
        'INSERT INTO usuarios (carnet, nombres, apellidos, email, password) VALUES (?, ?, ?, ?, ?)',
        [carnet, nombres, apellidos, email, hashedPassword]
      );
      
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Buscar usuario por email
  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM usuarios WHERE email = ?',
        [email]
      );
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Buscar usuario por carnet
  static async findByCarnet(carnet) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM usuarios WHERE carnet = ?',
        [carnet]
      );
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Buscar usuario por ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT id, carnet, nombres, apellidos, email, fecha_creacion FROM usuarios WHERE id = ?',
        [id]
      );
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Verificar contraseña
  static async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Actualizar contraseña
  static async updatePassword(id, newPassword) {
    try {
      // Hashear la nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      const [result] = await pool.execute(
        'UPDATE usuarios SET password = ? WHERE id = ?',
        [hashedPassword, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Obtener todos los usuarios (sin contraseñas)
  static async findAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT id, carnet, nombres, apellidos, email, fecha_creacion FROM usuarios ORDER BY fecha_creacion DESC'
      );
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar usuario
  static async update(id, updateData) {
    try {
      const { nombres, apellidos, email } = updateData;
      
      const [result] = await pool.execute(
        'UPDATE usuarios SET nombres = ?, apellidos = ?, email = ? WHERE id = ?',
        [nombres, apellidos, email, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar usuario
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM usuarios WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
