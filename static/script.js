/**
 * Strat & Tax - Lógica del Cliente para Producción
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contract-form'); // ID actualizado del index.html previo
    const responseMessage = document.getElementById('response-message');
    const submitButton = document.querySelector('.btn-submit');

    // 1. Manejo del Formulario de Generación de Contratos
    if (form) {
        form.addEventListener('submit', async function (e) {
            // No cancelamos el evento si queremos que la descarga sea tradicional, 
            // pero usaremos Fetch para poder mostrar mensajes de error/éxito dinámicos.
            e.preventDefault();

            // Reset de UI
            if (responseMessage) responseMessage.style.display = 'none';
            submitButton.disabled = true;
            const originalText = submitButton.textContent;
            submitButton.textContent = '⏳ Procesando y enviando correos...';

            try {
                const formData = new FormData(form);

                // En Render, usamos rutas relativas '/generate-word' 
                // para evitar problemas de CORS y URLs locales.
                const response = await fetch('/generate-word', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    // Procesar la descarga del ZIP
                    const blob = await response.blob();
                    const contentDisposition = response.headers.get('Content-Disposition');
                    let filename = "Contratos_StratAndTax.zip";

                    if (contentDisposition && contentDisposition.includes("filename=")) {
                        const match = contentDisposition.match(/filename="(.+?)"/);
                        if (match) filename = match[1];
                    }

                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);

                    alert("✅ Éxito: Documentos generados y enviados por correo.");
                } else {
                    const errorData = await response.json();
                    alert(`❌ Error: ${errorData.error}`);
                }

            } catch (error) {
                console.error("Error de conexión:", error);
                alert("❌ Error: No se pudo conectar con el servidor. Revisa tu conexión.");
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });
    }

    // 2. Lógica para sincronizar select con campos ocultos (si aplica)
    const selServicio = document.querySelector('select[name="servicio"]');
    if (selServicio) {
        selServicio.addEventListener('change', (e) => {
            console.log("Servicio seleccionado:", e.target.value);
        });
    }
});