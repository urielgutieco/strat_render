/**
 * STRAT & TAX - LÓGICA DEL CLIENTE PARA PRODUCCIÓN
 * ------------------------------------------------
 * ¿QUÉ ES?: Este script es el controlador de interfaz (Frontend) que gestiona el flujo de datos.
 * UTILIDAD: Actúa como puente entre el usuario y el servidor, automatizando la creación de 
 * documentos Word/ZIP y garantizando que el usuario reciba feedback en tiempo real.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM (Interfaz de Usuario)
    const form = document.getElementById('contract-form'); 
    const responseMessage = document.getElementById('response-message');
    const submitButton = document.querySelector('.btn-submit');

    /**
     * 1. MANEJO DEL FORMULARIO DE GENERACIÓN DE CONTRATOS
     * ¿QUÉ ES?: Un "Event Listener" de tipo 'submit'.
     * UTILIDAD: Intercepta el envío del formulario para procesar los datos en segundo plano (asíncronamente),
     * evitando que la página se recargue y permitiendo manejar errores de forma dinámica.
     */
    if (form) {
        form.addEventListener('submit', async function (e) {
            // Detiene la recarga de página estándar para usar la lógica personalizada de Fetch.
            e.preventDefault();

            /**
             * GESTIÓN DE ESTADOS DE UI
             * UTILIDAD: Previene el "doble clic" deshabilitando el botón y cambia el texto 
             * para informar al usuario que el proceso (que incluye envío de correos) está en marcha.
             */
            if (responseMessage) responseMessage.style.display = 'none';
            submitButton.disabled = true;
            const originalText = submitButton.textContent;
            submitButton.textContent = '⏳ Procesando y enviando correos...';

            try {
                // Empaqueta todos los campos del formulario en un objeto FormData para el envío.
                const formData = new FormData(form);

                /**
                 * COMUNICACIÓN CON EL BACKEND
                 * ¿QUÉ ES?: Petición HTTP POST al servidor.
                 * UTILIDAD: Envía la información capturada a la ruta '/generate-word' para que el 
                 * motor de plantillas genere los documentos legales.
                 */
                const response = await fetch('/generate-word', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    /**
                     * PROCESAMIENTO DEL ARCHIVO BINARIO (ZIP)
                     * ¿QUÉ ES?: Conversión de la respuesta del servidor en un objeto Blob.
                     * UTILIDAD: Permite capturar el archivo generado por el servidor y disparar 
                     * una descarga automática en el navegador del usuario sin intervención manual.
                     */
                    const blob = await response.blob();
                    const contentDisposition = response.headers.get('Content-Disposition');
                    let filename = "Contratos_StratAndTax.zip";

                    // Intenta extraer el nombre real del archivo definido por el servidor.
                    if (contentDisposition && contentDisposition.includes("filename=")) {
                        const match = contentDisposition.match(/filename="(.+?)"/);
                        if (match) filename = match[1];
                    }

                    // Crea un enlace invisible para forzar la descarga del documento.
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    
                    // Limpieza de recursos de memoria.
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);

                    alert("✅ Éxito: Documentos generados y enviados por correo.");
                } else {
                    // Captura y muestra errores específicos retornados por el servidor (ej. campos faltantes).
                    const errorData = await response.json();
                    alert(`❌ Error: ${errorData.error}`);
                }

            } catch (error) {
                // Manejo de errores de conectividad o fallos críticos de red.
                console.error("Error de conexión:", error);
                alert("❌ Error: No se pudo conectar con el servidor. Revisa tu conexión.");
            } finally {
                /**
                 * RESTAURACIÓN DE LA INTERFAZ
                 * UTILIDAD: Garantiza que, pase lo que pase (éxito o error), el botón de envío 
                 * vuelva a estar activo para que el usuario pueda intentar de nuevo si es necesario.
                 */
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });
    }

    /**
     * 2. LÓGICA DE SINCRONIZACIÓN DE SELECT
     * ¿QUÉ ES?: Observador de cambios en el selector de servicios.
     * UTILIDAD: Monitorea qué servicio elige el usuario para posibles validaciones futuras
     * o lógica condicional de campos ocultos.
     */
    const selServicio = document.querySelector('select[name="servicio"]');
    if (selServicio) {
        selServicio.addEventListener('change', (e) => {
            console.log("Servicio seleccionado:", e.target.value);
        });
    }
});