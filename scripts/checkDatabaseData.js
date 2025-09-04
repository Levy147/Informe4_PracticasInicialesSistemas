const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sistema_educativo',
  port: process.env.DB_PORT || 3306
};

async function checkDatabaseData() {
  let connection;
  
  try {
    console.log('🔄 Conectando a la base de datos...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión exitosa\n');
    
    // Verificar cursos
    console.log('📚 CURSOS EN LA BASE DE DATOS:');
    const [cursos] = await connection.execute('SELECT COUNT(*) as total FROM cursos');
    console.log(`   Total de cursos: ${cursos[0].total}`);
    
    if (cursos[0].total > 0) {
      const [cursosEjemplo] = await connection.execute('SELECT nombre, codigo, seccion FROM cursos LIMIT 5');
      console.log('   Ejemplos:');
      cursosEjemplo.forEach((curso, i) => {
        console.log(`   ${i + 1}. ${curso.codigo} - ${curso.nombre} (${curso.seccion})`);
      });
    }
    
    // Verificar profesores
    console.log('\n👨‍🏫 PROFESORES EN LA BASE DE DATOS:');
    const [profesores] = await connection.execute('SELECT COUNT(*) as total FROM profesores');
    console.log(`   Total de profesores: ${profesores[0].total}`);
    
    if (profesores[0].total > 0) {
      const [profesoresEjemplo] = await connection.execute('SELECT nombres, apellidos, titulo FROM profesores LIMIT 5');
      console.log('   Ejemplos:');
      profesoresEjemplo.forEach((prof, i) => {
        console.log(`   ${i + 1}. ${prof.nombres} ${prof.apellidos} - ${prof.titulo}`);
      });
    }
    
    // Verificar usuarios
    console.log('\n👤 USUARIOS EN LA BASE DE DATOS:');
    const [usuarios] = await connection.execute('SELECT COUNT(*) as total FROM usuarios');
    console.log(`   Total de usuarios: ${usuarios[0].total}`);
    
    if (usuarios[0].total > 0) {
      const [usuariosEjemplo] = await connection.execute('SELECT carnet, nombres, apellidos, email FROM usuarios');
      console.log('   Usuarios registrados:');
      usuariosEjemplo.forEach((user, i) => {
        console.log(`   ${i + 1}. ${user.carnet} - ${user.nombres} ${user.apellidos} (${user.email})`);
      });
    }
    
    // Verificar publicaciones
    console.log('\n📝 PUBLICACIONES EN LA BASE DE DATOS:');
    const [publicaciones] = await connection.execute('SELECT COUNT(*) as total FROM publicaciones');
    console.log(`   Total de publicaciones: ${publicaciones[0].total}`);
    
    if (publicaciones[0].total > 0) {
      const [pubEjemplo] = await connection.execute(`
        SELECT p.tipo, p.mensaje, u.nombres, u.apellidos, c.nombre as curso
        FROM publicaciones p 
        JOIN usuarios u ON p.usuario_id = u.id 
        JOIN cursos c ON p.materia_id = c.id 
        LIMIT 3
      `);
      console.log('   Ejemplos:');
      pubEjemplo.forEach((pub, i) => {
        console.log(`   ${i + 1}. [${pub.tipo.toUpperCase()}] ${pub.mensaje.substring(0, 50)}...`);
        console.log(`       Por: ${pub.nombres} ${pub.apellidos} | Curso: ${pub.curso}`);
      });
    }
    
    // Verificar comentarios
    console.log('\n💬 COMENTARIOS EN LA BASE DE DATOS:');
    const [comentarios] = await connection.execute('SELECT COUNT(*) as total FROM comentarios');
    console.log(`   Total de comentarios: ${comentarios[0].total}`);
    
    console.log('\n🎉 RESUMEN:');
    console.log(`   📚 Cursos: ${cursos[0].total}`);
    console.log(`   👨‍🏫 Profesores: ${profesores[0].total}`);
    console.log(`   👤 Usuarios: ${usuarios[0].total}`);
    console.log(`   📝 Publicaciones: ${publicaciones[0].total}`);
    console.log(`   💬 Comentarios: ${comentarios[0].total}`);
    
    if (cursos[0].total === 0 || profesores[0].total === 0) {
      console.log('\n⚠️  Parece que los datos del CSV no se han cargado.');
      console.log('   Ejecuta: npm run load-real-csv');
    } else {
      console.log('\n✅ Los datos están cargados correctamente.');
      console.log('   Puedes comenzar a probar las APIs.');
    }
    
  } catch (error) {
    console.error('❌ Error al verificar la base de datos:');
    console.error('   ', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Soluciones posibles:');
      console.log('   1. Verificar que MySQL esté ejecutándose');
      console.log('   2. Verificar las credenciales en el archivo .env');
      console.log('   3. Verificar que la base de datos "sistema_educativo" exista');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  checkDatabaseData()
    .then(() => {
      console.log('\n✅ Verificación completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error en verificación:', error.message);
      process.exit(1);
    });
}

module.exports = checkDatabaseData;
