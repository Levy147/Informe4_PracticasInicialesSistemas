// Configuración global para los tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';

// Mock de la base de datos para evitar conexiones reales durante tests
const mockPool = {
  execute: jest.fn(),
  end: jest.fn()
};

// Mock de la configuración de la base de datos
jest.mock('../config/database', () => ({
  pool: mockPool
}));

// Exportar el mock para uso en tests
global.mockPool = mockPool;

// Limpiar mocks después de cada test
afterEach(() => {
  jest.clearAllMocks();
});
