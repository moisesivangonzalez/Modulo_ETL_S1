/*/**
 * @file mapeo.js
 * @description Diccionario de equivalencias semánticas.
 * Resuelve la interoperabilidad entre los catálogos propietarios del sistema origen (DeclaraVer)
 * y los estándares normativos de la Plataforma Digital Nacional (PDN).
 */

// --- MAPAS DE CATÁLOGOS ---
// Mapeo de tipos de declaración
export const MAPEO_TIPOS_DECLARACION = {
  'INICIO': 'INICIAL', 'INICIAL': 'INICIAL',
  'MODIFICACION': 'MODIFICACIÓN', 'MODIFICACIÓN': 'MODIFICACIÓN',
  'CONCLUSION': 'CONCLUSIÓN', 'CONCLUSIÓN': 'CONCLUSIÓN', 'FINAL': 'CONCLUSIÓN'
};
// Mapeo de niveles de escolaridad
export const MAPEO_ESCOLARIDAD_CLAVE = {
  'PRI': 'PRI', 'SEC': 'SEC', 'BAC': 'BCH', 'BACHILLERATO': 'BCH', 'BCH': 'BCH',
  'CTC': 'CTC', 'LIC': 'LIC', 'LICENCIATURA': 'LIC', 'ESP': 'ESP',
  'MAE': 'MAE', 'MAESTRIA': 'MAE', 'DOC': 'DOC', 'DOCTORADO': 'DOC'
};
// Mapeo de valores de niveles de escolaridad
export const MAPEO_ESCOLARIDAD_VALOR = {
  PRI: "PRIMARIA", SEC: "SECUNDARIA", BCH: "BACHILLERATO",
  CTC: "CARRERA TÉCNICA O COMERCIAL", LIC: "LICENCIATURA",
  ESP: "ESPECIALIDAD", MAE: "MAESTRÍA", DOC: "DOCTORADO"
};
// Mapeo de estados civiles
export const MAPEO_ESTADO_CIVIL_CLAVE = {
  'SOL': 'SOL', 'SOLTERO': 'SOL', 'CAS': 'CAS', 'CASADO': 'CAS',
  'DIV': 'DIV', 'VIU': 'VIU', 'CON': 'CON', 'UNION LIBRE': 'CON', 'SCO': 'SCO'
};
// Mapeo de valores de estados civiles
export const MAPEO_ESTADO_CIVIL_VALOR = {
  SOL: "SOLTERO (A)", CAS: "CASADO (A)", DIV: "DIVORCIADO (A)",
  VIU: "VIUDO (A)", CON: "CONCUBINA/CONCUBINARIO/UNIÓN LIBRE",
  SCO: "SOCIEDAD DE CONVIVENCIA"
};
// Mapeo de niveles de gobierno
export const MAPEO_NIVEL_GOBIERNO = {
  'FEDERAL': 'FEDERAL', 'ESTATAL': 'ESTATAL',
  'MUNICIPAL': 'MUNICIPAL_ALCALDIA', 'MUNICIPAL/ALCALDIA': 'MUNICIPAL_ALCALDIA',
  'MUNICIPAL_ALCALDIA': 'MUNICIPAL_ALCALDIA'
};
// Mapeo de ámbitos del sector público
export const MAPEO_AMBITO_PUBLICO = {
  'EJECUTIVO': 'EJECUTIVO', 'LEGISLATIVO': 'LEGISLATIVO', 'JUDICIAL': 'JUDICIAL',
  'ORGANO AUTONOMO': 'ORGANO_AUTONOMO', 'ÓRGANO AUTÓNOMO': 'ORGANO_AUTONOMO',
  'ORGANO_AUTONOMO': 'ORGANO_AUTONOMO'
};
// Mapeo de formas de adquisición
export const MAPEO_FORMA_ADQUISICION_CLAVE = {
  'CPV': 'CPV', 'COMPRAVENTA': 'CPV', 'CSN': 'CSN', 'CESION': 'CSN', 'CESIÓN': 'CSN',
  'DNC': 'DNC', 'DONACION': 'DNC', 'DONACIÓN': 'DNC', 'DON': 'DNC',
  'HRN': 'HRN', 'HERENCIA': 'HRN', 'PRM': 'PRM', 'PERMUTA': 'PRM',
  'RST': 'RST', 'RIFA': 'RST', 'SORTEO': 'RST', 'RIFA O SORTEO': 'RST',
  'STC': 'STC', 'SENTENCIA': 'STC', 'ADJ': 'STC', 'DACION': 'CPV'
};
// Mapeo de valores de formas de adquisición
export const MAPEO_FORMA_ADQUISICION_VALOR = {
  CPV: "COMPRAVENTA", CSN: "CESIÓN", DNC: "DONACIÓN",
  HRN: "HERENCIA", PRM: "PERMUTA", RST: "RIFA O SORTEO", STC: "SENTENCIA"
};
// Mapeo de tipos de inmueble
export const MAPEO_TIPO_INMUEBLE_CLAVE = {
  'CASA': 'CASA', 'DPTO': 'DPTO', 'DEPARTAMENTO': 'DPTO',
  'EDIF': 'EDIF', 'EDIFICIO': 'EDIF', 'LOCC': 'LOCC', 'LOCAL COMERCIAL': 'LOCC',
  'BODG': 'BODG', 'BODEGA': 'BODG', 'PALC': 'PALC', 'PALCO': 'PALC',
  'RACH': 'RACH', 'RANCHO': 'RACH', 'TERR': 'TERR', 'TERRENO': 'TERR',
  'OTRO': 'OTRO', 'OTROS': 'OTRO'
};
// Mapeo de valores de tipos de inmueble
export const MAPEO_TIPO_INMUEBLE_VALOR = {
  CASA: "CASA", DPTO: "DEPARTAMENTO", EDIF: "EDIFICIO",
  LOCC: "LOCAL COMERCIAL", BODG: "BODEGA", PALC: "PALCO",
  RACH: "RANCHO", TERR: "TERRENO", OTRO: "OTROS (ESPECIFIQUE)"
};
// Mapeo de tipos de mueble
export const MAPEO_TIPO_MUEBLE_CLAVE = {
  'MECA': 'MECA', 'MENAJE': 'MECA', 'MENAJE DE CASA': 'MECA',
  'APAE': 'APAE', 'APARATOS': 'APAE', 'APARATOS ELECTRONICOS': 'APAE',
  'APARATOS ELECTRÓNICOS': 'APAE', 'APARATOS ELECTRÓNICOS Y ELECTRODOMÉSTICOS': 'APAE',
  'JOYA': 'JOYA', 'JOYAS': 'JOYA', 'COLEC': 'COLEC', 'COLECCIONES': 'COLEC',
  'OBRA': 'OBRA', 'OBRAS': 'OBRA', 'OBRAS DE ARTE': 'OBRA',
  'OTRO': 'OTRO', 'OTROS': 'OTRO'
};
// Mapeo de valores de tipos de mueble
export const MAPEO_TIPO_MUEBLE_VALOR = {
  MECA: "MENAJE DE CASA (MUEBLES Y ACCESORIOS DE CASA)",
  APAE: "APARATOS ELECTRÓNICOS Y ELECTRODOMÉSTICOS",
  JOYA: "JOYAS", COLEC: "COLECCIONES", OBRA: "OBRAS DE ARTE",
  OTRO: "OTROS (ESPECIFIQUE)"
};
// Mapeo de tipos de vehículo
export const MAPEO_TIPO_VEHICULO_CLAVE = {
  'AUMOT': 'AUMOT', 'AUTOMOVIL': 'AUMOT', 'MOTOCICLETA': 'AUMOT',
  'AUTOMÓVIL/MOTOCICLETA': 'AUMOT', 'AERN': 'AERN', 'AERONAVE': 'AERN',
  'BARYA': 'BARYA', 'BARCO': 'BARYA', 'YATE': 'BARYA', 'BARCO/YATE': 'BARYA',
  'OTRO': 'OTRO', 'OTROS': 'OTRO'
};
// Mapeo de valores de tipos de vehículo
export const MAPEO_TIPO_VEHICULO_VALOR = {
  AUMOT: "AUTOMÓVIL/MOTOCICLETA", AERN: "AERONAVE",
  BARYA: "BARCO/YATE", OTRO: "OTROS (ESPECIFIQUE)"
};
// Mapeo de tipos de institución de participación
export const MAPEO_TIPO_INSTITUCION_PARTICIPACION_CLAVE = {
  'OSC': 'OSC', 'ORGANIZACIONES DE LA SOCIEDAD CIVIL': 'OSC',
  'OB': 'OB', 'ORGANIZACIONES BENEFICAS': 'OB', 'ORGANIZACIONES BENÉFICAS': 'OB',
  'PP': 'PP', 'PARTIDOS POLITICOS': 'PP', 'PARTIDOS POLÍTICOS': 'PP',
  'GS': 'GS', 'GREMIOS': 'GS', 'SINDICATOS': 'GS', 'GREMIOS/SINDICATOS': 'GS',
  'OTRO': 'OTRO', 'OTROS': 'OTRO'
};
// Mapeo de valores de tipos de institución de participación
export const MAPEO_TIPO_INSTITUCION_PARTICIPACION_VALOR = {
  OSC: "ORGANIZACIONES DE LA SOCIEDAD CIVIL", OB: "ORGANIZACIONES BENÉFICAS",
  PP: "PARTIDOS POLÍTICOS", GS: "GREMIOS/SINDICATOS", OTRO: "OTRO (ESPECIFIQUE)"
};
// Mapeo de motivos de baja
export const MAPEO_MOTIVO_BAJA_CLAVE = {
  'VENTA': 'VEN', 'DONACION': 'DON', 'PERMUTA': 'PER',
  'ROBO': 'ROB', 'DESTRUCCION': 'DES', 'OTRO': 'OTRO'
};
// Mapeo de valores de motivos de baja
export const MAPEO_MOTIVO_BAJA_VALOR = {
  VEN: 'VENTA', DON: 'DONACIÓN', PER: 'PERMUTA',
  ROB: 'ROBO', DES: 'DESTRUCCIÓN', OTRO: 'OTRO (ESPECIFIQUE)'
};
// Mapeo de sectores económicos
export const MAPEO_SECTOR_CLAVE = {
  'AGRI': 'AGRI', 'MIN': 'MIN', 'EELECT': 'EELECT', 'CONS': 'CONS',
  'INDMANU': 'INDMANU', 'CMAYOR': 'CMAYOR', 'CMENOR': 'CMENOR',
  'TRANS': 'TRANS', 'MEDIOM': 'MEDIOM', 'SERVFIN': 'SERVFIN',
  'SERVINM': 'SERVINM', 'SERVPROF': 'SERVPROF', 'SALUD': 'SERVS',
  'EDUC': 'OTRO', 'RESTBAR': 'OTRO', 'RECREA': 'SERVESPAR',
  'HOTELES': 'SERVALOJ', 'OTRO': 'OTRO', 'OTR': 'OTRO',
  'SERVS': 'SERVS', 'SERVCORP': 'SERVCORP', 'SERVESPAR': 'SERVESPAR',
  'SERVALOJ': 'SERVALOJ'
};
// Mapeo de valores de sectores económicos
export const MAPEO_SECTOR_VALOR = {
  AGRI: "AGRICULTURA", MIN: "MINERÍA", EELECT: "ENERGÍA ELÉCTRICA",
  CONS: "CONSTRUCCIÓN", INDMANU: "INDUSTRIA MANUFACTURERA",
  CMAYOR: "COMERCIO AL POR MAYOR", CMENOR: "COMERCIO AL POR MENOR",
  TRANS: "TRANSPORTE", MEDIOM: "MEDIOS MASIVOS",
  SERVFIN: "SERVICIOS FINANCIEROS", SERVINM: "SERVICIOS INMOBILIARIOS",
  SERVPROF: "SERVICIOS PROFESIONALES", SERVCORP: "SERVICIOS CORPORATIVOS",
  SERVS: "SERVICIOS DE SALUD", SERVESPAR: "SERVICIOS DE ESPARCIMIENTO",
  SERVALOJ: "SERVICIOS DE ALOJAMIENTO", OTRO: "OTRO (ESPECIFIQUE)",
  OTR: "OTRO (ESPECIFIQUE)"
};
// Mapeo de ámbito del sector económico
export const MAPEO_AMBITO_SECTOR_CLAVE = {
  'PUB': 'PUB', 'PUBLICO': 'PUB', 'PÚBLICO': 'PUB', 'PUBLIC': 'PUB',
  'PRV': 'PRV', 'PRIV': 'PRV', 'PRIVADO': 'PRV', 'PRIVATE': 'PRV',
  'OTR': 'OTR', 'OTRO': 'OTR'
};
// Mapeo de valores de ámbito del sector económico
export const MAPEO_AMBITO_SECTOR_VALOR = {
  PUB: "PÚBLICO", PRV: "PRIVADO", OTR: "OTRO"
};
// Mapeo de titularidades
export const MAPEO_TITULAR_CLAVE = {
  'DEC': 'DEC', 'DECLARANTE': 'DEC', 'CYG': 'CYG', 'CONYUGE': 'CYG', 'CÓNYUGE': 'CYG',
  'CON': 'CBN', 'CONCUBINA': 'CBN', 'CONCUBINO': 'CBN', 'CONCUBINA/CONCUBINARIO': 'CBN',
  'CONV': 'CVV', 'DEP': 'DEN', 'DEPENDIENTE': 'DEN', 'DEPENDIENTE ECONOMICO': 'DEN',
  'HIJ': 'DEN', 'SOC': 'CTER', 'OTR': 'CTER', 'CTER': 'CTER'
};
// Mapeo de valores de titularidades
export const MAPEO_TITULAR_VALOR = {
  DEC: "DECLARANTE", CYG: "CÓNYUGE", CBN: "CONCUBINA O CONCUBINARIO",
  CVV: "CONVIVIENTE", DEN: "DEPENDIENTE ECONÓMICO", CTER: "COPROPIEDAD CON TERCEROS"
};
// Mapeo de tipos de operación
export const MAPEO_TIPO_OPERACION = {
  'AL': 'AGREGAR', 'AGREGAR': 'AGREGAR', 'BJ': 'BAJA', 'BAJA': 'BAJA',
  'MC': 'MODIFICAR', 'MODIFICAR': 'MODIFICAR', 'SIN_CAMBIO': 'SIN_CAMBIOS',
  'SIN CAMBIOS': 'SIN_CAMBIOS', 'SIN_CAMBIOS': 'SIN_CAMBIOS',
  ' ': 'SIN_CAMBIOS', '': 'SIN_CAMBIOS'
};
// Mapeo de relaciones familiares
export const MAPEO_RELACION_CLAVE = {
  'NIN': 'NIN', 'NINGUNO': 'NIN', 'NINGUNA': 'NIN',
  'PADRE': 'PADRE', 'MADRE': 'MADRE', 'HIJO': 'HIJO', 'HIJA': 'HIJA',
  'HERMANO': 'HERMANO', 'HERMANA': 'HERMANA', 'CONYUGE': 'CONYUGE', 'CÓNYUGE': 'CONYUGE',
  'SUEGRO': 'SUEGRO', 'SUEGRA': 'SUEGRA', 'YERNO': 'YERNO', 'NUERA': 'NUERA',
  'TIO': 'TIO', 'TÍO': 'TIO', 'TIA': 'TIA', 'TÍA': 'TIA',
  'SOBRINO': 'SOBRINO', 'SOBRINA': 'SOBRINA', 'PRIMO': 'PRIMO', 'PRIMA': 'PRIMA',
  'ABUELO': 'ABUELO', 'ABUELA': 'ABUELA', 'NIETO': 'NIETO', 'NIETA': 'NIETA',
  'OTRO': 'OTRO'
};
// Mapeo de valores de relaciones familiares
export const MAPEO_RELACION_VALOR = {
  NIN: "NINGUNO", PADRE: "PADRE", MADRE: "MADRE", HIJO: "HIJO", HIJA: "HIJA",
  HERMANO: "HERMANO", HERMANA: "HERMANA", CONYUGE: "CÓNYUGE",
  SUEGRO: "SUEGRO", SUEGRA: "SUEGRA", YERNO: "YERNO", NUERA: "NUERA",
  TIO: "TÍO", TIA: "TÍA", SOBRINO: "SOBRINO", SOBRINA: "SOBRINA",
  PRIMO: "PRIMO", PRIMA: "PRIMA", ABUELO: "ABUELO", ABUELA: "ABUELA",
  NIETO: "NIETO", NIETA: "NIETA", OTRO: "OTRO"
};
// Mapeo de monedas
export const MAPEO_MONEDAS = {
  'MXN': 'MXN', 'PESOS': 'MXN', 'PESO MEXICANO': 'MXN', 'MXP': 'MXN',
  'USD': 'USD', 'DOLARES': 'USD', 'DÓLARES': 'USD', 'DOLAR': 'USD',
  'DLL': 'USD', 'DLLS': 'USD', 'EUR': 'EUR', 'EUROS': 'EUR'
};
// Mapeo de países
export const MAPEO_PAISES = {
  'MX': 'MX', 'MEXICO': 'MX', 'MÉXICO': 'MX',
  'US': 'US', 'USA': 'US', 'ESTADOS UNIDOS': 'US',
  'E.U.A.': 'US', 'ESTADOS UNIDOS DE AMERICA': 'US',
  'CA': 'CA', 'CANADA': 'CA', 'CANADÁ': 'CA'
};
// Mapeo de ubicaciones
export const MAPEO_UBICACION = {
  'MEXICO': 'MX', 'MÉXICO': 'MX', 'MX': 'MX', 'NACIONAL': 'MX',
  'EXTRANJERO': 'EX', 'EX': 'EX', 'INTERNACIONAL': 'EX'
};
// Mapeo de tipos de inversión
export const MAPEO_TIPO_INVERSION_CLAVE = {
  'BANC': 'BANC', 'BANCARIA': 'BANC', 'FINV': 'FINV',
  'FONDOS DE INVERSION': 'FINV', 'FONDOS DE INVERSIÓN': 'FINV',
  'ORPM': 'ORPM', 'ORGANIZACIONES PRIVADAS Y/O MERCANTILES': 'ORPM',
  'POMM': 'POMM', 'POSESION DE MONEDAS Y/O METALES': 'POMM',
  'POSESIÓN DE MONEDAS Y/O METALES': 'POMM', 'SEGR': 'SEGR', 'SEGUROS': 'SEGR',
  'VBUR': 'VBUR', 'VALORES BURSATILES': 'VBUR', 'VALORES BURSÁTILES': 'VBUR',
  'AFOT': 'AFOT', 'AFORES Y OTROS': 'AFOT'
};
// Mapeo de valores de tipos de inversión
export const MAPEO_TIPO_INVERSION_VALOR = {
  BANC: "BANCARIA", FINV: "FONDOS DE INVERSIÓN",
  ORPM: "ORGANIZACIONES PRIVADAS Y/O MERCANTILES",
  POMM: "POSESIÓN DE MONEDAS Y/O METALES", SEGR: "SEGUROS",
  VBUR: "VALORES BURSÁTILES", AFOT: "AFORES Y OTROS"
};
// Mapeo de subtipos de inversión
export const MAPEO_SUBTIPO_INVERSION_CLAVE = {
  'CNOM': 'CNOM', 'CUENTA DE NOMINA': 'CNOM', 'CUENTA DE NÓMINA': 'CNOM',
  'CAHO': 'CAHO', 'CUENTA DE AHORRO': 'CAHO', 'CCHE': 'CCHE', 'CUENTA DE CHEQUES': 'CCHE',
  'CMAS': 'CMAS', 'CUENTA MAESTRA': 'CMAS', 'CEJE': 'CEJE', 'CUENTA EJE': 'CEJE',
  'DPLA': 'DPLA', 'DEPOSITO A PLAZOS': 'DPLA', 'DEPÓSITO A PLAZOS': 'DPLA',
  'SOIN': 'SOIN', 'SOCIEDADES DE INVERSION': 'SOIN', 'SOCIEDADES DE INVERSIÓN': 'SOIN',
  'IFEX': 'IFEX', 'INVERSIONES FINANCIERAS EN EL EXTRANJERO': 'IFEX',
  'ACCI': 'ACCI', 'ACCIONES': 'ACCI', 'CSAH': 'CSAH', 'CAJAS DE AHORRO': 'CSAH',
  'CENT': 'CENT', 'CENTENARIOS': 'CENT', 'DIVS': 'DIVS', 'DIVISAS': 'DIVS',
  'MONN': 'MONN', 'MONEDA NACIONAL': 'MONN', 'ONZT': 'ONZT', 'ONZAS TROY': 'ONZT',
  'CRIP': 'CRIP', 'CRIPTOMONEDAS': 'CRIP', 'SSIN': 'SSIN',
  'SEGURO DE SEPARACION INDIVIDUALIZADO': 'SSIN', 'SEGURO DE SEPARACIÓN INDIVIDUALIZADO': 'SSIN',
  'SEGI': 'SEGI', 'SEGURO DE INVERSION': 'SEGI', 'SEGURO DE INVERSIÓN': 'SEGI',
  'SEGV': 'SEGV', 'SEGURO DE VIDA': 'SEGV', 'ADER': 'ADER', 'ACCIONES Y DERIVADOS': 'ADER',
  'ABAN': 'ABAN', 'ACEPTACIONES BANCARIAS': 'ABAN', 'BGUB': 'BGUB', 'BONOS GUBERNAMENTALES': 'BGUB',
  'PCOM': 'PCOM', 'PAPEL COMERCIAL': 'PCOM', 'AFOR': 'AFOR', 'AFORES': 'AFOR',
  'FIDE': 'FIDE', 'FIDEICOMISOS': 'FIDE', 'CTES': 'CTES',
  'CERTIFICADOS DE LA TESORERIA': 'CTES', 'CERTIFICADOS DE LA TESORERÍA': 'CTES',
  'PFTE': 'PFTE', 'PRESTAMOS A FAVOR DE UN TERCERO': 'PFTE', 'PRÉSTAMOS A FAVOR DE UN TERCERO': 'PFTE'
};
// Mapeo de valores de subtipos de inversión
export const MAPEO_SUBTIPO_INVERSION_VALOR = {
  CNOM: "CUENTA DE NÓMINA", CAHO: "CUENTA DE AHORRO", CCHE: "CUENTA DE CHEQUES",
  CMAS: "CUENTA MAESTRA", CEJE: "CUENTA EJE", DPLA: "DEPÓSITO A PLAZOS",
  SOIN: "SOCIEDADES DE INVERSIÓN", IFEX: "INVERSIONES FINANCIERAS EN EL EXTRANJERO",
  ACCI: "ACCIONES", CSAH: "CAJAS DE AHORRO", CENT: "CENTENARIOS",
  DIVS: "DIVISAS", MONN: "MONEDA NACIONAL", ONZT: "ONZAS TROY",
  CRIP: "CRIPTOMONEDAS", SSIN: "SEGURO DE SEPARACIÓN INDIVIDUALIZADO",
  SEGI: "SEGURO DE INVERSIÓN", SEGV: "SEGURO DE VIDA",
  ADER: "ACCIONES Y DERIVADOS", ABAN: "ACEPTACIONES BANCARIAS",
  BGUB: "BONOS GUBERNAMENTALES", PCOM: "PAPEL COMERCIAL",
  AFOR: "AFORES", FIDE: "FIDEICOMISOS", CTES: "CERTIFICADOS DE LA TESORERÍA",
  PFTE: "PRÉSTAMOS A FAVOR DE UN TERCERO"
};
// Mapeo de formas de pago
export const MAPEO_FORMA_PAGO = {
  'CREDITO': 'CRÉDITO', 'CRÉDITO': 'CRÉDITO', 'CONTADO': 'CONTADO',
  'NO APLICA': 'NO APLICA', 'NA': 'NO APLICA', 'N/A': 'NO APLICA'
};

// --- REGISTRO DE MAPAS ---
const MAPS = {
  MAPEO_TIPOS_DECLARACION, MAPEO_ESCOLARIDAD_CLAVE, MAPEO_ESCOLARIDAD_VALOR,
  MAPEO_ESTADO_CIVIL_CLAVE, MAPEO_ESTADO_CIVIL_VALOR, MAPEO_NIVEL_GOBIERNO,
  MAPEO_AMBITO_PUBLICO, MAPEO_FORMA_ADQUISICION_CLAVE, MAPEO_FORMA_ADQUISICION_VALOR,
  MAPEO_TIPO_INMUEBLE_CLAVE, MAPEO_TIPO_INMUEBLE_VALOR, MAPEO_TIPO_VEHICULO_CLAVE,
  MAPEO_TIPO_VEHICULO_VALOR, MAPEO_SECTOR_CLAVE, MAPEO_SECTOR_VALOR,
  MAPEO_TITULAR_CLAVE, MAPEO_TITULAR_VALOR, MAPEO_TIPO_OPERACION,
  MAPEO_MONEDAS, MAPEO_PAISES, MAPEO_UBICACION, MAPEO_TIPO_INVERSION_CLAVE,
  MAPEO_TIPO_INVERSION_VALOR, MAPEO_SUBTIPO_INVERSION_CLAVE, MAPEO_SUBTIPO_INVERSION_VALOR,
  MAPEO_MOTIVO_BAJA_CLAVE, MAPEO_MOTIVO_BAJA_VALOR, MAPEO_RELACION_CLAVE,
  MAPEO_RELACION_VALOR, MAPEO_TIPO_MUEBLE_CLAVE, MAPEO_TIPO_MUEBLE_VALOR,
  MAPEO_AMBITO_SECTOR_CLAVE, MAPEO_AMBITO_SECTOR_VALOR
};

/**
 * Función de traducción de valores.
 * Busca la equivalencia de un término local en el diccionario correspondiente.
 * - Normaliza la entrada (Mayúsculas, sin acentos).
 * - Maneja fallos retornando un valor por defecto.
 * * @param {string} valor - Término a traducir (ej. "ESPOSA").
 * @param {string|Object} mapeo - Nombre del diccionario o el objeto mapa directo.
 * @param {string} valorPorDefecto - Valor de fallback si no hay coincidencia.
 */
export function aplicarMapeo(valor, mapeo, valorPorDefecto = null) {
  if (valor === null || valor === undefined || valor === '') return valorPorDefecto;

  const valorNormalizado = String(valor)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase()
    .trim();

  let dict = mapeo;
  if (typeof mapeo === "string" && MAPS[mapeo]) dict = MAPS[mapeo];

  if (typeof dict !== 'object' || dict === null) {
    console.warn(`WARN: Mapeo inválido para '${valor}'.`);
    return valorPorDefecto !== null ? valorPorDefecto : valor;
  }

  if (dict.hasOwnProperty(valorNormalizado)) return dict[valorNormalizado];
   // No se encontró el valor en el mapeo
  console.warn(`WARN: Valor '${valor}' no encontrado en mapeo.`);
  return valorPorDefecto !== null ? valorPorDefecto : valor;
}

// Funciones específicas de mapeo
export const mapearTipoDeclaracion = tipo => aplicarMapeo(tipo, MAPEO_TIPOS_DECLARACION, tipo);
export const mapearClaveEscolaridad = clave => aplicarMapeo(clave, MAPEO_ESCOLARIDAD_CLAVE, null);
export const mapearClaveEstadoCivil = clave => aplicarMapeo(clave, MAPEO_ESTADO_CIVIL_CLAVE, null);
export const mapearUbicacion = ubicacion => aplicarMapeo(ubicacion, MAPEO_UBICACION, null);