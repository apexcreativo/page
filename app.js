/* ==========================================================================
   APEX CREATIVO · MOTOR OPERATIVO & GESTOR DE DATOS
   Plataforma de Agencia Multicliente con Autenticación por PIN
   Soporta GitHub Pages (100% Client-Side con persistencia LocalStorage)
   ========================================================================== */

'use strict';

const STORAGE_KEY = 'apex_creativo_db_v2';
// PINs oficiales de cada cliente (se aplican siempre al cargar, aunque haya datos guardados)
const CLIENT_PINS = { tasca: '1010', palato: '0030', elfaro: '0020', canirac: '1001', galerenas: '2000', blucare: '0001', hidrogeo: '0002' };

// Miembros de equipo y sus PINs específicos
const TEAM_MEMBERS = [
  { id: 'ale', nombre: 'Alejandra', rol: 'Dirección General & Estrategia', pin: '0007' },
  { id: 'pablo', nombre: 'Pablo', rol: 'Dirección Operativa & Modelos', pin: '0028' },
  { id: 'mitzi', nombre: 'Mitzi', rol: 'Levantamiento, Edición y Foto/Video', pin: '3197' },
  { id: 'extra', nombre: 'Colaborador adicional', rol: 'Producción & Apoyo', pin: '0000' }
];

// ==========================================================================
// REPORTE OFICIAL · EL FARO · SEPTIEMBRE 2026
// Fuente única: capturas de Instagram, Facebook y TikTok (carpeta resultados/elfaro-2026-09).
// Las variaciones marcadas "(calc.)" se calcularon a partir de esas mismas cifras.
// ==========================================================================
const REPORTE_ELFARO_2026_09 = {
  reporteVersion: 1,
  resumen: 'Primer mes de gestión de Apex (publicación desde el 14 de septiembre). En Instagram, del 5 sep al 4 oct, las visualizaciones pasaron de 5,343 a 21,052 (+294.0% vs agosto) y las interacciones de 115 a 465 (+304.3%). Facebook reporta 10 mil visualizaciones (+282%) en los últimos 28 días. TikTok bajó en visualizaciones (7.9K, −19.2%) aunque subió en me gusta (+32.1%). La cuenta de Instagram todavía pierde más seguidores de los que gana (neto −12), pero la pérdida fue menor que en agosto (−22).',
  tileFijo: { nombre: 'Publicaciones en Instagram', valor: '41', comparativo: 'Contenido compartido · 5 sep – 4 oct' },
  kpis: [
    { nombre: 'Visualizaciones · Instagram', valor: '21,052', comparativo: '+294.0% vs agosto (5,343)', positivo: true },
    { nombre: 'Cuentas alcanzadas · Instagram', valor: '3,381', comparativo: '+162.5% vs agosto (1,288)', positivo: true },
    { nombre: 'Interacciones · Instagram', valor: '465', comparativo: '+304.3% vs agosto (115)', positivo: true },
    { nombre: 'Tasa de interacción · Instagram', valor: '13.75%', comparativo: 'Agosto: 8.93% · +4.82 pts', positivo: true },
    { nombre: 'Visitas al perfil · Instagram', valor: '326', comparativo: '+42.4% vs agosto (229)', positivo: true },
    { nombre: 'Toques en enlace · Instagram', valor: '17', comparativo: '+112.5% vs agosto (8)', positivo: true },
    { nombre: 'Visualizaciones · Facebook', valor: '10 mil', comparativo: '+282% vs 28 días previos', positivo: true },
    { nombre: 'Interacciones · Facebook', valor: '531', comparativo: '+2 mil% vs 28 días previos', positivo: true },
    { nombre: 'Visualizaciones · TikTok', valor: '7.9K', comparativo: '−1.9K (−19.2%) vs periodo anterior', positivo: false },
    { nombre: 'Me gusta · TikTok', valor: '144', comparativo: '+35 (+32.1%) vs periodo anterior', positivo: true }
  ],
  imagenes: [
    'resultados/elfaro-2026-09/ig-01-panel-sep.png',
    'resultados/elfaro-2026-09/ig-02-resumen-sep.png',
    'resultados/elfaro-2026-09/ig-03-formatos-sep.png',
    'resultados/elfaro-2026-09/ig-04-interacciones-perfil-sep.png',
    'resultados/elfaro-2026-09/ig-05-contenido-megusta-sep.png',
    'resultados/elfaro-2026-09/ig-06-contenido-vistas-sep.png',
    'resultados/elfaro-2026-09/ig-07-seguidores-sep.png',
    'resultados/elfaro-2026-09/ig-08-resumen-ago.png',
    'resultados/elfaro-2026-09/ig-09-formatos-ago.png',
    'resultados/elfaro-2026-09/ig-10-interacciones-perfil-ago.png',
    'resultados/elfaro-2026-09/fb-01-visualizaciones.png',
    'resultados/elfaro-2026-09/fb-02-interaccion.png',
    'resultados/elfaro-2026-09/fb-03-publico.png',
    'resultados/elfaro-2026-09/fb-04-que-funciona.png',
    'resultados/elfaro-2026-09/tt-01-resumen-sep.png',
    'resultados/elfaro-2026-09/tt-02-top-vistas.png',
    'resultados/elfaro-2026-09/tt-03-top-megusta.png'
  ],
  detalle: {
    avisoPeriodos: 'Cada red mide un periodo distinto y así se presenta. Instagram: 5 sep – 4 oct 2026 contra 1 – 31 ago 2026. Facebook: últimos 28 días (7 sep – 4 oct) contra los 28 días previos, según Meta. TikTok: 1 – 30 sep contra el periodo anterior, según TikTok. La publicación de contenido por Apex inició el 14 de septiembre, así que septiembre solo tuvo 17 días de gestión.',
    kpiDefiniciones: [
      { kpi: 'Visualizaciones', formula: 'Veces que se mostró el contenido (dato de cada red)', actual: 'IG 21,052 · FB 10 mil · TT 7.9K', base: 'IG ago 5,343' },
      { kpi: 'Cuentas alcanzadas', formula: 'Cuentas únicas que vieron contenido ("Espectadores")', actual: 'IG 3,381 · FB 4,4 mil', base: 'IG ago 1,288' },
      { kpi: 'Interacciones', formula: 'Me gusta + comentarios + compartidos + guardados, etc. (dato de cada red)', actual: 'IG 465 · FB 531', base: 'IG ago 115' },
      { kpi: 'Tasa de interacción', formula: 'Interacciones ÷ cuentas alcanzadas × 100', actual: 'IG 13.75% · FB ≈12.1%*', base: 'IG ago 8.93%' },
      { kpi: 'Frecuencia', formula: 'Visualizaciones ÷ cuentas alcanzadas', actual: 'IG 6.2 · FB ≈2.3*', base: 'IG ago 4.1' },
      { kpi: 'Alcance fuera de la comunidad', formula: 'Visualizaciones × % de no seguidores', actual: 'IG ≈6,252 (29.7%)', base: 'IG ago ≈2,356 (44.1%)' },
      { kpi: 'Crecimiento de seguidores', formula: 'Seguidores nuevos y saldo neto del periodo', actual: 'IG +39 nuevos · neto −12 · total 3,200', base: 'IG ago neto −22' },
      { kpi: 'Intención de visita', formula: 'Visitas al perfil + toques en enlace + toques en dirección', actual: 'IG 326 · 17 · 0 | TT perfil 82', base: 'IG ago 229 · 8 · 0' }
    ],
    notaKpi: '* Facebook muestra visualizaciones (10 mil) y espectadores (4,4 mil) redondeados, por eso su tasa y frecuencia son aproximadas.',
    redes: [
      {
        red: 'Instagram',
        clase: 'ig',
        periodo: '5 sep – 4 oct 2026 vs 1 – 31 ago 2026',
        filas: [
          { m: 'Visualizaciones', a: '21,052', b: '5,343', v: '+294.0%', t: 'up' },
          { m: 'Cuentas alcanzadas (espectadores)', a: '3,381', b: '1,288', v: '+162.5%', t: 'up' },
          { m: 'Interacciones', a: '465', b: '115', v: '+304.3%', t: 'up' },
          { m: 'Tasa de interacción (calc.)', a: '13.75%', b: '8.93%', v: '+4.82 pts', t: 'up' },
          { m: 'Vistas de seguidores / no seguidores', a: '70.3% / 29.7%', b: '55.9% / 44.1%', v: 'Más peso en seguidores', t: 'flat' },
          { m: 'Vistas en publicaciones', a: '9 mil', b: '545', v: '≈ +1,551%', t: 'up' },
          { m: 'Vistas en reels', a: '7,2 mil', b: '2,6 mil', v: '≈ +177%', t: 'up' },
          { m: 'Vistas en historias', a: '4,8 mil', b: '2,2 mil', v: '≈ +118%', t: 'up' },
          { m: 'Interacciones en publicaciones', a: '228', b: '3', v: '+225', t: 'up' },
          { m: 'Interacciones en reels', a: '166', b: '69', v: '+140.6%', t: 'up' },
          { m: 'Interacciones en historias', a: '71', b: '43', v: '+65.1%', t: 'up' },
          { m: 'Visitas al perfil', a: '326', b: '229', v: '+42.4%', t: 'up' },
          { m: 'Toques en el enlace', a: '17', b: '8', v: '+112.5%', t: 'up' },
          { m: 'Toques en la dirección del negocio', a: '0', b: '0', v: 'Sin cambio', t: 'flat' },
          { m: 'Seguidores netos', a: '−12', b: '−22', v: '10 bajas menos', t: 'up' },
          { m: 'Nuevos seguidores', a: '39', b: 'Sin dato', v: '—', t: 'flat' },
          { m: 'Seguidores totales', a: '3,200', b: 'Sin dato', v: '−0.4% desde el 4 sep', t: 'down' },
          { m: 'Contenido compartido', a: '41', b: 'Sin dato', v: '—', t: 'flat' }
        ],
        topTitulo: 'Contenido con más visualizaciones (5 sep – 4 oct)',
        top: [
          { t: 'Una michelada siempre e…', d: '1,7 mil vistas · 21 me gusta · 0 comentarios · 4 reposts · 2 compartidos' },
          { t: '¡Este viernes nos vemos en…', d: '1,6 mil vistas · 35 me gusta (la más gustada) · 4 reposts · 2 compartidos' },
          { t: 'Porque un buen plan sie…', d: '1,3 mil vistas · 23 me gusta · 2 comentarios · 3 reposts · 6 compartidos' },
          { t: '¿Se te antojó una michelad…', d: '1,1 mil vistas · 18 me gusta · 4 reposts' },
          { t: '¿Tú también eres de los qu…', d: '1,0 mil vistas · 22 me gusta · 1 repost · 3 compartidos' },
          { t: '¡Lo que tanto nos habían…', d: '927 vistas · 20 me gusta · 1 repost · 4 compartidos' },
          { t: 'Hoy se antoja una michel…', d: '848 vistas · 20 me gusta · 2 reposts · 5 compartidos' },
          { t: 'Dicen que son las mejore…', d: '806 vistas · 19 me gusta' }
        ],
        notas: [
          'La gráfica diaria se mantiene casi en cero hasta mediados de septiembre y sube a partir del 13–14 de septiembre: varios días superan 925 visualizaciones y los picos llegan a cerca de 1,8 mil.',
          'Agosto hizo lo contrario: arrancó cerca de 900 visualizaciones diarias y cayó casi a cero en la segunda quincena.',
          'Los tres contenidos que más seguidores trajeron (1 cada uno) fueron el molcajete, la michelada y "Dicen que son las mejores…". Cuatro de los ocho contenidos más vistos hablan de micheladas.'
        ]
      },
      {
        red: 'Facebook',
        clase: 'fb',
        periodo: 'Últimos 28 días (7 sep – 4 oct) vs 28 días previos · variaciones calculadas por Meta',
        filas: [
          { m: 'Visualizaciones', a: '10 mil', b: '—', v: '+282%', t: 'up' },
          { m: 'Interacción', a: '531', b: '—', v: '+2 mil%', t: 'up' },
          { m: 'Público', a: '10', b: '—', v: '+25%', t: 'up' },
          { m: 'Espectadores', a: '4,4 mil', b: '—', v: 'Sin comparativo', t: 'flat' },
          { m: 'Reproducciones de 3 segundos', a: '1,5 mil', b: '—', v: 'Sin comparativo', t: 'flat' },
          { m: 'Reacciones', a: '175', b: '—', v: 'Sin comparativo', t: 'flat' },
          { m: 'Veces que se compartió', a: '29', b: '—', v: 'Sin comparativo', t: 'flat' },
          { m: 'Comentarios y respuestas', a: '4', b: '—', v: 'Sin comparativo', t: 'flat' },
          { m: 'Ingresos', a: '$0', b: '—', v: '—', t: 'flat' }
        ],
        topTitulo: 'Contenido destacado y señales de Meta',
        top: [
          { t: '¡Este viernes nos vemos en nuestra n…', d: '1,722 visualizaciones (foto)' },
          { t: 'Seguimos en septiembre y, por su…', d: '1,313 visualizaciones (video)' },
          { t: 'Mejor formato (últimos 7 días)', d: 'Fotos: +6 mil% frente a otros formatos' },
          { t: 'Mejor duración (últimos 7 días)', d: 'Videos de 10 a 15 segundos: +6 mil% frente a otras duraciones' },
          { t: 'Audiencia de la página', d: '63% mujeres · 37% hombres · 25–34 años 39.3% · 35–44 años 27.5% · 45–54 años 14.9% · otros 18.3%' }
        ],
        notas: [
          'Meta indica que las visualizaciones subieron al publicar más reels (rinden 113% más que otros formatos), que la interacción subió con más fotos (197% más) y que la audiencia creció con reels (329% más).',
          'La gráfica de visualizaciones está casi en cero hasta el 14 de septiembre; después crece, con dos picos cercanos a 1,8 mil y 1,7 mil hacia el final del mes.',
          'El desglose de interacciones visible (reacciones, compartidos y comentarios) suma 208 de las 531; el resto corresponde a tipos que no aparecen en la captura.'
        ]
      },
      {
        red: 'TikTok',
        clase: 'tt',
        periodo: '1 – 30 sep 2026 vs periodo anterior · variaciones calculadas por TikTok',
        filas: [
          { m: 'Visualizaciones de publicaciones', a: '7.9K', b: '≈9.8K (calc.)', v: '−19.2%', t: 'down' },
          { m: 'Visualizaciones de perfil', a: '82', b: '156 (calc.)', v: '−47.4%', t: 'down' },
          { m: 'Me gusta', a: '144', b: '109 (calc.)', v: '+32.1%', t: 'up' },
          { m: 'Comentarios', a: '2', b: '4 (calc.)', v: '−50%', t: 'down' },
          { m: 'Veces compartido', a: '16', b: '36 (calc.)', v: '−55.6%', t: 'down' },
          { m: 'Recompensas estimadas', a: '$0.00', b: '—', v: '+$0.00', t: 'flat' },
          { m: 'Tráfico desde "Para ti"', a: '67.2%', b: '—', v: '—', t: 'flat' },
          { m: 'Tráfico desde búsqueda', a: '26.6%', b: '—', v: '—', t: 'flat' }
        ],
        topTitulo: 'Mejores publicaciones (últimos 7 días)',
        top: [
          { t: '¿Tú también eres de los que dicen: "un caldito y se me pasa…', d: '566 visualizaciones · 11 me gusta' },
          { t: '¡Este viernes nos vemos en nuestra nueva sucursal!', d: '281 visualizaciones · 4 me gusta' },
          { t: '¿Ya probaste nuestro Molcajete Mar y Tierra?', d: '234 visualizaciones · 3 me gusta' },
          { t: 'Si vienes a la Presa de la Olla, hay una parada que no puede f…', d: '190 visualizaciones · publicado el 12 ago' }
        ],
        notas: [
          'El periodo anterior se obtuvo restando la diferencia que muestra TikTok (por ejemplo, 7.9K + 1.9K ≈ 9.8K).',
          'La caída del mes se explica por la primera quincena: en la gráfica diaria, antes de mediados de septiembre ningún día llega a la línea de 293 visualizaciones; después hay varios picos por encima de 586.',
          'Una de cada cuatro visualizaciones (26.6%) llega desde la búsqueda de TikTok.'
        ]
      }
    ],
    conclusion: [
      'Septiembre fue un mes de arranque. Apex empezó a publicar el 14 de septiembre, así que los resultados reflejan 17 días de trabajo dentro del mes, y en Instagram y Facebook el corte llega hasta el 4 de octubre. En las tres gráficas diarias se ve el mismo patrón: actividad casi nula antes del 14 y crecimiento después.',
      'Instagram es donde el cambio se puede medir mejor contra agosto. Las visualizaciones se multiplicaron casi por cuatro (5,343 → 21,052), las cuentas alcanzadas por 2.6 (1,288 → 3,381) y las interacciones por cuatro (115 → 465). La tasa de interacción pasó de 8.93% a 13.75%, lo que dice que el contenido nuevo no solo se vio más, también provocó más respuesta. Las publicaciones fijas pasaron de 545 a 9 mil vistas y de 3 a 228 interacciones.',
      'Facebook acompaña la tendencia según Meta: 10 mil visualizaciones (+282%) y 531 interacciones. El anuncio de la nueva sucursal fue lo más visto en Facebook (1,722) y lo más gustado en Instagram (35 me gusta).',
      'Hay tres puntos a atender. Primero, TikTok bajó en visualizaciones (−19.2%), compartidos (−55.6%) y visitas al perfil (−47.4%), aunque los me gusta subieron 32.1%. Segundo, Instagram sigue con saldo negativo de seguidores (−12, con 39 nuevos), aunque la pérdida fue menor que en agosto (−22). Tercero, nadie tocó la dirección del negocio en Instagram ni en agosto ni en septiembre, y la proporción de visitas al perfil frente a cuentas alcanzadas bajó de 17.8% a 9.6%.',
      'Septiembre queda como línea base para octubre, el primer mes completo de gestión. Los KPI de esta página se van a comparar contra estas mismas cifras.'
    ],
    recomendaciones: [
      'Mantener la línea de micheladas y platillos estrella: cuatro de los ocho contenidos más vistos en Instagram son de micheladas, y el molcajete está entre lo más visto en Instagram y TikTok.',
      'En Facebook, seguir la señal de Meta: fotos para interacción y reels de 10 a 15 segundos para alcance.',
      'En TikTok, escribir textos y descripciones con palabras que la gente busca (platillo, zona, "micheladas"), ya que 26.6% del tráfico viene de la búsqueda.',
      'Agregar en cada publicación un llamado claro a visitar el perfil, el enlace o la ubicación, para mover las visitas al perfil, los toques en enlace y los toques en dirección.'
    ]
  }
};

// Base de datos inicial con clientes reales de México y Colombia
const DEFAULT_DATABASE = {
  version: '2.0',
  updatedAt: new Date().toISOString(),
  
  // Lista de Colaboradores Dinámica
  colaboradores: [
    { id: 'c_ale', nombre: 'Alejandra', rol: 'Dirección Estratégica & Pauta', color: '#ff4d28' },
    { id: 'c_pablo', nombre: 'Pablo', rol: 'Dirección Operativa & Modelos', color: '#3b82f6' },
    { id: 'c_mitzi', nombre: 'Mitzi', rol: 'Levantamiento, Edición y Foto/Video', color: '#8b5cf6' },
    { id: 'c_alexa', nombre: 'Alexa', rol: 'Grabación de video & Actuación', color: '#ec4899' },
    { id: 'c_infl', nombre: 'Influencers / Externos', rol: 'Generación de contenido en alianza', color: '#f59e0b' }
  ],

  // Clientes Reales Actuales con sus PINs exactos
  clientes: [
    {
      slug: 'tasca',
      nombre: 'La Tasca de la Paz',
      sector: 'Gastronomía Tradicional & Eventos',
      pais: 'México',
      pin: '1010',
      avatar: '🥘',
      color: '#f59e0b'
    },
    {
      slug: 'palato',
      nombre: 'Restaurante Palato',
      sector: 'Gastronomía de Autor',
      pais: 'México',
      pin: '0030',
      avatar: '🍽️',
      color: '#ff4d28'
    },
    {
      slug: 'elfaro',
      nombre: 'Restaurante & Micheladas El Faro',
      sector: 'Bares & Vida Nocturna',
      pais: 'México',
      pin: '0020',
      avatar: '🍻',
      color: '#3b82f6'
    },
    {
      slug: 'canirac',
      nombre: 'CANIRAC',
      sector: 'Cámara Restaurantera Institucional',
      pais: 'México',
      pin: '1001',
      avatar: '🏛️',
      color: '#10b981'
    },
    {
      slug: 'galerenas',
      nombre: 'Club Satélite Galereñas',
      sector: 'Impacto Social & Comunidad',
      pais: 'México',
      pin: '2000',
      avatar: '🤝',
      color: '#8b5cf6'
    },
    {
      slug: 'blucare',
      nombre: 'Blucare',
      sector: 'Salud, Belleza & Cuidado Personal',
      pais: 'Colombia',
      pin: '0001',
      avatar: '✨',
      color: '#ec4899'
    },
    {
      slug: 'hidrogeo',
      nombre: 'HidroGeo',
      sector: 'Modelos Matemáticos & Gestión del Agua',
      pais: 'México',
      pin: '0002',
      avatar: '💧',
      color: '#06b6d4'
    }
  ],

  // Producciones / Contenido por Cliente
  producciones: [
    // Club Satélite Galereñas (Datos reales importados del proyecto)
    {
      id: 'p_gal_01',
      clienteSlug: 'galerenas',
      fecha: '2026-09-23',
      formato: 'Reel',
      titulo: 'Episodio 1: ¿Qué estamos haciendo?',
      estado: 'Pendiente',
      actuacion: 'Alexa',
      duracion: '50 seg',
      link: '',
      aprobadoCliente: false,
      comentarioCliente: '',
      guion: [
        { ve: '', dice: 'Para muchos de nosotros, tener agua es tan sencillo como abrir una llave.', como: '', texto: '', seg: '6' },
        { ve: 'Mostrar condiciones de la comunidad y recorrido', dice: 'Pero para esta comunidad, conseguir agua significa tiempo, esfuerzo y recorrer grandes distancias.', como: '', texto: '', seg: '8' },
        { ve: 'Integrantes del Club visitando la comunidad', dice: 'Cuando conocimos su realidad, entendimos que no se trataba solamente de llevar agua. Se trataba de cambiar su día a día.', como: '', texto: '', seg: '9' },
        { ve: 'Tomas de terreno y caminos', dice: 'Así nació este proyecto. Tenemos un reto enorme por delante.', como: '', texto: '', seg: '7' },
        { ve: '', dice: 'Acompáñanos a descubrir cómo vamos a lograrlo.', como: '', texto: 'El camino del agua', seg: '5' }
      ],
      requerimientos: 'Fotografías y videos de las visitas a la comunidad',
      notas: 'Prioridad alta de producción'
    },
    {
      id: 'p_gal_02',
      clienteSlug: 'galerenas',
      fecha: '2026-09-28',
      formato: 'Reel',
      titulo: 'Episodio 2: ¿Cómo elegimos el proyecto?',
      estado: 'Grabado',
      actuacion: 'Alexa',
      duracion: '30 seg',
      link: '',
      aprobadoCliente: true,
      comentarioCliente: '¡Aprobado! Nos encantó el enfoque humano.',
      guion: [
        { ve: 'Recorrido por la zona', dice: 'No elegimos este proyecto al azar.', como: 'Seguro', texto: 'HASTA QUE LLEGUE EL AGUA', seg: '5' },
        { ve: 'Entrevistas cortas', dice: 'Visitamos la comunidad y escuchamos sus necesidades.', como: 'Cálido', texto: '', seg: '8' },
        { ve: 'Plano del lugar', dice: 'Llevar agua potable abre nuevas posibilidades para muchas familias.', como: 'Inspirador', texto: '', seg: '10' }
      ],
      requerimientos: 'Plano del lugar y tomas de apoyo',
      notas: ''
    },
    // Restaurante Palato
    {
      id: 'p_pal_01',
      clienteSlug: 'palato',
      fecha: '2026-09-24',
      formato: 'Reel',
      titulo: 'El Secreto de Nuestro Risotto de Hongos',
      estado: 'Grabado',
      actuacion: 'Chef Palato',
      duracion: '35 seg',
      link: '',
      aprobadoCliente: true,
      comentarioCliente: 'Aprobado para pauta el viernes.',
      guion: [
        { ve: 'Primer plano del fuego y sartén flameando', dice: 'El secreto de un gran risotto no está en la prisa, está en la paciencia.', como: 'Voz en off envolvente', texto: 'ALTA GASTRONOMÍA', seg: '6' },
        { ve: 'Mantequilla y caldo reduciendo', dice: 'Hongos silvestres de temporada, vino blanco y 22 minutos de mimo constante.', como: 'Sensorial', texto: 'Palato · México', seg: '12' },
        { ve: 'Platillo servido en mesa con copa de vino', dice: 'Ven a probar la experiencia esta noche.', como: 'Invitación cálida', texto: 'Reserva por WhatsApp', seg: '7' }
      ],
      requerimientos: 'Luz cálida de cocina y tomas en cámara lenta',
      notas: 'Pautar jueves a sábado en México'
    },
    // Blucare (Colombia)
    {
      id: 'p_blu_01',
      clienteSlug: 'blucare',
      fecha: '2026-09-25',
      formato: 'Carrusel',
      titulo: '5 Mitos del Protector Solar que Dañan tu Piel',
      estado: 'Pendiente',
      actuacion: 'Mitzi (Diseño)',
      duracion: '5 slides',
      link: '',
      aprobadoCliente: false,
      comentarioCliente: '',
      guion: [
        { ve: 'Slide 1: Portada impactante con tipografía bold', dice: 'Mito 1: En días nublados no necesitas bloqueador. FALSO: El 80% de la radiación UV atraviesa las nubes.', como: '', texto: '5 MITOS DEL CUIDADO SOLAR', seg: '' },
        { ve: 'Slide 2: Gráfico de aplicación de 2 dedos', dice: 'Mito 2: Con una sola aplicación en la mañana es suficiente. FALSO: Debe reaplicarse cada 3 a 4 horas.', como: '', texto: 'REAPLICACIÓN CONSTANTE', seg: '' },
        { ve: 'Slide 3: Foto producto Blucare con textura fluida', dice: 'Descubre nuestra fórmula con ácido hialurónico y acabado mate.', como: '', texto: 'Envíos a toda Colombia', seg: '' }
      ],
      requerimientos: 'Paleta rosa pastel y renders oficiales de producto',
      notas: 'Copy enfocado en compra en línea para Colombia'
    },
    // HidroGeo Consultoría
    {
      id: 'p_hid_01',
      clienteSlug: 'hidrogeo',
      fecha: '2026-09-27',
      formato: 'Post',
      titulo: '¿Cómo modelamos el comportamiento de un acuífero subterráneo?',
      estado: 'Pendiente',
      actuacion: 'Alejandra',
      duracion: '1 post',
      link: '',
      aprobadoCliente: false,
      comentarioCliente: '',
      guion: [
        { ve: 'Infografía técnica con mapa piezométrico y datos de simulación', dice: 'La gestión eficiente del agua no se basa en conjeturas: se basa en modelos matemáticos calibrados con geofísica real.', como: 'Corporativo / Científico', texto: 'Modelación Hidrogeológica 3D', seg: '' }
      ],
      requerimientos: 'Exportar gráfico de simulador hidrológico',
      notas: 'Audiencia: Organismos operadores de agua y directores industriales'
    }
  ],

  // Resultados Mensuales por Cliente
  resultados: {
    'elfaro': { '2026-09': JSON.parse(JSON.stringify(REPORTE_ELFARO_2026_09)) },
    'palato': {
      '2026-09': {
        resumen: 'Mes histórico en reservaciones digitales. Los dos Reels gastronómicos superaron los 48,000 views orgánicos en México.',
        kpis: [
          { nombre: 'Alcance Total', valor: '64,200', comparativo: '+28% vs agosto', positivo: true },
          { nombre: 'Interacciones', valor: '5,840', comparativo: '+42% vs agosto', positivo: true },
          { nombre: 'Nuevos Seguidores', valor: '+890', comparativo: '+15%', positivo: true },
          { nombre: 'Clics a Menú / WhatsApp', valor: '1,240', comparativo: '+35%', positivo: true }
        ],
        imagenes: []
      }
    },
    'galerenas': {
      '2026-09': {
        resumen: 'Campaña de difusión del proyecto del agua con excelente tracción en socias y donantes.',
        kpis: [
          { nombre: 'Alcance en México', valor: '18,500', comparativo: '+14%', positivo: true },
          { nombre: 'Compartidos de Video', valor: '410', comparativo: '+85%', positivo: true },
          { nombre: 'Donaciones / Contactos Bazar', valor: '38', comparativo: '+20%', positivo: true }
        ],
        imagenes: []
      }
    }
  }
};

// ==========================================================================
// ESTADO REACTIVO DE LA APLICACIÓN
// ==========================================================================
let db = loadDatabase();

const state = {
  // Autenticación
  authMode: 'client', // 'client' o 'team'
  currentRole: null,  // 'client' o 'team'
  activeClientSlug: 'palato',
  
  // Navegación dentro del portal
  activeTab: 'parrilla', // 'parrilla' | 'produccion' | 'tareas' | 'resultados' | 'ajustes'
  
  // Calendario
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth(),
  selectedDayIso: '',
  
  // Editor de producción
  activeProdId: null,
  prodFilterStatus: '',
  
  // Tablero de tareas
  taskFilterAssignee: 'todos',
  
  // Resultados
  resultsMonth: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
};

// ==========================================================================
// INICIALIZACIÓN & PERSISTENCIA LOCAL
// ==========================================================================
function loadDatabase() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.clientes)) {
        parsed.clientes.forEach(c => { if (CLIENT_PINS[c.slug]) c.pin = CLIENT_PINS[c.slug]; });
        // Reporte oficial El Faro sep-2026: se instala o actualiza si la copia guardada es anterior
        if (!parsed.resultados) parsed.resultados = {};
        if (!parsed.resultados.elfaro) parsed.resultados.elfaro = {};
        const prevFaro = parsed.resultados.elfaro['2026-09'];
        if (!prevFaro || (prevFaro.reporteVersion || 0) < REPORTE_ELFARO_2026_09.reporteVersion) {
          parsed.resultados.elfaro['2026-09'] = JSON.parse(JSON.stringify(REPORTE_ELFARO_2026_09));
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed)); } catch (e) {}
        }
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error leyendo base de datos local:', err);
  }
  saveDatabase(DEFAULT_DATABASE);
  return JSON.parse(JSON.stringify(DEFAULT_DATABASE));
}

function saveDatabase(customData) {
  try {
    const dataToSave = customData || db;
    dataToSave.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    return true;
  } catch (err) {
    console.error('Error guardando en localStorage:', err);
    return false;
  }
}

// ==========================================================================
// MÉTODOS DE AUTENTICACIÓN
// ==========================================================================
function verifyClientPin(slug, pin) {
  const client = db.clientes.find(c => c.slug === slug);
  if (!client) return false;
  return client.pin === pin.trim();
}

function verifyTeamPin(memberId, pin) {
  const member = TEAM_MEMBERS.find(m => m.id === memberId);
  if (!member) return false;
  return member.pin === pin.trim();
}

function loginAsClient(slug, pin) {
  if (verifyClientPin(slug, pin)) {
    state.currentRole = 'client';
    state.activeClientSlug = slug;
    state.activeTab = 'parrilla';
    openPortalWorkspace();
    return { success: true };
  }
  return { success: false, message: 'PIN incorrecto para este cliente.' };
}

function loginAsTeam(memberId, pin) {
  if (verifyTeamPin(memberId, pin)) {
    const member = TEAM_MEMBERS.find(m => m.id === memberId);
    state.currentRole = 'team';
    state.currentTeamMember = member;
    state.activeTab = 'parrilla';
    openPortalWorkspace();
    return { success: true };
  }
  return { success: false, message: 'PIN incorrecto para el colaborador seleccionado.' };
}

function logout() {
  state.currentRole = null;
  state.activeClientSlug = db.clientes[0] ? db.clientes[0].slug : 'palato';
  closePortalWorkspace();
}

// ==========================================================================
// APERTURA Y CIERRE DEL WORKSPACE MODAL
// ==========================================================================
function openPortalModal() {
  const overlay = document.getElementById('portalOverlay');
  if (overlay) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Si ya está autenticado, muestra el workspace; si no, la pantalla de PIN
    if (state.currentRole) {
      document.getElementById('portalAuthScreen').hidden = true;
      document.getElementById('portalWorkspaceBody').hidden = false;
      renderPortalWorkspace();
    } else {
      document.getElementById('portalAuthScreen').hidden = false;
      document.getElementById('portalWorkspaceBody').hidden = true;
      renderAuthSelectOptions();
    }
  }
}

function closePortalModal() {
  const overlay = document.getElementById('portalOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function openPortalWorkspace() {
  document.getElementById('portalAuthScreen').hidden = true;
  document.getElementById('portalWorkspaceBody').hidden = false;
  renderPortalWorkspace();
}

function closePortalWorkspace() {
  document.getElementById('portalAuthScreen').hidden = false;
  document.getElementById('portalWorkspaceBody').hidden = true;
  renderAuthSelectOptions();
}

// ==========================================================================
// RENDERIZADO DEL PORTAL WORKSPACE
// ==========================================================================
function renderPortalWorkspace() {
  const activeClient = db.clientes.find(c => c.slug === state.activeClientSlug) || db.clientes[0];
  
  // 1. Renderizar Barra Superior del Portal
  const roleBadge = document.getElementById('portalRoleBadge');
  if (roleBadge) {
    if (state.currentRole === 'team') {
      roleBadge.textContent = `Modo Equipo: ${state.currentTeamMember ? state.currentTeamMember.nombre : 'Apex'}`;
      roleBadge.style.background = 'rgba(192, 132, 252, 0.2)';
      roleBadge.style.color = '#e9d5ff';
    } else {
      roleBadge.textContent = `Portal Cliente: ${activeClient.nombre}`;
      roleBadge.style.background = 'rgba(16, 185, 129, 0.2)';
      roleBadge.style.color = '#34d399';
    }
  }

  // 2. Selector de Cliente (Solo visible si es Team/Agencia)
  const clientSwitcherWrap = document.getElementById('clientSwitcherWrap');
  if (clientSwitcherWrap) {
    clientSwitcherWrap.hidden = state.currentRole !== 'team';
    if (state.currentRole === 'team') {
      const select = document.getElementById('clientSwitcherSelect');
      if (select) {
        select.innerHTML = db.clientes.map(c => 
          `<option value="${c.slug}" ${c.slug === state.activeClientSlug ? 'selected' : ''}>${c.avatar} ${c.nombre} (${c.pais})</option>`
        ).join('') + `<option value="__NEW__">+ Agregar Nuevo Cliente...</option>`;
      }
    }
  }

  // 3. Encabezado de Cliente Activo
  const clientAvatarEl = document.getElementById('currentClientAvatar');
  const clientNameEl = document.getElementById('currentClientName');
  const clientSectorEl = document.getElementById('currentClientSector');
  if (clientAvatarEl) clientAvatarEl.textContent = activeClient.avatar;
  if (clientNameEl) clientNameEl.textContent = activeClient.nombre;
  if (clientSectorEl) clientSectorEl.textContent = `${activeClient.sector} · ${activeClient.pais}`;

  // 4. Pestañas visibles según rol
  const tabTareas = document.getElementById('tabBtnTareas');
  const tabAjustes = document.getElementById('tabBtnAjustes');
  if (tabTareas) tabTareas.hidden = state.currentRole !== 'team';
  if (tabAjustes) tabAjustes.hidden = state.currentRole !== 'team';

  // Si el cliente estaba en una pestaña de equipo, mandarlo a la parrilla
  if (state.currentRole === 'client' && (state.activeTab === 'tareas' || state.activeTab === 'ajustes')) {
    state.activeTab = 'parrilla';
  }

  // Activar botón de pestaña actual
  document.querySelectorAll('.portal-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === state.activeTab);
  });

  // Ocultar todos los paneles y mostrar el activo
  ['parrilla', 'produccion', 'tareas', 'resultados', 'ajustes'].forEach(tabName => {
    const el = document.getElementById(`viewTab_${tabName}`);
    if (el) el.hidden = state.activeTab !== tabName;
  });

  // Renderizar contenido de la pestaña activa
  if (state.activeTab === 'parrilla') renderParrilla();
  if (state.activeTab === 'produccion') renderProduccion();
  if (state.activeTab === 'tareas') renderTareas();
  if (state.activeTab === 'resultados') renderResultados();
  if (state.activeTab === 'ajustes') renderAjustes();
}

// ==========================================================================
// 1. MÓDULO PARRILLA DE CONTENIDO
// ==========================================================================
const MESES_NOMBRES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DIAS_NOMBRES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function renderParrilla() {
  const y = state.calYear;
  const m = state.calMonth;
  const calTitle = document.getElementById('calMonthDisplay');
  if (calTitle) calTitle.textContent = `${MESES_NOMBRES[m]} ${y}`;

  const primero = new Date(y, m, 1);
  const inicioSemana = (primero.getDay() + 6) % 7; // Lunes = 0
  const diasEnMes = new Date(y, m + 1, 0).getDate();
  const hoyIso = new Date().toISOString().slice(0, 10);

  // Obtener piezas para el cliente activo en este mes
  const piezasCliente = db.producciones.filter(p => {
    const matchClient = p.clienteSlug === state.activeClientSlug;
    const matchMes = p.fecha && p.fecha.startsWith(`${y}-${String(m + 1).padStart(2, '0')}`);
    return matchClient && matchMes;
  });

  let gridHtml = '';
  // Celdas vacías al inicio
  for (let i = 0; i < inicioSemana; i++) {
    gridHtml += '<div class="cal-cell empty-cell"></div>';
  }

  // Celdas de días
  for (let d = 1; d <= diasEnMes; d++) {
    const fechaIso = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const piezasDia = piezasCliente.filter(p => p.fecha === fechaIso);
    const isToday = fechaIso === hoyIso;
    const isSelected = fechaIso === state.selectedDayIso;

    gridHtml += `
      <div class="cal-cell ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}" data-day="${fechaIso}" onclick="selectDay('${fechaIso}')">
        <div class="cell-top">
          <span class="cell-dnum">${d}</span>
          ${piezasDia.length ? `<span class="mono" style="font-size:10px;color:var(--text-dim);">${piezasDia.length}</span>` : ''}
        </div>
        ${piezasDia.map(p => {
          let formatColor = 'var(--color-reel)';
          if (p.formato === 'Carrusel') formatColor = 'var(--color-carrusel)';
          if (p.formato === 'Post') formatColor = 'var(--color-post)';
          return `
            <div class="content-chip" style="--chip-color:${formatColor}" onclick="event.stopPropagation(); openProdFromCal('${p.id}')">
              <span class="chip-format">${p.formato} · ${p.estado}</span>
              <span class="chip-title">${escapeHtml(p.titulo || 'Sin título')}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // Celdas vacías al final
  const resto = (inicioSemana + diasEnMes) % 7;
  if (resto > 0) {
    for (let k = resto; k < 7; k++) {
      gridHtml += '<div class="cal-cell empty-cell"></div>';
    }
  }

  const calBody = document.getElementById('calGridBody');
  if (calBody) calBody.innerHTML = gridHtml;

  // Resumen del mes
  const countTotal = piezasCliente.length;
  const countPub = piezasCliente.filter(p => p.estado === 'Publicado').length;
  const countGrab = piezasCliente.filter(p => p.estado === 'Grabado').length;
  const calSummaryEl = document.getElementById('calSummaryDisplay');
  if (calSummaryEl) {
    calSummaryEl.textContent = `${countTotal} piezas programadas · ${countGrab} grabadas · ${countPub} publicadas`;
  }

  renderDayDetailPanel();
}

function selectDay(fechaIso) {
  state.selectedDayIso = fechaIso;
  renderParrilla();
}

function renderDayDetailPanel() {
  const panel = document.getElementById('dayDetailPanel');
  if (!panel) return;

  if (!state.selectedDayIso) {
    panel.innerHTML = '';
    panel.hidden = true;
    return;
  }

  const piezas = db.producciones.filter(p => p.clienteSlug === state.activeClientSlug && p.fecha === state.selectedDayIso);
  const dateObj = new Date(`${state.selectedDayIso}T12:00:00`);
  const formattedDate = `${DIAS_NOMBRES[dateObj.getDay()]} ${dateObj.getDate()} de ${MESES_NOMBRES[dateObj.getMonth()]} de ${dateObj.getFullYear()}`;

  panel.hidden = false;
  panel.innerHTML = `
    <div style="background:var(--bg-surface-elevated);border:1px solid var(--border-medium);border-radius:var(--radius-lg);padding:18px 22px;margin-top:16px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:10px;">
        <h4 style="font-family:var(--font-display);font-size:16px;color:#fff;">📅 Contenido del ${formattedDate}</h4>
        ${state.currentRole === 'team' ? `
          <button class="btn btn-sm btn-primary" onclick="createProduction('${state.selectedDayIso}')">+ Agregar Pieza a este Día</button>
        ` : ''}
      </div>
      ${piezas.length === 0 ? `
        <p style="color:var(--text-dim);font-size:13.5px;">No hay piezas programadas para esta fecha.</p>
      ` : `
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${piezas.map(p => `
            <div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg-surface);padding:12px 16px;border-radius:var(--radius-md);border:1px solid var(--border-subtle);flex-wrap:wrap;gap:10px;">
              <div>
                <span class="badge" style="background:var(--bg-surface-elevated);color:var(--apex-orange);margin-bottom:4px;">${p.formato} · ${p.estado}</span>
                <h5 style="color:#fff;font-size:15px;font-weight:600;">${escapeHtml(p.titulo || 'Sin título')}</h5>
                <p style="font-size:12px;color:var(--text-dim);font-family:var(--font-mono);">Asignado a: ${p.actuacion || 'Sin asignar'} · ${p.duracion || 's/d'}</p>
              </div>
              <div style="display:flex;gap:8px;">
                <button class="btn btn-sm btn-secondary" onclick="openProdFromCal('${p.id}')">Ver Guion Completo</button>
                ${state.currentRole === 'team' ? `
                  <button class="btn btn-sm btn-secondary" style="color:#f87171;" onclick="deleteProduction('${p.id}')">Eliminar</button>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}

function openProdFromCal(prodId) {
  state.activeProdId = prodId;
  state.activeTab = 'produccion';
  renderPortalWorkspace();
}

// ==========================================================================
// 2. MÓDULO PRODUCCIÓN & GUIONES (Escena por Escena)
// ==========================================================================
function renderProduccion() {
  const piezas = db.producciones.filter(p => p.clienteSlug === state.activeClientSlug);

  // Si no hay pieza activa o no pertenece al cliente, elegir la primera
  if (!state.activeProdId || !piezas.some(p => p.id === state.activeProdId)) {
    if (piezas.length > 0) state.activeProdId = piezas[0].id;
    else state.activeProdId = null;
  }

  // Renderizar Lista Lateral
  const listEl = document.getElementById('prodSidebarList');
  if (listEl) {
    if (piezas.length === 0) {
      listEl.innerHTML = '<div style="padding:24px;text-align:center;color:var(--text-dim);font-size:13px;">Sin producciones para este cliente.</div>';
    } else {
      listEl.innerHTML = piezas.map(p => `
        <button class="prod-item-btn ${p.id === state.activeProdId ? 'active' : ''}" onclick="selectProduction('${p.id}')">
          <div class="item-btn-title">${escapeHtml(p.titulo || 'Sin título')}</div>
          <div class="item-btn-meta">
            <span>${p.fecha ? p.fecha.slice(5) : 's/f'}</span> ·
            <span>${p.formato}</span> ·
            <span style="color:${p.estado === 'Publicado' ? 'var(--apex-emerald)' : 'var(--text-dim)'}">${p.estado}</span>
          </div>
        </button>
      `).join('');
    }
  }

  // Renderizar Editor de Guion
  const editorEl = document.getElementById('prodMainEditor');
  if (!editorEl) return;

  const currentProd = piezas.find(p => p.id === state.activeProdId);
  if (!currentProd) {
    editorEl.innerHTML = `
      <div style="text-align:center;padding:60px 20px;">
        <h3 style="color:#fff;margin-bottom:12px;">Selecciona o crea una producción</h3>
        <p style="color:var(--text-muted);font-size:14px;margin-bottom:20px;">Elige una pieza del menú izquierdo para desglosar su guion y plan de grabación.</p>
        ${state.currentRole === 'team' ? `<button class="btn btn-primary" onclick="createProduction()">+ Nueva Producción</button>` : ''}
      </div>
    `;
    return;
  }

  // Calcular segundos totales
  const totalSegundos = (currentProd.guion || []).reduce((acc, escena) => {
    const s = parseFloat(String(escena.seg || '0').replace(',', '.'));
    return acc + (isNaN(s) ? 0 : s);
  }, 0);

  const isClient = state.currentRole === 'client';
  const readOnlyAttr = isClient ? 'disabled' : '';

  editorEl.innerHTML = `
    <!-- Barra de Aprobación de Cliente -->
    <div class="client-approval-bar">
      <div>
        <h4 style="font-family:var(--font-display);font-size:15px;color:#fff;margin-bottom:2px;">
          ${currentProd.aprobadoCliente ? '✅ Guion Aprobado por el Cliente' : '⏳ Pendiente de Aprobación del Cliente'}
        </h4>
        <p style="font-size:12.5px;color:var(--text-muted);">
          ${currentProd.comentarioCliente ? `Nota del cliente: "${escapeHtml(currentProd.comentarioCliente)}"` : 'Revisa las escenas y confirma si está listo para grabación.'}
        </p>
      </div>
      <div style="display:flex;gap:8px;">
        ${isClient ? `
          <button class="btn btn-sm ${currentProd.aprobadoCliente ? 'btn-secondary' : 'btn-primary'}" onclick="toggleClientApproval('${currentProd.id}')">
            ${currentProd.aprobadoCliente ? 'Quitar Aprobación' : '✓ Aprobar Guion Ahora'}
          </button>
          <button class="btn btn-sm btn-secondary" onclick="promptClientComment('${currentProd.id}')">
            💬 Dejar Comentario
          </button>
        ` : `
          <button class="btn btn-sm btn-secondary" onclick="toggleClientApproval('${currentProd.id}')">
            ${currentProd.aprobadoCliente ? 'Marcar Pendiente' : 'Marcar Aprobado por Cliente'}
          </button>
        `}
      </div>
    </div>

    <!-- Área 1: Datos Generales -->
    <div class="editor-card">
      <div class="editor-card-header">
        <div class="editor-card-title">
          <span class="card-tag-num">ÁREA 1</span> Información General de la Pieza
        </div>
      </div>
      <div class="form-grid-3">
        <div class="form-group col-full">
          <label class="form-label">Título de la Idea</label>
          <input type="text" class="form-control" value="${escapeHtml(currentProd.titulo || '')}" ${readOnlyAttr} oninput="updateProdField('${currentProd.id}', 'titulo', this.value)" placeholder="Título atractivo">
        </div>
        <div class="form-group">
          <label class="form-label">Fecha Programada</label>
          <input type="date" class="form-control" value="${currentProd.fecha || ''}" ${readOnlyAttr} onchange="updateProdField('${currentProd.id}', 'fecha', this.value)">
        </div>
        <div class="form-group">
          <label class="form-label">Formato</label>
          <select class="form-control" ${readOnlyAttr} onchange="updateProdField('${currentProd.id}', 'formato', this.value)">
            <option ${currentProd.formato === 'Reel' ? 'selected' : ''}>Reel</option>
            <option ${currentProd.formato === 'Carrusel' ? 'selected' : ''}>Carrusel</option>
            <option ${currentProd.formato === 'Post' ? 'selected' : ''}>Post</option>
            <option ${currentProd.formato === 'Historia' ? 'selected' : ''}>Historia</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Estado de Producción</label>
          <select class="form-control" ${readOnlyAttr} onchange="updateProdField('${currentProd.id}', 'estado', this.value)">
            <option ${currentProd.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
            <option ${currentProd.estado === 'Grabado' ? 'selected' : ''}>Grabado</option>
            <option ${currentProd.estado === 'Editado' ? 'selected' : ''}>Editado</option>
            <option ${currentProd.estado === 'Publicado' ? 'selected' : ''}>Publicado</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Responsable / Actuación</label>
          <select class="form-control" ${readOnlyAttr} onchange="updateProdField('${currentProd.id}', 'actuacion', this.value)">
            <option value="">Seleccionar colaborador...</option>
            ${db.colaboradores.map(col => `
              <option value="${col.nombre}" ${currentProd.actuacion === col.nombre ? 'selected' : ''}>${col.nombre} (${col.rol})</option>
            `).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Duración Estimada</label>
          <input type="text" class="form-control" value="${escapeHtml(currentProd.duracion || '')}" ${readOnlyAttr} oninput="updateProdField('${currentProd.id}', 'duracion', this.value)" placeholder="30 seg">
        </div>
        <div class="form-group">
          <label class="form-label">Link del Video Final</label>
          <input type="url" class="form-control" value="${escapeHtml(currentProd.link || '')}" ${readOnlyAttr} oninput="updateProdField('${currentProd.id}', 'link', this.value)" placeholder="https://drive.google.com/...">
        </div>
      </div>
    </div>

    <!-- Área 2: Guion Escena por Escena -->
    <div class="editor-card">
      <div class="editor-card-header">
        <div class="editor-card-title">
          <span class="card-tag-num">ÁREA 2</span> Guion & Desglose Técnico
        </div>
        <div class="mono" style="font-size:12px;color:var(--apex-orange);">
          ${(currentProd.guion || []).length} escenas · Total: ${Math.round(totalSegundos * 10) / 10} s
        </div>
      </div>
      <div class="guion-table-wrap">
        <table class="guion-table">
          <thead>
            <tr>
              <th style="width:40px;text-align:center;">#</th>
              <th style="width:26%;">Qué se ve (Visual)</th>
              <th style="width:30%;">Lo que se dice (Audio / Voz)</th>
              <th style="width:18%;">Cómo lo dice (Tono)</th>
              <th style="width:18%;">Texto en Pantalla</th>
              <th style="width:65px;text-align:center;">Seg</th>
              ${!isClient ? '<th style="width:35px;"></th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${(currentProd.guion || []).map((escena, idx) => `
              <tr>
                <td style="text-align:center;font-family:var(--font-mono);color:var(--text-dim);">${idx + 1}</td>
                <td><textarea class="guion-input" ${readOnlyAttr} oninput="updateSceneField('${currentProd.id}', ${idx}, 've', this.value)">${escapeHtml(escena.ve || '')}</textarea></td>
                <td><textarea class="guion-input" ${readOnlyAttr} oninput="updateSceneField('${currentProd.id}', ${idx}, 'dice', this.value)">${escapeHtml(escena.dice || '')}</textarea></td>
                <td><textarea class="guion-input" ${readOnlyAttr} oninput="updateSceneField('${currentProd.id}', ${idx}, 'como', this.value)">${escapeHtml(escena.como || '')}</textarea></td>
                <td><textarea class="guion-input" ${readOnlyAttr} oninput="updateSceneField('${currentProd.id}', ${idx}, 'texto', this.value)">${escapeHtml(escena.texto || '')}</textarea></td>
                <td><input type="text" class="guion-input" style="text-align:center;min-height:0;height:36px;" value="${escapeHtml(escena.seg || '')}" ${readOnlyAttr} oninput="updateSceneField('${currentProd.id}', ${idx}, 'seg', this.value)"></td>
                ${!isClient ? `
                  <td style="vertical-align:middle;text-align:center;">
                    <button class="btn btn-sm btn-secondary" style="padding:4px 8px;color:#f87171;" onclick="deleteScene('${currentProd.id}', ${idx})">×</button>
                  </td>
                ` : ''}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ${!isClient ? `
        <button class="btn btn-sm btn-primary" onclick="addScene('${currentProd.id}')">+ Agregar Escena</button>
      ` : ''}
    </div>

    <!-- Área 3: Requerimientos & Notas -->
    <div class="editor-card">
      <div class="editor-card-header">
        <div class="editor-card-title">
          <span class="card-tag-num">ÁREA 3</span> Requerimientos de Grabación y Notas del Equipo
        </div>
      </div>
      <div class="form-grid-3">
        <div class="form-group col-full">
          <label class="form-label">Requerimientos (Utilería, vestuario, iluminación, locación)</label>
          <textarea class="form-control" rows="2" ${readOnlyAttr} oninput="updateProdField('${currentProd.id}', 'requerimientos', this.value)">${escapeHtml(currentProd.requerimientos || '')}</textarea>
        </div>
        <div class="form-group col-full">
          <label class="form-label">Notas Adicionales</label>
          <textarea class="form-control" rows="2" ${readOnlyAttr} oninput="updateProdField('${currentProd.id}', 'notas', this.value)">${escapeHtml(currentProd.notas || '')}</textarea>
        </div>
      </div>
    </div>
  `;
}

function selectProduction(id) {
  state.activeProdId = id;
  renderProduccion();
}

function createProduction(fechaDefecto) {
  const newProd = {
    id: 'p_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    clienteSlug: state.activeClientSlug,
    fecha: fechaDefecto || state.selectedDayIso || new Date().toISOString().slice(0, 10),
    formato: 'Reel',
    titulo: 'Nueva Idea de Contenido',
    estado: 'Pendiente',
    actuacion: '',
    duracion: '30 seg',
    link: '',
    aprobadoCliente: false,
    comentarioCliente: '',
    guion: [
      { ve: '', dice: '', como: '', texto: '', seg: '5' }
    ],
    requerimientos: '',
    notas: ''
  };
  db.producciones.push(newProd);
  saveDatabase();
  state.activeProdId = newProd.id;
  renderPortalWorkspace();
}

function deleteProduction(id) {
  if (confirm('¿Eliminar esta producción de contenido?')) {
    db.producciones = db.producciones.filter(p => p.id !== id);
    saveDatabase();
    if (state.activeProdId === id) state.activeProdId = null;
    renderPortalWorkspace();
  }
}

function updateProdField(id, field, value) {
  const p = db.producciones.find(item => item.id === id);
  if (p) {
    p[field] = value;
    saveDatabase();
  }
}

function updateSceneField(prodId, sceneIdx, field, value) {
  const p = db.producciones.find(item => item.id === prodId);
  if (p && p.guion && p.guion[sceneIdx]) {
    p.guion[sceneIdx][field] = value;
    saveDatabase();
  }
}

function addScene(prodId) {
  const p = db.producciones.find(item => item.id === prodId);
  if (p) {
    if (!p.guion) p.guion = [];
    p.guion.push({ ve: '', dice: '', como: '', texto: '', seg: '5' });
    saveDatabase();
    renderProduccion();
  }
}

function deleteScene(prodId, sceneIdx) {
  const p = db.producciones.find(item => item.id === prodId);
  if (p && p.guion) {
    p.guion.splice(sceneIdx, 1);
    if (p.guion.length === 0) p.guion.push({ ve: '', dice: '', como: '', texto: '', seg: '' });
    saveDatabase();
    renderProduccion();
  }
}

function toggleClientApproval(prodId) {
  const p = db.producciones.find(item => item.id === prodId);
  if (p) {
    p.aprobadoCliente = !p.aprobadoCliente;
    saveDatabase();
    renderProduccion();
  }
}

function promptClientComment(prodId) {
  const p = db.producciones.find(item => item.id === prodId);
  if (p) {
    const comentario = prompt('Escribe tus observaciones o ajustes para el equipo de producción:', p.comentarioCliente || '');
    if (comentario !== null) {
      p.comentarioCliente = comentario;
      saveDatabase();
      renderProduccion();
    }
  }
}

// ==========================================================================
// 3. MÓDULO TABLERO DE TAREAS & COLABORADORES (Vista Equipo)
// ==========================================================================
function renderTareas() {
  const container = document.getElementById('viewTab_tareas');
  if (!container) return;

  // Filtrar producciones del cliente actual (o todas las del equipo)
  let piezas = db.producciones;
  if (state.taskFilterAssignee !== 'todos') {
    piezas = piezas.filter(p => p.actuacion === state.taskFilterAssignee);
  }

  // Columnas Kanban
  const colPendiente = piezas.filter(p => p.estado === 'Pendiente');
  const colGrabado = piezas.filter(p => p.estado === 'Grabado');
  const colEditado = piezas.filter(p => p.estado === 'Editado');
  const colPublicado = piezas.filter(p => p.estado === 'Publicado');

  container.innerHTML = `
    <div class="tasks-toolbar">
      <div>
        <h3 style="font-family:var(--font-display);font-size:20px;color:#fff;margin-bottom:4px;">Tablero de Labores & Colaboradores</h3>
        <p style="font-size:13px;color:var(--text-muted);">Asigna y da seguimiento a grabaciones de Alexa, edición de Mitzi y supervisión de Alejandra.</p>
      </div>
      <div class="collab-filters">
        <span class="mono" style="font-size:11px;color:var(--text-dim);margin-right:6px;">FILTRAR:</span>
        <button class="collab-filter-btn ${state.taskFilterAssignee === 'todos' ? 'active' : ''}" onclick="filterTasksAssignee('todos')">Todos</button>
        ${db.colaboradores.map(col => `
          <button class="collab-filter-btn ${state.taskFilterAssignee === col.nombre ? 'active' : ''}" onclick="filterTasksAssignee('${col.nombre}')">
            ${col.nombre}
          </button>
        `).join('')}
      </div>
    </div>

    <div class="tasks-kanban">
      <!-- Columna 1: Por Grabar / Pendiente -->
      <div class="kanban-col">
        <div class="kanban-col-header">
          <div class="kanban-col-title">
            <span style="width:8px;height:8px;border-radius:50%;background:var(--status-pendiente);"></span>
            Por Grabar (${colPendiente.length})
          </div>
        </div>
        ${renderKanbanCards(colPendiente, 'Pendiente')}
      </div>

      <!-- Columna 2: Grabado / En Edición -->
      <div class="kanban-col">
        <div class="kanban-col-header">
          <div class="kanban-col-title">
            <span style="width:8px;height:8px;border-radius:50%;background:var(--status-grabado);"></span>
            Grabado (${colGrabado.length})
          </div>
        </div>
        ${renderKanbanCards(colGrabado, 'Grabado')}
      </div>

      <!-- Columna 3: Editado / En Aprobación -->
      <div class="kanban-col">
        <div class="kanban-col-header">
          <div class="kanban-col-title">
            <span style="width:8px;height:8px;border-radius:50%;background:var(--status-editado);"></span>
            Editado (${colEditado.length})
          </div>
        </div>
        ${renderKanbanCards(colEditado, 'Editado')}
      </div>

      <!-- Columna 4: Publicado / Pautado -->
      <div class="kanban-col">
        <div class="kanban-col-header">
          <div class="kanban-col-title">
            <span style="width:8px;height:8px;border-radius:50%;background:var(--status-publicado);"></span>
            Publicado (${colPublicado.length})
          </div>
        </div>
        ${renderKanbanCards(colPublicado, 'Publicado')}
      </div>
    </div>
  `;
}

function filterTasksAssignee(nombre) {
  state.taskFilterAssignee = nombre;
  renderTareas();
}

function renderKanbanCards(piezas, estadoCol) {
  if (piezas.length === 0) {
    return '<div style="padding:20px;text-align:center;color:var(--text-dim);font-size:12px;">Sin labores en este estado</div>';
  }
  return piezas.map(p => {
    const client = db.clientes.find(c => c.slug === p.clienteSlug) || { nombre: p.clienteSlug, avatar: '📌' };
    return `
      <div class="task-card" onclick="openProdFromKanban('${p.clienteSlug}', '${p.id}')">
        <div class="task-assignee">👤 ${p.actuacion || 'Sin asignar'}</div>
        <div class="task-title">${escapeHtml(p.titulo || 'Sin título')}</div>
        <div class="task-meta">
          <span>${client.avatar} ${client.nombre}</span>
          <span>${p.fecha ? p.fecha.slice(5) : 's/f'}</span>
        </div>
        <div style="margin-top:10px;display:flex;gap:4px;" onclick="event.stopPropagation();">
          <select class="form-control" style="font-size:11px;padding:3px 6px;" onchange="moveTaskStatus('${p.id}', this.value)">
            <option value="Pendiente" ${p.estado === 'Pendiente' ? 'selected' : ''}>Mover a Pendiente</option>
            <option value="Grabado" ${p.estado === 'Grabado' ? 'selected' : ''}>Mover a Grabado</option>
            <option value="Editado" ${p.estado === 'Editado' ? 'selected' : ''}>Mover a Editado</option>
            <option value="Publicado" ${p.estado === 'Publicado' ? 'selected' : ''}>Mover a Publicado</option>
          </select>
        </div>
      </div>
    `;
  }).join('');
}

function moveTaskStatus(prodId, newStatus) {
  const p = db.producciones.find(item => item.id === prodId);
  if (p) {
    p.estado = newStatus;
    saveDatabase();
    renderTareas();
  }
}

function openProdFromKanban(clientSlug, prodId) {
  state.activeClientSlug = clientSlug;
  state.activeProdId = prodId;
  state.activeTab = 'produccion';
  renderPortalWorkspace();
}

// ==========================================================================
// 4. MÓDULO RESULTADOS & MÉTRICAS
// ==========================================================================
function renderResultados() {
  const container = document.getElementById('viewTab_resultados');
  if (!container) return;

  const clientResults = (db.resultados[state.activeClientSlug] && db.resultados[state.activeClientSlug]['2026-09']) || {
    resumen: 'Mes en curso de ejecución y levantamiento de contenido.',
    kpis: [
      { nombre: 'Alcance Estimado', valor: '0', comparativo: 'En medición', positivo: true },
      { nombre: 'Interacciones', valor: '0', comparativo: 'En medición', positivo: true },
      { nombre: 'Piezas Producidas', valor: '0', comparativo: '0', positivo: true }
    ],
    imagenes: []
  };

  const piezasMes = db.producciones.filter(p => p.clienteSlug === state.activeClientSlug && (p.fecha || '').startsWith('2026-09'));
  const pubCount = piezasMes.filter(p => p.estado === 'Publicado').length;

  container.innerHTML = `
    <div class="results-header">
      <div>
        <h3 style="font-family:var(--font-display);font-size:20px;color:#fff;margin-bottom:4px;">Reporte de Resultados · Septiembre 2026</h3>
        <p style="font-size:13px;color:var(--text-muted);">Métricas verificadas de impacto, interacciones y conversiones para la marca.</p>
      </div>
      <div>
        ${state.currentRole === 'team' ? `
          <button class="btn btn-sm btn-primary" onclick="addCustomKpi()">+ Agregar Indicador</button>
        ` : ''}
      </div>
    </div>

    <!-- Tarjetas de Métricas -->
    <div class="kpi-tiles-grid">
      ${clientResults.tileFijo ? `
      <div class="kpi-tile" style="border-left:3px solid var(--apex-orange);">
        <div class="kpi-label">${escapeHtml(clientResults.tileFijo.nombre)}</div>
        <div class="kpi-val">${escapeHtml(clientResults.tileFijo.valor)}</div>
        <div class="kpi-trend neutral">${escapeHtml(clientResults.tileFijo.comparativo)}</div>
      </div>` : `
      <div class="kpi-tile" style="border-left:3px solid var(--apex-orange);">
        <div class="kpi-label">Total Piezas Planificadas</div>
        <div class="kpi-val">${piezasMes.length}</div>
        <div class="kpi-trend neutral">${pubCount} publicadas</div>
      </div>`}
      ${(clientResults.kpis || []).map((kpi, idx) => `
        <div class="kpi-tile">
          <div class="kpi-label">${escapeHtml(kpi.nombre)}</div>
          <div class="kpi-val">${escapeHtml(kpi.valor)}</div>
          <div class="kpi-trend ${kpi.positivo ? 'positive' : (kpi.positivo === false ? 'negative' : 'neutral')}">${escapeHtml(kpi.comparativo)}</div>
          ${state.currentRole === 'team' ? `
            <div style="margin-top:8px;">
              <button class="btn btn-sm btn-secondary" style="font-size:10px;padding:2px 6px;" onclick="editKpi(${idx})">Editar</button>
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>

    <!-- Resumen Ejecutivo -->
    <div class="editor-card" style="margin-bottom:24px;">
      <h4 style="font-family:var(--font-display);font-size:16px;color:#fff;margin-bottom:12px;">Resumen Ejecutivo del Mes</h4>
      <p style="color:var(--text-main);font-size:14.5px;line-height:1.6;">${escapeHtml(clientResults.resumen)}</p>
      ${state.currentRole === 'team' ? `
        <div style="margin-top:14px;">
          <button class="btn btn-sm btn-secondary" onclick="editResultsSummary()">Editar Resumen Ejecutivo</button>
        </div>
      ` : ''}
    </div>

    ${renderDetalleResultados(clientResults.detalle)}

    <!-- Capturas y Evidencias de Resultados -->
    <div class="editor-card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
        <h4 style="font-family:var(--font-display);font-size:16px;color:#fff;">Capturas & Evidencias Verificadas</h4>
        ${state.currentRole === 'team' ? `
          <button class="btn btn-sm btn-secondary" onclick="document.getElementById('kpiImageInput').click()">+ Subir Captura</button>
        ` : ''}
      </div>
      <input type="file" id="kpiImageInput" accept="image/*" style="display:none;" onchange="handleKpiImageUpload(this)">
      <div class="metrics-proofs-grid">
        ${(clientResults.imagenes && clientResults.imagenes.length) ? clientResults.imagenes.map((imgSrc, imgIdx) => `
          <div class="proof-card" onclick="openLightbox('${imgSrc}')">
            <img src="${imgSrc}" alt="Captura métrica">
          </div>
        `).join('') : `
          <div style="grid-column:1/-1;padding:20px;text-align:center;color:var(--text-dim);font-size:13px;">
            Aún no se han adjuntado capturas de pantalla para este mes.
          </div>
        `}
      </div>
    </div>
  `;
}

// Detalle por red, KPIs y conclusión (solo si el reporte trae "detalle")
function renderDetalleResultados(d) {
  if (!d) return '';
  const arrow = t => t === 'up' ? '▲' : (t === 'down' ? '▼' : '•');
  const kpiRows = (d.kpiDefiniciones || []).map(k => `
    <tr>
      <td class="res-strong">${escapeHtml(k.kpi)}</td>
      <td>${escapeHtml(k.formula)}</td>
      <td class="res-num">${escapeHtml(k.actual)}</td>
      <td class="res-num res-dim">${escapeHtml(k.base)}</td>
    </tr>`).join('');

  const redes = (d.redes || []).map(r => `
    <div class="editor-card res-red res-red-${escapeHtml(r.clase || '')}">
      <div class="res-red-head">
        <h4>${escapeHtml(r.red)}</h4>
        <span class="res-periodo">${escapeHtml(r.periodo)}</span>
      </div>
      <div class="res-table-wrap">
        <table class="res-table">
          <thead><tr><th>Métrica</th><th>Septiembre</th><th>Anterior</th><th>Variación</th></tr></thead>
          <tbody>
            ${(r.filas || []).map(f => `
              <tr>
                <td>${escapeHtml(f.m)}</td>
                <td class="res-num res-strong">${escapeHtml(f.a)}</td>
                <td class="res-num res-dim">${escapeHtml(f.b)}</td>
                <td class="res-num res-trend res-${escapeHtml(f.t)}"><span>${arrow(f.t)}</span> ${escapeHtml(f.v)}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
      ${(r.top && r.top.length) ? `
        <h5 class="res-sub">${escapeHtml(r.topTitulo || 'Contenido destacado')}</h5>
        <ol class="res-top">
          ${r.top.map(x => `<li><strong>${escapeHtml(x.t)}</strong><span>${escapeHtml(x.d)}</span></li>`).join('')}
        </ol>` : ''}
      ${(r.notas && r.notas.length) ? `
        <ul class="res-notas">${r.notas.map(n => `<li>${escapeHtml(n)}</li>`).join('')}</ul>` : ''}
    </div>`).join('');

  return `
    <div class="res-aviso">${escapeHtml(d.avisoPeriodos || '')}</div>

    <div class="editor-card" style="margin-bottom:24px;">
      <h4 class="res-h4">KPI medibles · línea base de septiembre</h4>
      <div class="res-table-wrap">
        <table class="res-table">
          <thead><tr><th>KPI</th><th>Cómo se mide</th><th>Septiembre</th><th>Agosto / base</th></tr></thead>
          <tbody>${kpiRows}</tbody>
        </table>
      </div>
      ${d.notaKpi ? `<p class="res-foot">${escapeHtml(d.notaKpi)}</p>` : ''}
    </div>

    ${redes}

    <div class="editor-card res-conclusion" style="margin-bottom:24px;">
      <h4 class="res-h4">Conclusión del mes</h4>
      ${(d.conclusion || []).map(p => `<p>${escapeHtml(p)}</p>`).join('')}
      ${(d.recomendaciones && d.recomendaciones.length) ? `
        <h5 class="res-sub">Qué sigue en octubre</h5>
        <ul class="res-notas">${d.recomendaciones.map(n => `<li>${escapeHtml(n)}</li>`).join('')}</ul>` : ''}
    </div>
  `;
}

function editResultsSummary() {
  const current = (db.resultados[state.activeClientSlug] && db.resultados[state.activeClientSlug]['2026-09'] && db.resultados[state.activeClientSlug]['2026-09'].resumen) || '';
  const newSummary = prompt('Edita el resumen ejecutivo mensual:', current);
  if (newSummary !== null) {
    if (!db.resultados[state.activeClientSlug]) db.resultados[state.activeClientSlug] = {};
    if (!db.resultados[state.activeClientSlug]['2026-09']) {
      db.resultados[state.activeClientSlug]['2026-09'] = { resumen: '', kpis: [], imagenes: [] };
    }
    db.resultados[state.activeClientSlug]['2026-09'].resumen = newSummary;
    saveDatabase();
    renderResultados();
  }
}

function addCustomKpi() {
  const nombre = prompt('Nombre del indicador (ej. Guardados, Visitas al perfil, Clics en anuncio):');
  if (!nombre) return;
  const valor = prompt('Valor numérico (ej. 3,450):', '0');
  const comp = prompt('Comparativo vs mes anterior (ej. +18%):', '+0%');

  if (!db.resultados[state.activeClientSlug]) db.resultados[state.activeClientSlug] = {};
  if (!db.resultados[state.activeClientSlug]['2026-09']) {
    db.resultados[state.activeClientSlug]['2026-09'] = { resumen: '', kpis: [], imagenes: [] };
  }
  db.resultados[state.activeClientSlug]['2026-09'].kpis.push({
    nombre,
    valor: valor || '0',
    comparativo: comp || '',
    positivo: true
  });
  saveDatabase();
  renderResultados();
}

function editKpi(idx) {
  const kpis = db.resultados[state.activeClientSlug]['2026-09'].kpis;
  if (!kpis[idx]) return;
  const valor = prompt(`Nuevo valor para ${kpis[idx].nombre}:`, kpis[idx].valor);
  if (valor !== null) {
    kpis[idx].valor = valor;
    saveDatabase();
    renderResultados();
  }
}

function handleKpiImageUpload(input) {
  const file = input.files && input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    // Comprimir en canvas
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const maxW = 900;
      const scale = Math.min(1, maxW / img.width);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);

      if (!db.resultados[state.activeClientSlug]) db.resultados[state.activeClientSlug] = {};
      if (!db.resultados[state.activeClientSlug]['2026-09']) {
        db.resultados[state.activeClientSlug]['2026-09'] = { resumen: '', kpis: [], imagenes: [] };
      }
      db.resultados[state.activeClientSlug]['2026-09'].imagenes.push(compressedDataUrl);
      saveDatabase();
      renderResultados();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
  input.value = '';
}

// Lightbox
function openLightbox(src) {
  const modal = document.getElementById('globalLightboxModal');
  const img = document.getElementById('globalLightboxImg');
  if (modal && img) {
    img.src = src;
    modal.hidden = false;
    modal.style.display = 'flex';
  }
}

function closeLightbox() {
  const modal = document.getElementById('globalLightboxModal');
  const img = document.getElementById('globalLightboxImg');
  if (modal) {
    modal.hidden = true;
    modal.style.display = 'none';
  }
  if (img) img.src = '';
}

// ==========================================================================
// 5. MÓDULO AJUSTES & GESTOR DINÁMICO (Clientes & Colaboradores)
// ==========================================================================
function renderAjustes() {
  const container = document.getElementById('viewTab_ajustes');
  if (!container) return;

  container.innerHTML = `
    <div style="max-width:880px;">
      <h3 style="font-family:var(--font-display);font-size:20px;color:#fff;margin-bottom:6px;">Panel de Ajustes de la Agencia</h3>
      <p style="font-size:13px;color:var(--text-muted);margin-bottom:24px;">Administra tus clientes, contraseñas PIN, colaboradores del equipo y respaldos.</p>

      <!-- Gestor de Clientes -->
      <div class="editor-card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
          <h4 style="font-family:var(--font-display);font-size:16px;color:#fff;">Clientes Activos (${db.clientes.length})</h4>
          <button class="btn btn-sm btn-primary" onclick="addNewClientPrompt()">+ Agregar Cliente</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${db.clientes.map(c => `
            <div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg-surface-elevated);padding:10px 14px;border-radius:var(--radius-md);border:1px solid var(--border-subtle);flex-wrap:wrap;gap:8px;">
              <div>
                <span style="font-size:18px;margin-right:8px;">${c.avatar}</span>
                <strong style="color:#fff;font-size:14px;">${c.nombre}</strong>
                <span class="mono" style="font-size:11px;color:var(--text-dim);margin-left:8px;">PIN: ${c.pin} · ${c.pais}</span>
              </div>
              <div style="display:flex;gap:6px;">
                <button class="btn btn-sm btn-secondary" onclick="editClientPin('${c.slug}')">Cambiar PIN</button>
                <button class="btn btn-sm btn-secondary" style="color:#f87171;" onclick="deleteClient('${c.slug}')">Eliminar</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Gestor Dinámico de Colaboradores -->
      <div class="editor-card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
          <h4 style="font-family:var(--font-display);font-size:16px;color:#fff;">Equipo & Colaboradores (${db.colaboradores.length})</h4>
          <button class="btn btn-sm btn-primary" onclick="addNewCollabPrompt()">+ Agregar Colaborador</button>
        </div>
        <p style="font-size:12.5px;color:var(--text-muted);margin-bottom:14px;">
          Como el equipo puede variar (Mitzi, Alexa, Influencers), puedes añadir o actualizar los roles aquí.
        </p>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${db.colaboradores.map((col, idx) => `
            <div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg-surface-elevated);padding:10px 14px;border-radius:var(--radius-md);border:1px solid var(--border-subtle);flex-wrap:wrap;gap:8px;">
              <div>
                <strong style="color:#fff;font-size:14px;">👤 ${col.nombre}</strong>
                <span style="font-size:12px;color:var(--text-dim);margin-left:8px;">(${col.rol})</span>
              </div>
              <div style="display:flex;gap:6px;">
                <button class="btn btn-sm btn-secondary" style="color:#f87171;" onclick="deleteCollab(${idx})">Eliminar</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Respaldos y Seguridad -->
      <div class="editor-card">
        <h4 style="font-family:var(--font-display);font-size:16px;color:#fff;margin-bottom:8px;">Respaldo y Seguridad de Datos</h4>
        <p style="font-size:12.5px;color:var(--text-muted);margin-bottom:16px;">
          Descarga una copia completa de tus guiones, calendarios y resultados en un archivo JSON para tener siempre tu información segura.
        </p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button class="btn btn-primary" onclick="downloadBackupJson()">📥 Descargar Respaldo JSON</button>
          <button class="btn btn-secondary" onclick="document.getElementById('restoreJsonInput').click()">📤 Cargar Respaldo JSON</button>
          <input type="file" id="restoreJsonInput" accept=".json" style="display:none;" onchange="restoreBackupJson(this)">
        </div>
      </div>
    </div>
  `;
}

function addNewClientPrompt() {
  const nombre = prompt('Nombre del nuevo cliente (ej. Restaurante El Rincón):');
  if (!nombre) return;
  const sector = prompt('Sector o giro (ej. Gastronomía, Belleza, etc.):', 'Comercial');
  const pais = prompt('País (México o Colombia):', 'México');
  const pin = prompt('Código PIN de 4 dígitos para que el cliente ingrese:');
  if (!pin || !pin.trim()) { alert('El cliente necesita un PIN para poder ingresar.'); return; }
  const slug = nombre.toLowerCase().replace(/[^a-z0-9]/g, '');

  db.clientes.push({
    slug,
    nombre,
    sector: sector || 'Comercial',
    pais: pais || 'México',
    pin: pin.trim(),
    avatar: '🌟',
    color: '#ff4d28'
  });
  saveDatabase();
  renderPortalWorkspace();
}

function editClientPin(slug) {
  const client = db.clientes.find(c => c.slug === slug);
  if (!client) return;
  const newPin = prompt(`Nuevo PIN para ${client.nombre}:`, client.pin);
  if (newPin && newPin.trim()) {
    client.pin = newPin.trim();
    saveDatabase();
    renderAjustes();
  }
}

function deleteClient(slug) {
  if (confirm(`¿Estás seguro de eliminar al cliente ${slug}? Se conservarán los datos históricos.`)) {
    db.clientes = db.clientes.filter(c => c.slug !== slug);
    saveDatabase();
    if (state.activeClientSlug === slug) {
      state.activeClientSlug = db.clientes[0] ? db.clientes[0].slug : '';
    }
    renderPortalWorkspace();
  }
}

function addNewCollabPrompt() {
  const nombre = prompt('Nombre del nuevo colaborador (ej. Carlos, Camila):');
  if (!nombre) return;
  const rol = prompt('Función principal (ej. Fotografía, Edición de Reels, Guiones):', 'Colaborador Creativo');
  db.colaboradores.push({
    id: 'c_' + Date.now().toString(36),
    nombre,
    rol: rol || 'Colaborador',
    color: '#3b82f6'
  });
  saveDatabase();
  renderAjustes();
}

function deleteCollab(idx) {
  if (confirm('¿Eliminar este colaborador de la lista activa?')) {
    db.colaboradores.splice(idx, 1);
    saveDatabase();
    renderAjustes();
  }
}

function downloadBackupJson() {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(db, null, 2));
  const a = document.createElement('a');
  a.setAttribute('href', dataStr);
  a.setAttribute('download', `apex_creativo_respaldo_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function restoreBackupJson(input) {
  const file = input.files && input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed && Array.isArray(parsed.clientes)) {
        db = parsed;
        saveDatabase();
        alert('Respaldo cargado correctamente.');
        renderPortalWorkspace();
      } else {
        alert('El archivo no contiene un formato de respaldo válido.');
      }
    } catch (err) {
      alert('Error leyendo el archivo JSON.');
    }
  };
  reader.readAsText(file);
  input.value = '';
}

// ==========================================================================
// UTILIDADES & MANEJO DEL DOM
// ==========================================================================
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderAuthSelectOptions() {
  const select = document.getElementById('authClientSelect');
  if (select) {
    select.innerHTML = db.clientes.map(c => 
      `<option value="${c.slug}">${c.avatar} ${c.nombre} (${c.pais})</option>`
    ).join('');
  }
  const teamSelect = document.getElementById('authTeamSelect');
  if (teamSelect) {
    teamSelect.innerHTML = TEAM_MEMBERS.map(m =>
      `<option value="${m.id}">${m.nombre} (${m.rol})</option>`
    ).join('');
  }
}

// Inicialización de Eventos DOM al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  renderAuthSelectOptions();

  // Cambio de pestañas en autenticación
  const tabClientBtn = document.getElementById('authTabClient');
  const tabTeamBtn = document.getElementById('authTabTeam');
  const groupClientSelect = document.getElementById('authGroupClientSelect');
  const groupTeamSelect = document.getElementById('authGroupTeamSelect');
  const pinLabel = document.getElementById('authPinLabel');
  const authPinInput = document.getElementById('authPinInput');
  const authSubmitBtn = document.getElementById('authSubmitBtn');
  const authErrorMsg = document.getElementById('authErrorMsg');

  if (tabClientBtn && tabTeamBtn) {
    tabClientBtn.addEventListener('click', () => {
      state.authMode = 'client';
      tabClientBtn.classList.add('active');
      tabTeamBtn.classList.remove('active');
      if (groupClientSelect) groupClientSelect.hidden = false;
      if (groupTeamSelect) groupTeamSelect.hidden = true;
      if (pinLabel) pinLabel.textContent = 'Ingresa el PIN de tu Marca';
      if (authErrorMsg) authErrorMsg.hidden = true;
      if (authPinInput) authPinInput.value = '';
    });

    tabTeamBtn.addEventListener('click', () => {
      state.authMode = 'team';
      tabTeamBtn.classList.add('active');
      tabClientBtn.classList.remove('active');
      if (groupClientSelect) groupClientSelect.hidden = true;
      if (groupTeamSelect) groupTeamSelect.hidden = false;
      if (pinLabel) pinLabel.textContent = 'Ingresa tu PIN de Colaborador';
      if (authErrorMsg) authErrorMsg.hidden = true;
      if (authPinInput) authPinInput.value = '';
    });
  }

  // Submit de autenticación
  if (authSubmitBtn && authPinInput) {
    authSubmitBtn.addEventListener('click', () => {
      const pin = authPinInput.value;
      if (!pin) {
        showAuthError('Por favor ingresa un código PIN.');
        return;
      }

      if (state.authMode === 'client') {
        const select = document.getElementById('authClientSelect');
        const slug = select ? select.value : db.clientes[0].slug;
        const res = loginAsClient(slug, pin);
        if (!res.success) showAuthError(res.message);
        else authPinInput.value = '';
      } else {
        const teamSelect = document.getElementById('authTeamSelect');
        const memberId = teamSelect ? teamSelect.value : TEAM_MEMBERS[0].id;
        const res = loginAsTeam(memberId, pin);
        if (!res.success) showAuthError(res.message);
        else authPinInput.value = '';
      }
    });

    authPinInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') authSubmitBtn.click();
    });
  }

  function showAuthError(msg) {
    if (authErrorMsg) {
      authErrorMsg.textContent = msg;
      authErrorMsg.hidden = false;
    }
  }

  // Botones de cambio de pestañas en el portal
  document.querySelectorAll('.portal-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeTab = btn.dataset.tab;
      renderPortalWorkspace();
    });
  });

  // Selector de cliente de equipo
  const clientSwitcherSelect = document.getElementById('clientSwitcherSelect');
  if (clientSwitcherSelect) {
    clientSwitcherSelect.addEventListener('change', (e) => {
      if (e.target.value === '__NEW__') {
        addNewClientPrompt();
      } else {
        state.activeClientSlug = e.target.value;
        renderPortalWorkspace();
      }
    });
  }

  // Navegación de mes en el calendario
  const prevMonthBtn = document.getElementById('calPrevMonthBtn');
  const nextMonthBtn = document.getElementById('calNextMonthBtn');
  const todayBtn = document.getElementById('calTodayBtn');

  if (prevMonthBtn) {
    prevMonthBtn.addEventListener('click', () => {
      state.calMonth--;
      if (state.calMonth < 0) {
        state.calMonth = 11;
        state.calYear--;
      }
      renderParrilla();
    });
  }

  if (nextMonthBtn) {
    nextMonthBtn.addEventListener('click', () => {
      state.calMonth++;
      if (state.calMonth > 11) {
        state.calMonth = 0;
        state.calYear++;
      }
      renderParrilla();
    });
  }

  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      const now = new Date();
      state.calYear = now.getFullYear();
      state.calMonth = now.getMonth();
      state.selectedDayIso = now.toISOString().slice(0, 10);
      renderParrilla();
    });
  }

  // Revisar si en la URL viene parámetro para abrir portal directo
  // ej. ?portal=1 o ?cliente=<slug>&pin=<PIN>
  const urlParams = new URLSearchParams(window.location.search);
  const paramCliente = urlParams.get('cliente');
  const paramPin = urlParams.get('pin');
  const paramTeam = urlParams.get('equipo');
  const paramPortal = urlParams.get('portal');

  if (paramCliente && paramPin) {
    openPortalModal();
    loginAsClient(paramCliente, paramPin);
  } else if (paramTeam && paramPin) {
    openPortalModal();
    loginAsTeam(paramTeam, paramPin);
  } else if (paramPortal) {
    openPortalModal();
  }
});
