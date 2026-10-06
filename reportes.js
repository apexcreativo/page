/* ==========================================================================
   APEX CREATIVO · REPORTES DE RESULTADOS POR PLATAFORMA
   --------------------------------------------------------------------------
   Aquí se capturan, a mano, las métricas de cada cliente por mes.
   El portal (pestaña "Resumen de Resultados") las muestra en 4 bloques:
   Instagram, Facebook, TikTok y Google, con la comparación contra el mes
   anterior, el Top 5 de contenidos y las reseñas destacadas.

   CÓMO AGREGAR EL REPORTE DE OTRO CLIENTE O DE OTRO MES
   1. Copia el bloque completo de El Faro ('2026-09': { ... }).
   2. Pégalo dentro de REPORTES_PLATAFORMAS con el slug del cliente
      (tasca, palato, elfaro, canirac, galerenas, blucare, hidrogeo)
      y el mes en formato 'AAAA-MM'. Ejemplo:  palato: { '2026-10': { ... } }
   3. Cambia los valores:
      - actual   = valor del mes del reporte
      - anterior = valor del mes anterior
      Escribe los números SIN comas (21052). El portal calcula solo la
      diferencia, el porcentaje y la flecha de subida o bajada.
      Si la red solo da un valor redondeado, escríbelo como texto: '10 mil'.
      En ese caso puedes poner a mano 'diferencia' y 'variacion' (ej. '+282%').
      null = el portal muestra "Por completar".
      'comparadoCon' es el texto que aparece en la comparación ("vs agosto").
      'sinComparacion: true' muestra solo el valor del mes, sin la línea "vs mes anterior".
   4. Principal contenido (Top 3): pega en 'link' el link del video
      (Instagram, Facebook, TikTok o YouTube). La portada se toma del link
      y al darle clic se abre el video. 'portada' es una imagen opcional
      que solo se usa si no hay link.
   Además, el perfil APEX CEO1 puede editar todo el reporte desde el portal
   (botón "✏️ Editar reporte"); lo que guarda ahí tiene prioridad sobre este archivo.
   ========================================================================== */

'use strict';

// Estructura vacía de un reporte (sirve de base para cualquier cliente)
function plantillaReporte() {
  const top = () => [1, 2, 3].map(() => ({ link: null, portada: null, titulo: null, valor: null, detalle: null }));
  return {
    instagram: {
      periodo: null,
      periodoAnterior: null,
      metricas: [
        { nombre: 'Visualizaciones totales', actual: null, anterior: null, sub: [
          { nombre: '% de seguidores', tipo: 'porcentaje', actual: null, anterior: null, sinComparacion: true },
          { nombre: '% de no seguidores', tipo: 'porcentaje', actual: null, anterior: null, sinComparacion: true }
        ] },
        { nombre: 'Cuentas alcanzadas', actual: null, anterior: null },
        { nombre: 'Interacciones', actual: null, anterior: null, sub: [
          { nombre: 'Seguidores', actual: null, anterior: null },
          { nombre: 'No seguidores', actual: null, anterior: null }
        ] },
        { nombre: 'Tasa de interacción', tipo: 'porcentaje', actual: null, anterior: null },
        { nombre: 'Publicaciones en total', actual: null, anterior: null, sub: [
          { nombre: 'Publicaciones en el perfil', actual: null, anterior: null },
          { nombre: 'Historias', actual: null, anterior: null }
        ] },
        { nombre: 'Actividad en el perfil', tipo: 'grupo', sub: [
          { nombre: 'Visitas al perfil', actual: null, anterior: null },
          { nombre: 'Toques en el enlace externo', actual: null, anterior: null }
        ] },
        { nombre: 'Total de seguidores', actual: null, anterior: null }
      ],
      top: { criterio: 'Visualizaciones', items: top() }
    },
    facebook: {
      periodo: null,
      periodoAnterior: null,
      metricas: [
        { nombre: 'Visualizaciones', actual: null, anterior: null },
        { nombre: 'Interacciones', actual: null, anterior: null },
        { nombre: 'Total de seguidores', actual: null, anterior: null },
        { nombre: 'Publicaciones en total', actual: null, anterior: null, sub: [
          { nombre: 'Publicaciones en el perfil', actual: null, anterior: null },
          { nombre: 'Historias', actual: null, anterior: null }
        ] }
      ],
      top: { criterio: 'Visualizaciones', items: top() }
    },
    tiktok: {
      periodo: null,
      periodoAnterior: null,
      metricas: [
        { nombre: 'Visualizaciones', actual: null, anterior: null },
        { nombre: 'Me gusta', actual: null, anterior: null },
        { nombre: 'Nuevos seguidores', actual: null, anterior: null },
        { nombre: 'Interacciones', tipo: 'grupo', sub: [
          { nombre: 'Comentarios', actual: null, anterior: null },
          { nombre: 'Compartidos', actual: null, anterior: null }
        ] }
      ],
      top: { criterio: 'Visualizaciones', items: top() }
    },
    google: {
      periodo: null,
      periodoAnterior: null,
      metricas: [
        { nombre: 'Total de reseñas', actual: null, anterior: null },
        { nombre: 'Calificación actual', tipo: 'calificacion', actual: null, anterior: null },
        { nombre: 'Reseñas nuevas en el mes', actual: null, anterior: null }
      ],
      resenas: {
        positiva: { autor: null, calificacion: null, fecha: null, texto: null },
        negativa: { autor: null, calificacion: null, fecha: null, texto: null }
      }
    }
  };
}

const REPORTES_PLATAFORMAS = {

  // ------------------------------------------------------------------------
  // EL FARO · SEPTIEMBRE 2026 (ejemplo completo, datos de las capturas de
  // estadísticas de cada red guardadas en resultados/elfaro-2026-09/)
  // ------------------------------------------------------------------------
  elfaro: {
    '2026-09': {
      instagram: {
        periodo: '5 sep – 4 oct 2026 (últimos 30 días)',
        periodoAnterior: '1 – 31 ago 2026',
        comparadoCon: 'agosto',
        metricas: [
          { nombre: 'Visualizaciones totales', actual: 21052, anterior: 5343, sub: [
            { nombre: '% de seguidores', tipo: 'porcentaje', actual: 70.3, anterior: 55.9, sinComparacion: true },
            { nombre: '% de no seguidores', tipo: 'porcentaje', actual: 29.7, anterior: 44.1, sinComparacion: true }
          ] },
          { nombre: 'Cuentas alcanzadas', actual: 3381, anterior: 1288 },
          { nombre: 'Interacciones', actual: 465, anterior: 115, sub: [
            { nombre: 'Seguidores', actual: null, anterior: null },
            { nombre: 'No seguidores', actual: null, anterior: null }
          ] },
          { nombre: 'Tasa de interacción', tipo: 'porcentaje', actual: 13.75, anterior: 8.93,
            nota: 'Interacciones ÷ cuentas alcanzadas.' },
          { nombre: 'Publicaciones en total', actual: 41, anterior: null, sub: [
            { nombre: 'Publicaciones en el perfil', actual: null, anterior: null },
            { nombre: 'Historias', actual: null, anterior: null }
          ] },
          { nombre: 'Actividad en el perfil', tipo: 'grupo', sub: [
            { nombre: 'Visitas al perfil', actual: 326, anterior: 229 },
            { nombre: 'Toques en el enlace externo', actual: 17, anterior: 8 }
          ] },
          { nombre: 'Total de seguidores', actual: 3200, anterior: 3212, sub: [
            { nombre: 'Nuevos seguidores', actual: 39, anterior: null },
            { nombre: 'Seguidores netos', actual: -12, anterior: -22 }
          ], nota: 'El valor anterior es al 4 de septiembre (3,200 − (−12)).' }
        ],
        top: {
          criterio: 'Visualizaciones',
          items: [
            { link: null, portada: 'resultados/elfaro-2026-09/portadas/ig-1.jpg', titulo: 'Una michelada siempre e…', valor: '1.7 mil visualizaciones', detalle: '21 me gusta · 4 reposts · 2 envíos' },
            { link: null, portada: 'resultados/elfaro-2026-09/portadas/ig-2.jpg', titulo: '¡Este viernes nos vemos en…', valor: '1.6 mil visualizaciones', detalle: '35 me gusta · 4 reposts · 2 envíos' },
            { link: null, portada: 'resultados/elfaro-2026-09/portadas/ig-3.jpg', titulo: 'Porque un buen plan sie…', valor: '1.3 mil visualizaciones', detalle: '23 me gusta · 2 comentarios · 6 envíos' }
          ]
        }
      },

      facebook: {
        periodo: 'Últimos 28 días (al 4 oct 2026)',
        periodoAnterior: '28 días anteriores',
        comparadoCon: '28 días previos',
        metricas: [
          { nombre: 'Visualizaciones', actual: '10 mil', anterior: null, variacion: '+282%',
            nota: 'Espectadores: 4.4 mil.' },
          { nombre: 'Interacciones', actual: 531, anterior: null, variacion: '+2 mil%', sub: [
            { nombre: 'Reacciones', actual: 175, anterior: null },
            { nombre: 'Veces que se compartió', actual: 29, anterior: null },
            { nombre: 'Comentarios y respuestas', actual: 4, anterior: null }
          ] },
          { nombre: 'Total de seguidores', actual: null, anterior: null,
            nota: 'Público nuevo en el periodo: 10 (+25% según Facebook).' },
          { nombre: 'Publicaciones en total', actual: null, anterior: null, sub: [
            { nombre: 'Publicaciones en el perfil', actual: null, anterior: null },
            { nombre: 'Historias', actual: null, anterior: null }
          ] }
        ],
        top: {
          criterio: 'Visualizaciones',
          items: [
            { link: null, portada: 'resultados/elfaro-2026-09/portadas/fb-1.jpg', titulo: '¡Este viernes nos vemos en nuestra n…', valor: '1,722 visualizaciones', detalle: 'Foto' },
            { link: null, portada: 'resultados/elfaro-2026-09/portadas/fb-2.jpg', titulo: 'Seguimos en septiembre y, por su…', valor: '1,313 visualizaciones', detalle: 'Reel' },
            { link: null, portada: null, titulo: null, valor: null, detalle: null }
          ]
        }
      },

      tiktok: {
        periodo: '1 – 30 sep 2026',
        periodoAnterior: 'Agosto 2026 (periodo anterior que compara TikTok)',
        comparadoCon: 'periodo anterior',
        metricas: [
          { nombre: 'Visualizaciones', actual: '7.9 mil', anterior: '9.8 mil', diferencia: '−1.9 mil', variacion: '−19.2%' },
          { nombre: 'Me gusta', actual: 144, anterior: 109 },
          { nombre: 'Nuevos seguidores', actual: null, anterior: null },
          { nombre: 'Interacciones', tipo: 'grupo', sub: [
            { nombre: 'Comentarios', actual: 2, anterior: 4 },
            { nombre: 'Compartidos', actual: 16, anterior: 36 }
          ] },
          { nombre: 'Visualizaciones del perfil', actual: 82, anterior: 156 }
        ],
        top: {
          criterio: 'Visualizaciones',
          nota: 'TikTok muestra este ranking con los últimos 7 días (captura del 4 oct).',
          items: [
            { link: null, portada: 'resultados/elfaro-2026-09/portadas/tt-1.jpg', titulo: '¿Tú también eres de los que dicen: "un caldito y se me pasa…', valor: '566 visualizaciones', detalle: '11 me gusta' },
            { link: null, portada: 'resultados/elfaro-2026-09/portadas/tt-2.jpg', titulo: '¡Este viernes nos vemos en nuestra nueva sucursal!', valor: '281 visualizaciones', detalle: '4 me gusta' },
            { link: null, portada: 'resultados/elfaro-2026-09/portadas/tt-3.jpg', titulo: '¿Ya probaste nuestro Molcajete Mar y Tierra?', valor: '234 visualizaciones', detalle: '3 me gusta' }
          ]
        }
      },

      google: {
        periodo: 'Septiembre 2026',
        periodoAnterior: 'Agosto 2026',
        metricas: [
          { nombre: 'Total de reseñas', actual: null, anterior: null },
          { nombre: 'Calificación actual', tipo: 'calificacion', actual: null, anterior: null },
          { nombre: 'Reseñas nuevas en el mes', actual: null, anterior: null }
        ],
        resenas: {
          positiva: { autor: null, calificacion: null, fecha: null, texto: null },
          negativa: { autor: null, calificacion: null, fecha: null, texto: null }
        }
      }
    }
  }

};
