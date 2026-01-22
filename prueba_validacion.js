import fs from 'fs';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

// --- CONFIGURACIÓN DE RUTAS ---
const PRUEBAS = [
    {
        titulo: "DECLARACIÓN INICIAL",
        schema: './schemas/declaracion_inicial.json',
        data: './salida/inicial.transformadas.json'
    },
    {
        titulo: "DECLARACIÓN DE MODIFICACIÓN",
        schema: './schemas/declaracion_modificacion.json',
        data: './salida/modificacion.transformadas.json'
    },
    {
        titulo: "DECLARACIÓN DE CONCLUSIÓN",
        schema: './schemas/declaracion_conclusion.json',
        data: './salida/conclusion.transformadas.json'
    }
];

const validarTipo = (caso) => {
    console.log(`\n INICIANDO BARRIDO MASIVO: ${caso.titulo}`);
    
    const ajv = new Ajv({ 
        strict: false, 
        allErrors: false, // Solo queremos saber si falla o no
        discriminator: true 
    });
    addFormats(ajv);

    try {
        // 1. Verificaciones básicas de archivos
        if (!fs.existsSync(caso.schema) || !fs.existsSync(caso.data)) {
            console.log(`    Saltando: Falta archivo de esquema o datos.`);
            return;
        }

        // 2. Cargar Archivos
        const openApiDoc = JSON.parse(fs.readFileSync(caso.schema, 'utf8'));
        const misDatos = JSON.parse(fs.readFileSync(caso.data, 'utf8'));
        const totalRegistros = misDatos.length;

        if (totalRegistros === 0) {
            console.log("    El archivo de datos está vacío.");
            return;
        }

        console.log(`    Archivos cargados. Preparando validador...`);

        // 3. Compilar el Validador 
        const tempId = `schema_${Date.now()}`;
        openApiDoc.$id = tempId;
        ajv.addSchema(openApiDoc);

        // Lógica de detección de esquema 
        let schemaKey = null;
        const schemas = openApiDoc.components.schemas;
        for (const key in schemas) {
            if (schemas[key].properties && schemas[key].properties.declaracion) {
                schemaKey = key;
                break;
            }
        }

        let validate;
        if (schemaKey) {
            validate = ajv.getSchema(`${tempId}#/components/schemas/${schemaKey}`);
        } else {
            validate = ajv.getSchema(`${tempId}#/components/schemas/resDeclaraciones/properties/results/items`);
        }

        if (!validate) {
            throw new Error("No se pudo compilar el validador.");
        }

        // 4. BUCLE: EJECUCIÓN DE LA PRUEBA DE ESTRÉS
        console.log(`    Validando ${totalRegistros} registros uno por uno...`);
        
        let exitos = 0;
        let fallos = 0;
        let primerError = null;

        // Aquí recorremos TODAS las declaraciones
        for (let i = 0; i < totalRegistros; i++) {
            const declaracion = misDatos[i];
            const esValido = validate(declaracion);

            if (esValido) {
                exitos++;
            } else {
                fallos++;
                // Guardamos solo el primer error para mostrarlo de ejemplo
                if (!primerError) {
                    primerError = {
                        id: declaracion.id,
                        msg: validate.errors[0].message,
                        path: validate.errors[0].instancePath
                    };
                }
            }
        }

        // 5. RESULTADOS FINALES
        if (fallos === 0) {
            console.log(`    Resultado exitoso: ${exitos}/${totalRegistros} registros válidos.`);
        } else {
            console.log(`    RESULTADO:`);
            console.log(`       Pasaron: ${exitos}`);
            console.log(`       Fallaron: ${fallos}`);
            console.log(`       Ejemplo de error (ID: ${primerError.id}): ${primerError.msg} en ${primerError.path}`);
        }

    } catch (error) {
        console.error(`    Error ejecutando prueba: ${error.message}`);
    }
};

// --- EJECUCIÓN ---

console.log(" PRUEBA DE ESTRÉS Y CONFORMIDAD MASIVA");


PRUEBAS.forEach(prueba => validarTipo(prueba));

console.log("\n===================================================");
console.log(" PROCESO TERMINADO");