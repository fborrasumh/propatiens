# Formulario de inscripción desde DifundIA (aplicación web de Google Apps Script)

Con esta aplicación, cualquier asociación crea su formulario de inscripción desde DifundIA con un botón, sin tocar código:

1. En DifundIA, paso de la idea → **Inscripción online** → «¿Aún no tienes formulario?» → rellena el nombre de la actividad, el día y la hora, el lugar, el precio, las plazas y la fecha límite.
2. **Crear mi formulario en Google** → entra con su cuenta de Google → **Crear el formulario**.
3. **Volver a DifundIA**: el enlace se pone solo en todas las publicaciones y como código QR en las imágenes.

El formulario se crea en el Drive de la asociación, con las preguntas de inscripción, la información básica de protección de datos (con su nombre, dirección y correo) y las autorizaciones de imagen y de comunicaciones. Las respuestas solo las ve la asociación.

## Implementarla (una vez, quien mantiene DifundIA)

1. [script.google.com](https://script.google.com) → **Nuevo proyecto**. Ponle de nombre «DifundIA · Formulario de inscripción» (es el nombre que verán las asociaciones al dar permiso).
2. Borra el contenido de `Código.gs` y pega `Codigo.gs`.
3. **Configuración del proyecto** (rueda dentada) → marca **Mostrar el archivo de manifiesto "appsscript.json" en el editor** → vuelve al editor y sustituye `appsscript.json` por el de esta carpeta. Fija el único permiso que pide (Formularios de Google) y la forma de ejecutarse.
4. **Implementar → Nueva implementación** → tipo **Aplicación web**:
   - **Ejecutar como: Usuario que accede a la aplicación web.** Imprescindible: así cada formulario y sus respuestas son de la asociación y no tuyos.
   - **Quién tiene acceso: Cualquier usuario con cuenta de Google.**
5. Copia la **URL de la aplicación web** (`https://script.google.com/macros/s/…/exec`) y ponla en DifundIA, en la constante `FORM_APP` de `index.html`. Mientras esté vacía, DifundIA solo deja pegar un enlace.

Para cambiar el código después: **Implementar → Gestionar implementaciones → editar (lápiz) → Versión: nueva**. Así la URL no cambia.

## Lo que verán las asociaciones la primera vez

Google pedirá permiso y, como la aplicación no está verificada, mostrará «Google no ha verificado esta aplicación». Para seguir: **Configuración avanzada → Ir a DifundIA · Formulario de inscripción (no seguro) → Permitir**. Conviene enseñarlo en el curso. Solo pasa la primera vez.

Mientras no esté verificada, Google la deja usar a un máximo de 100 cuentas. Para quitar el aviso y el límite hay que asociar el proyecto a un proyecto de Google Cloud propio y pedir la verificación de la pantalla de permisos, un trámite de días o semanas.

## Qué crea

| Pregunta | Obligatoria |
|---|---|
| Nombre y apellidos | Sí |
| Teléfono (validado) | Sí |
| Correo electrónico (validado) | No |
| ¿Eres socio o socia? | Sí |
| Plazas que reserva (1 a 3) | Sí |
| Consentimiento para la inscripción | Sí |
| Fotos y vídeos de la actividad (sí o no) | Sí |
| Información de próximas actividades (sí o no) | Sí |

No pregunta nada de salud. La cláusula de protección de datos es un modelo de práctica, no asesoramiento jurídico: cada asociación debe revisarla y puede cambiarla en su formulario («Ver o cambiar el formulario»). Para tener las respuestas en una hoja de cálculo: pestaña **Respuestas → Vincular con Hojas de cálculo**.
