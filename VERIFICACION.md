# Verificación — 21 de octubre de 2026

Recorrido comprobado: visitante → sitio estático → navegación y contenido → contacto por email, reproducción del reel o calendario de reservas.

## Resultados

- Navegador Chrome real sobre servidor local; sin errores JavaScript ni respuestas 4xx/5xx de assets locales.
- Anchos 320, 375, 402, 768, 1024, 1444 y 1920 px: sin desbordamiento horizontal.
- Menú móvil: abrir desplaza el hero más de 300 px; Escape cierra y devuelve foco; logo centrado en abierto comprobado; enlaces cerrados quedan fuera del foco mediante `inert`.
- FAQ: comprobadas apertura y cierre.
- Testimonios: comprobadas flechas, retorno circular, teclado y puntos; nueve citas y retratos locales decodificados correctamente. Swipe horizontal comprobado mediante eventos táctiles en el navegador.
- Carruseles: comprobadas pausa, reanudación y detención con `prefers-reduced-motion`.
- Auditoría axe-core 4.10.3, reglas WCAG 2 A/AA y WCAG 2.1 AA: **0 infracciones detectadas** a 402 y 1444 px. No equivale a una certificación completa de accesibilidad.
- Sin JavaScript: navegación móvil visible, nueve testimonios legibles y enlaces de reserva disponibles. Las FAQs usan controles nativos.
- Un H1, título, descripción, canonical, datos Person, sitemap, robots e imagen social presentes.
- Ninguna solicitud externa en la carga inicial ni al recorrer el contenido antes de activar los embeds. Fuentes y assets servidos localmente. Medición de la sesión de auditoría: aproximadamente 650 KB de recursos decodificados; no es una puntuación Lighthouse ni una medición de conexión móvil real.

## Integraciones

- **Cal.com real:** cargó el iframe del evento `gavrielarias/let-s-connect` sin solicitudes fallidas en la prueba. Inspección visual: evento “Let's connect”, duración **30m**, Google Meet y selección de horas. No se reservó ninguna sesión.
- **Cal.com configuración:** comprobada además con prueba controlada la inicialización diferida, namespace, enlace, month_view, vista móvil y reenvío de parámetros.
- **YouTube:** comprobado el click y la inserción de la URL del reel correcto en un iframe de `youtube-nocookie.com`. La reproducción real depende de conectividad, consentimiento del navegador, bloqueadores y disponibilidad del video.
- **Email/redes:** comprobados los destinos en el HTML. No se enviaron correos ni se modificaron perfiles.

## Límites y despliegue

La versión local no modifica el sitio de Drive, Figma, GitHub ni DNS. No se ha publicado. Tras subirla, comprobar HTTPS, dominio canónico, carga de embeds y vista previa al compartir. La compresión HTTP y las cabeceras de caché dependen del alojamiento. No hay backend, cuentas de usuario, pagos ni base de datos.

## Revision vigente: movimiento y calendario automatico

Esta revision sustituye las afirmaciones anteriores sobre carga inicial sin solicitudes externas y controles de pausa. Cal.com ahora se carga automaticamente al abrir el sitio; YouTube sigue bajo demanda. Se eliminaron todos los botones de pausa, pausa por hover, flechas de servicios y textos superpuestos al reel. Cubos y luces lima animados con CSS y blur. Pruebas especificas: calendario real cargado automaticamente, cero errores JavaScript, cero infracciones axe detectadas, anchos 320 a 1920 sin desbordamiento; velocidades desktop 25.6s / 70s / 30s para franja / Work / Tools. Todas siguen corriendo al pasar el mouse; movimiento reducido detiene cubos, luces y tiras.
