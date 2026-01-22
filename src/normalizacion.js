/**
 * @file normalizacion.js
 * @description Transformación DeclaraVer → PDN 
 * Coordina la ejecución de las reglas de negocio, limpieza, mapeo y reestructuración
 * para convertir cada sección de la declaración al estándar de la PDN.
 */
import {
    nz, toStr, toNum, toBool, sinAcentosMayus, clean, normalizaTipo, normalizaUbicacionMXEX,
    aISODate, aISODateTime, pad3, padN, makeMonto, buildMontoPDN, buildMontoPDNAllowZero,
    normalizaSuperficie, normalizaTipoOperacion, normalizaEnumObjeto,
    actividadpdnVacios, serviciospdnVacios, enajenacionpdnVacios, actividadFinancierapdnVacios, otrosIngresosVacios,
    validarTodasSeccionesNinguno, normalizarAnio, normalizarLugarRegistro,
    normalizarDomicilioMexico, normalizarDomicilioExtranjero, normalizarTelefonoOficina,
    normalizarFormaPago, normalizarValorConformeA, normalizarTransmisor, normalizarPais,
    normalizarOtorganteCredito, normalizarPersonaTercero, normalizarLocalizacionInversion,
    normalizarActividadComercial, normalizarActividadFinanciera, normalizarServiciosProfesionales,
    normalizarOtrosIngresos, normalizarEnajenacionBienes, normalizarOtrosIngresosTotal, calcularTotalIngresos,
    normalizarInstitucionEducativa, normalizarEmpleoCargoComision, normalizarExperienciaLaboral,
    normalizarUbicacion, normalizarTipoParticipacion, normalizarPorcentaje, normalizarRFC,
    normalizarBeneficiarioApoyo, normalizarTipoApoyo, normalizarFormaRecepcion, normalizarTipoPersona,
    normalizarTipoRelacionRepresentacion, normalizarTipoRepresentacion, normalizarUbicacionRepresentacion,
    normalizarTipoBeneficio, normalizarOtorganteBeneficio, normalizarTipoFideicomiso,
    normalizarTipoParticipacionFideicomiso, normalizarPersonaFideicomiso, normalizarFiduciario,
    normalizarEmpresaCliente, normalizarTipoBienPrestamo, normalizarInmueblePrestamo,
    normalizarVehiculoPrestamo, normalizarDuenoTitular, validarConsistenciaNinguno,
    normalizarClientePrincipal, normalizarUbicacionCliente
} from './libs/normalizacionHelpers.js';
import { limpiarNombre, limpiarRFC } from './libs/limpieza.js';
import { getTipoDeclaracion } from './libs/camposCondicionales.js';
import {
    MAPEO_ESCOLARIDAD_CLAVE, MAPEO_ESCOLARIDAD_VALOR, MAPEO_TIPO_INMUEBLE_CLAVE, MAPEO_TIPO_INMUEBLE_VALOR,
    MAPEO_TIPO_VEHICULO_CLAVE, MAPEO_TIPO_VEHICULO_VALOR, MAPEO_SECTOR_CLAVE, MAPEO_SECTOR_VALOR,
    MAPEO_TITULAR_CLAVE, MAPEO_TITULAR_VALOR, MAPEO_TIPO_INVERSION_CLAVE, MAPEO_TIPO_INVERSION_VALOR,
    MAPEO_SUBTIPO_INVERSION_CLAVE, MAPEO_SUBTIPO_INVERSION_VALOR, MAPEO_MOTIVO_BAJA_CLAVE, MAPEO_MOTIVO_BAJA_VALOR,
    MAPEO_FORMA_ADQUISICION_CLAVE, MAPEO_FORMA_ADQUISICION_VALOR, MAPEO_TIPO_MUEBLE_CLAVE, MAPEO_TIPO_MUEBLE_VALOR,
    MAPEO_TIPO_INSTITUCION_PARTICIPACION_CLAVE, MAPEO_TIPO_INSTITUCION_PARTICIPACION_VALOR, aplicarMapeo
} from './libs/mapeo.js';

const MXN = "MXN";
// HELPERS INTERNOS

//Si la sección está vacía o marcada como ninguno, genera el objeto { ninguno: true }
const normalizarSeccionNinguno = (obj, arrayKey, crearFn, mapFn) => {
    if (!obj || obj.ninguno === true) return crearFn(true);
    
    const items = (obj[arrayKey] || [])
        .map((item, idx) => item && typeof item === 'object' ? mapFn(item, idx) : null)
        .filter(item => item !== null);
    
    return {
        ninguno: validarConsistenciaNinguno(obj.ninguno, items),
        [arrayKey]: items,
        aclaracionesObservaciones: nz(toStr(obj.aclaracionesObservaciones))
    };
};
//Retorna una función que crea el objeto por defecto { ninguno: true, arreglo: [] }
const crearEstructuraVacia = (arrayKey, incluirAclaraciones = true) => (ninguno = true) => {
    const base = { ninguno, [arrayKey]: [] };
    if (incluirAclaraciones) base.aclaracionesObservaciones = "";
    return base;
};
// 1. METADATA Y ROOT
/**
 * Normaliza los metadatos de la declaración.
 * Asegura que las fechas de actualización cumplan ISO-8601 y estandariza el tipo de declaración.
 */
function fixMetadata(item) {
    if (!item.metadata) item.metadata = {};
    const meta = item.metadata;
    item.metadata = {
        actualizacion: meta.actualizacion ? aISODateTime(meta.actualizacion) : meta.actualizacion,
        institucion: toStr(meta.institucion),
        tipo: meta.tipo ? normalizaTipo(meta.tipo) : meta.tipo,
        declaracionCompleta: meta.declaracionCompleta !== undefined ? Boolean(meta.declaracionCompleta) : true,
        actualizacionConflictoInteres: meta.actualizacionConflictoInteres !== undefined 
            ? Boolean(meta.actualizacionConflictoInteres) : false
    };
}
/**
  * Limpieza de raíz. Elimina cualquier propiedad no permitida en el nivel superior del objeto JSON
 *  para evitar inyección de datos basura.
 */
function cleanItemRoot(item) {
    const camposPermitidos = ['id', 'metadata', 'declaracion'];
    Object.keys(item).forEach(key => {
        if (!camposPermitidos.includes(key)) delete item[key];
    });
}
// 2. DATOS GENERALES Y CURRICULARES
//Normaliza estructuras anidadas en Datos Generales (ej. correos institucionales).
function fixDatosGenerales(item) {
    const ce = item?.declaracion?.situacionPatrimonial?.datosGenerales?.correoElectronico;
    if (ce && typeof ce === "object") ce.institucional = nz(ce.institucional);
}
/**
 * Estandariza el historial académico del declarante.
 * Mapea niveles educativos y formatea fechas de obtención de documentos.
 */
function fixDatosCurricularesDeclarante(item) {
    const esc = item?.declaracion?.situacionPatrimonial?.datosCurricularesDeclarante?.escolaridad;
    if (!Array.isArray(esc)) return;
    
    esc.forEach((e, idx) => {
        if (!e || typeof e !== 'object') return;
        esc[idx] = {
            tipoOperacion: normalizaTipoOperacion(e.tipoOperacion),
            nivel: normalizaEnumObjeto(e.nivel, MAPEO_ESCOLARIDAD_CLAVE, MAPEO_ESCOLARIDAD_VALOR),
            institucionEducativa: normalizarInstitucionEducativa(e.institucionEducativa),
            carreraAreaConocimiento: nz(toStr(e.carreraAreaConocimiento)),
            estatus: nz(toStr(e.estatus)),
            documentoObtenido: nz(toStr(e.documentoObtenido)),
            fechaObtencion: aISODate(e.fechaObtencion)
        };
    });
}
// 3. EMPLEO Y EXPERIENCIA
/**
 * Normaliza el empleo actual (Cargo Comisión).
 * Aplica lógica condicional: Si es MODIFICACIÓN, procesa cargos adicionales.
 */
function fixDatosEmpleoCargoComision(item) {
    const decc = item?.declaracion?.situacionPatrimonial?.datosEmpleoCargoComision;
    if (!decc) return;
    const tipoDeclaracion = getTipoDeclaracion(item);
    const empleoPDN = normalizarEmpleoCargoComision(decc, tipoDeclaracion);

    if (tipoDeclaracion === 'MODIFICACION') {
        empleoPDN.cuentaConOtroCargoPublico = Boolean(decc.cuentaConOtroCargoPublico);
        empleoPDN.otroEmpleoCargoComision = Array.isArray(decc.otroEmpleoCargoComision)
            ? decc.otroEmpleoCargoComision.map(otro => normalizarEmpleoCargoComision(otro, tipoDeclaracion))
            : [];
    }
    item.declaracion.situacionPatrimonial.datosEmpleoCargoComision = empleoPDN;
}
/**
 * Procesa la experiencia laboral previa.
 * Maneja la nulidad explícita si el declarante no reporta experiencia pasada.
 */
function fixExperienciaLaboral(item) {
    const expObj = item?.declaracion?.situacionPatrimonial?.experienciaLaboral;
    if (!expObj) return;
    if (expObj.ninguno === true || !Array.isArray(expObj.experiencia)) {
        item.declaracion.situacionPatrimonial.experienciaLaboral = {
            ninguno: true,
            experiencia: []
        };
        return;
    }
    expObj.experiencia = expObj.experiencia
        .map(e => e && typeof e === 'object' ? normalizarExperienciaLaboral(e) : null)
        .filter(exp => exp !== null);
    
    expObj.ninguno = false;
}
// 4. INGRESOS (CONDICIONAL POR TIPO)
/**
 * Normaliza Ingresos.
 * Aplica Reglas de Negocio Condicionales:
 * - INICIAL: Procesa ingresos mensuales.
 * - MODIFICACIÓN/CONCLUSIÓN: Procesa ingresos anuales y enajenación de bienes.
 * Calcula automáticamente los totales para garantizar consistencia aritmética.
 */
function fixIngresos(item) {
    const sp = item?.declaracion?.situacionPatrimonial;
    if (!sp) return;
    const tipoDeclaracion = getTipoDeclaracion(item);
    if (!tipoDeclaracion) return;
    const src = sp.ingresos || {};
    const actividadIndustrialComercialEmpresarial = normalizarActividadComercial(src.actividadIndustrialComercialEmpresarial);
    const actividadFinanciera = normalizarActividadFinanciera(src.actividadFinanciera);
    const serviciosProfesionales = normalizarServiciosProfesionales(src.serviciosProfesionales);
    const otrosIngresos = normalizarOtrosIngresos(src.otrosIngresos);
    if (tipoDeclaracion === 'INICIAL') {
        sp.ingresos = {
            remuneracionMensualCargoPublico: buildMontoPDNAllowZero(src.remuneracionMensualCargoPublico?.valor ?? src.remuneracionMensualCargoPublico),
            otrosIngresosMensualesTotal: normalizarOtrosIngresosTotal(src.otrosIngresosMensualesTotal),
            actividadIndustrialComercialEmpresarial, actividadFinanciera, serviciosProfesionales, otrosIngresos,
            ingresoMensualNetoDeclarante: buildMontoPDNAllowZero(src.ingresoMensualNetoDeclarante?.valor ?? src.ingresoMensualNetoDeclarante),
            totalIngresosMensualesNetos: calcularTotalIngresos(src.remuneracionMensualCargoPublico, src.otrosIngresosMensualesTotal)
        };
    } else if (tipoDeclaracion === 'MODIFICACION') {
        sp.ingresos = {
            remuneracionAnualCargoPublico: buildMontoPDNAllowZero(src.remuneracionAnualCargoPublico?.valor ?? src.remuneracionAnualCargoPublico),
            otrosIngresosAnualesTotal: normalizarOtrosIngresosTotal(src.otrosIngresosAnualesTotal),
            actividadIndustrialComercialEmpresarial, actividadFinanciera, serviciosProfesionales,
            enajenacionBienes: normalizarEnajenacionBienes(src.enajenacionBienes), otrosIngresos,
            ingresoAnualNetoDeclarante: buildMontoPDNAllowZero(src.ingresoAnualNetoDeclarante?.valor ?? src.ingresoAnualNetoDeclarante),
            totalIngresosAnualesNetos: calcularTotalIngresos(src.remuneracionAnualCargoPublico, src.otrosIngresosAnualesTotal)
        };
    } else if (tipoDeclaracion === 'CONCLUSION') {
        sp.ingresos = {
            remuneracionConclusionCargoPublico: buildMontoPDNAllowZero(src.remuneracionConclusionCargoPublico?.valor ?? src.remuneracionConclusionCargoPublico),
            otrosIngresosConclusionTotal: normalizarOtrosIngresosTotal(src.otrosIngresosConclusionTotal),
            actividadIndustrialComercialEmpresarial, actividadFinanciera, serviciosProfesionales,
            enajenacionBienes: normalizarEnajenacionBienes(src.enajenacionBienes), otrosIngresos,
            ingresoConclusionNetoDeclarante: buildMontoPDNAllowZero(src.ingresoConclusionNetoDeclarante?.valor ?? src.ingresoConclusionNetoDeclarante),
            totalIngresosConclusionNetos: calcularTotalIngresos(src.remuneracionConclusionCargoPublico, src.otrosIngresosConclusionTotal)
        };
    }
}
/**
 * Garantiza la existencia de la estructura 'actividadAnualAnterior'.
 * Rellena valores por defecto si la sección es requerida pero inexistente en el origen.
 */
function ensureActividadAnualAnterior(item) {
    const sp = item?.declaracion?.situacionPatrimonial;
    if (!sp) return;

    const estructuraBase = {
        servidorPublicoAnioAnterior: false, fechaIngreso: "2010-01-01", fechaConclusion: "2010-01-01",
        remuneracionNetaCargoPublico: { valor: -1, moneda: "" }, otrosIngresosTotal: { valor: -1, moneda: "" },
        actividadIndustialComercialEmpresarial: actividadpdnVacios(),
        actividadFinanciera: actividadFinancierapdnVacios(),
        serviciosProfesionales: serviciospdnVacios(),
        enajenacionBienes: enajenacionpdnVacios(),
        otrosIngresos: otrosIngresosVacios(),
        ingresoNetoAnualDeclarante: { valor: -1, moneda: "" },
        totalIngresosNetosAnuales: { valor: -1, moneda: "" }
    };

    if (!sp.actividadAnualAnterior) {
        sp.actividadAnualAnterior = structuredClone(estructuraBase);
        return;
    }

    const act = sp.actividadAnualAnterior;
    act.servidorPublicoAnioAnterior = Boolean(act.servidorPublicoAnioAnterior);

    for (const [campo, valorDefault] of Object.entries(estructuraBase)) {
        if (!(campo in act)) act[campo] = structuredClone(valorDefault);
    }

    if (!act.servidorPublicoAnioAnterior) {
        act.fechaIngreso ??= "2010-01-01";
        act.fechaConclusion ??= "2010-01-01";
        act.remuneracionNetaCargoPublico ??= { valor: -1, moneda: "" };
    }
}
// 5. BIENES INMUEBLES
/**
 * Normaliza la cartera de Bienes Inmuebles.
 * Estandariza superficies, valores de adquisición y domicilios.
 */
function fixBienesInmuebles(item) {
    const sp = item?.declaracion?.situacionPatrimonial;
    if (!sp) return;

    const tipoDeclaracion = getTipoDeclaracion(item);
    
    sp.bienesInmuebles = normalizarSeccionNinguno(
        sp.bienesInmuebles,
        'bienInmueble',
        crearEstructuraVacia('bienInmueble'),
        (bien) => {
            const bienPDN = {
                tipoOperacion: normalizaTipoOperacion(bien.tipoOperacion),
                tipoInmueble: normalizaEnumObjeto(bien.tipoInmueble, MAPEO_TIPO_INMUEBLE_CLAVE, MAPEO_TIPO_INMUEBLE_VALOR, "OTRO"),
                titular: Array.isArray(bien.titular)
                    ? bien.titular.map(t => normalizaEnumObjeto(t, MAPEO_TITULAR_CLAVE, MAPEO_TITULAR_VALOR, "DEC")).filter(t => t)
                    : [],
                porcentajePropiedad: toNum(bien.porcentajePropiedad) ?? 0,
                superficieTerreno: normalizaSuperficie(bien.superficieTerreno),
                superficieConstruccion: normalizaSuperficie(bien.superficieConstruccion),
                tercero: Array.isArray(bien.tercero) ? bien.tercero.map(normalizarPersonaTercero).filter(t => t) : [],
                domicilioMexico: normalizarDomicilioMexico(bien.domicilioMexico),
                domicilioExtranjero: normalizarDomicilioExtranjero(bien.domicilioExtranjero, false),
                formaAdquisicion: normalizaEnumObjeto(bien.formaAdquisicion, MAPEO_FORMA_ADQUISICION_CLAVE, MAPEO_FORMA_ADQUISICION_VALOR, "CPV"),
                formaPago: normalizarFormaPago(bien.formaPago),
                valorAdquisicion: makeMonto(bien.valorAdquisicion?.valor ?? bien.valorAdquisicion),
                fechaAdquisicion: aISODate(bien.fechaAdquisicion),
                datoIdentificacion: nz(toStr(bien.datoIdentificacion)),
                valorConformeA: tipoDeclaracion === 'INICIAL' ? normalizarValorConformeA(bien.valorConformeA) : undefined,
                transmisor: Array.isArray(bien.transmisor) ? bien.transmisor.map(normalizarTransmisor).filter(t => t) : []
            };

            if (tipoDeclaracion === 'MODIFICACION' || tipoDeclaracion === 'CONCLUSION') {
                bienPDN.motivoBaja = normalizaEnumObjeto(bien.motivoBaja, MAPEO_MOTIVO_BAJA_CLAVE, MAPEO_MOTIVO_BAJA_VALOR, "OTRO");
            }

            return bienPDN;
        }
    );
}
// 6. VEHÍCULOS
/**
 * Normaliza el inventario de Vehículos.
 * Maneja marcas, modelos y la transmisión de propiedad.
 */
function fixVehiculos(item) {
    const sp = item?.declaracion?.situacionPatrimonial;
    if (!sp) return;
    const tipoDeclaracion = getTipoDeclaracion(item);
    sp.vehiculos = normalizarSeccionNinguno(
        sp.vehiculos,
        'vehiculo',
        crearEstructuraVacia('vehiculo'),
        (v) => {
            const vehiculoPDN = {
                tipoOperacion: normalizaTipoOperacion(v.tipoOperacion),
                tipoVehiculo: normalizaEnumObjeto(v.tipoVehiculo, MAPEO_TIPO_VEHICULO_CLAVE, MAPEO_TIPO_VEHICULO_VALOR, "AUMOT"),
                titular: Array.isArray(v.titular) ? v.titular.map(t => normalizaEnumObjeto(t, MAPEO_TITULAR_CLAVE, MAPEO_TITULAR_VALOR, "DEC")).filter(t => t) : [],
                transmisor: Array.isArray(v.transmisor) ? v.transmisor.map(normalizarTransmisor).filter(t => t) : [],
                marca: nz(toStr(v.marca)), modelo: nz(toStr(v.modelo)), anio: normalizarAnio(v.anio),
                numeroSerieRegistro: nz(toStr(v.numeroSerieRegistro)),
                tercero: Array.isArray(v.tercero) ? v.tercero.map(normalizarPersonaTercero).filter(t => t) : [],
                lugarRegistro: normalizarLugarRegistro(v.lugarRegistro),
                formaAdquisicion: normalizaEnumObjeto(v.formaAdquisicion, MAPEO_FORMA_ADQUISICION_CLAVE, MAPEO_FORMA_ADQUISICION_VALOR, "CPV"),
                formaPago: normalizarFormaPago(v.formaPago),
                valorAdquisicion: makeMonto(v.valorAdquisicion?.valor ?? v.valorAdquisicion),
                fechaAdquisicion: aISODate(v.fechaAdquisicion)
            };

            if (tipoDeclaracion === 'MODIFICACION' || tipoDeclaracion === 'CONCLUSION') {
                vehiculoPDN.motivoBaja = normalizaEnumObjeto(v.motivoBaja, MAPEO_MOTIVO_BAJA_CLAVE, MAPEO_MOTIVO_BAJA_VALOR, "OTRO");
            }
            return vehiculoPDN;
        }
    );
}
// 7. BIENES MUEBLES
/**
 * Normaliza Bienes Muebles.
 * Asegura la correcta categorización del bien.
 */
function fixBienesMuebles(item) {
    const sp = item?.declaracion?.situacionPatrimonial;
    if (!sp) return;
    const tipoDeclaracion = getTipoDeclaracion(item);  
    sp.bienesMuebles = normalizarSeccionNinguno(
        sp.bienesMuebles,
        'bienMueble',
        crearEstructuraVacia('bienMueble'),
        (m) => {
            const mueblePDN = {
                tipoOperacion: normalizaTipoOperacion(m.tipoOperacion),
                titular: Array.isArray(m.titular) ? m.titular.map(t => normalizaEnumObjeto(t, MAPEO_TITULAR_CLAVE, MAPEO_TITULAR_VALOR, "DEC")).filter(t => t) : [],
                tipoBien: normalizaEnumObjeto(m.tipoBien, MAPEO_TIPO_MUEBLE_CLAVE, MAPEO_TIPO_MUEBLE_VALOR, "OTRO"),
                transmisor: Array.isArray(m.transmisor) ? m.transmisor.map(normalizarTransmisor).filter(t => t) : [],
                tercero: Array.isArray(m.tercero) ? m.tercero.map(normalizarPersonaTercero).filter(t => t) : [],
                descripcionGeneralBien: nz(toStr(m.descripcionGeneralBien)),
                formaAdquisicion: normalizaEnumObjeto(m.formaAdquisicion, MAPEO_FORMA_ADQUISICION_CLAVE, MAPEO_FORMA_ADQUISICION_VALOR, "CPV"),
                formaPago: normalizarFormaPago(m.formaPago),
                valorAdquisicion: makeMonto(m.valorAdquisicion?.valor ?? m.valorAdquisicion),
                fechaAdquisicion: aISODate(m.fechaAdquisicion)
            };
            if (tipoDeclaracion === 'MODIFICACION' || tipoDeclaracion === 'CONCLUSION') {
                mueblePDN.motivoBaja = normalizaEnumObjeto(m.motivoBaja, MAPEO_MOTIVO_BAJA_CLAVE, MAPEO_MOTIVO_BAJA_VALOR, "OTRO");
            }
            return mueblePDN;
        }
    );
}
// 8. INVERSIONES
/**
 * Normaliza Cuentas Bancarias e Inversiones.
 * Maneja saldos condicionales según el tipo de declaración (Actual vs Anterior).
 */
function fixInversiones(item) {
    const sp = item?.declaracion?.situacionPatrimonial;
    if (!sp) return;
    const tipoDeclaracion = getTipoDeclaracion(item);
    if (!tipoDeclaracion) {
        sp.inversiones = { ninguno: true, inversion: [], aclaracionesObservaciones: "" };
        return;
    }
    sp.inversiones = normalizarSeccionNinguno(
        sp.inversiones,
        'inversion',
        crearEstructuraVacia('inversion'),
        (inv) => {
            const inversionPDN = {
                tipoOperacion: normalizaTipoOperacion(inv.tipoOperacion),
                tipoInversion: normalizaEnumObjeto(inv.tipoInversion, MAPEO_TIPO_INVERSION_CLAVE, MAPEO_TIPO_INVERSION_VALOR, "BANC"),
                subTipoInversion: normalizaEnumObjeto(inv.subTipoInversion, MAPEO_SUBTIPO_INVERSION_CLAVE, MAPEO_SUBTIPO_INVERSION_VALOR, "CNOM"),
                titular: Array.isArray(inv.titular) ? inv.titular.map(t => normalizaEnumObjeto(t, MAPEO_TITULAR_CLAVE, MAPEO_TITULAR_VALOR, "DEC")).filter(t => t) : [],
                tercero: Array.isArray(inv.tercero) ? inv.tercero.map(normalizarPersonaTercero).filter(t => t) : [],
                numeroCuentaContrato: nz(toStr(inv.numeroCuentaContrato)),
                localizacionInversion: normalizarLocalizacionInversion(inv.localizacionInversion)
            };
            if (tipoDeclaracion === 'INICIAL') {
                inversionPDN.saldoSituacionActual = makeMonto(inv.saldoSituacionActual?.valor ?? inv.saldoSituacionActual);
            } else if (tipoDeclaracion === 'MODIFICACION') {
                inversionPDN.saldoDiciembreAnterior = makeMonto(inv.saldoDiciembreAnterior?.valor ?? inv.saldoDiciembreAnterior);
                inversionPDN.porcentajeIncrementoDecremento = toNum(inv.porcentajeIncrementoDecremento) ?? 0;
            } else if (tipoDeclaracion === 'CONCLUSION') {
                inversionPDN.saldoFechaConclusion = makeMonto(inv.saldoFechaConclusion?.valor ?? inv.saldoFechaConclusion);
                inversionPDN.porcentajeIncrementoDecremento = toNum(inv.porcentajeIncrementoDecremento) ?? 0;
            }
            return inversionPDN;
        }
    );
}
// 9. ADEUDOS
/**
 * Normaliza Pasivos y Deudas.
 * Estructura montos originales y saldos insolutos.
 */
function fixAdeudos(item) {
    const sp = item?.declaracion?.situacionPatrimonial;
    if (!sp) return;
    const tipoDeclaracion = getTipoDeclaracion(item);
    if (!tipoDeclaracion) {
        sp.adeudos = { ninguno: true, adeudo: [], aclaracionesObservaciones: "" };
        return;
    }
    sp.adeudos = normalizarSeccionNinguno(
        sp.adeudos,
        'adeudo',
        crearEstructuraVacia('adeudo'),
        (a) => {
            const adeudoPDN = {
                tipoOperacion: normalizaTipoOperacion(a.tipoOperacion),
                titular: Array.isArray(a.titular) ? a.titular.map(t => normalizaEnumObjeto(t, MAPEO_TITULAR_CLAVE, MAPEO_TITULAR_VALOR, "DEC")).filter(t => t) : [],
                tipoAdeudo: { clave: nz(toStr(a.tipoAdeudo?.clave)), valor: nz(toStr(a.tipoAdeudo?.valor)) },
                numeroCuentaContrato: nz(toStr(a.numeroCuentaContrato)),
                fechaAdquisicion: aISODate(a.fechaAdquisicion),
                montoOriginal: makeMonto(a.montoOriginal?.valor ?? a.montoOriginal),
                tercero: Array.isArray(a.tercero) ? a.tercero.map(normalizarPersonaTercero).filter(t => t) : [],
                otorganteCredito: normalizarOtorganteCredito(a.otorganteCredito),
                localizacionAdeudo: { pais: normalizarPais(a.localizacionAdeudo?.pais) }
            };

            if (tipoDeclaracion === 'INICIAL') {
                adeudoPDN.saldoInsolutoSituacionActual = makeMonto(a.saldoInsolutoSituacionActual?.valor ?? a.saldoInsolutoSituacionActual);
            } else if (tipoDeclaracion === 'MODIFICACION') {
                adeudoPDN.saldoInsolutoDiciembreAnterior = makeMonto(a.saldoInsolutoDiciembreAnterior?.valor ?? a.saldoInsolutoDiciembreAnterior);
            } else if (tipoDeclaracion === 'CONCLUSION') {
                adeudoPDN.saldoInsolutoFechaConclusion = makeMonto(a.saldoInsolutoFechaConclusion?.valor ?? a.saldoInsolutoFechaConclusion);
            }
            return adeudoPDN;
        }
    );
}
// 10. PRÉSTAMO O COMODATO
//Normaliza préstamos de bienes por terceros (Comodato).
function fixPrestamoComodato(item) {
    const sp = item?.declaracion?.situacionPatrimonial;
    if (!sp) return;
    sp.prestamoOComodato = normalizarSeccionNinguno(
        sp.prestamoOComodato,
        'prestamo',
        crearEstructuraVacia('prestamo'),
        (p) => ({
            tipoOperacion: normalizaTipoOperacion(p.tipoOperacion),
            tipoBien: normalizarTipoBienPrestamo(p.tipoBien),
            duenoTitular: normalizarDuenoTitular(p.duenoTitular)
        })
    );
}
// 11. INTERESES (7 SECCIONES)
//Normaliza Participación en Toma de Decisiones.
function fixParticipacionTomaDecisiones(item) {
    const interesObj = item?.declaracion?.interes;
    if (!interesObj) return;

    interesObj.participacionTomaDecisiones = normalizarSeccionNinguno(
        interesObj.participacionTomaDecisiones,
        'participacion',
        crearEstructuraVacia('participacion'),
        (p) => {
            const rfcNormalizado = normalizarRFC(p.rfc);
            const participacion = {
                tipoInstitucion: normalizaEnumObjeto(p.tipoInstitucion, MAPEO_TIPO_INSTITUCION_PARTICIPACION_CLAVE, MAPEO_TIPO_INSTITUCION_PARTICIPACION_VALOR, "OTRO"),
                nombreInstitucion: nz(toStr(p.nombreInstitucion)),
                puestoRol: nz(toStr(p.puestoRol)),
                fechaInicioParticipacion: aISODate(p.fechaInicioParticipacion)
            };
            if (rfcNormalizado && rfcNormalizado.length >= 12) participacion.rfc = rfcNormalizado;
            return participacion;
        }
    );
}
//Normaliza Participación en Empresas/Sociedades.
function fixParticipacion(item) {
    const interesObj = item?.declaracion?.interes;
    if (!interesObj) return;

    interesObj.participacion = normalizarSeccionNinguno(
        interesObj.participacion,
        'participacion',
        crearEstructuraVacia('participacion'),
        (p) => {
            const rfcNormalizado = normalizarRFC(p.rfc);
            const participacion = {
                tipoOperacion: normalizaTipoOperacion(p.tipoOperacion),
                tipoParticipacion: normalizarTipoParticipacion(p.tipoParticipacion),
                nombreEmpresaSociedadAsociacion: nz(toStr(p.nombreEmpresaSociedadAsociacion)),
                porcentajeParticipacion: normalizarPorcentaje(p.porcentajeParticipacion),
                sector: normalizaEnumObjeto(p.sector, MAPEO_SECTOR_CLAVE, MAPEO_SECTOR_VALOR, "OTRO"),
                puestoRolEmpresaSociedad: nz(toStr(p.puestoRolEmpresaSociedad)),
                fechaInicioParticipacion: aISODate(p.fechaInicioParticipacion),
                tercero: Array.isArray(p.tercero) ? p.tercero.map(normalizarPersonaTercero).filter(t => t) : []
            };
            if (rfcNormalizado && rfcNormalizado.length >= 12) participacion.rfc = rfcNormalizado;
            return participacion;
        }
    );
}
//Normaliza Apoyos o Beneficios Públicos.
function fixApoyos(item) {
    const interesObj = item?.declaracion?.interes;
    if (!interesObj) return;

    interesObj.apoyos = normalizarSeccionNinguno(
        interesObj.apoyos,
        'apoyo',
        crearEstructuraVacia('apoyo'),
        (a) => ({
            tipoOperacion: normalizaTipoOperacion(a.tipoOperacion),
            beneficiario: Array.isArray(a.beneficiario) ? a.beneficiario.map(normalizarBeneficiarioApoyo).filter(b => b) : [],
            nombrePrograma: nz(toStr(a.nombrePrograma)),
            institucionOtorgante: nz(toStr(a.institucionOtorgante)),
            nivelOrdenGobierno: aplicarMapeo(a.nivelOrdenGobierno, "MAPEO_NIVEL_GOBIERNO", "FEDERAL"),
            tipoApoyo: normalizarTipoApoyo(a.tipoApoyo),
            formaRecepcion: normalizarFormaRecepcion(a.formaRecepcion),
            montoApoyoMensual: makeMonto(a.montoApoyoMensual?.valor ?? a.montoApoyoMensual),
            especifiqueApoyo: nz(toStr(a.especifiqueApoyo))
        })
    );
}
//Normaliza Representación (activa o pasiva)
function fixRepresentaciones(item) {
    const interesObj = item?.declaracion?.interes;
    if (!interesObj) return;

    const reprObj = interesObj.representaciones || interesObj.representacion;

    interesObj.representaciones = normalizarSeccionNinguno(
        reprObj,
        'representacion',
        crearEstructuraVacia('representacion'),
        (r) => ({
            tipoOperacion: normalizaTipoOperacion(r.tipoOperacion),
            tipoRelacion: normalizarTipoRelacionRepresentacion(r.tipoRelacion),
            tipoRepresentacion: normalizarTipoRepresentacion(r.tipoRepresentacion),
            fechaInicioRepresentacion: aISODate(r.fechaInicioRepresentacion),
            tipoPersona: normalizarTipoPersona(r.tipoPersona),
            nombreRazonSocial: limpiarNombre(toStr(r.nombreRazonSocial)),
            rfc: normalizarRFC(r.rfc),
            recibeRemuneracion: Boolean(r.recibeRemuneracion),
            montoMensual: makeMonto(r.montoMensual?.valor ?? r.montoMensual),
            ubicacion: normalizarUbicacionRepresentacion(r.ubicacion),
            sector: normalizaEnumObjeto(r.sector, MAPEO_SECTOR_CLAVE, MAPEO_SECTOR_VALOR, "OTRO")
        })
    );
}
//Normaliza Beneficios Privados.
function fixBeneficiosPrivados(item) {
    const interesObj = item?.declaracion?.interes;
    if (!interesObj) return;

    interesObj.beneficiosPrivados = normalizarSeccionNinguno(
        interesObj.beneficiosPrivados,
        'beneficio',
        crearEstructuraVacia('beneficio'),
        (b) => ({
            tipoOperacion: normalizaTipoOperacion(b.tipoOperacion),
            tipoBeneficio: normalizarTipoBeneficio(b.tipoBeneficio),
            beneficiario: normalizarPersonaTercero(b.beneficiario),
            otorgante: normalizarOtorganteBeneficio(b.otorgante),
            formaRecepcion: normalizarFormaRecepcion(b.formaRecepcion),
            especifiqueBeneficio: nz(toStr(b.especifiqueBeneficio)),
            montoMensualAproximado: makeMonto(b.montoMensualAproximado?.valor ?? b.montoMensualAproximado),
            sector: normalizaEnumObjeto(b.sector, MAPEO_SECTOR_CLAVE, MAPEO_SECTOR_VALOR, "OTRO")
        })
    );
}
//Normaliza Fideicomisos.
function fixFideicomisos(item) {
    const interesObj = item?.declaracion?.interes;
    if (!interesObj) return;

    interesObj.fideicomisos = normalizarSeccionNinguno(
        interesObj.fideicomisos,
        'fideicomiso',
        crearEstructuraVacia('fideicomiso'),
        (f) => ({
            tipoOperacion: normalizaTipoOperacion(f.tipoOperacion),
            tipoRelacion: normalizarTipoRelacionRepresentacion(f.tipoRelacion),
            tipoFideicomiso: normalizarTipoFideicomiso(f.tipoFideicomiso),
            tipoParticipacion: normalizarTipoParticipacionFideicomiso(f.tipoParticipacion),
            rfcFideicomiso: normalizarRFC(f.rfcFideicomiso),
            fideicomitente: normalizarPersonaFideicomiso(f.fideicomitente),
            fideicomisario: normalizarPersonaFideicomiso(f.fideicomisario),
            fiduciario: normalizarFiduciario(f.fiduciario),
            sector: normalizaEnumObjeto(f.sector, MAPEO_SECTOR_CLAVE, MAPEO_SECTOR_VALOR, "OTRO"),
            extranjero: normalizaUbicacionMXEX(f.extranjero)
        })
    );
}
//Normaliza Clientes Principales (Actividad Lucrativa)
function fixClientesPrincipales(item) {
    const interesObj = item?.declaracion?.interes;
    if (!interesObj) return;

    interesObj.clientesPrincipales = normalizarSeccionNinguno(
        interesObj.clientesPrincipales,
        'cliente',
        crearEstructuraVacia('cliente'),
        (c) => ({
            tipoOperacion: normalizaTipoOperacion(c.tipoOperacion),
            realizaActividadLucrativa: Boolean(c.realizaActividadLucrativa),
            tipoRelacion: normalizarTipoRelacionRepresentacion(c.tipoRelacion),
            empresa: normalizarEmpresaCliente(c.empresa),
            clientePrincipal: normalizarClientePrincipal(c.clientePrincipal),
            sector: normalizaEnumObjeto(c.sector, MAPEO_SECTOR_CLAVE, MAPEO_SECTOR_VALOR, "OTRO"),
            montoAproximadoGanancia: makeMonto(c.montoAproximadoGanancia?.valor ?? c.montoAproximadoGanancia),
            ubicacion: normalizarUbicacionCliente(c.ubicacion)
        })
    );
}
// 12. ORGANIZADORES PRINCIPALES/**
 /* Organiza la Sección Intereses.
 * Ejecuta la normalización secuencial de los 7 sub-módulos de conflictos de interés.
 */
function fixIntereses(item) {
    if (!item?.declaracion?.interes) {
        if (!item.declaracion) item.declaracion = {};
        item.declaracion.interes = {};
    }

    const interesObj = item.declaracion.interes;
    delete interesObj.actualizacionConflictoInteres;

    fixParticipacion(item);
    fixParticipacionTomaDecisiones(item);
    fixApoyos(item);
    fixRepresentaciones(item);
    fixClientesPrincipales(item);
    fixBeneficiosPrivados(item);
    fixFideicomisos(item);

    item.declaracion.interes = {
        participacion: interesObj.participacion,
        participacionTomaDecisiones: interesObj.participacionTomaDecisiones,
        apoyos: interesObj.apoyos,
        representaciones: interesObj.representaciones,
        clientesPrincipales: interesObj.clientesPrincipales,
        beneficiosPrivados: interesObj.beneficiosPrivados,
        fideicomisos: interesObj.fideicomisos
    };
}
/**
 * Organiza la Situación Patrimonial.
 * Coordina la transformación de todas las subsecciones patrimoniales (Bienes, Pasivos, Ingresos).
 */
function fixSituacionPatrimonial(item) {
    const sp = item?.declaracion?.situacionPatrimonial;
    if (!sp) return;

    fixDatosGenerales(item);
    fixDatosCurricularesDeclarante(item);
    fixDatosEmpleoCargoComision(item);
    fixExperienciaLaboral(item);
    fixIngresos(item);
    ensureActividadAnualAnterior(item);
    fixBienesInmuebles(item);
    fixVehiculos(item);
    fixBienesMuebles(item);
    fixInversiones(item);
    fixAdeudos(item);
    fixPrestamoComodato(item);

    item.declaracion.situacionPatrimonial = {
        datosGenerales: sp.datosGenerales,
        datosCurricularesDeclarante: sp.datosCurricularesDeclarante,
        datosEmpleoCargoComision: sp.datosEmpleoCargoComision,
        experienciaLaboral: sp.experienciaLaboral,
        ingresos: sp.ingresos,
        actividadAnualAnterior: sp.actividadAnualAnterior,
        bienesInmuebles: sp.bienesInmuebles,
        vehiculos: sp.vehiculos,
        bienesMuebles: sp.bienesMuebles,
        inversiones: sp.inversiones,
        adeudos: sp.adeudos,
        prestamoOComodato: sp.prestamoOComodato
    };
}
// 13. FUNCIÓN PRINCIPAL
/**
 * Punto de entrada del módulo de normalización.
 * Recibe una declaración cruda y orquesta todo el pipeline de transformación.
 * @param {Object} item - Objeto JSON de la declaración original.
 * @returns {Object} Declaración completamente normalizada y lista para validar.
 */
export function normalizarDeclaracion(item) {
    if (!item || typeof item !== "object") return item;
    
    cleanItemRoot(item);
    fixMetadata(item);
    fixSituacionPatrimonial(item);
    fixIntereses(item);
    
    return item;
}