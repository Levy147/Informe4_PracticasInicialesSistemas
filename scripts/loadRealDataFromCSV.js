const mysql = require('mysql2/promise');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config();

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sistema_educativo',
  port: process.env.DB_PORT || 3306
};

async function loadRealDataFromCSV() {
  let connection;
  
  try {
    console.log('🔄 Conectando a la base de datos...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('🗑️ Limpiando datos de prueba existentes...');
    
    // Limpiar datos existentes (manteniendo la estructura)
    await connection.execute('DELETE FROM comentarios');
    await connection.execute('DELETE FROM publicaciones');
    await connection.execute('DELETE FROM cursos_aprobados');
    await connection.execute('DELETE FROM cursos');
    await connection.execute('DELETE FROM profesores');
    await connection.execute('DELETE FROM usuarios WHERE id > 0'); // Eliminar todos los usuarios
    
    // Reset auto increment
    await connection.execute('ALTER TABLE comentarios AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE publicaciones AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE cursos AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE profesores AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE usuarios AUTO_INCREMENT = 1');
    
    console.log('✅ Datos de prueba eliminados');
    
    // Leer y procesar el archivo CSV
    const cursosData = [];
    const profesoresSet = new Set();
    
    console.log('📖 Leyendo archivo CSV...');
    
    await new Promise((resolve, reject) => {
      fs.createReadStream('encoded-profesores_cursos.csv')
        .pipe(csv())
        .on('data', (row) => {
          // Procesar cada fila del CSV
          const id = row['#'];
          const nombreCurso = row['Nombre de Curso'];
          const apellidos = row['Apellidos'];
          const nombres = row['Nombres'];
          
          // Solo procesar filas que tengan datos completos
          if (id && nombreCurso && apellidos && nombres) {
            // Limpiar y procesar el nombre del curso (manejar codificación)
            let cursoLimpio = nombreCurso
              .replace(/Ã¡/g, 'á')
              .replace(/Ã©/g, 'é')
              .replace(/Ã­/g, 'í')
              .replace(/Ã³/g, 'ó')
              .replace(/Ãº/g, 'ú')
              .replace(/Ã±/g, 'ñ')
              .replace(/Ã/g, 'Ñ')
              .replace(/Ã¿/g, 'í')
              .replace(/Ã\u00AD/g, 'í')
              .replace(/Â/g, '')
              .replace(/�/g, 'ó');
            
            // Limpiar nombres y apellidos de profesores también
            let nombresLimpio = nombres
              .replace(/Ã¡/g, 'á')
              .replace(/Ã©/g, 'é')
              .replace(/Ã­/g, 'í')
              .replace(/Ã³/g, 'ó')
              .replace(/Ãº/g, 'ú')
              .replace(/Ã±/g, 'ñ')
              .replace(/Ã/g, 'Ñ')
              .replace(/Â/g, '')
              .replace(/�/g, 'ó');
              
            let apellidosLimpio = apellidos
              .replace(/Ã¡/g, 'á')
              .replace(/Ã©/g, 'é')
              .replace(/Ã­/g, 'í')
              .replace(/Ã³/g, 'ó')
              .replace(/Ãº/g, 'ú')
              .replace(/Ã±/g, 'ñ')
              .replace(/Ã/g, 'Ñ')
              .replace(/Â/g, '')
              .replace(/�/g, 'ó');
            
            // Extraer información del curso
            const match = cursoLimpio.match(/^(.+?)\s*\(([^)]+)\)$/);
            let nombreBase = match ? match[1].trim() : cursoLimpio;
            let seccion = match ? match[2].trim() : 'A';
            
            // Generar código del curso
            const palabras = nombreBase.split(' ');
            let codigo = '';
            let numeroMateria = 1;
            
            // Extraer número si existe
            const numeroMatch = nombreBase.match(/(\d+)/);
            if (numeroMatch) {
              numeroMateria = parseInt(numeroMatch[1]);
            }
            
            // Generar código basado en las primeras letras
            if (nombreBase.toLowerCase().includes('programacion') || nombreBase.toLowerCase().includes('programación')) {
              codigo = `PROG${numeroMateria}${seccion.charAt(0)}`;
            } else if (nombreBase.toLowerCase().includes('base') && nombreBase.toLowerCase().includes('datos')) {
              codigo = `BD${numeroMateria}${seccion.charAt(0)}`;
            } else if (nombreBase.toLowerCase().includes('sistemas operativos')) {
              codigo = `SO${numeroMateria}${seccion.charAt(0)}`;
            } else if (nombreBase.toLowerCase().includes('redes')) {
              codigo = `RED${numeroMateria}${seccion.charAt(0)}`;
            } else if (nombreBase.toLowerCase().includes('estructura')) {
              codigo = `EST${numeroMateria}${seccion.charAt(0)}`;
            } else if (nombreBase.toLowerCase().includes('arquitectura')) {
              codigo = `ARQ${numeroMateria}${seccion.charAt(0)}`;
            } else {
              // Código genérico usando las primeras 3 consonantes
              const consonantes = nombreBase.replace(/[aeiouAEIOU\s]/g, '').substring(0, 3).toUpperCase();
              codigo = `${consonantes}${numeroMateria}${seccion.charAt(0)}`;
            }
            
            cursosData.push({
              id: parseInt(id),
              nombre: nombreBase,
              codigo: codigo,
              seccion: seccion,
              creditos: 4, // Valor por defecto
              semestre: Math.floor(Math.random() * 10) + 1, // Semestre aleatorio entre 1-10
              descripcion: `Curso de ${nombreBase} - ${seccion}`
            });
            
            // Agregar profesor al set (evita duplicados)
            if (apellidosLimpio.trim() && nombresLimpio.trim()) {
              const nombreCompleto = `${nombresLimpio.trim()}, ${apellidosLimpio.trim()}`;
              profesoresSet.add(nombreCompleto);
            }
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    console.log(`📊 Procesados ${cursosData.length} cursos y ${profesoresSet.size} profesores únicos`);
    
    // Insertar profesores
    console.log('👨‍🏫 Insertando profesores...');
    const profesoresArray = Array.from(profesoresSet);
    const profesoresInsertados = [];
    
    for (let i = 0; i < profesoresArray.length; i++) {
      const nombreCompleto = profesoresArray[i];
      const [nombres, apellidos] = nombreCompleto.split(', ');
      
      // Generar email del profesor
      const emailBase = nombres.toLowerCase().replace(/\s+/g, '.') + '.' + 
                       apellidos.toLowerCase().split(' ')[0].replace(/\s+/g, '');
      const email = `${emailBase}@profesor.edu.gt`;
      
      // Generar título académico aleatorio
      const titulos = ['Ingeniero en Sistemas', 'Licenciado en Informática', 'Master en Computación', 
                      'Doctor en Ciencias de la Computación', 'Ingeniero en Computación'];
      const titulo = titulos[Math.floor(Math.random() * titulos.length)];
      
      try {
        const [result] = await connection.execute(
          'INSERT INTO profesores (nombres, apellidos, email, titulo, activo) VALUES (?, ?, ?, ?, ?)',
          [nombres, apellidos, email, titulo, 1]
        );
        
        profesoresInsertados.push({
          id: result.insertId,
          nombreCompleto: nombreCompleto
        });
      } catch (error) {
        console.warn(`⚠️ Error insertando profesor ${nombreCompleto}:`, error.message);
      }
    }
    
    console.log(`✅ Insertados ${profesoresInsertados.length} profesores`);
    
    // Insertar cursos
    console.log('📚 Insertando cursos...');
    let cursosInsertados = 0;
    
    for (const curso of cursosData) {
      try {
        await connection.execute(
          'INSERT INTO cursos (nombre, codigo, creditos, semestre, descripcion, activo) VALUES (?, ?, ?, ?, ?, ?)',
          [curso.nombre, curso.codigo, curso.creditos, curso.semestre, curso.descripcion, 1]
        );
        cursosInsertados++;
      } catch (error) {
        console.warn(`⚠️ Error insertando curso ${curso.nombre}:`, error.message);
      }
    }
    
    console.log(`✅ Insertados ${cursosInsertados} cursos`);
    
    // Crear algunos usuarios de ejemplo
    console.log('👤 Creando usuarios de ejemplo...');
    const bcrypt = require('bcryptjs');
    const usuariosEjemplo = [
      {
        carnet: '202100001',
        nombres: 'Juan Carlos',
        apellidos: 'García López',
        email: 'juan.garcia@estudiante.edu.gt',
        password: await bcrypt.hash('password123', 10)
      },
      {
        carnet: '202100002',
        nombres: 'María Fernanda',
        apellidos: 'Rodríguez Pérez',
        email: 'maria.rodriguez@estudiante.edu.gt',
        password: await bcrypt.hash('password123', 10)
      },
      {
        carnet: '202100003',
        nombres: 'Luis Antonio',
        apellidos: 'Morales Silva',
        email: 'luis.morales@estudiante.edu.gt',
        password: await bcrypt.hash('password123', 10)
      }
    ];
    
    for (const usuario of usuariosEjemplo) {
      try {
        await connection.execute(
          'INSERT INTO usuarios (carnet, nombres, apellidos, email, password) VALUES (?, ?, ?, ?, ?)',
          [usuario.carnet, usuario.nombres, usuario.apellidos, usuario.email, usuario.password]
        );
      } catch (error) {
        console.warn(`⚠️ Error insertando usuario ${usuario.email}:`, error.message);
      }
    }
    
    console.log('✅ Usuarios de ejemplo creados');
    
    // Crear algunas publicaciones de ejemplo
    console.log('📝 Creando publicaciones de ejemplo...');
    const publicacionesEjemplo = [
      {
        usuario_id: 1,
        tipo: 'curso',
        materia_id: 1,
        mensaje: '¿Alguien tiene material adicional sobre este curso? Me está costando entender algunos conceptos.'
      },
      {
        usuario_id: 2,
        tipo: 'profesor',
        materia_id: 2,
        mensaje: 'Excelente profesor, explica muy bien los temas complejos.'
      },
      {
        usuario_id: 3,
        tipo: 'curso',
        materia_id: 3,
        mensaje: '¿Cuáles son los prerequisitos reales para este curso?'
      }
    ];
    
    for (const pub of publicacionesEjemplo) {
      try {
        await connection.execute(
          'INSERT INTO publicaciones (usuario_id, tipo, materia_id, mensaje) VALUES (?, ?, ?, ?)',
          [pub.usuario_id, pub.tipo, pub.materia_id, pub.mensaje]
        );
      } catch (error) {
        console.warn(`⚠️ Error insertando publicación:`, error.message);
      }
    }
    
    console.log('✅ Publicaciones de ejemplo creadas');
    
    // Mostrar resumen
    console.log('\n🎉 ¡Carga de datos reales completada!\n');
    console.log('📊 RESUMEN:');
    console.log(`   👨‍🏫 Profesores: ${profesoresInsertados.length}`);
    console.log(`   📚 Cursos: ${cursosInsertados}`);
    console.log(`   👤 Usuarios: ${usuariosEjemplo.length}`);
    console.log(`   📝 Publicaciones: ${publicacionesEjemplo.length}`);
    console.log('\n✅ La base de datos ahora contiene datos reales del archivo CSV\n');
    
  } catch (error) {
    console.error('❌ Error durante la carga de datos:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión a la base de datos cerrada');
    }
  }
}

// Ejecutar el script si es llamado directamente
if (require.main === module) {
  loadRealDataFromCSV()
    .then(() => {
      console.log('✅ Script ejecutado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error ejecutando script:', error);
      process.exit(1);
    });
}

module.exports = loadRealDataFromCSV;
