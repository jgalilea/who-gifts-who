// Spanish dictionary. Values are strings with {placeholders} or functions (for plurals).
const plural = (n, one, many) => (n === 1 ? one : many);

export default {
  'app.skip': 'Saltar al contenido',
  'app.tagline': 'Amigo invisible sin complicaciones',
  'app.language': 'Idioma',
  'app.footer': 'Todo ocurre en tu navegador: no hay servidor ni base de datos. El borrador se guarda en este dispositivo.',

  'common.optional': '(opcional)',
  'common.cancel': 'Cancelar',
  'common.confirm': 'Confirmar',
  'common.save': 'Guardar',
  'common.edit': 'Editar',
  'common.remove': 'Eliminar',

  'participants.title': 'Participantes',
  'participants.name': 'Nombre',
  'participants.group': 'Grupo familiar',
  'participants.groupPlaceholder': 'p. ej. Familia García',
  'participants.add': 'Añadir',
  'participants.empty': 'Todavía no hay participantes. Añádelos uno a uno o importa una lista.',
  'participants.count': ({ count }) => `${count} ${plural(count, 'persona', 'personas')}`,
  'participants.editLabel': 'Editar a {name}',
  'participants.removeLabel': 'Eliminar a {name}',
  'participants.removed': '{name} eliminado/a de la lista',
  'participants.clear': 'Vaciar todo',
  'participants.clearTitle': '¿Vaciar todo?',
  'participants.clearMessage': 'Se borrarán los participantes, las reglas y el sorteo guardado en este dispositivo. Si quieres conservarlos, exporta antes la configuración.',

  'errors.nameRequired': 'Escribe un nombre.',
  'errors.nameTooLong': 'El nombre es demasiado largo (máximo 60 caracteres).',
  'errors.groupTooLong': 'El grupo es demasiado largo (máximo 60 caracteres).',
  'errors.nameDuplicate': 'Ya hay alguien con ese nombre. Añade una inicial o un apellido para distinguirlos.',
  'errors.exclusionSame': 'Elige dos personas distintas.',
  'errors.exclusionMissing': 'Elige las dos personas.',
  'errors.exclusionDuplicate': 'Esa exclusión ya existe.',

  'import.open': 'Importar lista',
  'import.title': 'Importar participantes',
  'import.help': 'Sube un archivo <strong>.txt</strong> o <strong>.csv</strong> con un nombre por línea. Opcionalmente, añade el grupo familiar y el teléfono separados por punto y coma: <code>Ana;Familia García;+34 600 123 456</code>. También acepta archivos <strong>.json</strong> exportados desde esta app.',
  'import.file': 'Archivo',
  'import.chooseFile': 'Elegir archivo…',
  'import.paste': '…o pega la lista aquí',
  'import.placeholder': 'Ana;Familia García\nLuis;Familia García;+34 600 123 456\nMarta',
  'import.mode': '¿Qué hacer con la lista actual?',
  'import.modeAdd': 'Añadir a la lista actual',
  'import.modeReplace': 'Reemplazar la lista actual (y sus reglas)',
  'import.confirm': ({ count }) => (count ? `Importar ${count} ${plural(count, 'persona', 'personas')}` : 'Importar'),
  'import.summary': ({ ok, skipped }) =>
    `${ok} ${plural(ok, 'persona lista', 'personas listas')} para importar` +
    (skipped ? ` · ${skipped} ${plural(skipped, 'línea se omitirá', 'líneas se omitirán')}` : ''),
  'import.issueEmpty': 'Línea {line}: vacía, se ignorará.',
  'import.issueDuplicate': 'Línea {line}: «{name}» está repetido en la lista, se ignorará.',
  'import.issueExists': 'Línea {line}: «{name}» ya es participante, se ignorará.',
  'import.issueTooLong': 'Línea {line}: el nombre o el grupo es demasiado largo (máximo 60 caracteres).',
  'import.issueInvalid': 'Elemento {line}: formato no válido, se ignorará.',
  'import.invalidJson': 'El archivo JSON no es válido: {detail}',
  'import.jsonShape': 'El JSON debe ser una lista de nombres o un objeto con "participants". Consulta el README.',
  'import.extraExclusions': ({ count }) => `También se ${plural(count, 'importará 1 exclusión', `importarán ${count} exclusiones`)}.`,
  'import.extraFamily': 'Se activará la regla «Excluir familiares».',
  'import.settingsIgnored': 'Los ajustes del archivo solo se aplican al reemplazar la lista.',
  'import.previewCaption': 'Vista previa de la importación',
  'import.done': ({ count }) => `${count} ${plural(count, 'persona importada', 'personas importadas')}`,

  'export.button': 'Exportar configuración',
  'export.done': 'Configuración descargada. Guárdala para el año que viene.',

  'rules.title': 'Reglas',
  'rules.excludeFamily': 'Excluir familiares',
  'rules.excludeFamilyHint': 'Nadie regalará a alguien de su mismo grupo familiar.',
  'rules.exclusionTitle': 'Exclusión individual',
  'rules.from': 'Quién',
  'rules.to': 'No puede regalar a',
  'rules.direction': 'Sentido',
  'rules.oneWay': 'Solo en ese sentido',
  'rules.bothWays': 'En ambos sentidos',
  'rules.addExclusion': 'Añadir exclusión',
  'rules.choose': 'Elige…',
  'rules.active': 'Reglas activas',
  'rules.always': 'Siempre activa',
  'rules.noSelf': 'Nadie puede regalarse a sí mismo.',
  'rules.familyActive': 'Excluir familiares: {groups}.',
  'rules.familyNoGroups': 'Excluir familiares (ningún participante tiene grupo familiar todavía).',
  'rules.removeFamily': 'Desactivar «Excluir familiares»',
  'rules.oneWayRule': '{from} no puede regalar a {to}.',
  'rules.mutual': '{from} y {to} no pueden regalarse entre sí.',
  'rules.removeLabel': 'Quitar regla: {rule}',

  'feasibility.ok': 'Con estas reglas hay asignaciones posibles. ¡Listo para sortear!',
  'feasibility.notPossible': 'No hay ninguna combinación posible.',
  'feasibility.tooFew': ({ min }) => `Hacen falta al menos ${min} participantes.`,
  'feasibility.noReceivers': '{name} no puede regalar a nadie con las reglas actuales.',
  'feasibility.noGivers': 'Nadie puede regalar a {name} con las reglas actuales.',
  'feasibility.familyTooLarge': ({ group, size, total, others }) =>
    `${group} tiene ${size} de ${total} personas; con la exclusión de familiares solo hay ${others} ${plural(others, 'persona', 'personas')} a ${plural(others, 'quien', 'quienes')} pueden regalar, así que no hay combinación posible.`,
  'feasibility.hall': ({ givers, receivers, giverCount, receiverCount }) =>
    `Entre ${givers} (${giverCount} personas) solo pueden regalar a ${receivers} (${receiverCount} ${plural(receiverCount, 'persona', 'personas')}). No hay destinatarios suficientes: quita alguna exclusión.`,

  'prob.title': 'Probabilidades',
  'prob.toggle': 'Mostrar probabilidades',
  'prob.toggleHint': 'Calcula la probabilidad de cada emparejamiento según las reglas activas. Están ocultas para no condicionar a nadie.',
  'prob.calculating': 'Calculando…',
  'prob.needMore': 'Añade al menos tres participantes para ver las probabilidades.',
  'prob.none': 'Con las reglas actuales no hay combinaciones válidas.',
  'prob.total': 'Combinaciones válidas:',
  'prob.exactNote': 'cálculo exacto; todas se consideran igual de probables.',
  'prob.estimateNote': 'estimación por muestreo ({samples} muestras), porque hay más de {limit} participantes.',
  'prob.person': 'Persona',
  'prob.gives': 'Probabilidad de que {name} regale a…',
  'prob.receives': 'Probabilidad de que a {name} le regale…',
  'prob.matrix': 'Matriz: quién regala a quién',
  'prob.matrixHint': 'Cada fila es quien regala; cada columna, quien recibe. «—»: no permitido por una regla. «0 %»: ninguna regla lo prohíbe, pero las demás reglas hacen que nunca pueda ocurrir (por ejemplo, porque esas personas ya tienen que regalar a otras).',
  'prob.matrixCaption': 'Probabilidad de que la persona de cada fila regale a la de cada columna',
  'prob.giverAxis': 'Regala ↓',
  'prob.receiverAxis': 'Recibe →',
  'prob.notAllowed': 'no permitido',

  'draw.title': 'Sorteo',
  'draw.intro': 'El sorteo elige al azar una de todas las combinaciones válidas, todas con la misma probabilidad. Los resultados no se mostrarán en esta pantalla.',
  'draw.button': 'Realizar sorteo',
  'draw.doneToast': 'Sorteo realizado. Los resultados están ocultos.',
  'draw.error': 'No se pudo realizar el sorteo. Revisa las reglas.',
  'draw.doneTitle': 'Sorteo realizado.',
  'draw.doneText': ({ date, count }) => `${date} · ${count} personas. Los resultados están ocultos: ni siquiera tú los ves aquí.`,
  'draw.stale': 'Has cambiado participantes, reglas o datos del evento después del sorteo. Los enlaces generados muestran el resultado y los datos anteriores: repite el sorteo si quieres aplicar los cambios.',
  'draw.deliveryMode': 'Cómo entregar los resultados',
  'draw.tabLinks': 'Enviar enlaces',
  'draw.tabInPerson': 'Presencial',
  'draw.linksHint': 'Cada persona recibe un enlace secreto que solo muestra su resultado. El resultado va cifrado dentro del propio enlace.',
  'draw.inPersonHint': 'Pasad el móvil de mano en mano. La app indica en cada momento a quién hay que pasárselo y qué botón pulsar.',
  'draw.startInPerson': 'Empezar sorteo presencial',
  'draw.organizerOptions': 'Opciones del organizador',
  'draw.revealAll': 'Revelar todos los resultados',
  'draw.revealAllTitle': '¿Ver todos los resultados?',
  'draw.revealAllMessage': 'Úsalo solo si alguien ha perdido su enlace. Verás quién regala a quién y dejará de ser una sorpresa para ti.',
  'draw.revealAllCheck': 'Entiendo que voy a ver todos los resultados.',
  'draw.revealAllConfirm': 'Revelar',
  'draw.allResults': 'Todos los resultados',
  'draw.hideAll': 'Ocultar resultados',
  'draw.gives': 'regala a',
  'draw.redo': 'Repetir sorteo',
  'draw.redoTitle': '¿Repetir el sorteo?',
  'draw.redoMessage': ({ code }) => `Se generará un sorteo nuevo, con enlaces nuevos y otro código (el actual es #${code}). Los enlaces ya enviados seguirán abriéndose y mostrarán el resultado anterior con el código #${code}: reenvía los nuevos y avisa al grupo de cuál es el código válido.`,
  'draw.discard': 'Borrar sorteo',
  'draw.discardTitle': '¿Borrar el sorteo?',
  'draw.discardMessage': 'Se borrará el sorteo de este dispositivo. Los enlaces ya enviados seguirán funcionando.',

  'share.whatsapp': 'WhatsApp',
  'share.whatsappLabel': 'Enviar el enlace de {name} por WhatsApp',
  'share.share': 'Compartir',
  'share.shareLabel': 'Compartir el enlace de {name}',
  'share.copy': 'Copiar enlace',
  'share.copyLabel': 'Copiar el enlace de {name}',
  'share.copied': 'Enlace de {name} copiado',
  'share.copyError': 'No se pudo copiar el enlace',
  'share.shareError': 'No se pudo compartir el enlace',
  'share.message': ({ name, url, event, code }) => `🎁 ¡Hola, ${name}! Ya tenemos el sorteo del amigo invisible${event ? ` «${event}»` : ''}${code ? ` (código #${code})` : ''}. Abre tu enlace secreto para descubrir a quién le regalas (no lo compartas con nadie): ${url}`,
  'share.shareText': ({ name, event }) => `🎁 ¡Hola, ${name}! Abre tu enlace secreto para descubrir a quién le regalas en el amigo invisible${event ? ` «${event}»` : ''}.`,

  'inperson.exit': 'Salir',
  'inperson.exitTitle': '¿Salir del sorteo presencial?',
  'inperson.exitMessage': 'Si sales, podrás volver a empezar desde la primera persona cuando quieras.',
  'inperson.instructions': '{name}: cuando tengas el móvil en la mano y nadie más mire la pantalla, mantén pulsado el botón.',
  'inperson.youGift': '{name}, le regalas a',
  'inperson.hideNext': 'Ocultar y pasar el móvil a {next}',
  'inperson.hideLast': 'Ocultar y terminar',
  'inperson.progress': '{current} de {total}',
  'inperson.progressDone': '{total} de {total}',
  'inperson.introTitle': 'Cómo funciona',
  'inperson.introStep1': 'La app muestra a quién le toca. <strong>Pásale el móvil a esa persona.</strong>',
  'inperson.introStep2': 'Esa persona, y solo ella, <strong>mantiene pulsado</strong> el botón para ver su resultado.',
  'inperson.introStep3': 'Lo memoriza y pulsa <strong>Ocultar</strong>. El resultado desaparece de la pantalla.',
  'inperson.introStep4': 'La app muestra el nombre de la siguiente persona: pásale el móvil y repetid.',
  'inperson.begin': 'Entendido, empezar',
  'inperson.step1': 'Paso 1 de 2 · Pasar el móvil',
  'inperson.step2': 'Paso 2 de 2 · Memorizar y ocultar',
  'inperson.passTo': 'Pasa el móvil a',
  'inperson.holdToReveal': 'Soy {name}: mantén pulsado para ver',
  'inperson.holdToRevealAria': 'Soy {name}: mantén pulsado para ver mi resultado',
  'inperson.holdHint': 'Mantén pulsado hasta que se llene el botón.',
  'inperson.onlyYou': '🤫 Solo {name} debe ver esta pantalla',
  'inperson.memorizeNext': 'Memorízalo. Después pulsa el botón para ocultarlo y pasa el móvil a {next}.',
  'inperson.memorizeLast': 'Memorízalo y pulsa el botón para ocultarlo. ¡Eres la última persona!',
  'inperson.exitCancel': 'Seguir con el sorteo',
  'draw.organizerHint': 'Pulsa para desplegar: revelar todo, repetir o borrar el sorteo',
  'draw.badgeDone': 'Realizado',
  'draw.badgeReady': 'Pendiente',
  'draw.badgeBlocked': 'Bloqueado',
  'rules.badge': ({ count }) => `${count} ${plural(count, 'regla', 'reglas')}`,
  'rules.badgeBlocked': 'Sin solución',
  'inperson.doneTitle': '¡Todos tienen su amigo invisible!',
  'inperson.finish': 'Terminar',

  'reveal.errorTitle': 'Enlace no válido',
  'reveal.errorText': 'Este enlace está incompleto o dañado. Pide a quien organiza el sorteo que te lo vuelva a enviar.',
  'reveal.hello': 'Hola,',
  'reveal.intro': 'Tu amigo invisible te espera dentro de este regalo.',
  'reveal.button': 'Descubrir a quién le regalo',
  'reveal.youGift': 'Le regalas a…',
  'reveal.keepSecret': '¡Shhh! Guarda el secreto 🤫',
  'reveal.createOwn': 'Organiza tu propio amigo invisible con Who Gifts Who',
  'event.title': 'Evento',
  'event.hint': 'Todo es opcional. Aparecerá en el mensaje y en la página de cada participante, junto a su resultado.',
  'event.name': 'Nombre del evento',
  'event.namePlaceholder': 'p. ej. Navidad en familia 2026',
  'event.date': 'Fecha',
  'event.budget': 'Presupuesto',
  'event.budgetPlaceholder': '30',
  'event.currency': 'Moneda',
  'event.badgeEmpty': 'Sin datos',
  'participants.phone': 'Teléfono',
  'participants.phonePlaceholder': '+34 600 123 456',
  'participants.phoneHint': 'Con prefijo del país. Sirve para abrir su chat de WhatsApp directamente.',
  'participants.existingGroups': 'Grupos existentes',
  'errors.phoneInvalid': 'El teléfono no parece válido. Escríbelo con el prefijo del país, p. ej. +34 600 123 456.',
  'errors.phoneNoPrefix': 'Añade el prefijo del país al principio, p. ej. +34 600 123 456.',
  'import.issuePhone': 'Línea {line}: el teléfono de «{name}» no es válido (¿falta el prefijo del país?); se importará sin teléfono.',
  'import.extraEvent': 'Se importarán los datos del evento.',
  'import.extraPrevious': ({ count }) => `Se importarán ${count} ${plural(count, 'sorteo anterior', 'sorteos anteriores')} para no repetir parejas.`,
  'feasibility.combinations': 'Hay {count} combinaciones posibles.',
  'feasibility.fewCombinations': ({ count }) => count === 1 ? 'Solo hay 1 combinación posible: el resultado está decidido de antemano. Añade personas o quita reglas.' : `Solo hay ${count} combinaciones posibles: quien sepa su resultado puede deducir el de los demás. Añade personas o quita reglas.`,
  'draw.codeLabel': 'Código del sorteo',
  'draw.codeHint': 'Aparece en el mensaje y en la página de cada enlace. Si repites el sorteo, el código cambia: dile al grupo cuál es el código válido y así nadie se fiará de un enlace antiguo.',
  'draw.next': 'Nuevo sorteo sin repetir parejas',
  'draw.nextTitle': '¿Preparar un nuevo sorteo sin repetir parejas?',
  'draw.nextMessage': 'Pensado para el año siguiente. Las parejas de este sorteo se guardarán como «sorteo anterior» (sin mostrar quién regaló a quién) y este sorteo se borrará de este dispositivo. Los enlaces ya enviados seguirán funcionando. Si exportas la configuración, se incluye en el archivo.',
  'draw.nextDone': 'Listo: el próximo sorteo no repetirá las parejas anteriores.',
  'reveal.event': 'Evento',
  'reveal.date': 'Fecha',
  'reveal.budget': 'Presupuesto',
  'reveal.code': 'Código del sorteo',
  'reveal.notSet': 'Sin indicar',
  'rules.previousRule': ({ draw, applies, total }) => `No repetir parejas de ${draw}` + (applies === total ? ` (${total} ${plural(total, 'pareja', 'parejas')}).` : ` (aplican ${applies} de ${total} parejas a los participantes actuales).`),
  'history.title': 'Sorteos anteriores',
  'history.hint': 'Evita repetir parejas de años anteriores. Las parejas no se muestran en pantalla.',
  'history.import': 'Importar sorteos anteriores',
  'history.export': 'Exportar sorteos',
  'history.exportDraw': 'Exportar sorteo',
  'history.unnamed': 'sin nombre',
  'history.importTitle': 'Importar sorteos anteriores',
  'history.importHelp': 'Sube un archivo exportado con «Exportar sorteo» (o una configuración que los incluya), <strong>pega los enlaces secretos</strong> de un sorteo anterior (se descifran en tu dispositivo) o <strong>escribe las parejas</strong>, una por línea: <code>Ana &gt; Luis</code>.',
  'history.paste': '…o pega aquí los enlaces o las parejas',
  'history.placeholder': 'Ana > Luis\nLuis > Marta\nMarta > Ana\n\no pega los enlaces: https://…/reveal.html#…',
  'history.label': 'Nombre del sorteo',
  'history.labelPlaceholder': 'p. ej. Navidad 2024',
  'history.labelHint': 'Solo para parejas escritas a mano. Los enlaces y archivos ya traen el suyo.',
  'history.importConfirm': ({ count }) => (count ? `Importar ${count} ${plural(count, 'sorteo', 'sorteos')}` : 'Importar'),
  'history.found': ({ count }) => `${count} ${plural(count, 'sorteo encontrado', 'sorteos encontrados')}:`,
  'history.nothingFound': 'No se ha encontrado ninguna pareja ni enlace válido.',
  'history.pairs': ({ count }) => `${count} ${plural(count, 'pareja', 'parejas')}`,
  'history.alreadyImported': 'ya importado',
  'history.unknownNames': ({ count }) => `${count} ${plural(count, 'pareja menciona', 'parejas mencionan')} a personas que no están en la lista: se guardan por si las añades después.`,
  'history.invalidLine': 'Línea {line}: no se entiende la pareja (usa «Ana > Luis»); se ignorará.',
  'history.badLinks': ({ count }) => (count === 1 ? '1 enlace no es válido o está dañado; se ignorará.' : `${count} enlaces no son válidos o están dañados; se ignorarán.`),
  'history.noDrawsInFile': 'El archivo no contiene ningún sorteo.',
  'history.imported': ({ count }) => `${count} ${plural(count, 'sorteo anterior importado', 'sorteos anteriores importados')}`,
  'history.exportTitle': 'Exportar sorteos',
  'history.exportWhat': '¿Qué quieres exportar?',
  'history.exportCurrent': ({ code }) => `Solo el sorteo actual ${code}`,
  'history.exportCurrentNone': 'Solo el sorteo actual (no hay ninguno)',
  'history.exportAll': ({ count }) => `Todos juntos: el actual y los anteriores (${count} ${plural(count, 'sorteo', 'sorteos')})`,
  'history.exportAllPrevious': ({ count }) => `Todos los sorteos anteriores guardados (${count})`,
  'history.exportWarning': 'El archivo incluye quién regala a quién. Guárdalo en un lugar privado y no lo compartas antes del evento.',
  'history.exportConfirm': 'Descargar',
  'history.exported': ({ count }) => `${count} ${plural(count, 'sorteo exportado', 'sorteos exportados')}`,
  'help.button': 'Ayuda',
  'help.title': 'Cómo funciona',
  'help.intro': 'Pulsa cada tema para desplegarlo.',
  'help.close': 'Cerrar',
  'help.start.title': `Cómo funciona, en resumen`,
  'help.start.body': `<p><strong>Who Gifts Who</strong> organiza un amigo invisible sin servidor: todo ocurre en tu navegador y se guarda en este dispositivo.</p>
<ol>
<li><strong>Evento</strong> (opcional): nombre, fecha y presupuesto.</li>
<li><strong>Participantes</strong>: añádelos a mano o importa una lista.</li>
<li><strong>Reglas</strong>: quién no puede regalar a quién.</li>
<li><strong>Probabilidades</strong> (opcional): cómo de probable es cada pareja.</li>
<li><strong>Sorteo</strong>: la app elige al azar y entregas los resultados por enlace secreto o en persona.</li>
</ol>
<p>Cada sección se puede plegar pulsando su título.</p>`,
  'help.event.title': `1 · Evento`,
  'help.event.body': `<p>Nombre, fecha y presupuesto son opcionales. Si los rellenas, aparecen en el mensaje que envías y en la página de cada participante, junto a su resultado.</p>
<p>Si los cambias después del sorteo, los enlaces ya generados siguen mostrando los datos antiguos: la app te avisa para que repitas el sorteo.</p>`,
  'help.participants.title': `2 · Participantes`,
  'help.participants.body': `<ul>
<li><strong>Nombre</strong>: obligatorio y sin repetir (no distingue mayúsculas).</li>
<li><strong>Grupo familiar</strong>: opcional. Sirve para la regla «Excluir familiares». Escribe el mismo nombre para toda la familia.</li>
<li><strong>Teléfono</strong>: opcional, con prefijo del país (+34…). Si lo pones, el botón de WhatsApp abre directamente su chat.</li>
</ul>
<p><strong>Importar lista</strong>: sube un .txt o .csv con una persona por línea (<code>nombre;grupo;teléfono</code>), pega la lista o usa un .json exportado. Verás una vista previa con los avisos antes de confirmar.</p>
<p><strong>Exportar configuración</strong>: descarga todo (evento, participantes, reglas y sorteos anteriores) para reutilizarlo el año que viene. No incluye el resultado del sorteo actual.</p>`,
  'help.rules.title': `3 · Reglas`,
  'help.rules.body': `<ul>
<li><strong>Nadie se regala a sí mismo</strong>: siempre activa.</li>
<li><strong>Excluir familiares</strong>: nadie regala a alguien de su mismo grupo familiar.</li>
<li><strong>Exclusión individual</strong>: «X no puede regalar a Y», en un sentido o en ambos (por ejemplo, parejas).</li>
</ul>
<p>Debajo verás si hay combinaciones posibles. Si no las hay, la app explica el motivo y no deja sortear. Si hay muy pocas (1 o 2), avisa: alguien podría deducir el resultado de los demás.</p>`,
  'help.previous.title': `Sorteos anteriores (no repetir parejas)`,
  'help.previous.body': `<p>Sirve para que no se repitan las parejas de años anteriores. Cada sorteo anterior es una regla que puedes quitar cuando quieras. Las parejas <strong>no se muestran</strong>: solo verás «No repetir las parejas de…».</p>
<p>Tres formas de añadir un sorteo anterior:</p>
<ul>
<li><strong>Desde el sorteo actual</strong>: en «Opciones del organizador», pulsa «Nuevo sorteo sin repetir parejas».</li>
<li><strong>Importar un archivo</strong> exportado con «Exportar sorteo/sorteos» (o una configuración que los incluya).</li>
<li><strong>Pegar los enlaces secretos</strong> del año pasado (la app los descifra en tu dispositivo) o <strong>escribir las parejas</strong>, una por línea: <code>Ana &gt; Luis</code>.</li>
</ul>
<p>Las parejas se guardan por nombre: si alguien ya no participa, su pareja simplemente no se aplica.</p>`,
  'help.probabilities.title': `4 · Probabilidades`,
  'help.probabilities.body': `<p>Están ocultas por defecto para no condicionar a nadie. Al activarlas verás:</p>
<ul>
<li>El <strong>número de combinaciones válidas</strong>.</li>
<li>Para cada persona, la probabilidad de que regale a cada una de las demás y de que cada una le regale a ella.</li>
<li>Una <strong>matriz</strong> «quién regala a quién»: filas = quien regala, columnas = quien recibe; «—» significa que no está permitido.</li>
</ul>
<p>Hasta 20 personas el cálculo es exacto; con más, es una estimación por muestreo (se indica).</p>`,
  'help.draw.title': `5 · Sorteo`,
  'help.draw.body': `<p>La app elige al azar <strong>una de todas las combinaciones válidas</strong>, todas con la misma probabilidad (coincide con las probabilidades mostradas). Usa el generador aleatorio seguro del navegador.</p>
<p>Tras el sorteo, <strong>nadie ve los resultados en pantalla</strong>, ni siquiera quien organiza. Después eliges cómo entregarlos: enlaces o en persona.</p>`,
  'help.links.title': `Entregar por enlace secreto`,
  'help.links.body': `<p>Cada persona tiene su propio enlace. El resultado va <strong>cifrado dentro del enlace</strong> (después de «#»), así que no pasa por ningún servidor y no se ve mirando la dirección.</p>
<ul>
<li><strong>WhatsApp</strong>: abre WhatsApp con el mensaje preparado (directamente en su chat si tiene teléfono).</li>
<li><strong>Compartir</strong>: usa el menú de compartir del móvil (si está disponible).</li>
<li><strong>Copiar enlace</strong>: para enviarlo por donde quieras.</li>
</ul>
<p>Al abrirlo, la persona ve «Hola, [nombre]», pulsa «Descubrir a quién le regalo» y aparece el resultado con los datos del evento.</p>`,
  'help.inperson.title': `Entregar en persona (pasar el móvil)`,
  'help.inperson.body': `<ol>
<li>La app muestra a quién le toca: <strong>pásale el móvil a esa persona</strong>.</li>
<li>Esa persona, y solo ella, <strong>mantiene pulsado</strong> el botón hasta que se llena para ver su resultado. Mantenerlo evita que un doble toque accidental revele el de otra persona.</li>
<li>Lo memoriza y pulsa <strong>Ocultar</strong>: el resultado desaparece de la pantalla.</li>
<li>La app indica a quién pasar el móvil después. Repetid hasta el final.</li>
</ol>
<p>«Salir» pide confirmación dentro de la propia pantalla y nunca vuelve a mostrar un resultado.</p>`,
  'help.code.title': `El código del sorteo`,
  'help.code.body': `<p>Cada sorteo tiene un código corto, por ejemplo <strong>#A7K2</strong>. Aparece en el mensaje y en la página de cada enlace.</p>
<p>Si repites el sorteo, el código cambia, pero los enlaces que ya enviaste siguen abriéndose (no se pueden anular sin servidor). Dile al grupo cuál es el código válido: si alguien abre un enlace con otro código, sabrá que es antiguo.</p>`,
  'help.organizer.title': `Opciones del organizador`,
  'help.organizer.body': `<ul>
<li><strong>Revelar todos los resultados</strong>: solo si alguien pierde su enlace. Pide confirmación explícita.</li>
<li><strong>Repetir sorteo</strong>: sorteo nuevo con enlaces y código nuevos.</li>
<li><strong>Exportar sorteo</strong>: descarga el resultado (solo el actual o todos juntos con los anteriores). El archivo contiene quién regala a quién: guárdalo en privado.</li>
<li><strong>Nuevo sorteo sin repetir parejas</strong>: guarda este sorteo como «anterior» y lo borra, listo para sortear de nuevo.</li>
<li><strong>Borrar sorteo</strong>: lo elimina de este dispositivo; los enlaces enviados siguen funcionando.</li>
</ul>`,
  'help.nextYear.title': `Para el año que viene`,
  'help.nextYear.body': `<ol>
<li>Después del evento, en «Opciones del organizador», pulsa <strong>Nuevo sorteo sin repetir parejas</strong> (o «Exportar sorteo» para guardarlo aparte).</li>
<li>Pulsa <strong>Exportar configuración</strong> y guarda el archivo.</li>
<li>El año siguiente, <strong>Importar lista</strong> → elige el archivo → «Reemplazar la lista actual». Vuelven los participantes, las reglas y los sorteos anteriores.</li>
</ol>`,
  'help.privacy.title': `Privacidad y límites`,
  'help.privacy.body': `<ul>
<li>No hay servidor ni base de datos: todo se guarda en este navegador. Si cambias de dispositivo, exporta la configuración.</li>
<li>El enlace <strong>es la llave</strong>: está cifrado, pero quien tenga el enlace puede abrirlo. Por eso quien organiza podría, técnicamente, abrir enlaces ajenos; se confía en que no lo haga.</li>
<li>El sorteo y sus enlaces se guardan en este dispositivo para poder reenviarlos. Usa «Borrar sorteo» al terminar si quieres.</li>
<li>La vista previa de los enlaces (en WhatsApp, etc.) nunca muestra el resultado.</li>
</ul>`,
};
