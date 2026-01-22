/**
 * @file normalizacionHelpers.js
 * @description Librería de funciones auxiliares (Helpers) para la transformación de datos.
 * Contiene la lógica de bajo nivel para limpieza, casting de tipos, formateo de fechas
 * y normalización de estructuras específicas (Domicilios, Personas, Montos).
 */

// --- IMPORTS ---
import { aplicarMapeo } from './mapeo.js';
import {
    MAPEO_RELACION_CLAVE, MAPEO_RELACION_VALOR,
    MAPEO_AMBITO_SECTOR_CLAVE, MAPEO_AMBITO_SECTOR_VALOR,
    MAPEO_SECTOR_CLAVE, MAPEO_SECTOR_VALOR,
    MAPEO_TIPO_INMUEBLE_CLAVE, MAPEO_TIPO_INMUEBLE_VALOR,
    MAPEO_TIPO_VEHICULO_CLAVE, MAPEO_TIPO_VEHICULO_VALOR
} from './mapeo.js';
import { limpiarRFC, limpiarNombre, limpiarClaveNumerica } from './limpieza.js';
const MXN = "MXN";
// 1. CONVERSIÓN DE TIPOS BÁSICOS
//Retorna string vacío si el valor es nulo o indefinido.
export const nz = v => (v ?? "");
//Extrae el valor string, manejando objetos BSON ($numberLong) de MongoDB.
export const toStr = v => {
    if (v && typeof v === 'object' && v.hasOwnProperty('$numberLong')) {
        v = v['$numberLong'];
    }
    return (v === undefined || v === null) ? undefined : String(v);
};
//Extrae el valor numérico, manejando objetos BSON ($numberLong) de MongoDB.
export const toNum = v => {
    if (v && typeof v === 'object' && v.hasOwnProperty('$numberLong')) {
        v = v['$numberLong'];
    }
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
};
export const toBool = v => Boolean(v);
// 2. NORMALIZACIÓN DE TEXTO
// Elimina acentos, convierte a mayúsculas y recorta espacios en blanco
export const sinAcentosMayus = s => String(s ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase()
    .trim();
// Limpia espacios en blanco extra y caracteres invisibles
export const clean = s => s?.replace(/[\u00A0\u200B\u200C\u200D\u202F\uFEFF]/g," ")
    .replace(/\s+/g," ")
    .trim();
// Normaliza nombres completos (elimina títulos, limpia espacios y acentos)
export const normalizaTipo = s => {
    const t = sinAcentosMayus(s);
    if (t === "INICIO") return "INICIAL";
    if (t === "MODIFICACION") return "MODIFICACIÓN";
    if (t === "CONCLUSION") return "CONCLUSIÓN";
    return s;
};
// Normaliza ubicación México/Extranjero
export const normalizaUbicacionMXEX = v => {
    const t = sinAcentosMayus(v);
    if (t === "MX" || t === "MEXICO") return "MX";
    if (t === "EX" || t === "EXTRANJERO") return "EX";
    return v;
};
// 3. NORMALIZACIÓN DE FECHAS
// Convierte a formato ISO 8601 date-time
export const aISODateTime = s => {
    if (!s) return s;
    let str = String(s).trim();
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(str)) str = str.replace(" ", "T") + "Z";
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) str = `${str}T00:00:00Z`;
    const d = new Date(str);
    return Number.isNaN(d.getTime()) ? s : d.toISOString();
};
// Convierte a formato ISO 8601 date (YYYY-MM-DD), con lógica de interpretación flexible
export const aISODate = s => {
    if (!s && s !== 0) return undefined;

    if (typeof s === 'object') {
        if (s.$date) s = s.$date;
        else if (s instanceof Date) {
            if (isNaN(s.getTime())) return undefined;
            const y = s.getUTCFullYear();
            const m = String(s.getUTCMonth() + 1).padStart(2, '0');
            const d = String(s.getUTCDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }
    }
    let dateStr = String(s).trim();
    try {
        if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(dateStr)) {
            const [day, month, year] = dateStr.split('/');
            dateStr = `${year.padStart(4,'0')}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`;
        } else if (/^\d{1,2}-\d{1,2}-\d{2,4}$/.test(dateStr)) {
            const [day, month, year] = dateStr.split('-');
            dateStr = `${year.padStart(4,'0')}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`;
        }
    } catch (e) {
    }
    const match = dateStr.match(/^(\d{1,4})-(\d{1,2})-(\d{1,2})/);
    if (!match) return undefined;

    let [ , yearPart, monthPart, dayPart ] = match;
    const month = String(parseInt(monthPart,10)).padStart(2,'0');
    const day = String(parseInt(dayPart,10)).padStart(2,'0');
    let yearNum = parseInt(yearPart, 10);
    if (yearPart.length === 4 && yearPart.startsWith('0')) {
        yearNum = 2000 + parseInt(yearPart.slice(-2), 10);
    } else if (yearPart.length === 3) {
        yearNum = 2000 + parseInt(yearPart.padStart(4, '0').slice(-2), 10);
    } else if (yearPart.length <= 2) {
        yearNum = 2000 + parseInt(yearPart, 10);
    }
    if (yearNum < 1900 || yearNum > 2100) return undefined;
    const candidate = `${yearNum}-${month}-${day}`;
    const dt = new Date(candidate + 'T00:00:00Z');
    if (isNaN(dt.getTime())) return undefined;
    const finalY = dt.getUTCFullYear();
    const finalM = String(dt.getUTCMonth() + 1).padStart(2,'0');
    const finalD = String(dt.getUTCDate()).padStart(2,'0');
    if (`${finalY}-${finalM}-${finalD}` !== `${String(yearNum)}-${month}-${day}`) {
        return undefined;
    }
    return `${yearNum}-${month}-${day}`;
};
// 4. NORMALIZACIÓN DE CLAVES Y CÓDIGOS
// Padding de strings numéricos con ceros a la izquierda
export const padN = (s, length = 3) => {
    const v = toStr(s);
    return v ? v.padStart(length, "0").slice(-length) : v;
};
export const pad3 = s => padN(s, 3);
// 5. NORMALIZACIÓN DE MONTOS
// Construye objeto Monto con valor numérico y moneda (default MXN)
export const makeMonto = (valor, moneda = MXN) => {
    const n = toNum(valor);
    return { 
        valor: n !== undefined ? n : 0,
        moneda: moneda || MXN 
    };
};
// Construye objeto Monto, retorna valor -1 y moneda vacía si no es numérico
export const buildMontoPDN = (valor) => {
    const n = toNum(valor);
    return n === undefined 
        ? { valor: -1, moneda: "" } 
        : { valor: n, moneda: MXN };
};
// Construye objeto Monto, permite valor cero
export const buildMontoPDNAllowZero = (valor) => {
    const n = toNum(valor);
    return { valor: n === undefined ? 0 : n, moneda: MXN };
};
// 6. NORMALIZACIÓN DE SUPERFICIES
// Construye objeto Superficie con valor numérico y unidad (m2, ha, km2)
export const normalizaSuperficie = (superficieInput) => {
    let valorCrudo, unidadCruda = "M2";
    if (superficieInput && typeof superficieInput === 'object') {
        valorCrudo = superficieInput.Valor;
        if (superficieInput.Unidad) unidadCruda = superficieInput.Unidad;
    } else {
        valorCrudo = superficieInput;
    }
    const valorNumerico = toNum(valorCrudo);
    if (valorNumerico === undefined || valorNumerico < 0) return undefined;
    const unidadLimpia = String(unidadCruda ?? "M2").trim().toLowerCase();
    const unidadNormalizada = ["m2", "ha", "km2"].includes(unidadLimpia) ? unidadLimpia : "m2";
    
    return { valor: valorNumerico, unidad: unidadNormalizada };
};
// 7. NORMALIZACIÓN DE ENUMS Y OPERACIONES
// Normaliza relación usando mapeos definidos
export const normalizaTipoOperacion = (valor) => {
    if (!valor) return "SIN_CAMBIOS";
    const valorNormalizado = sinAcentosMayus(String(valor));
    
    const mapeoTipoOp = {
        'AGREGAR': 'AGREGAR', 'AL': 'AGREGAR', 'ALTA': 'AGREGAR', 'ADD': 'AGREGAR',
        'MODIFICAR': 'MODIFICAR', 'MC': 'MODIFICAR', 'MOD': 'MODIFICAR', 'MODIFICACION': 'MODIFICAR',
        'SIN_CAMBIOS': 'SIN_CAMBIOS', 'SIN CAMBIOS': 'SIN_CAMBIOS', 'SINCAMBIOS': 'SIN_CAMBIOS', 'SC': 'SIN_CAMBIOS',
        'BAJA': 'BAJA', 'BJ': 'BAJA', 'DELETE': 'BAJA', 'DEL': 'BAJA'
    };
    
    return mapeoTipoOp[valorNormalizado] || "SIN_CAMBIOS";
};
// Normaliza enums basados en objetos con Clave/Valor
export function normalizaEnumObjeto(obj, claveMap = {}, valorMap = {}, valorDefaultClave = "") {
    if (!obj || typeof obj !== 'object') {
        if (valorDefaultClave && valorMap && valorMap[valorDefaultClave]) {
            return { clave: valorDefaultClave, valor: valorMap[valorDefaultClave] };
        }
        return undefined;
    } 
    let claveInput = obj.Clave ?? obj.clave;
    let clavePDN = claveMap[sinAcentosMayus(claveInput)] || valorDefaultClave || null;
    
    if (clavePDN === null || clavePDN === undefined) return undefined;
    if (!valorMap || !valorMap.hasOwnProperty(clavePDN)) return undefined;
    
    return { clave: clavePDN, valor: valorMap[clavePDN] };
}
// 8. ESTRUCTURAS VACÍAS PDN
// Retorna estructuras vacías conforme a PDN para secciones específicas
export const actividadpdnVacios = () => ({
    remuneracionTotal: { valor: -1, moneda: "MXN" },
    actividades: []
});
// Estructura vacía para Servicios
export const serviciospdnVacios = () => ({
    remuneracionTotal: { valor: -1, moneda: "MXN" },
    servicios: []
});
// Estructura vacía para Honorarios 
export const enajenacionpdnVacios = () => ({
    remuneracionTotal: { valor: -1, moneda: "MXN" },
    bienes: []
});
// Estructura vacía para Actividad Financiera
export const actividadFinancierapdnVacios = () => ({
    remuneracionTotal: { valor: -1, moneda: "MXN" },
    actividades: []
});
// Estructura vacía para Otros Ingresos
export const otrosIngresosVacios = () => ({
    remuneracionTotal: { valor: -1, moneda: "" },
    ingresos: []
});
// 9. NORMALIZACIÓN DE DOMICILIOS Y CONTACTO
// Normaliza domicilio en México
export function normalizarDomicilioMexico(dom) {
    if (!dom || typeof dom !== 'object') return undefined;
    
    let municipio = undefined;
    if (dom.municipioAlcaldia && typeof dom.municipioAlcaldia === 'object') {
        const mun = dom.municipioAlcaldia;
        municipio = {
            clave: padN(toStr(mun.clave), 3),
            valor: toStr(mun.valor) || ""
        };
    }
    let entidad = undefined;
    if (dom.entidadFederativa && typeof dom.entidadFederativa === 'object') {
        const ef = dom.entidadFederativa;
        let clave = toStr(ef.clave) || "";
        if (clave && /^\d+$/.test(clave)) clave = clave.padStart(2, '0');
        entidad = { clave: clave, valor: toStr(ef.valor) || "" };
    }
    return {
        calle: nz(toStr(dom.calle)),
        numeroExterior: nz(toStr(dom.numeroExterior)),
        numeroInterior: nz(toStr(dom.numeroInterior)),
        coloniaLocalidad: nz(toStr(dom.coloniaLocalidad)),
        municipioAlcaldia: municipio,
        entidadFederativa: entidad,
        codigoPostal: toStr(dom.codigoPostal) || ""
    };
}
// Normaliza domicilio en el extranjero
export function normalizarDomicilioExtranjero(domExt, crearVacio = true) {
    const vacio = {
        calle: "", numeroExterior: "", numeroInterior: "",
        ciudadLocalidad: "", estadoProvincia: "", pais: "", codigoPostal: ""
    };
    
    if (!domExt || typeof domExt !== 'object') return crearVacio ? vacio : undefined;
    
    return {
        calle: nz(toStr(domExt.calle)),
        numeroExterior: nz(toStr(domExt.numeroExterior)),
        numeroInterior: nz(toStr(domExt.numeroInterior)),
        ciudadLocalidad: nz(toStr(domExt.ciudadLocalidad)),
        estadoProvincia: nz(toStr(domExt.estadoProvincia)),
        pais: toStr(domExt.pais) || "",
        codigoPostal: toStr(domExt.codigoPostal) || ""
    };
}

export function normalizarTelefonoOficina(tel) {
    if (!tel || typeof tel !== 'object') return undefined;
    return {
        telefono: nz(toStr(tel.telefono)),
        extension: nz(toStr(tel.extension))
    };
}
// 10. VALIDACIONES DE CONSISTENCIA
// Valida que las secciones que tienen "Ninguno" estén vacías
export function validarTodasSeccionesNinguno(item) {
    const secciones = [
        { obj: item?.declaracion?.situacionPatrimonial?.experienciaLaboral, nombre: 'experienciaLaboral', array: 'experiencia' },
        { obj: item?.declaracion?.situacionPatrimonial?.bienesInmuebles, nombre: 'bienesInmuebles', array: 'bienInmueble' },
        { obj: item?.declaracion?.situacionPatrimonial?.vehiculos, nombre: 'vehiculos', array: 'vehiculo' },
        { obj: item?.declaracion?.situacionPatrimonial?.bienesMuebles, nombre: 'bienesMuebles', array: 'bienMueble' },
        { obj: item?.declaracion?.situacionPatrimonial?.inversiones, nombre: 'inversiones', array: 'inversion' },
        { obj: item?.declaracion?.situacionPatrimonial?.adeudos, nombre: 'adeudos', array: 'adeudo' },
        { obj: item?.declaracion?.situacionPatrimonial?.prestamoOComodato, nombre: 'prestamoOComodato', array: 'prestamo' },
        { obj: item?.declaracion?.interes?.participacion, nombre: 'participacion', array: 'participacion' },
        { obj: item?.declaracion?.interes?.participacionTomaDecisiones, nombre: 'participacionTomaDecisiones', array: 'participacion' },
        { obj: item?.declaracion?.interes?.apoyos, nombre: 'apoyos', array: 'apoyo' },
        { obj: item?.declaracion?.interes?.representaciones, nombre: 'representaciones', array: 'representacion' },
        { obj: item?.declaracion?.interes?.clientesPrincipales, nombre: 'clientesPrincipales', array: 'cliente' },
        { obj: item?.declaracion?.interes?.beneficiosPrivados, nombre: 'beneficiosPrivados', array: 'beneficio' },
        { obj: item?.declaracion?.interes?.fideicomisos, nombre: 'fideicomisos', array: 'fideicomiso' },
    ];
    
    return secciones.every(({ obj, nombre, array }) => 
        validarConsistenciaNinguno(obj, nombre, array)
    );
}

export function validarConsistenciaNinguno(ningunoOriginal, arrayNormalizado) {
    if (Array.isArray(arrayNormalizado) && arrayNormalizado.length > 0) return false;
    if (!Array.isArray(arrayNormalizado) || arrayNormalizado.length === 0) return true;
    return true;
}
// 11. NORMALIZACIÓN DE CAMPOS ESPECÍFICOS - GENÉRICOS
export function normalizarFormaPago(valor) {
    if (!valor) return undefined;
    const mapeo = {
        'CREDITO': 'CRÉDITO', 'CONTADO': 'CONTADO',
        'NO APLICA': 'NO APLICA', 'NO_APLICA': 'NO APLICA', 'N/A': 'NO APLICA', 'NA': 'NO APLICA'
    };
    return mapeo[sinAcentosMayus(String(valor))] || undefined;
}
export function normalizarValorConformeA(valor) {
    if (!valor) return undefined;
    const mapeo = {
        'ESCRITURA PUBLICA': 'ESCRITURA PÚBLICA', 'ESCRITURA_PUBLICA': 'ESCRITURA PÚBLICA',
        'ESCRITURA': 'ESCRITURA PÚBLICA', 'SENTENCIA': 'SENTENCIA', 'CONTRATO': 'CONTRATO'
    };
    return mapeo[sinAcentosMayus(String(valor))] || undefined;
}
export function normalizarTransmisor(trans) {
    if (!trans || typeof trans !== 'object') {
        return {
            tipoPersona: "", nombreRazonSocial: "", rfc: "", relacion: undefined
        };
    }    
    let tipoPersona = toStr(trans.tipoPersona) || "";
    if (tipoPersona) {
        const tipoNormalizado = sinAcentosMayus(tipoPersona);
        tipoPersona = (tipoNormalizado === "FISICA" || tipoNormalizado === "FÍSICA") ? "FISICA" : 
                      (tipoNormalizado === "MORAL") ? "MORAL" : tipoPersona;
    }   
    return {
        tipoPersona: tipoPersona,
        nombreRazonSocial: nz(toStr(trans.nombreRazonSocial)),
        rfc: toStr(trans.rfc) || "",
        relacion: normalizaEnumObjeto(trans.relacion, MAPEO_RELACION_CLAVE, MAPEO_RELACION_VALOR)
    };
}
export const normalizarAnio = (anio) => {
    const anioCrudo = anio?.$numberLong ?? anio;
    const anioNum = Math.round(toNum(anioCrudo) || 0);
    return isNaN(anioNum) ? 0 : anioNum;
};
export function normalizarPais(pais) {
    if (!pais) return "MX";
    const paisNormalizado = sinAcentosMayus(String(pais));
    const mapaPaises = {
        'MX': 'MX', 'MEXICO': 'MX', 'MÉXICO': 'MX', 'MEX': 'MX',
        'US': 'US', 'USA': 'US', 'ESTADOS UNIDOS': 'US', 'UNITED STATES': 'US', 'EUA': 'US',
        'CA': 'CA', 'CANADA': 'CA', 'CANADÁ': 'CA'
    };
    return mapaPaises[paisNormalizado] || pais;
}
// 12. NORMALIZACIÓN DE PERSONAS (CONSOLIDADO)
//Función base para estructurar datos de personas físicas o morales.
function normalizarPersonaBase(persona, defaultTipo = 'FISICA', usarLimpiarRFC = false) {
    if (!persona || typeof persona !== 'object') {
        return { tipoPersona: defaultTipo, nombreRazonSocial: '', rfc: '' };
    }

    return {
        tipoPersona: normalizarTipoPersona(persona.tipoPersona) || defaultTipo,
        nombreRazonSocial: limpiarNombre(toStr(persona.nombreRazonSocial)),
        rfc: usarLimpiarRFC ? limpiarRFC(persona.rfc) : normalizarRFC(persona.rfc)
    };
}

export const normalizarPersonaTercero = (p) => {
    const result = normalizarPersonaBase(p, 'FISICA', false);
    return result.nombreRazonSocial || result.rfc ? result : null;
};

export const normalizarPersonaFideicomiso = (p) => normalizarPersonaBase(p, 'FISICA', true);
export const normalizarClientePrincipal = (p) => normalizarPersonaBase(p, 'FISICA', false);

export function normalizarOtorganteCredito(otorgante) {
    return normalizarPersonaBase(otorgante, 'MORAL', false);
}

export function normalizarOtorganteBeneficio(otorgante) {
    return normalizarPersonaBase(otorgante, 'FISICA', true);
}

export function normalizarFiduciario(fiduciario) {
    if (!fiduciario || typeof fiduciario !== 'object') {
        return { nombreRazonSocial: '', rfc: '' };
    }
    return {
        nombreRazonSocial: limpiarNombre(toStr(fiduciario.nombreRazonSocial)),
        rfc: limpiarRFC(fiduciario.rfc)
    };
}

export function normalizarDuenoTitular(dueno) {
    if (!dueno || typeof dueno !== 'object') {
        return {
            tipoDuenoTitular: 'FISICA',
            nombreTitular: '',
            rfc: '',
            relacionConTitular: ''
        };
    }

    return {
        tipoDuenoTitular: normalizarTipoPersona(dueno.tipoDuenoTitular),
        nombreTitular: limpiarNombre(toStr(dueno.nombreTitular)),
        rfc: limpiarRFC(dueno.rfc),
        relacionConTitular: nz(toStr(dueno.relacionConTitular))
    };
}
// 13. NORMALIZACIÓN DE UBICACIONES (CONSOLIDADO)
//Función base para normalizar ubicaciones con país y entidad federativa.
function normalizarUbicacionBase(ubicacion) {
    if (!ubicacion || typeof ubicacion !== 'object') {
        return {
            pais: "MX",
            entidadFederativa: { clave: "00", valor: "" }
        };
    }

    const ef = ubicacion.entidadFederativa || {};
    let claveEF = toStr(ef.clave) || "00";
    if (/^\d+$/.test(claveEF)) claveEF = claveEF.padStart(2, '0');

    return {
        pais: normalizarPais(ubicacion.pais),
        entidadFederativa: {
            clave: claveEF,
            valor: nz(toStr(ef.valor))
        }
    };
}

export const normalizarLugarRegistro = normalizarUbicacionBase;
export const normalizarUbicacionRepresentacion = normalizarUbicacionBase;
export const normalizarUbicacionCliente = normalizarUbicacionBase;

export function normalizarLocalizacionInversion(loc) {
    if (!loc || typeof loc !== 'object') {
        return { pais: "MX", institucionRazonSocial: "", rfc: "" };
    }
    return {
        pais: normalizarPais(loc.pais),
        institucionRazonSocial: nz(toStr(loc.institucionRazonSocial)),
        rfc: toStr(loc.rfc) || ""
    };
}

export function normalizarUbicacion(ubicacion) {
    if (!ubicacion) return "MX";
    if (typeof ubicacion === 'string') return normalizaUbicacionMXEX(ubicacion);
    if (typeof ubicacion === 'object' && ubicacion.clave) {
        return normalizaUbicacionMXEX(ubicacion.clave);
    }
    return "MX";
}

// 14. NORMALIZACIÓN DE INGRESOS (CONSOLIDADO)
//Función base para normalizar secciones de ingresos con estructura similar.
function normalizarSeccionIngresos(seccion, arrayKey, mapFn, emptyFn) {
    if (!seccion) return emptyFn();
    
    const totalVal = toNum(seccion.remuneracionTotal?.valor ?? seccion.remuneracionTotal);
    const resultado = {
        remuneracionTotal: totalVal === undefined 
            ? { valor: -1, moneda: "" } 
            : { valor: totalVal, moneda: "MXN" },
        [arrayKey]: Array.isArray(seccion[arrayKey]) ? seccion[arrayKey].map(mapFn) : []
    };
    
    return (!resultado[arrayKey].length && resultado.remuneracionTotal.valor === -1) 
        ? emptyFn() 
        : resultado;
}

export const normalizarActividadComercial = (act) => normalizarSeccionIngresos(
    act, 'actividades',
    a => ({
        remuneracion: buildMontoPDN(a.remuneracion?.valor ?? a.remuneracion),
        nombreRazonSocial: nz(toStr(a.nombreRazonSocial)),
        tipoNegocio: nz(toStr(a.tipoNegocio))
    }),
    actividadpdnVacios
);

export const normalizarActividadFinanciera = (act) => normalizarSeccionIngresos(
    act, 'actividades',
    a => ({
        remuneracion: buildMontoPDN(a.remuneracion?.valor ?? a.remuneracion),
        tipoInstrumento: a?.tipoInstrumento 
            ? { clave: nz(toStr(a.tipoInstrumento.clave)), valor: nz(toStr(a.tipoInstrumento.valor)) }
            : { clave: "OTRO", valor: "OTRO (ESPECIFIQUE)" }
    }),
    actividadFinancierapdnVacios
);

export const normalizarServiciosProfesionales = (serv) => normalizarSeccionIngresos(
    serv, 'servicios',
    s => ({
        remuneracion: buildMontoPDN(s.remuneracion?.valor ?? s.remuneracion),
        tipoServicio: nz(toStr(s.tipoServicio))
    }),
    serviciospdnVacios
);

export const normalizarOtrosIngresos = (otros) => normalizarSeccionIngresos(
    otros, 'ingresos',
    i => ({
        remuneracion: buildMontoPDN(i.remuneracion?.valor ?? i.remuneracion),
        tipoIngreso: nz(toStr(i.tipoIngreso))
    }),
    otrosIngresosVacios
);

export function normalizarEnajenacionBienes(enajenacion) {
    if (!enajenacion) return enajenacionpdnVacios();
    
    const totalVal = toNum(enajenacion.remuneracionTotal?.valor ?? enajenacion.remuneracionTotal);
    
    return {
        remuneracionTotal: totalVal === undefined 
            ? { valor: -1, moneda: "" } 
            : { valor: totalVal, moneda: "MXN" },
        bienes: Array.isArray(enajenacion.bienes)
            ? enajenacion.bienes.map(b => ({
                remuneracion: buildMontoPDN(b.remuneracion?.valor ?? b.remuneracion),
                tipoBienEnajenado: nz(toStr(b.tipoBienEnajenado))
            }))
            : []
    };
}

export function normalizarOtrosIngresosTotal(valor) {
    if (valor === undefined || valor === null) {
        return { valor: -1, moneda: "" };
    }
    const n = toNum(valor?.valor ?? valor);
    return n === undefined ? { valor: 0, moneda: "MXN" } : { valor: n, moneda: "MXN" };
}

export function calcularTotalIngresos(remuneracion, otrosTotal) {
    const rem = toNum(remuneracion?.valor ?? remuneracion) ?? 0;
    const otros = toNum(otrosTotal?.valor ?? otrosTotal) ?? 0;
    return { valor: rem + otros, moneda: "MXN" };
}
// 15. NORMALIZACIÓN DE CAMPOS EDUCATIVOS Y LABORALES
// Inferir tipo de operación para empleo/cargo/comisión
export function normalizarInstitucionEducativa(institucion) {
    if (!institucion || typeof institucion !== 'object') {
        return { nombre: "", ubicacion: "MX" };
    }
    return {
        nombre: nz(toStr(institucion.nombre)),
        ubicacion: normalizaUbicacionMXEX(institucion.ubicacion)
    };
}

export function normalizarEmpleoCargoComision(empleo, tipoDeclaracion = 'INICIAL') {
    if (!empleo || typeof empleo !== 'object') {
        return {
            tipoOperacion: inferirTipoOperacionEmpleo(null, tipoDeclaracion),
            nivelOrdenGobierno: "", ambitoPublico: "", nombreEntePublico: "",
            areaAdscripcion: "", empleoCargoComision: "", contratadoPorHonorarios: false,
            nivelEmpleoCargoComision: "", funcionPrincipal: "", fechaTomaPosesion: undefined,
            telefonoOficina: undefined, domicilioMexico: undefined,
            domicilioExtranjero: normalizarDomicilioExtranjero(null, true)
        };
    }

    return {
        tipoOperacion: inferirTipoOperacionEmpleo(empleo.tipoOperacion, tipoDeclaracion),
        nivelOrdenGobierno: aplicarMapeo(empleo.nivelOrdenGobierno, "MAPEO_NIVEL_GOBIERNO", ""),
        ambitoPublico: aplicarMapeo(empleo.ambitoPublico, "MAPEO_AMBITO_PUBLICO", ""),
        nombreEntePublico: toStr(empleo.nombreEntePublico) || "",
        areaAdscripcion: toStr(empleo.areaAdscripcion) || "",
        empleoCargoComision: toStr(empleo.empleoCargoComision) || "",
        contratadoPorHonorarios: Boolean(empleo.contratadoPorHonorarios),
        nivelEmpleoCargoComision: toStr(empleo.nivelEmpleoCargoComision) || "",
        funcionPrincipal: toStr(empleo.funcionPrincipal) || "",
        fechaTomaPosesion: aISODate(empleo.fechaTomaPosesion),
        telefonoOficina: normalizarTelefonoOficina(empleo.telefonoOficina),
        domicilioMexico: normalizarDomicilioMexico(empleo.domicilioMexico),
        domicilioExtranjero: normalizarDomicilioExtranjero(empleo.domicilioExtranjero, true)
    };
}

export function normalizarExperienciaLaboral(exp) {
    if (!exp || typeof exp !== 'object') return null;

    let ambitoSector = normalizaEnumObjeto(
        exp.ambitoSector,
        MAPEO_AMBITO_SECTOR_CLAVE,
        MAPEO_AMBITO_SECTOR_VALOR
    );

    if (!ambitoSector) {
        ambitoSector = (exp.nombreEntePublico || exp.nivelOrdenGobierno || exp.ambitoPublico)
            ? { clave: "PUB", valor: "PÚBLICO" }
            : { clave: "PRV", valor: "PRIVADO" };
    }

    const comunes = {
        tipoOperacion: normalizaTipoOperacion(exp.tipoOperacion),
        ambitoSector: ambitoSector,
        fechaIngreso: aISODate(exp.fechaIngreso),
        fechaEgreso: aISODate(exp.fechaEgreso),
        ubicacion: normalizarUbicacion(exp.ubicacion)
    };

    if (ambitoSector.clave === 'PUB') {
        return {
            ...comunes,
            nivelOrdenGobierno: nz(toStr(exp.nivelOrdenGobierno)),
            ambitoPublico: nz(toStr(exp.ambitoPublico)),
            nombreEntePublico: nz(toStr(exp.nombreEntePublico)),
            areaAdscripcion: nz(toStr(exp.areaAdscripcion)),
            empleoCargoComision: nz(toStr(exp.empleoCargoComision)),
            funcionPrincipal: nz(toStr(exp.funcionPrincipal))
        };
    } else {
        return {
            ...comunes,
            nombreEmpresaSociedadAsociacion: nz(toStr(exp.nombreEmpresaSociedadAsociacion)),
            rfc: nz(toStr(exp.rfc)),
            area: nz(toStr(exp.area)),
            puesto: nz(toStr(exp.puesto)),
            sector: normalizaEnumObjeto(exp.sector, MAPEO_SECTOR_CLAVE, MAPEO_SECTOR_VALOR, "OTRO")
        };
    }
}
// 16. NORMALIZACIÓN DE PARTICIPACIÓN Y APOYOS
// Normaliza tipo de participación (en objeto o string) a formato PDN
export function normalizarTipoParticipacion(tipoParticipacion) {
    if (tipoParticipacion && typeof tipoParticipacion === 'object') {
        return {
            clave: toStr(tipoParticipacion.clave) || "OTRO",
            valor: toStr(tipoParticipacion.valor) || "OTRO (ESPECIFIQUE)"
        };
    }

    const tipoValor = toStr(tipoParticipacion)?.trim() || "";
    if (!tipoValor || ["null", "undefined"].includes(tipoValor.toLowerCase())) {
        return { clave: "OTRO", valor: "OTRO (ESPECIFIQUE)" };
    }

    return { clave: "OTRO", valor: tipoValor };
}

export const normalizarPorcentaje = (porcentaje) => {
    const porcentajeCrudo = porcentaje?.Valor ?? porcentaje?.valor ?? porcentaje;
    const porcentajeNum = toNum(porcentajeCrudo);
    return porcentajeNum !== undefined ? Math.round(porcentajeNum) : 0;
};

export const normalizarRFC = (rfc) => {
    const rfcLimpio = toStr(rfc)?.trim().toUpperCase() || "";
    if (rfcLimpio.length < 12) return "";
    if (rfcLimpio.length >= 12 && rfcLimpio.length <= 13) return rfcLimpio;
    return rfcLimpio.substring(0, 13);
};

export function normalizarBeneficiarioApoyo(beneficiario) {
    const MAPEO_CLAVE = {
        'DC': 'DC', 'DECLARANTE': 'DC', 'CY': 'CY', 'CONYUGE': 'CY', 'CÓNYUGE': 'CY',
        'CON': 'CON', 'CONCUBINA': 'CON', 'CONCUBINARIO': 'CON', 'CONV': 'CONV', 'CONVIVIENTE': 'CONV',
        'HIJ': 'HIJ', 'HIJO': 'HIJ', 'HIJA': 'HIJ', 'HER': 'HER', 'HERMANO': 'HER', 'HERMANA': 'HER',
        'CU': 'CU', 'CUÑADO': 'CU', 'CUÑADA': 'CU', 'MA': 'MA', 'MADRE': 'MA', 'PA': 'PA', 'PADRE': 'PA',
        'TIO': 'TIO', 'TÍO': 'TIO', 'TIA': 'TIO', 'TÍA': 'TIO', 'PRI': 'PRI', 'PRIMO': 'PRI', 'PRIMA': 'PRI',
        'SOB': 'SOB', 'SOBRINO': 'SOB', 'SOBRINA': 'SOB', 'AHI': 'AHI', 'AHIJADO': 'AHI', 'AHIJADA': 'AHI',
        'NUE': 'NUE', 'NUERA': 'NUE', 'YER': 'YER', 'YERNO': 'YER',
        'ABU': 'ABU', 'ABUELO': 'ABU', 'ABUELA': 'ABU', 'NIE': 'NIE', 'NIETO': 'NIE', 'NIETA': 'NIE',
        'OTRO': 'OTRO'
    };

    const MAPEO_VALOR = {
        DC: 'DECLARANTE', CY: 'CÓNYUGE', CON: 'CONCUBINA O CONCUBINARIO', CONV: 'CONVIVIENTE',
        HIJ: 'HIJO(A)', HER: 'HERMANO(A)', CU: 'CUÑADO(A)', MA: 'MADRE', PA: 'PADRE',
        TIO: 'TÍO(A)', PRI: 'PRIMO(A)', SOB: 'SOBRINO(A)', AHI: 'AHIJADO(A)',
        NUE: 'NUERA', YER: 'YERNO', ABU: 'ABUELO(A)', NIE: 'NIETO(A)', OTRO: 'OTRO(A)'
    };

    return normalizaEnumObjeto(beneficiario, MAPEO_CLAVE, MAPEO_VALOR, 'DC');
}

export function normalizarTipoApoyo(tipoApoyo) {
    const MAPEO_CLAVE = {
        'SUB': 'SUB', 'SUBSIDIO': 'SUB', 'SER': 'SER', 'SERVICIO': 'SER',
        'OBRA': 'OBRA', 'OTRO': 'OTRO'
    };
    const MAPEO_VALOR = {
        SUB: 'SUBSIDIO', SER: 'SERVICIO', OBRA: 'OBRA', OTRO: 'OTRO (ESPECIFIQUE)'
    };
    return normalizaEnumObjeto(tipoApoyo, MAPEO_CLAVE, MAPEO_VALOR, 'OTRO');
}
// 17. NORMALIZACIÓN DE ENUMS SIMPLES (CONSOLIDADO)
// Normaliza enums simples usando mapeos definidos y valor por defecto
const normalizarEnumSimple = (valor, mapeo, defaultVal) => 
    mapeo[sinAcentosMayus(toStr(valor))] || defaultVal;

export const normalizarFormaRecepcion = (forma) => 
    normalizarEnumSimple(forma, {
        'MONETARIO': 'MONETARIO', 'EFECTIVO': 'MONETARIO', 'DINERO': 'MONETARIO',
        'ESPECIE': 'ESPECIE', 'EN ESPECIE': 'ESPECIE'
    }, 'MONETARIO');

export const normalizarTipoPersona = (v) => 
    normalizarEnumSimple(v, { 'MORAL': 'MORAL' }, 'FISICA');

export const normalizarTipoRelacionRepresentacion = (v) => 
    normalizarEnumSimple(v, {
        'DECLARANTE': 'DECLARANTE', 'PAREJA': 'PAREJA',
        'DEPENDIENTE': 'DEPENDIENTE_ECONOMICO',
        'DEPENDIENTE_ECONOMICO': 'DEPENDIENTE_ECONOMICO',
        'DEPENDIENTE ECONOMICO': 'DEPENDIENTE_ECONOMICO'
    }, 'DECLARANTE');

export const normalizarTipoRepresentacion = (v) => 
    normalizarEnumSimple(v, { 'REPRESENTADO': 'REPRESENTADO' }, 'REPRESENTANTE');

export const normalizarTipoFideicomiso = (v) => 
    normalizarEnumSimple(v, {
        'PUBLICO': 'PUBLICO', 'PÚBLICO': 'PUBLICO', 'PRIVADO': 'PRIVADO', 'MIXTO': 'MIXTO'
    }, 'PRIVADO');

export const normalizarTipoParticipacionFideicomiso = (v) => 
    normalizarEnumSimple(v, {
        'FIDEICOMITENTE': 'FIDEICOMITENTE', 'FIDUCIARIO': 'FIDUCIARIO',
        'FIDEICOMISARIO': 'FIDEICOMISARIO', 'COMITE_TECNICO': 'COMITE_TECNICO',
        'COMITÉ_TECNICO': 'COMITE_TECNICO', 'COMITE TECNICO': 'COMITE_TECNICO',
        'COMITÉ TÉCNICO': 'COMITE_TECNICO'
    }, 'FIDEICOMISARIO');

export function normalizarTipoBeneficio(tipoBeneficio) {
    const MAPEO_CLAVE = {
        'S': 'S', 'SORTEO': 'S', 'C': 'C', 'CONCURSO': 'C',
        'D': 'D', 'DONACION': 'D', 'DONACIÓN': 'D', 'O': 'O', 'OTRO': 'O'
    };
    const MAPEO_VALOR = {
        S: 'SORTEO', C: 'CONCURSO', D: 'DONACIÓN', O: 'OTRO (ESPECIFICO)'
    };
    return normalizaEnumObjeto(tipoBeneficio, MAPEO_CLAVE, MAPEO_VALOR, 'O');
}
// 18. NORMALIZACIÓN DE EMPRESAS Y PRÉSTAMOS
// Normaliza empresa cliente a formato PDN 
export function normalizarEmpresaCliente(empresa) {
    if (!empresa || typeof empresa !== 'object') {
        return { nombreEmpresaServicio: '', rfc: '' };
    }

    const nombreEmpresa = 
        empresa.nombreEmpresaServicio || 
        empresa.nombreRazonSocial ||
        empresa.empresaServicioSociedadCliente || 
        '';

    return {
        nombreEmpresaServicio: nz(toStr(nombreEmpresa)),
        rfc: normalizarRFC(empresa.rfc || '')
    };
}

export function normalizarTipoBienPrestamo(tipoBien) {
    if (!tipoBien || typeof tipoBien !== 'object') {
        return { inmueble: {}, vehiculo: {} };
    }

    return {
        inmueble: normalizarInmueblePrestamo(tipoBien.inmueble),
        vehiculo: normalizarVehiculoPrestamo(tipoBien.vehiculo)
    };
}

export function normalizarInmueblePrestamo(inmueble) {
    if (!inmueble || typeof inmueble !== 'object') return {};

    return {
        tipoInmueble: normalizaEnumObjeto(
            inmueble.tipoInmueble,
            MAPEO_TIPO_INMUEBLE_CLAVE,
            MAPEO_TIPO_INMUEBLE_VALOR,
            "OTRO"
        ),
        domicilioMexico: normalizarDomicilioMexico(inmueble.domicilioMexico),
        domicilioExtranjero: normalizarDomicilioExtranjero(inmueble.domicilioExtranjero, false)
    };
}

export function normalizarVehiculoPrestamo(vehiculo) {
    if (!vehiculo || typeof vehiculo !== 'object') return {};

    return {
        tipo: normalizaEnumObjeto(
            vehiculo.tipoVehiculo || vehiculo.tipo,
            MAPEO_TIPO_VEHICULO_CLAVE,
            MAPEO_TIPO_VEHICULO_VALOR,
            "AUMOT"
        ),
        marca: nz(toStr(vehiculo.marca)),
        modelo: nz(toStr(vehiculo.modelo)),
        anio: normalizarAnio(vehiculo.anio),
        numeroSerieRegistro: nz(toStr(vehiculo.numeroSerieRegistro)),
        lugarRegistro: normalizarLugarRegistro(vehiculo.lugarRegistro)
    };
}
// 19. FUNCIONES AUXILIARES FINALES
// Inferir tipo de operación para empleo/cargo/comisión basado en tipo de declaración
export function inferirTipoOperacionEmpleo(tipoOperacionOriginal, tipoDeclaracion) {
    if (tipoOperacionOriginal) {
        const normalizado = normalizaTipoOperacion(tipoOperacionOriginal);
        if (normalizado !== "SIN_CAMBIOS") return normalizado;
    }
    
    switch (tipoDeclaracion) {
        case 'INICIAL': return 'AGREGAR';
        case 'MODIFICACION': return 'MODIFICAR';
        case 'CONCLUSION': return 'BAJA';
        default: return 'AGREGAR';
    }
}