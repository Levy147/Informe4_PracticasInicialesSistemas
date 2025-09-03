const fs = require('fs');
const csv = require('csv-parser');

async function previewCSVData() {
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
          let numeroMateria = 1;
          
          // Extraer número si existe
          const numeroMatch = nombreBase.match(/(\d+)/);
          if (numeroMatch) {
            numeroMateria = parseInt(numeroMatch[1]);
          }
          
          // Generar código basado en las primeras letras
          let codigo = '';
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
            nombreCompleto: cursoLimpio
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
  
  console.log(`\n📊 VISTA PREVIA DE LOS DATOS DEL CSV:`);
  console.log(`📚 Total de cursos: ${cursosData.length}`);
  console.log(`👨‍🏫 Total de profesores únicos: ${profesoresSet.size}\n`);
  
  console.log('📚 PRIMEROS 10 CURSOS:');
  cursosData.slice(0, 10).forEach((curso, i) => {
    console.log(`${i + 1}. ${curso.codigo} - ${curso.nombre} (${curso.seccion})`);
  });
  
  console.log('\n👨‍🏫 PRIMEROS 10 PROFESORES:');
  Array.from(profesoresSet).slice(0, 10).forEach((profesor, i) => {
    console.log(`${i + 1}. ${profesor}`);
  });
  
  console.log('\n📋 EJEMPLOS DE CÓDIGOS GENERADOS:');
  console.log('- Programación:', cursosData.filter(c => c.codigo.includes('PROG')).slice(0, 3).map(c => c.codigo).join(', '));
  console.log('- Bases de Datos:', cursosData.filter(c => c.codigo.includes('BD')).slice(0, 3).map(c => c.codigo).join(', '));
  console.log('- Arquitectura:', cursosData.filter(c => c.codigo.includes('ARQ')).slice(0, 3).map(c => c.codigo).join(', '));
  console.log('- Otros:', cursosData.filter(c => !c.codigo.includes('PROG') && !c.codigo.includes('BD') && !c.codigo.includes('ARQ')).slice(0, 5).map(c => c.codigo).join(', '));
  
  console.log('\n✅ Vista previa completada. Para cargar estos datos a la base de datos:');
  console.log('1. Configura tu archivo .env con las credenciales de MySQL');
  console.log('2. Asegúrate de que MySQL esté ejecutándose');
  console.log('3. Ejecuta: npm run load-real-csv\n');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  previewCSVData()
    .then(() => {
      console.log('✅ Vista previa completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = previewCSVData;
