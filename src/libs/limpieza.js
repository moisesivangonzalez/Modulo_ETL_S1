/**
 * @file limpieza.js
 * @description Módulo de Limpieza y Normalización de Datos Primitivos.
 * Provee funciones puras para la limpieza de cadenas, validación de formatos oficiales (RFC, CURP)
 * y estandarización de tipos de datos antes del procesamiento lógico.
 */
// Limpia texto: elimina espacios al inicio/final. Devuelve "" para null/undefined.
export function limpiarTexto(texto) {
  if (texto === null || texto === undefined) return "";
  return String(texto).trim();
}
// Limpia y valida correos electrónicos. Devuelve "" si es inválido.
export function limpiarCorreo(correo) {
  if (!correo) return "";
  const limpio = String(correo).trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(limpio)) {
    return limpio;
  } else {
    console.warn(`WARN: Correo inválido detectado: ${correo}`);
    return "";
  }
}
// Limpia teléfonos: mantiene solo dígitos y '+'.
export function limpiarTelefono(telefono) {
  if (telefono === null || telefono === undefined) return "";
  return String(telefono).replace(/[^\d+]/g, "").trim();
}
// Limpia y valida RFC (longitud 12 o 13). Devuelve "" si es inválido.
export function limpiarRFC(rfc) {
  if (!rfc) return "";
  const limpio = String(rfc).trim().toUpperCase().replace(/[-\s]/g, "");
  const rfcRegex = /^[A-Z&Ñ]{3,4}\d{6}[A-Z\d]{3}$/;
  if (rfcRegex.test(limpio)) {
    return limpio;
  } else {
    console.warn(`WARN: RFC con formato inválido detectado: ${rfc}`);
    return "";
  }
}

// Limpia y valida CURP (longitud 18). Devuelve "" si es inválido.
export function limpiarCURP(curp) {
  if (!curp) return "";
  const limpio = String(curp).trim().toUpperCase().replace(/[-\s]/g, "");
  const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z\d]\d$/;
  if (limpio.length === 18 && curpRegex.test(limpio)) {
    return limpio;
  } else {
    console.warn(`WARN: CURP con formato inválido detectado: ${curp}`);
    return "";
  }
}

// Limpia strings numéricos: quita $, comas. No convierte a número.
export function limpiarStringNumerico(valorStr) {
  if (typeof valorStr !== 'string') return valorStr;
  return valorStr.replace(/[$,]/g, "").trim();
}

// Convierte valor a booleano de forma flexible.
export function limpiarBooleano(valor) {
  if (typeof valor === 'boolean') return valor;
  if (valor === null || valor === undefined) return false;
  const str = String(valor).toLowerCase().trim();
  return ['true', '1', 'si', 'sí', 'yes', 'verdadero', 't'].includes(str);
}

// Normaliza nombres propios: capitaliza primera letra de cada palabra.
export function limpiarNombre(nombre) {
  if (!nombre) return "";
  return String(nombre)
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .split(' ')
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(' ');
}

// Limpia textos largos: elimina espacios duplicados y caracteres raros.
export function limpiarTextoLargo(texto) {
  if (!texto) return "";
  return String(texto)
    .replace(/[\u00A0\u200B\u200C\u200D\u202F\uFEFF]/g, " ")
    .replace(/\s+/g, ' ')
    .trim();
}

// Limpia códigos postales a 5 dígitos. Devuelve "" si es inválido.
export function limpiarCodigoPostal(cp) {
  if (cp === null || cp === undefined) return "";
  const limpio = String(cp).replace(/\D/g, '').padStart(5, '0');
  return limpio.length === 5 ? limpio.slice(-5) : "";
}

// Limpia claves numéricas con padding (municipio, entidad).
export function limpiarClaveNumerica(clave, longitud = 3) {
  if (clave === null || clave === undefined) return "".padStart(longitud, '0');
  const limpio = String(clave).replace(/\D/g, '').padStart(longitud, '0');
  return limpio.slice(-longitud);
}

// Convierte nombre de entidad a clave de 2 dígitos.
export const limpiarClaveEntidad = valor => {
  if (!valor) return null;
  const mapa = {
    "AGUASCALIENTES": "01", "BAJA CALIFORNIA": "02", "BAJA CALIFORNIA SUR": "03",
    "CAMPECHE": "04", "COAHUILA": "05", "COLIMA": "06", "CHIAPAS": "07", "CHIHUAHUA": "08",
    "CDMX": "09", "CIUDAD DE MÉXICO": "09", "DISTRITO FEDERAL": "09",
    "DURANGO": "10", "GUANAJUATO": "11", "GUERRERO": "12", "HIDALGO": "13",
    "JALISCO": "14", "MÉXICO": "15", "MEXICO": "15", "MICHOACÁN": "16",
    "MICHOACAN": "16", "MORELOS": "17", "NAYARIT": "18", "NUEVO LEÓN": "19",
    "NUEVO LEON": "19", "OAXACA": "20", "PUEBLA": "21", "QUERÉTARO": "22",
    "QUERETARO": "22", "QUINTANA ROO": "23", "SAN LUIS POTOSÍ": "24",
    "SAN LUIS POTOSI": "24", "SINALOA": "25", "SONORA": "26", "TABASCO": "27",
    "TAMAULIPAS": "28", "TLAXCALA": "29", "VERACRUZ": "30", "YUCATÁN": "31",
    "YUCATAN": "31", "ZACATECAS": "32"
  };
  const v = String(valor).normalize("NFD").replace(/\p{Diacritic}/gu, "").toUpperCase().trim();
  return mapa[v] || null;
};