/**
 * @file index.js
 * @description Punto de entrada principal del módulo ETL.
 * Este script hace la ejecución del proceso de transformación, mide el rendimiento
 * operativo y genera el reporte de resultados en la interfaz de línea de comandos (CLI).
 */
import { leerArchivo } from './src/leerArchivo.js';
import path from 'path';
import { fileURLToPath } from 'url';
//Configuración de variables de entorno para compatibilidad con ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const main = () => {
    // Guardamos las referencias originales de la consola
    const logOriginal = console.log;
    const warnOriginal = console.warn;
    const errorOriginal = console.error;

    /* * Se silencia la salida estándar temporalmente.
     * Objetivo: Evitar que logs intermedios de depuración o advertencias de librerías
     * interfieran con la visualización limpia del reporte final.
     */
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {}; 
    //ejecucion  del proceso etl
    try {
        // Inicio del contador de rendimiento
        const inicio = Date.now();
       
        const resumen = leerArchivo();
        
        // Cálculo del tiempo total de ejecución
        const fin = Date.now();
        const tiempo = ((fin - inicio) / 1000).toFixed(2);

        
        console.log = logOriginal;
        console.warn = warnOriginal;
        console.error = errorOriginal;

        if (!resumen) {
            console.error("Error: El proceso no devolvió datos.");
            process.exit(1);
        }

        //Limpiamos terminal para una visualización del reporte
        console.clear(); 

        console.log("==================================================");
        console.log("REPORTE DE EJECUCIÓN ETL (DeclaraNet -> PDN)");
        console.log("==================================================\n");

        console.log(`Tiempo de ejecución: ${tiempo} segundos\n`);
        
        console.log("Resumen:");
        console.table({
            "Total Procesados": resumen.registrosEncontrados,
            "Exitosos": resumen.registrosExitosos,
            "Errores": resumen.registrosConError
        });
        // Tabla de Desglose por Tipo de declaración
        console.log("\nDESGLOSE POR TIPO:");
        const desglose = {
            "Inicial": resumen.detalles.inicial,
            "Modificación": resumen.detalles.modificacion,
            "Conclusión": resumen.detalles.conclusion
        };
        console.table(desglose);
        console.log("\nARCHIVOS GENERADOS:");
        Object.entries(resumen.archivos).forEach(([tipo, ruta]) => {
            // Extraemos solo el nombre del archivo para que se vea limpio
            const nombreArchivo = path.basename(ruta);
            // Alineamos el texto para que se vea ordenado
            const etiqueta = tipo.toUpperCase().padEnd(12, ' ');
            console.log(`   [${etiqueta}]: ${nombreArchivo}`);
        });

        const rutaSalida = path.join(__dirname, 'salida');
        console.log(`\n   Ubicación completa: ${rutaSalida}`);
        
        console.log("\n==================================================");
        process.exit(0);
    } catch (error) {
        console.log = logOriginal;
        console.error = errorOriginal;
        console.error("\nERROR CRÍTICO:");
        console.error(error);
        process.exit(1);
    }
};
main();