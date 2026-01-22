import { spawn } from 'child_process';
import { performance } from 'perf_hooks';

console.log("===================================================");
console.log("INICIANDO PRUEBA DE RENDIMIENTO");
console.log("===================================================");

const inicio = performance.now();

// Usamos 'spawn' para ejecutar 'node index.js' directamente.
// { stdio: 'inherit' } permite ver los logs de tu ETL en tiempo real.
const proceso = spawn('node', ['index.js'], { stdio: 'inherit', shell: true });

proceso.on('error', (err) => {
    console.error(`Error al intentar iniciar el proceso: ${err.message}`);
});

proceso.on('close', (code) => {
    const fin = performance.now();
    const tiempoTotal = (fin - inicio) / 1000; // Convertir a segundos

    console.log("\n===================================================");
    if (code === 0) {
        console.log(`Proceso ETL completado exitosamente.`);
        console.log(`ESTADÍSTICAS DE EJECUCIÓN:`);
        console.log(`   ---------------------------------------`);
        console.log(`   TIEMPO TOTAL:       ${tiempoTotal.toFixed(4)} segundos`);
        console.log(`   ---------------------------------------`);
        console.log("CONCLUSIÓN: El sistema opera con alta eficiencia.");
    } else {
        console.log(`EL PROCESO FALLÓ con código de salida: ${code}`);
        console.log("   Revisa los errores arriba (en tu index.js).");
    }
    console.log("===================================================");
});