-- Base de Datos del Sistema Educativo
-- Tablas definidas en español

-- Tabla de usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    carnet VARCHAR(50) UNIQUE NOT NULL COMMENT 'ID académico único del usuario',
    nombres VARCHAR(100) NOT NULL COMMENT 'Nombres del usuario',
    apellidos VARCHAR(100) NOT NULL COMMENT 'Apellidos del usuario',
    email VARCHAR(255) UNIQUE NOT NULL COMMENT 'Correo electrónico del usuario',
    password VARCHAR(255) NOT NULL COMMENT 'Contraseña encriptada del usuario',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación de la cuenta'
);

-- Tabla de profesores (opcional para filtros)
CREATE TABLE profesores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL COMMENT 'Nombre completo del profesor'
);

-- Tabla de cursos (opcional para filtros)
CREATE TABLE cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL COMMENT 'Nombre del curso',
    codigo VARCHAR(20) UNIQUE NOT NULL COMMENT 'Código único del curso'
);

-- Tabla de publicaciones
CREATE TABLE publicaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL COMMENT 'ID del usuario que crea la publicación',
    tipo ENUM('curso', 'profesor') NOT NULL COMMENT 'Tipo de publicación: curso o profesor',
    materia_id INT NOT NULL COMMENT 'ID de la materia (curso o profesor)',
    mensaje TEXT NOT NULL COMMENT 'Contenido de la publicación',
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación de la publicación',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (materia_id) REFERENCES cursos(id) ON DELETE CASCADE
);

-- Tabla de comentarios
CREATE TABLE comentarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    publicacion_id INT NOT NULL COMMENT 'ID de la publicación a la que pertenece',
    usuario_id INT NOT NULL COMMENT 'ID del usuario que escribe el comentario',
    mensaje TEXT NOT NULL COMMENT 'Contenido del comentario',
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación del comentario',
    FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de cursos aprobados por usuario
CREATE TABLE cursos_aprobados (
    usuario_id INT NOT NULL COMMENT 'ID del usuario',
    codigo_curso VARCHAR(20) NOT NULL COMMENT 'Código del curso aprobado',
    nombre_curso VARCHAR(200) NOT NULL COMMENT 'Nombre del curso aprobado',
    creditos INT NOT NULL COMMENT 'Número de créditos del curso',
    PRIMARY KEY (usuario_id, codigo_curso),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Índices para optimizar consultas
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_carnet ON usuarios(carnet);
CREATE INDEX idx_publicaciones_usuario ON publicaciones(usuario_id);
CREATE INDEX idx_publicaciones_tipo ON publicaciones(tipo);
CREATE INDEX idx_publicaciones_materia ON publicaciones(materia_id);
CREATE INDEX idx_comentarios_publicacion ON comentarios(publicacion_id);
CREATE INDEX idx_cursos_codigo ON cursos(codigo);

-- ========================================
-- DATOS DE PRUEBA PARA POBLAR TABLAS
-- ========================================

-- Insertar usuarios de prueba (2-3 usuarios)
INSERT INTO usuarios (carnet, nombres, apellidos, email, password) VALUES
('2021001', 'Juan Carlos', 'Pérez González', 'juan.perez@estudiante.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('2021002', 'María Elena', 'Rodríguez Silva', 'maria.rodriguez@estudiante.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('2021003', 'Carlos Alberto', 'Mendoza Torres', 'carlos.mendoza@estudiante.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Insertar profesores de prueba
INSERT INTO profesores (nombre) VALUES
('Dr. Carlos Mendoza'),
('Ing. Ana Rodríguez'),
('Lic. María González'),
('MSc. Roberto Silva'),
('Dr. Patricia López'),
('Ing. Fernando Torres'),
('Lic. Carmen Vargas'),
('MSc. Diego Herrera');

-- Insertar cursos del área de sistemas
INSERT INTO cursos (nombre, codigo) VALUES
('Introducción a la Programación', 'PROG101'),
('Bases de Datos I', 'BD101'),
('Estructuras de Datos', 'ED101'),
('Programación Orientada a Objetos', 'POO101'),
('Sistemas Operativos', 'SO101'),
('Redes de Computadoras', 'RED101'),
('Ingeniería de Software', 'IS101'),
('Arquitectura de Computadoras', 'ARQ101'),
('Programación Web', 'WEB101'),
('Inteligencia Artificial', 'IA101'),
('Seguridad Informática', 'SEG101'),
('Desarrollo de Aplicaciones Móviles', 'MOB101'),
('Cloud Computing', 'CLOUD101'),
('Machine Learning', 'ML101'),
('DevOps y CI/CD', 'DEVOPS101');

-- Insertar publicaciones de prueba
INSERT INTO publicaciones (usuario_id, tipo, materia_id, mensaje, fecha) VALUES
(1, 'curso', 1, '¿Alguien puede explicarme los conceptos básicos de variables en programación? Estoy teniendo dificultades con el tema.', '2024-01-15 10:30:00'),
(2, 'curso', 2, 'Recomendaciones para estudiar bases de datos. ¿Qué temas son más importantes para el examen?', '2024-01-16 14:20:00'),
(3, 'curso', 3, 'Excelente material sobre listas enlazadas. ¿Alguien tiene ejercicios adicionales para practicar?', '2024-01-17 09:15:00'),
(1, 'curso', 4, '¿Cuál es la mejor manera de entender la herencia en POO? Necesito ejemplos prácticos.', '2024-01-18 16:45:00'),
(2, 'curso', 5, 'Problemas con la instalación de Linux para la clase de Sistemas Operativos. ¿Alguien puede ayudar?', '2024-01-19 11:30:00');

-- Insertar comentarios de prueba
INSERT INTO comentarios (publicacion_id, usuario_id, mensaje, fecha) VALUES
(1, 2, 'Te recomiendo empezar con variables simples como int y string. Una variable es como una caja donde guardas información.', '2024-01-15 11:00:00'),
(1, 3, '¡Exacto! Y recuerda que en programación, las variables deben declararse antes de usarlas.', '2024-01-15 11:30:00'),
(2, 1, 'Para bases de datos, enfócate en SQL básico, normalización y diseño de esquemas.', '2024-01-16 15:00:00'),
(2, 3, 'También es importante entender las relaciones entre tablas y las claves primarias/foráneas.', '2024-01-16 15:30:00'),
(3, 1, '¡Gracias por compartir! Las listas enlazadas son fundamentales para entender estructuras de datos.', '2024-01-17 10:00:00'),
(4, 2, 'La herencia es como una familia. Una clase hija hereda las características de su clase padre.', '2024-01-18 17:15:00'),
(5, 3, 'Para Linux, te recomiendo usar Ubuntu o Linux Mint. Son muy amigables para principiantes.', '2024-01-19 12:00:00');

-- Insertar algunos cursos aprobados de ejemplo
INSERT INTO cursos_aprobados (usuario_id, codigo_curso, nombre_curso, creditos) VALUES
(1, 'PROG101', 'Introducción a la Programación', 4),
(1, 'BD101', 'Bases de Datos I', 4),
(2, 'PROG101', 'Introducción a la Programación', 4),
(2, 'ED101', 'Estructuras de Datos', 4),
(3, 'PROG101', 'Introducción a la Programación', 4),
(3, 'BD101', 'Bases de Datos I', 4),
(3, 'ED101', 'Estructuras de Datos', 4);