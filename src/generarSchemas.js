/**
 * @file generarSchemas.js
 * @description  Validación y Conformidad Normativa.
 * Este módulo administra la carga, compilación y ejecución de los esquemas JSON (OpenAPI)
 * oficiales de la Plataforma Digital Nacional. Implementa validación estricta de tipos y formatos.
 */
import Ajv from "ajv";
import addFormats from "ajv-formats";

// Carga de definiciones normativas (Esquemas Oficiales)
import specInicial from "../schemas/declaracion_inicial.json" with { type: "json" };
import specModificacion from "../schemas/declaracion_modificacion.json" with { type: "json" };
import specConclusion from "../schemas/declaracion_conclusion.json" with { type: "json" };

/**
 * Instanciación del motor Ajv.
 * - allErrors: true -> Permite capturar todos los fallos de un registro en una sola pasada.
 * - strict: false -> Permite flexibilidad ante metadatos adicionales no definidos en el esquema.
 */
const ajv = new Ajv({ allErrors: true, strict: false });
// Inyección de formatos estándar (date, date-time, email, uri) requeridos por la PDN
addFormats(ajv);

// Registrar esquemas con claves únicas
try {
  ajv.addSchema(specInicial, "INICIAL");
  ajv.addSchema(specModificacion, "MODIFICACION");
  ajv.addSchema(specConclusion, "CONCLUSION");
} catch (e) {
  console.error("Error fatal al añadir esquemas base a AJV:", e);
  process.exit(1);
}

/**
 * Genera una función de validación para un tipo específico.
 * Utiliza un "Schema Pointer" ($ref) para apuntar directamente a la definición del ítem individual
 * dentro de la estructura del estándar OpenAPI.
 * @param {string} schemaKey - Clave del esquema registrado (INICIAL, MODIFICACION, CONCLUSION).
 */
function compileValidator(schemaKey) {
  try {
    const schemaRef = `${schemaKey}#/components/schemas/resDeclaraciones/properties/results/items`;
    const validator = ajv.compile({ $ref: schemaRef });
    console.log(`Validador para '${schemaKey}' compilado exitosamente.`);
    return validator;
  } catch (e) {
    console.error(`Error al compilar validador para '${schemaKey}':`, e);
    const failedValidator = () => {
      failedValidator.errors = [{ message: `Compilador para '${schemaKey}' falló` }];
      return false;
    };
    return failedValidator;
  }
}

// Compilar validadores para cada tipo de declaración
const validadores = {
  INICIAL: compileValidator("INICIAL"),
  MODIFICACION: compileValidator("MODIFICACION"),
  CONCLUSION: compileValidator("CONCLUSION")
};

/**
 * Ejecuta la validación normativa sobre un registro individual.
 * @param {Object} item - Objeto de declaración ya normalizado.
 * @param {string} tipoDeclaracion - Contexto (INICIAL, MODIFICACION, CONCLUSION).
 * @returns {boolean} true si es válido. Lanza error si es inválido.
 */
export function validarResultItem(item, tipoDeclaracion) {
  const validator = validadores[tipoDeclaracion];

  if (!validator) {
    throw new Error(`Error de validación: No se encontró validador para tipo '${tipoDeclaracion}'.`);
  }

  if (!validator(item)) {
    const itemId = item?.id ? ` (ID: ${item.id})` : '';
    const tipo = item?.metadata?.tipo || tipoDeclaracion;
    throw new Error(
      `Error de validación en item${itemId} (Tipo: ${tipo}):\n` + formatear(validator.errors)
    );
  }
  
  return true;
}

/**
 * Transforma el array de errores técnicos de Ajv en un string legible.
 * Extrae la ruta del error (Path) y la descripción del problema.
 */
function formatear(errors = []) {
  if (!Array.isArray(errors)) return "Error desconocido al formatear errores.";
  return errors
    .map(e => {
      let details = '';
      if (e.params?.allowedValues) {
        details = ` (Permitidos: ${e.params.allowedValues.join(', ')})`;
      }
      const path = e.instancePath || e.schemaPath || 'Raíz';
      return `• ${path} → ${e.message}${details}`;
    })
    .join("\n");
}