# Apex Creativo · Plataforma Web & Suite de Clientes

Plataforma web de clase mundial y portal de gestión operativa para **Apex Creativo**, especializada en la creación de contenido, guiones escena por escena y resultados medibles para marcas en **México y Colombia**.

---

## 🚀 Despliegue Inmediato en GitHub Pages (100% Gratuito)

La plataforma está diseñada con arquitectura pura (HTML5, CSS3 moderno y Vanilla JavaScript), por lo que **no requiere compilar, ni instalar servidores, ni pagar hosting**.

### Pasos para publicar en 2 minutos:
1. Crea un repositorio en tu cuenta de GitHub (ej. `apex-creativo` o `apexcreativo.github.io`).
2. Sube todos los archivos de esta carpeta (`index.html`, `app.html`, `styles.css`, `app.js` y la carpeta `resultados`).
3. En GitHub, ve a **Settings** ➔ **Pages** ➔ en **Branch** selecciona `main` (o `master`) y guarda (**Save**).
4. ¡Listo! Tu sitio estará activo en `https://tuusuario.github.io/apex-creativo/`.

---

## 🔑 Sistema de Accesos y PINs de Seguridad

El acceso es por PIN y todo lo que se edita en el portal se guarda en la nube (Firebase, proyecto `apex-creativo-portal`), así que los cambios se ven en cualquier navegador o dispositivo:

### 1. Acceso Clientes (Vista Exclusiva de su Marca)
* **Cómo ingresa el cliente:**
  1. Entra a la web y da clic en **"Acceso Clientes"** (o va directo a `app.html`).
  2. Escribe el nombre de su marca (mínimo 3 letras, por ejemplo "Faro") y la elige de las opciones que aparecen. La lista completa de clientes no se muestra.
  3. Ingresa el código PIN de 4 dígitos asignado a su marca (se cambia en el portal: Ajustes de Agencia → Cambiar PIN).
* **Enlace directo preautenticado:**
  Puedes enviarles un enlace de WhatsApp directo como este:  
  `https://tu-sitio.com/?cliente=<slug>&pin=<PIN>`  
  *(Al dar clic, el cliente entra directamente a su parrilla sin tener que escribir nada).*
* **Qué puede hacer el cliente:**
  * Ver su **Parrilla de Contenido** del mes con formatos (Reels, Carruseles, Posts) y fechas de publicación.
  * Revisar el **Guion Escena por Escena** (qué se ve, qué se dice y texto en pantalla).
  * **Aprobar Guiones con 1 clic** o dejar comentarios y ajustes para el equipo.
  * Consultar su **Reporte Mensual de Resultados** por plataforma: indicadores con su comparación contra el mes anterior y Top 3 de contenidos de Instagram.

### 2. Acceso Equipo Apex
* **Pestaña "Equipo Apex"** ➔ Elegir el código de acceso (APEX CEO1, APEX CEO2, APEX EQ1 o APEX EQ2) e ingresar su PIN personal (guardado en la nube; no está escrito en el código).
* **Qué puede hacer el equipo:**
  * **Selector Multicliente:** Cambiar al instante entre los clientes de la agencia.
  * **Crear Nuevos Clientes:** Añadir cualquier marca nueva con su nombre, sector, país y PIN personalizado en 1 segundo.
  * **Tablero de Colaboradores & Labores:**
    * Filtrar tareas por responsable: Mitzi (edición/levantamiento), Alexa (grabación/actuación), Influencers aliados, Alejandra (dirección/pauta).
    * Mover piezas entre estados: *Por Grabar*, *Grabado*, *Editado*, *Publicado*.
  * **Gestor Dinámico de Equipo:** Agregar nuevos colaboradores sobre la marcha según varíe el equipo.
  * **Reportes de Métricas:** Las métricas de cada cliente y mes se capturan en `reportes.js` (ver abajo).
  * **Respaldos:** Descargar una copia completa de la base de datos en archivo `.json` con un solo clic.

---

## 📊 Reporte de Resultados por plataforma (`reportes.js`)

La pestaña **Resumen de Resultados** muestra 4 bloques (Instagram, Facebook, TikTok y Google). Cada indicador trae su comparación contra el mes anterior ("vs septiembre", etc.). TikTok se compara desde octubre 2026; en septiembre 2026 solo muestra los datos del mes. Debajo, Instagram muestra el Top 3 de contenidos con portada y Google las reseñas destacadas; Facebook y TikTok solo muestran sus indicadores.

* **Instagram:** Visualizaciones totales, Cuentas alcanzadas (con visitas al perfil y toques en el enlace externo), Interacciones, Publicaciones en total y Total de seguidores.

* Los datos se capturan en **`reportes.js`**. El Faro · Septiembre 2026 es el ejemplo completo.
* Para otro cliente o mes: copia el bloque de El Faro, cámbialo de cliente (slug) y de mes (`'AAAA-MM'`) y llena `actual` y `anterior`. El portal calcula la diferencia, el % y la flecha.
* `null` se muestra como "Por completar".
* **Principal contenido (Top 3, solo Instagram):** se pega el link de la publicación o reel; la tarjeta muestra la portada y al darle clic se abre el video en otra pestaña. Las imágenes de `resultados/<cliente>-<AAAA-MM>/portadas/` solo se usan cuando no hay link. Las portadas de El Faro · octubre 2026 van incrustadas dentro de `reportes.js` (`PORTADAS_ELFARO_2026_10`), así que ese mes no necesita carpeta de imágenes.
* **Edición desde el portal:** el perfil **APEX CEO1** ve el botón "✏️ Editar reporte" en Resumen de Resultados y puede cambiar todos los campos (periodos, indicadores, valores del mes anterior, notas, Top 3 de Instagram y reseñas de Google). Lo que guarda se va a la nube y tiene prioridad sobre `reportes.js`.
* **Eliminar un reporte:** el mismo perfil ve "🗑️ Eliminar reporte" cuando el mes tiene un reporte guardado en la nube. Pide confirmación, lo borra de la nube y conserva la planeación y los colores del calendario de ese mes. Lo capturado en `reportes.js` no se borra desde el portal.
* **Historial de reportes (todos los meses):** arriba del reporte, la tira "Tus reportes mensuales" muestra cada mes publicado, del más antiguo al más reciente. El cliente entra en el más reciente y cambia de mes con un clic, con las flechas ‹ › o con "Reporte anterior / siguiente" al final del reporte. Cada mes que se guarda (con "✏️ Editar reporte" o en `reportes.js`) aparece solo; los meses sin reporte no se muestran al cliente.
* **Ver como cliente:** el equipo tiene el botón "👁 Ver como cliente" para revisar la pestaña tal como la ve el cliente (solo meses publicados y sin botones de edición). "Volver a la vista del equipo" regresa a la vista normal.

---

## 📝 Planeación del mes y colores del calendario

* **Pestaña Planeación:** tabla de 3 columnas por cliente y por mes. El equipo puede escribir en las celdas, renombrar las columnas, agregar filas (1, 3, 5 o 10 a la vez), insertar o eliminar filas y colorear celdas con "🎨 Colorear celdas". El cliente la ve en modo lectura.
* **Parrilla de Contenido:** con "🎨 Colorear días" el equipo pinta los días del calendario; tocar un día con el mismo color se lo quita.
* Todo se guarda en la nube, en el documento del mes de cada cliente (`resultados/<cliente>__<AAAA-MM>`, campos `planeacion` y `calendarioColores`).

---

## 💳 Pestaña Pagos

Última pestaña del portal. Muestra en qué periodo de pago va cada cliente.

* **Cliente (estado de cuenta):** tarjeta "Tu próximo pago" (mes, monto, fecha límite y días que faltan) o aviso de pago vencido, con el botón "Enviar comprobante" (WhatsApp a APEX) y los datos para pagar. A un lado, el avance del contrato ("Vas en el mes 2 de 6") con un segmento por mes. Debajo, los totales (pagado, por pagar ahora, por venir) y la lista de meses con su estado, con filtros Todos, Pagados y Por pagar.
* **Equipo:**
  * "Cobranza del mes" de todos los clientes, con flechas para cambiar de mes, el porcentaje cobrado y tres columnas: Vencidos, Por cobrar y Pagados. Cada tarjeta tiene "Registrar pago" (o "Deshacer") y "Recordar por WhatsApp". Al tocar el nombre se abre el estado de cuenta de ese cliente.
  * Debajo, el estado de cuenta del cliente elegido, tal como lo ve él, con "Registrar pago", la fecha de pago editable y "Deshacer".
  * "Editar plan" para configurar a cada cliente: concepto, monto de cada mes, día límite de pago, primer mes, duración en meses (vacío = sin fecha de término) y datos para pagar.
* **Estados:** Pagado, Por pagar (el siguiente pago), Vencido (pasó la fecha límite sin pago) y Por venir. Se calculan solos con la fecha del día; siempre llevan texto e icono, no solo color.
* **Registro de pagos (tabla manual):** al final de la pestaña. Empieza con 5 columnas — Fecha de cobro, Fecha de pago, Concepto, Monto y Estado — y 5 filas vacías. El equipo escribe directo en las celdas (se guarda solo), renombra las columnas, agrega columnas (hasta 10), agrega filas de 1, 3, 5 o 10 a la vez, inserta una fila debajo de otra (＋) o la elimina (✕). El cliente la ve en solo lectura, y solo cuando ya tiene algo escrito.
* **Dónde se guarda:** en la nube, en `resultados/<cliente>__pagos`, campo `cobranza` (`{ concepto, monto, diaPago, inicio: 'AAAA-MM', meses, datosPago, periodos: { 'AAAA-MM': { pagado: 'AAAA-MM-DD' } } }`) y campo `pagos` (el registro de pagos, con `columnas` y `filas`).

---

## 📁 Estructura del Proyecto

```
d:\ITM\Página web\
│
├── index.html       # Página Web Pública (Showcase de autoridad + Portal integrado)
├── app.html         # Portal de Trabajo en Pantalla Completa (Acceso directo)
├── styles.css       # Sistema de Diseño Dark Luxury (Tipografías, Glassmorphism y Componentes)
├── reportes.js      # Métricas por plataforma de cada cliente y mes
├── app.js           # Motor del portal y conexión con la nube (datos y PIN viven en Firebase)
└── README.md        # Documentación y Guía de Uso
```

---

## 🎨 Kit de Marca Provisional (Apex Creativo)

* **Paleta Principal:**
  * Dark Obsidian: `#0a0e14`
  * Surface Slate: `#121822` & `#1a2230`
  * Apex Coral / Naranja Fuego: `#ff4d28` (Acento primario, Reels y CTAs)
  * Esmeralda Éxito: `#10b981` (Publicado y métricas positivas)
  * Púrpura Creativo: `#8b5cf6` (Carruseles y estrategia)
  * Azul Cobalto: `#3b82f6` (Posts y ciencia B2B)
* **Tipografías:** *Plus Jakarta Sans* (Display), *Inter* (Lectura) y *JetBrains Mono* (Cronómetros y datos).
