# Gavriel Arias — Built. Ready. Live.

Sitio estático listo para subir a GitHub. No requiere Node, npm, instalación ni compilación. No se ha publicado ni se ha modificado el sitio original de Drive.

## Publicar en GitHub Pages

1. Crea un repositorio y sube **el contenido de esta carpeta**: `index.html`, `style.css`, `script.js`, `assets/`, `licenses/`, `.nojekyll`, `robots.txt` y `sitemap.xml`. `index.html` debe quedar en la raíz, no dentro de otra carpeta `gavriel-site`.
2. Abre **Settings → Pages → Deploy from a branch**. Elige tu rama principal y **/(root)**, y guarda.
3. GitHub mostrará la URL cuando termine de publicar. Las rutas de los assets son relativas y funcionan también en una URL de proyecto.
4. Para usar gavrielarias.com, configura tu dominio en GitHub Pages y sus registros DNS. Este paquete no cambia el dominio ni añade un archivo CNAME automáticamente.

La URL canónica, sitemap y metadatos sociales usan `https://www.gavrielarias.com/`, siguiendo el sitio anterior. Si publicas definitivamente sin `www` o bajo otro dominio, actualiza esas URLs en `index.html`, `sitemap.xml` y `robots.txt`. Redirige el dominio alternativo desde el alojamiento.

## Vista previa

Puedes abrir `index.html` directamente para revisar el diseño. Para comprobar YouTube, fuentes y calendario como en producción, usa un servidor local o GitHub Pages. La entrega también se comprobó en un servidor local, sin compilar.

## Qué incluye

- Diseño basado en los frames Desktop, Mobile y menú abierto del Figma `BZ0oujyEw7v2z6FR04LhT9`, con alineación, escala tipográfica y espaciados normalizados.
- H1 único; H2 por sección y H3 en servicios, preguntas y reserva. Copy público en inglés.
- Menú móvil en el flujo de la página: abre y empuja el contenido, cierra con Escape o al seguir un enlace. En abierto el logo se centra.
- Franja, trabajos e iconos en movimiento continuo de derecha a izquierda, sin controles de pausa ni pausa al pasar el mouse; respeta movimiento reducido.
- Las 12 tarjetas de trabajo son imágenes sin enlaces, según lo solicitado.
- Reel `9jNRsr2kPPM`, cargado tras pulsar Play en YouTube con dominio de privacidad mejorada. Enlace alternativo visible.
- Nueve testimonios transcritos de los JPG originales, con las caras PNG en el mismo orden; texto real, nombres y cargos en negrita. Navegación por flechas, puntos, teclado y swipe. Sin avance automático para permitir leer las citas completas.
- Cuatro FAQs expandibles y colapsables. La primera abierta inicialmente; las otras tres respuestas completadas según el contexto aprobado. Se pueden abrir varias.
- Contacto por email y las cuatro redes confirmadas. TikTok corregido a `@gavrielarias` y con icono de Simple Icons.
- Calendario Cal.com visible desde la carga inicial, evento `gavrielarias/let-s-connect`, namespace `let-s-connect`, mes y vista móvil de slots. Texto de 30 minutos. El evento real se comprobó y muestra 30m; no se creó ninguna reserva.
- Fuentes locales WOFF2 (Inter variable y Special Gothic Expanded One); imágenes WebP, dimensiones reservadas, retrato responsive y precarga de imágenes de las tiras al acercarse a la pantalla.
- Title, description, canonical, Open Graph, imagen social 1200 × 630, Twitter card, schema Person, sitemap, robots y favicon.
- Contenido y enlaces alternativos disponibles sin JavaScript. Sin analítica ni formularios.

## Editar después

- **Textos, FAQs, testimonios, redes y SEO:** `index.html`.
- **Colores, tipografías, tamaños y responsive:** variables al inicio de `style.css`; breakpoint móvil 760 px.
- **Interacciones y configuración del calendario/reel:** `script.js`.
- **Imágenes:** `assets/images/`; herramientas y SVG: `assets/icons/`; fuentes: `assets/fonts/`.
- **Animación:** duraciones en `.word-track`, `.work-track` y `.tools-track`. Menor duración significa mayor velocidad.

No cambies el nombre del evento de Cal.com solo en el texto: su `calLink` está en `script.js` y el enlace alternativo está en `index.html`. La disponibilidad del calendario se administra desde tu cuenta de Cal.com.

## Recursos y licencias

- Diseño, logo, retrato, cubos, trabajo y testimonios: proporcionados por Gavriel. El sitio anterior se consultó como referencia para sus carruseles y estructura estática.
- Flechas, brillos y tres iconos sociales: exportados del Figma proporcionado. TikTok: https://github.com/simple-icons/simple-icons, licencia CC0-1.0, copia en `licenses/simple-icons.txt`. La licencia del icono no concede derechos sobre la marca.
- Inter: https://github.com/rsms/inter, SIL Open Font License, copia en `licenses/inter.txt`.
- Special Gothic Expanded One: https://github.com/AlistairMcCready/Special-Gothic, SIL Open Font License, copia en `licenses/special-gothic.txt`.
- No hay librerías JavaScript de terceros para animación ni dependencias de compilación. Se usan CSS, IntersectionObserver y controles HTML nativos. YouTube se solicita al activar el reel; Cal.com se carga al abrir el sitio.

## Validación

Ver `VERIFICACION.md`. Las comprobaciones automáticas no sustituyen revisar el contenido comercial y la configuración del alojamiento definitivo. No se promete una posición en buscadores ni una puntuación Lighthouse de producción sin medirla allí.

## Revision de animaciones y contacto

Franja 25 % mas rapida (25.6 s desktop / 19.2 s movil); Tools 20 % mas rapido (30 s); Work conserva 70 s desktop / 75 s movil. Cubos con flotacion y rotacion suave; luz lima organica con blur y movimiento mediante CSS. Se respeta movimiento reducido. Servicios sin flechas. Portada del reel limpia con logo sobre negro, sin interfaz de YouTube incrustada ni textos propios superpuestos. Calendario automatico sin pantalla previa; enlace alternativo disponible si Cal.com esta bloqueado.
