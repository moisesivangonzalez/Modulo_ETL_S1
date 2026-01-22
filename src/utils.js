/**
 * @file utils.js
 * @description Módulo de utilerías para la manipulación y estandarización de estructuras de datos.
 * Implementa algoritmos recursivos para resolver la incompatibilidad de nomenclatura entre el sistema origen (PascalCase)
 * y el estándar destino (camelCase).
 */
/**
 * Estandariza nombres de propiedades a camelCase
 * Convierte _id a id y aplica camelCase a todas las propiedades
 * @param {*} obj - Objeto, array o valor a estandarizar
 * @returns {*} Objeto/array estandarizado o valor original
 */
export function estandarizarNombres(obj) {
    // Caso 1: Si es Array, aplicar recursivamente a cada elemento (objeto)
    if (Array.isArray(obj)) {
        return obj.map(item => estandarizarNombres(item));
    }
    
    // Caso 2: Si esObjeto o nulo, procesar sus claves para renombrarlas
    if (obj !== null && typeof obj === 'object') {
        const nuevoObj = {};
        
        for (const key in obj) {
            if (!obj.hasOwnProperty(key)) continue;
            
            // Conversión de clave
            const nuevaKey = key === '_id' ? 'id' : toCamelCase(key);
            
            // Aplicar recursivamente al valor
            nuevoObj[nuevaKey] = estandarizarNombres(obj[key]);
        }
        
        return nuevoObj;
    }
    
    // Caso 3: Si es valor primitivo - retornar sin cambios
    return obj;
}
/**
 * Convierte string a camelCase (primera letra minúscula)
 * @param {string} str - String a convertir
 * @returns {string} String en camelCase
 */
function toCamelCase(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
}