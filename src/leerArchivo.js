/**
 * @file leerArchivo.js
 * @description Controlador principal del flujo ETL.
 * Responsable de la carga de datos (Input), organiza la transformación (Process)
 * y persistencia de los resultados en disco (Output).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Módulos internos de lógica de negocio y validación
import { validarResultItem } from './generarSchemas.js';
import { normalizarDeclaracion } from './normalizacion.js';
import { estandarizarNombres } from './utils.js';
import { getTipoDeclaracion } from './libs/camposCondicionales.js';

// Configuración de rutas relativas para el sistema de archivos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta del archivo fuente (Origen de Datos)
const filePath2 = path.join(__dirname, '../entrada/s1-api.declaraciones.json');

/**
 * Función que ejecuta el Pipeline ETL completo.
 * 1. Lee el archivo fuente JSON.
 * 2. Estandariza la nomenclatura (PascalCase -> camelCase).
 * 3. Itera sobre cada registro para normalizarlo y validarlo.
 * 4. Clasifica los resultados y genera archivos de salida listos para la BD de la API de Interconexión del S1.
 * * @returns {Object|null} Objeto de resumen con estadísticas y rutas de archivos generados.
 */
export function leerArchivo() {
    try {
        // 1. Cargar Archivo Fuente
        console.log(`Leyendo archivo: ${filePath2}`);
        const fileContent2 = fs.readFileSync(filePath2, 'utf-8');

        // 2. Parsear JSON
        console.log("Parseando JSON...");
        let datosDeclaraNet = JSON.parse(fileContent2);

        // Asegurar que estamos trabajando con un array
        const registrosDeclaraNet = Array.isArray(datosDeclaraNet) ? datosDeclaraNet : datosDeclaraNet.registros;
        if (!Array.isArray(registrosDeclaraNet)) {
            throw new Error("No se encontró un array de registros en el archivo de entrada.");
        }
        console.log(`Total de registros encontrados: ${registrosDeclaraNet.length}`);

        console.log("Estandarizando nombres...");
        const datosEstandarizados = estandarizarNombres(registrosDeclaraNet);

        console.log(`Procesando ${datosEstandarizados.length} registros...`);

        if (datosEstandarizados.length === 0) {
            console.warn("Advertencia: No se encontraron registros para procesar.");
            return null;
        }
        // 3. Normalizar y Validar cada registro
        console.log("Normalizando y validando registros uno por uno...");
        
        // Estructuras para separar los registros
        const registros = {
            INICIAL: [],
            MODIFICACION: [],
            CONCLUSION: []
        };
        const conErrores = [];

        // Iterar sobre TODOS los registros
        for (const [index, item] of datosEstandarizados.entries()) {
            const itemId = item?.id || `(índice ${index})`;
            
            // detectar tipo de declaración
            const tipoDeclaracion = getTipoDeclaracion(item);

            if (!tipoDeclaracion) {
                // Si no se puede determinar el tipo, es un error crítico para ese registro
                conErrores.push({ id: itemId, error: "Tipo de declaración desconocido (metadata.tipo)." });
                continue;
            }

            try {
                // Normaliza
                const itemNormalizado = normalizarDeclaracion(item);
                
                // Valida (AJV)
                validarResultItem(itemNormalizado, tipoDeclaracion);
                
                // Clasifica si todo salió bien
                registros[tipoDeclaracion].push(itemNormalizado);

            } catch (err) {
                // Captura errores tanto de normalización como de validación
                // No imprimimos el error completo en consola para no ensuciar el reporte final,
                // pero lo guardamos en el array de errores.
                conErrores.push({ id: itemId, tipo: tipoDeclaracion, error: err.message });
            }
        } 

        // Resumen interno antes de guardar archivos
        console.log("--- Proceso de Normalización y Validación Terminado ---");
        console.log(`Registros INICIAL: ${registros.INICIAL.length}`);
        console.log(`Registros MODIFICACION: ${registros.MODIFICACION.length}`);
        console.log(`Registros CONCLUSION: ${registros.CONCLUSION.length}`);
        console.log(`Registros con Error: ${conErrores.length}`);
        
        // Guardar archivos de salida
        const outPathDir = path.join(__dirname, '../salida');
        fs.mkdirSync(outPathDir, { recursive: true });
        const guardarJSON = (nombreArchivo, datos) => {
            const outPath = path.join(outPathDir, nombreArchivo);
            const jsonData = JSON.stringify(datos, null, 2); 
            fs.writeFileSync(outPath, jsonData, 'utf-8');
            return outPath;
        };
        const todosNormalizados = [...registros.INICIAL, ...registros.MODIFICACION, ...registros.CONCLUSION];
        // Archivos generados de salida
        const archivosSalida = {};
        archivosSalida.inicial = guardarJSON('inicial.transformadas.json', registros.INICIAL);
        archivosSalida.modificacion = guardarJSON('modificacion.transformadas.json', registros.MODIFICACION);
        archivosSalida.conclusion = guardarJSON('conclusion.transformadas.json', registros.CONCLUSION);
        archivosSalida.total = guardarJSON('transformadas.totales.json', todosNormalizados);
        
        // Devolver objeto de resumen para que index.js lo muestre
        return {
            archivos: archivosSalida,
            registrosEncontrados: datosEstandarizados.length,
            registrosExitosos: todosNormalizados.length,
            detalles: {
                inicial: registros.INICIAL.length,
                modificacion: registros.MODIFICACION.length,
                conclusion: registros.CONCLUSION.length
            },
            registrosConError: conErrores.length
        };

    } catch (error) {
        // Error fatal (ej. no existe archivo de entrada)
        console.error('Error fatal en leerArchivo:', error.message);
        return null;
    }
}