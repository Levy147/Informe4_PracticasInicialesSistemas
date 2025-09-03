const jwt = require('jsonwebtoken');
const { authenticateToken, optionalAuth } = require('../middlewares/auth');
require('./setup'); // Cargar configuración de test

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('authenticateToken', () => {
    it('debería pasar al siguiente middleware con token válido', () => {
      const token = jwt.sign(
        { userId: 1, carnet: '12345', email: 'test@test.com' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      req.headers.authorization = `Bearer ${token}`;

      authenticateToken(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.userId).toBe(1);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('debería fallar sin token de autorización', () => {
      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Token de acceso requerido',
        error: 'TOKEN_MISSING'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('debería fallar con token malformado', () => {
      req.headers.authorization = 'Invalid token format';

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Token inválido o expirado',
        error: 'TOKEN_INVALID'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('debería fallar con token inválido', () => {
      req.headers.authorization = 'Bearer invalid-token';

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Token inválido o expirado',
        error: 'TOKEN_INVALID'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('debería fallar con token expirado', () => {
      const expiredToken = jwt.sign(
        { userId: 1, carnet: '12345', email: 'test@test.com' },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' } // Token expirado
      );

      req.headers.authorization = `Bearer ${expiredToken}`;

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Token inválido o expirado',
        error: 'TOKEN_INVALID'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuth', () => {
    it('debería agregar información del usuario con token válido', () => {
      const token = jwt.sign(
        { userId: 1, carnet: '12345', email: 'test@test.com' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      req.headers.authorization = `Bearer ${token}`;

      optionalAuth(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.userId).toBe(1);
      expect(next).toHaveBeenCalled();
    });

    it('debería continuar sin usuario cuando no hay token', () => {
      optionalAuth(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });

    it('debería continuar sin usuario con token inválido', () => {
      req.headers.authorization = 'Bearer invalid-token';

      optionalAuth(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });

    it('debería continuar sin usuario con token expirado', () => {
      const expiredToken = jwt.sign(
        { userId: 1, carnet: '12345', email: 'test@test.com' },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );

      req.headers.authorization = `Bearer ${expiredToken}`;

      optionalAuth(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });
  });
});
