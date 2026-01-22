import fs from 'fs';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

// Configuración de rutas
const ARCHIVO_ERRORES = './salida/declaraciones-erroneas.json';
const MAPA_SCHEMAS = {
    'INICIAL': './schemas/declaracion_inicial.json',
    'MODIFICACIÓN': './schemas/declaracion_modificacion.json',
    'CONCLUSIÓN': './schemas/declaracion_conclusion.json'
};

const ejecutarPruebaRobustez = () => {

    console.log("  INICIANDO PRUEBA DE ROBUSTEZ");


    // Configuración del validador
    const ajv = new Ajv({ strict: false, allErrors: true });
    addFormats(ajv);

    try {
        // Cargar el archivo de datos "sucios"
        if (!fs.existsSync(ARCHIVO_ERRORES)) {
            throw new Error(`No se encontró el archivo: ${ARCHIVO_ERRORES}`);
        }
        const datosSucios = JSON.parse(fs.readFileSync(ARCHIVO_ERRORES, 'utf8'));
        
        console.log(` Archivo cargado: ${ARCHIVO_ERRORES}`);
        console.log(` Se intentarán validar ${datosSucios.length} registros corruptos.\n`);

        let bloqueados = 0;

        // Recorre cada registro y valida contra su esquema correspondiente
        datosSucios.forEach((registro, index) => {
            const tipoDeclaracion = registro.metadata.tipo; // Ej: "INICIAL"
            const rutaSchema = MAPA_SCHEMAS[tipoDeclaracion];

            console.log(`Procesando Registro #${index + 1} (Tipo: ${tipoDeclaracion})...`);

            if (!rutaSchema) {
                console.log(`     Salto: Tipo de declaración '${tipoDeclaracion}' no reconocido.`);
                return;
            }

            // Cargar el esquema específico para este tipo
            const openApiDoc = JSON.parse(fs.readFileSync(rutaSchema, 'utf8'));
            
            // Asignar ID único dinámico para no mezclar esquemas
            const tempId = `schema_robustez_${index}`;
            openApiDoc.$id = tempId;
            // Limpiamos caché de esquemas viejos solo si es necesario
            if(ajv.getSchema(tempId)) ajv.removeSchema(tempId);
            ajv.addSchema(openApiDoc);

            // Buscar el validador del item (Declaración individual)
            // Intentamos la ruta estándar de la PDN
            let validate = ajv.getSchema(`${tempId}#/components/schemas/resDeclaraciones/properties/results/items`);
            
            // Si no lo encuentra directo, buscamos en los componentes
            if (!validate) {
                const schemas = openApiDoc.components.schemas;
                for (const key in schemas) {
                    if (schemas[key].properties && schemas[key].properties.declaracion) {
                        validate = ajv.getSchema(`${tempId}#/components/schemas/${key}`);
                        break;
                    }
                }
            }

            const pasoValidacion = validate(registro);

            if (!pasoValidacion) {
                bloqueados++;
                console.log(`    ÉXITO: El sistema RECHAZÓ el dato incorrecto.`);
                console.log(`      Motivo: ${validate.errors[0].message}`);
                console.log(`      Campo afectado: ${validate.errors[0].instancePath}`);
            } else {
                console.log(`    FALLO CRÍTICO: El sistema aceptó un dato que debía rechazar.`);
            }
            console.log("---------------------------------------------------");
        });
        console.log(`\nPRUEBA COMPLETADA: ${bloqueados} de ${datosSucios.length} registros fueron correctamente bloqueados.`);
    } catch (error) {
        console.error(" Error en el script:", error.message);
    }
};

ejecutarPruebaRobustez();