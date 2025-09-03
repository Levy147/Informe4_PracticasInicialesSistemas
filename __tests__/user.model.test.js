const User = require('../models/User');
require('./setup'); // Cargar configuración de test

describe('User Model', () => {
  beforeEach(() => {
    global.mockPool.execute.mockClear();
  });

  describe('create', () => {
    it('debería crear un usuario exitosamente', async () => {
      global.mockPool.execute.mockResolvedValueOnce([{ insertId: 1 }]);

      const userData = {
        carnet: '12345',
        nombres: 'Juan',
        apellidos: 'Pérez',
        email: 'juan@test.com',
        password: 'password123'
      };

      const userId = await User.create(userData);

      expect(userId).toBe(1);
      expect(global.mockPool.execute).toHaveBeenCalledWith(
        'INSERT INTO usuarios (carnet, nombres, apellidos, email, password) VALUES (?, ?, ?, ?, ?)',
        expect.arrayContaining(['12345', 'Juan', 'Pérez', 'juan@test.com', expect.any(String)])
      );
    });

    it('debería manejar errores durante la creación', async () => {
      global.mockPool.execute.mockRejectedValueOnce(new Error('Database error'));

      const userData = {
        carnet: '12345',
        nombres: 'Juan',
        apellidos: 'Pérez',
        email: 'juan@test.com',
        password: 'password123'
      };

      await expect(User.create(userData)).rejects.toThrow('Database error');
    });
  });

  describe('findByEmail', () => {
    it('debería encontrar un usuario por email', async () => {
      const mockUser = {
        id: 1,
        carnet: '12345',
        nombres: 'Juan',
        apellidos: 'Pérez',
        email: 'juan@test.com'
      };

      global.mockPool.execute.mockResolvedValueOnce([[mockUser]]);

      const user = await User.findByEmail('juan@test.com');

      expect(user).toEqual(mockUser);
      expect(global.mockPool.execute).toHaveBeenCalledWith(
        'SELECT * FROM usuarios WHERE email = ?',
        ['juan@test.com']
      );
    });

    it('debería retornar null si no encuentra el usuario', async () => {
      global.mockPool.execute.mockResolvedValueOnce([[]]);

      const user = await User.findByEmail('noexiste@test.com');

      expect(user).toBeNull();
    });
  });

  describe('findByCarnet', () => {
    it('debería encontrar un usuario por carnet', async () => {
      const mockUser = {
        id: 1,
        carnet: '12345',
        nombres: 'Juan'
      };

      global.mockPool.execute.mockResolvedValueOnce([[mockUser]]);

      const user = await User.findByCarnet('12345');

      expect(user).toEqual(mockUser);
      expect(global.mockPool.execute).toHaveBeenCalledWith(
        'SELECT * FROM usuarios WHERE carnet = ?',
        ['12345']
      );
    });
  });

  describe('findById', () => {
    it('debería encontrar un usuario por ID', async () => {
      const mockUser = {
        id: 1,
        carnet: '12345',
        nombres: 'Juan',
        apellidos: 'Pérez',
        email: 'juan@test.com',
        fecha_creacion: new Date()
      };

      global.mockPool.execute.mockResolvedValueOnce([[mockUser]]);

      const user = await User.findById(1);

      expect(user).toEqual(mockUser);
      expect(global.mockPool.execute).toHaveBeenCalledWith(
        'SELECT id, carnet, nombres, apellidos, email, fecha_creacion FROM usuarios WHERE id = ?',
        [1]
      );
    });
  });

  describe('verifyPassword', () => {
    it('debería verificar correctamente una contraseña válida', async () => {
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await User.verifyPassword('password123', 'hashedpassword');

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');

      bcrypt.compare.mockRestore();
    });

    it('debería retornar false para contraseña incorrecta', async () => {
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const result = await User.verifyPassword('wrongpassword', 'hashedpassword');

      expect(result).toBe(false);

      bcrypt.compare.mockRestore();
    });
  });

  describe('updatePassword', () => {
    it('debería actualizar la contraseña exitosamente', async () => {
      global.mockPool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const result = await User.updatePassword(1, 'newpassword');

      expect(result).toBe(true);
      expect(global.mockPool.execute).toHaveBeenCalledWith(
        'UPDATE usuarios SET password = ? WHERE id = ?',
        [expect.any(String), 1]
      );
    });

    it('debería retornar false si no se actualiza ningún registro', async () => {
      global.mockPool.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const result = await User.updatePassword(999, 'newpassword');

      expect(result).toBe(false);
    });
  });

  describe('findAll', () => {
    it('debería obtener todos los usuarios', async () => {
      const mockUsers = [
        {
          id: 1,
          carnet: '12345',
          nombres: 'Juan',
          apellidos: 'Pérez',
          email: 'juan@test.com',
          fecha_creacion: new Date()
        },
        {
          id: 2,
          carnet: '67890',
          nombres: 'María',
          apellidos: 'García',
          email: 'maria@test.com',
          fecha_creacion: new Date()
        }
      ];

      global.mockPool.execute.mockResolvedValueOnce([mockUsers]);

      const users = await User.findAll();

      expect(users).toEqual(mockUsers);
      expect(users).toHaveLength(2);
      expect(global.mockPool.execute).toHaveBeenCalledWith(
        'SELECT id, carnet, nombres, apellidos, email, fecha_creacion FROM usuarios ORDER BY fecha_creacion DESC'
      );
    });
  });

  describe('update', () => {
    it('debería actualizar un usuario exitosamente', async () => {
      global.mockPool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const updateData = {
        nombres: 'Juan Carlos',
        apellidos: 'Pérez González',
        email: 'juancarlos@test.com'
      };

      const result = await User.update(1, updateData);

      expect(result).toBe(true);
      expect(global.mockPool.execute).toHaveBeenCalledWith(
        'UPDATE usuarios SET nombres = ?, apellidos = ?, email = ? WHERE id = ?',
        ['Juan Carlos', 'Pérez González', 'juancarlos@test.com', 1]
      );
    });
  });

  describe('delete', () => {
    it('debería eliminar un usuario exitosamente', async () => {
      global.mockPool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const result = await User.delete(1);

      expect(result).toBe(true);
      expect(global.mockPool.execute).toHaveBeenCalledWith(
        'DELETE FROM usuarios WHERE id = ?',
        [1]
      );
    });

    it('debería retornar false si no se elimina ningún registro', async () => {
      global.mockPool.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const result = await User.delete(999);

      expect(result).toBe(false);
    });
  });
});
