# Módulo de Procesamiento y Transformación ETL (DeclaraVer - PDN)

Este proyecto es una herramienta de **Transformación de Datos** desarrollada para la **Secretaría Ejecutiva del Sistema Estatal Anticorrupción de Veracruz (SESEAV)**. 

Su función principal es la interoperabilidad: actúa como un puente tecnológico que transforma, limpia y valida masivamente las declaraciones patrimoniales del sistema local (**DeclaraVer**) para adaptarlas al estándar estricto de la **Plataforma Digital Nacional (PDN - Sistema 1)**.

---

## Tabla de Contenidos
1. [Requisitos Previos](#requisitos-previos)
2. [Instalación](#instalación)
3. [Configuración de Datos](#configuración-de-datos)
4. [Ejecución del ETL](#ejecución-del-etl)


---

## Requisitos Previos

Para ejecutar este sistema necesitas tener instalado en tu equipo:

* **Node.js**: Versión LTS recomendada (v18.x o superior). [Descargar aquí](https://nodejs.org/).
* **NPM**: Gestor de paquetes (se instala automáticamente con Node.js).
* **Visual Studio Code**: Editor de código recomendado para visualizar los resultados y logs.

---

## Instalación

Sigue estos pasos para desplegar el proyecto en tu entorno local:

1.  **Obtener el código fuente:**
    
    Opción A: Clonar el repositorio con Git
    ```bash
    git clone [https://github.com/TU_USUARIO/TU_REPOSITORIO.git](https://github.com/TU_USUARIO/TU_REPOSITORIO.git)
    cd TU_REPOSITORIO
    ```
    
    Opción B: Descargar como ZIP
    * Descarga el archivo comprimido desde GitHub.
    * Descomprímelo en tu carpeta de trabajo.
    * Abre la terminal en esa carpeta.

2.  **Instalar dependencias:**
    El sistema utiliza librerías externas para la validación de esquemas (`ajv` y `ajv-formats`). Ejecuta el siguiente comando para descargar todo automáticamente:
    ```bash
    npm install
    npm install ajv
    ```
    > **Nota:** Este comando leerá el archivo `package.json` e instalará las versiones exactas necesarias.

---

## Configuración de Datos

Por protocolos de seguridad y protección de datos personales, este repositorio **NO incluye datos reales**. Debes agregar manualmente el archivo de origen.

1.  Ve a la carpeta **`/entrada`**.
2.  Pega ahí tu archivo JSON con las declaraciones crudas exportadas de DeclaraVer.
3.  Asegúrate de que el archivo se llame exactamente:
    **`s1-api.declaraciones.json`**

---

## Ejecución del ETL

Para iniciar el proceso de transformación, limpieza y generación de archivos, ejecuta el siguiente comando en la terminal:

```bash
node .\index.js
