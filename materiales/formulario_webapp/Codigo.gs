/**
 * DifundIA · Formulario de inscripción (aplicación web de Google Apps Script)
 *
 * DifundIA abre esta aplicación con los datos de la asociación y de la actividad (parámetro «d», JSON en base64).
 * La persona pulsa «Crear el formulario» y se crea en SU Google Drive un formulario de inscripción con las
 * preguntas, la cláusula de protección de datos y las autorizaciones. Al terminar, «Volver a DifundIA» lleva el
 * enlace de vuelta (…/difundia/?formulario=…) y DifundIA lo pone en todas las publicaciones y en el QR.
 *
 * IMPLEMENTACIÓN (una vez, guía en LEEME.md):
 *   Implementar → Nueva implementación → Aplicación web
 *   Ejecutar como: «Usuario que accede a la aplicación web»   ← así cada formulario y sus datos son de la asociación
 *   Quién tiene acceso: «Cualquier usuario con cuenta de Google»
 *
 * Solo usa Formularios de Google (sin permisos de Drive ni de Hojas de cálculo).
 */

function doGet(e) {
  let datos = {};
  try { datos = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(e.parameter.d || '')).getDataAsString('UTF-8')); } catch (err) { datos = {}; }
  datos = limpia_(datos);
  const ok = !!(datos.titulo && datos.asociacion && datos.correo);
  const html = HtmlService.createHtmlOutput(pagina_(datos, ok))
    .setTitle('Formulario de inscripción · DifundIA')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  return html;
}

/* solo texto corto y la vuelta a una dirección https */
function limpia_(d) {
  const o = {};
  ['titulo', 'resumen', 'cuando', 'donde', 'precio', 'plazas', 'hasta', 'asociacion', 'direccion', 'correo', 'web', 'vuelta']
    .forEach(function (k) { o[k] = String(d[k] == null ? '' : d[k]).replace(/[\u0000-\u001F]/g, ' ').trim().slice(0, k === 'resumen' ? 600 : 300); });
  if (!/^https:\/\//.test(o.vuelta)) o.vuelta = 'https://fborrasumh.github.io/difundia/';
  return o;
}

const esc_ = s => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

function pagina_(d, ok) {
  const filas = [['Actividad', d.titulo], ['Cuándo', d.cuando], ['Dónde', d.donde], ['Precio', d.precio], ['Plazas', d.plazas],
    ['Inscripción hasta', d.hasta], ['Asociación', d.asociacion], ['Correo', d.correo]]
    .filter(f => f[1]).map(f => '<tr><th>' + f[0] + '</th><td>' + esc_(f[1]) + '</td></tr>').join('');
  const json = JSON.stringify(d).replace(/</g, '\\u003c');
  return '<!DOCTYPE html><html lang="es"><head><base target="_top"><style>' +
    'body{font:16px/1.5 Arial,Helvetica,sans-serif;color:#14213D;background:#F3F6FA;margin:0;padding:24px}' +
    '.c{max-width:620px;margin:0 auto;background:#fff;border-radius:16px;padding:28px;box-shadow:0 6px 24px rgba(20,33,61,.1)}' +
    'h1{font-size:24px;margin:0 0 8px}p{margin:8px 0}table{border-collapse:collapse;width:100%;margin:16px 0}' +
    'th{text-align:left;color:#5D7691;font-weight:600;padding:6px 12px 6px 0;vertical-align:top;white-space:nowrap}td{padding:6px 0}' +
    '.b{display:inline-block;border:0;border-radius:999px;padding:14px 26px;font:700 17px Arial;cursor:pointer;text-decoration:none;margin:6px 8px 6px 0}' +
    '.p{background:#E4572E;color:#fff}.s{background:#EEF2F6;color:#14213D}.b[disabled]{opacity:.6;cursor:wait}' +
    '.enl{font:700 18px monospace;background:#EEF7F2;border-radius:10px;padding:12px;word-break:break-all}.err{color:#B3261E}' +
    '</style></head><body><div class="c">' +
    (ok
      ? '<div id="paso1"><h1>Crear el formulario de inscripción</h1>' +
        '<p>Se creará en <b>tu Google Drive</b> un formulario con las preguntas de inscripción, la información de protección de datos y las autorizaciones de imagen y de comunicaciones.</p>' +
        '<table>' + filas + '</table>' +
        '<button class="b p" id="crear">Crear el formulario</button><p id="msg"></p></div>' +
        '<div id="paso2" hidden><h1>¡Listo! Tu formulario ya está publicado</h1>' +
        '<p>Este es el enlace para inscribirse:</p><p class="enl" id="enl"></p>' +
        '<p>Pulsa <b>Volver a DifundIA</b>: el enlace se pondrá solo en todas tus publicaciones y en el código QR.</p>' +
        '<a class="b p" id="volver" href="#">Volver a DifundIA</a><a class="b s" id="editar" href="#" target="_blank">Ver o cambiar el formulario</a>' +
        '<p style="color:#5D7691;font-size:14px">El formulario y las respuestas están en tu Google Drive. Las inscripciones se ven en la pestaña «Respuestas».</p></div>'
      : '<h1>Faltan datos</h1><p class="err">Abre esta página desde DifundIA, con el botón «Crear mi formulario en Google».</p>' +
        '<a class="b p" href="' + esc_(d.vuelta) + '">Ir a DifundIA</a>') +
    '</div><script>' +
    'var D=' + json + ';' +
    'var b=document.getElementById("crear");if(b)b.onclick=function(){b.disabled=true;b.textContent="Creando… (unos segundos)";' +
    'google.script.run.withSuccessHandler(function(r){document.getElementById("paso1").hidden=true;document.getElementById("paso2").hidden=false;' +
    'document.getElementById("enl").textContent=r.enlace;' +
    'document.getElementById("volver").href=D.vuelta+(D.vuelta.indexOf("?")<0?"?":"&")+"formulario="+encodeURIComponent(r.enlace);' +
    'document.getElementById("editar").href=r.editar;})' +
    '.withFailureHandler(function(e){b.disabled=false;b.textContent="Crear el formulario";document.getElementById("msg").innerHTML="<span class=err>No se pudo crear: "+String(e.message||e).replace(/</g,"&lt;")+"</span>";})' +
    '.crear(D);};' +
    '</script></body></html>';
}

/* se llama desde la página con google.script.run: se ejecuta con la cuenta de quien la usa */
function crear(entrada) {
  const d = limpia_(entrada || {});
  if (!d.titulo || !d.asociacion || !d.correo) throw new Error('faltan el nombre de la actividad, de la asociación o su correo.');
  const responsable = [d.asociacion, d.direccion, d.correo].filter(String).join(', ');

  const form = FormApp.create('Inscripción · ' + d.titulo);
  form.setTitle('Inscripción · ' + d.titulo);
  form.setDescription([
    d.resumen,
    [d.cuando && 'Cuándo: ' + d.cuando, d.donde && 'Dónde: ' + d.donde, d.precio && 'Precio: ' + d.precio,
     d.plazas && 'Plazas: ' + d.plazas + ', por orden de inscripción', d.hasta && 'Inscripción abierta hasta: ' + d.hasta].filter(String).join('\n'),
    'Organiza: ' + d.asociacion + (d.web ? ' · ' + d.web : '')
  ].filter(String).join('\n\n'));
  form.setConfirmationMessage('¡Gracias! Hemos recibido tu inscripción. Te confirmaremos la plaza por teléfono o correo. ' +
    'Si necesitas algo (por ejemplo, por una alergia o intolerancia alimentaria), escríbenos a ' + d.correo + '.');
  form.setShowLinkToRespondAgain(false).setAllowResponseEdits(false).setProgressBar(false);

  form.addTextItem().setTitle('Nombre y apellidos').setRequired(true);
  form.addTextItem().setTitle('Teléfono').setRequired(true)
      .setHelpText('Te llamaremos o escribiremos por WhatsApp solo para confirmar tu plaza o avisarte de cambios.')
      .setValidation(FormApp.createTextValidation().setHelpText('Escribe un teléfono válido, por ejemplo 600 123 456.')
        .requireTextMatchesPattern('^\\+?[0-9 ]{9,15}$').build());
  form.addTextItem().setTitle('Correo electrónico').setHelpText('Opcional.')
      .setValidation(FormApp.createTextValidation().setHelpText('Escribe un correo válido.').requireTextIsEmail().build());
  form.addMultipleChoiceItem().setTitle('¿Eres socio o socia de la asociación?').setChoiceValues(['Sí', 'No']).setRequired(true);
  form.addListItem().setTitle('¿Cuántas plazas reservas, contándote a ti?').setChoiceValues(['1', '2', '3']).setRequired(true)
      .setHelpText('Si viene alguna persona menor de edad, debe venir acompañada de una persona adulta, que es quien la inscribe.');

  form.addPageBreakItem().setTitle('Protección de datos y autorizaciones');
  form.addSectionHeaderItem().setTitle('Información básica sobre protección de datos').setHelpText(
    'Responsable: ' + responsable + '.\n\n' +
    'Finalidad: gestionar tu inscripción en la actividad, asignar las plazas y avisarte de cualquier cambio. ' +
    'Solo si lo autorizas más abajo: publicar fotos o vídeos de la actividad y enviarte información de próximas actividades.\n\n' +
    'Legitimación: tu consentimiento, que puedes retirar cuando quieras escribiendo a ' + d.correo + '.\n\n' +
    'Destinatarios: no cedemos tus datos a nadie, salvo obligación legal. Se recogen y guardan con Google Forms; ' +
    'Google actúa como proveedor del servicio y puede tratarlos fuera de la Unión Europea con las garantías que exige el RGPD.\n\n' +
    'Conservación: los datos de inscripción, hasta un año después de la actividad; las fotos y vídeos, mientras no retires tu autorización.\n\n' +
    'Derechos: puedes acceder a tus datos, rectificarlos, suprimirlos, oponerte a su tratamiento, limitarlo y pedir su portabilidad ' +
    'escribiendo a ' + d.correo + '. Si crees que no los tratamos bien, puedes reclamar ante la Agencia Española de Protección de Datos (www.aepd.es).\n\n' +
    'Por favor, no escribas en este formulario nada sobre tu salud.');
  form.addCheckboxItem().setTitle('Consentimiento para la inscripción').setRequired(true)
      .setChoiceValues(['He leído la información sobre protección de datos y acepto que la asociación trate mis datos para gestionar mi inscripción.']);
  form.addMultipleChoiceItem().setTitle('Fotos y vídeos de la actividad').setRequired(true)
      .setHelpText('Si inscribes a menores, esta respuesta vale también para ellos y la das como madre, padre o tutor.')
      .setChoiceValues(['Sí, autorizo que la asociación publique fotos o vídeos de la actividad en los que aparezca, en su web, su boletín y sus redes sociales.',
                        'No autorizo la publicación de mi imagen.']);
  form.addMultipleChoiceItem().setTitle('Información de próximas actividades').setRequired(true)
      .setChoiceValues(['Sí, quiero recibir información de las actividades de la asociación por correo o WhatsApp.', 'No, gracias.']);

  try { form.setRequireLogin(false); } catch (e) { /* solo en cuentas de Google Workspace */ }
  try { form.setPublished(true); } catch (e) { /* formularios antiguos: ya nacen publicados */ }
  form.setAcceptingResponses(true);

  const largo = form.getPublishedUrl();
  let enlace = largo;
  try { enlace = form.shortenFormUrl(largo); } catch (e) { /* si no se puede acortar, vale el largo */ }
  return {enlace: enlace, editar: form.getEditUrl()};
}
