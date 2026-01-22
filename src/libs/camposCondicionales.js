/**
 * @file camposCondicionales.js
 * @description Gestor de Reglas de Negocio y Lógica Condicional.
 * Define los campos obligatorios y exclusivos según la tipología de la declaración
 * (Inicial, Modificación, Conclusión), basándose en la normativa de la PDN.
 */

/**
 * Mapa de configuración que define la existencia de campos exclusivos.
 * Actúa como la fuente de verdad para el motor de normalización.
 * Estructura: TIPO -> SECCIÓN -> CAMPO -> boolean
 */
export const CAMPOS_EXCLUSIVOS = {
  INICIAL: {
    ingresos: {
      remuneracionMensualCargoPublico: true,
      otrosIngresosMensualesTotal: true,
      ingresoMensualNetoDeclarante: true,
      ingresoMensualNetoParejaDependiente: true,
      totalIngresosMensualesNetos: true
    },
    adeudos: {
      saldoInsolutoSituacionActual: true
    },
    inversiones: {
      saldoSituacionActual: true
    }
  },
  MODIFICACION: {
    ingresos: {
      remuneracionAnualCargoPublico: true,
      otrosIngresosAnualesTotal: true,
      ingresoAnualNetoDeclarante: true,
      ingresoAnualNetoParejaDependiente: true,
      totalIngresosAnualesNetos: true
    },
    adeudos: {
      saldoInsolutoDiciembreAnterior: true
    },
    inversiones: {
      saldoDiciembreAnterior: true
    },
    datosEmpleoCargoComision: {
      cuentaConOtroCargoPublico: true,
      otroEmpleoCargoComision: true
    }
  },
  CONCLUSION: {
    ingresos: {
      remuneracionConclusionCargoPublico: true,
      otrosIngresosConclusionTotal: true,
      ingresoConclusionNetoDeclarante: true,
      ingresoConclusionNetoParejaDependiente: true,
      totalIngresosConclusionNetos: true
    },
    adeudos: {
      saldoInsolutoFechaConclusion: true
    },
    inversiones: {
      saldoFechaConclusion: true
    }
  }
};
// 2. RUTAS DE ACCESO 
/**
 * Registro de rutas completas (Dot Notation) para campos condicionales.
 * Utilizado para validación profunda y generación de reportes de cobertura.
 */
export const CAMPOS_EXCLUSIVOS_RUTAS = {
  INICIAL: [
    'declaracion.situacionPatrimonial.adeudos.adeudo[].saldoInsolutoSituacionActual',
    'declaracion.situacionPatrimonial.ingresos.ingresoMensualNetoDeclarante',
    'declaracion.situacionPatrimonial.ingresos.otrosIngresosMensualesTotal',
    'declaracion.situacionPatrimonial.ingresos.remuneracionMensualCargoPublico',
    'declaracion.situacionPatrimonial.ingresos.totalIngresosMensualesNetos',
    'declaracion.situacionPatrimonial.inversiones.inversion[].saldoSituacionActual'
  ],
  MODIFICACION: [
    'declaracion.situacionPatrimonial.adeudos.adeudo[].saldoInsolutoDiciembreAnterior',
    'declaracion.situacionPatrimonial.datosEmpleoCargoComision.cuentaConOtroCargoPublico',
    'declaracion.situacionPatrimonial.datosEmpleoCargoComision.otroEmpleoCargoComision',
    'declaracion.situacionPatrimonial.datosEmpleoCargoComision.otroEmpleoCargoComision[].aclaracionesObservaciones',
    'declaracion.situacionPatrimonial.datosEmpleoCargoComision.otroEmpleoCargoComision[].ambitoPublico',
    'declaracion.situacionPatrimonial.datosEmpleoCargoComision.otroEmpleoCargoComision[].areaAdscripcion',
    'declaracion.situacionPatrimonial.datosEmpleoCargoComision.otroEmpleoCargoComision[].contratadoPorHonorarios',
    'declaracion.situacionPatrimonial.datosEmpleoCargoComision.otroEmpleoCargoComision[].domicilioExtranjero',
    'declaracion.situacionPatrimonial.datosEmpleoCargoComision.otroEmpleoCargoComision[].domicilioMexico',
    'declaracion.situacionPatrimonial.datosEmpleoCargoComision.otroEmpleoCargoComision[].empleoCargoComision',
    'declaracion.situacionPatrimonial.datosEmpleoCargoComision.otroEmpleoCargoComision[].fechaTomaPosesion',
    'declaracion.situacionPatrimonial.datosEmpleoCargoComision.otroEmpleoCargoComision[].funcionPrincipal',
    'declaracion.situacionPatrimonial.datosEmpleoCargoComision.otroEmpleoCargoComision[].nivelEmpleoCargoComision',
    'declaracion.situacionPatrimonial.datosEmpleoCargoComision.otroEmpleoCargoComision[].nivelOrdenGobierno',
    'declaracion.situacionPatrimonial.datosEmpleoCargoComision.otroEmpleoCargoComision[].nombreEntePublico',
    'declaracion.situacionPatrimonial.datosEmpleoCargoComision.otroEmpleoCargoComision[].telefonoOficina',
    'declaracion.situacionPatrimonial.datosEmpleoCargoComision.otroEmpleoCargoComision[].telefonoOficina.extension',
    'declaracion.situacionPatrimonial.datosEmpleoCargoComision.otroEmpleoCargoComision[].telefonoOficina.telefono',
    'declaracion.situacionPatrimonial.ingresos.ingresoAnualNetoDeclarante',
    'declaracion.situacionPatrimonial.ingresos.otrosIngresosAnualesTotal',
    'declaracion.situacionPatrimonial.ingresos.remuneracionAnualCargoPublico',
    'declaracion.situacionPatrimonial.ingresos.totalIngresosAnualesNetos',
    'declaracion.situacionPatrimonial.inversiones.inversion[].saldoDiciembreAnterior'
  ],
  CONCLUSION: [
    'declaracion.situacionPatrimonial.adeudos.adeudo[].saldoInsolutoFechaConclusion',
    'declaracion.situacionPatrimonial.ingresos.ingresoConclusionNetoDeclarante',
    'declaracion.situacionPatrimonial.ingresos.otrosIngresosConclusionTotal',
    'declaracion.situacionPatrimonial.ingresos.remuneracionConclusionCargoPublico',
    'declaracion.situacionPatrimonial.ingresos.totalIngresosConclusionNetos',
    'declaracion.situacionPatrimonial.inversiones.inversion[].saldoFechaConclusion'
  ]
};
// 3. LÓGICA DE DETERMINACIÓN DE TIPO
//  Extrae y normaliza el tipo de declaración desde metadata.
export function getTipoDeclaracion(item) { //toma una declaracion
  const tipo = item?.metadata?.tipo; //guarda dentro de tipo lo que hay dentro de la declaracion en metadata y dentro de ahi el tipo
  if (!tipo) return null; //si no existe regresa null
  
  const tipoNormalizado = tipo
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase()
    .trim();
  if (tipoNormalizado === 'INICIO' || tipoNormalizado === 'INICIAL') return 'INICIAL';
  if (tipoNormalizado === 'MODIFICACION' || tipoNormalizado === 'MODIFICACIÓN') return 'MODIFICACION';
  if (tipoNormalizado === 'CONCLUSION' || tipoNormalizado === 'CONCLUSIÓN') return 'CONCLUSION';
  return null;
}
// 4. FUNCIONES DE CONSULTA
// Verifica si un campo es obligatorio/exclusivo para un tipo dado.
export function debeExistirCampo(seccion, campo, tipoDeclaracion) {
  const campos = CAMPOS_EXCLUSIVOS[tipoDeclaracion];
  if (!campos) return false;
  
  const camposSeccion = campos[seccion];
  if (!camposSeccion) return false;
  
  return camposSeccion[campo] === true;
}

//Obtiene todas las rutas exclusivas de un tipo
export function getRutasExclusivas(tipoDeclaracion) {
  return CAMPOS_EXCLUSIVOS_RUTAS[tipoDeclaracion] || [];
}