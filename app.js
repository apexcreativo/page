/* ==========================================================================
   APEX CREATIVO · MOTOR OPERATIVO & GESTOR DE DATOS
   Plataforma de Agencia Multicliente con Autenticación por PIN
   Soporta GitHub Pages (100% Client-Side con persistencia LocalStorage)
   ========================================================================== */

'use strict';

const STORAGE_KEY = 'apex_creativo_db_v1';
const MASTER_PIN = '0000'; // PIN de Dirección General (Alejandra y Equipo)

// Base de datos inicial con clientes reales de México y Colombia
const DEFAULT_DATABASE = {
  version: '1.0',
  updatedAt: new Date().toISOString(),
  masterPin: MASTER_PIN,
  
  // Lista de Colaboradores Dinámica (se pueden agregar o editar)
  colaboradores: [
    { id: 'c_ale', nombre: 'Alejandra', rol: 'Dirección Estratégica & Pauta', color: '#ff4d28' },
    { id: 'c_mitzi', nombre: 'Mitzi', rol: 'Levantamiento, Edición y Foto/Video', color: '#8b5cf6' },
    { id: 'c_alexa', nombre: 'Alexa', rol: 'Grabación de video & Actuación', color: '#3b82f6' },
    { id: 'c_infl', nombre: 'Influencers / Externos', rol: 'Generación de contenido en alianza', color: '#f59e0b' }
  ],

  // Clientes Reales Actuales
  clientes: [
    {
      slug: 'palato',
      nombre: 'Restaurante Palato',
      sector: 'Gastronomía de Autor',
      pais: 'México (GTO)',
      pin: '1234',
      avatar: '🍽️',
      color: '#ff4d28'
    },
    {
      slug: 'tazca',
      nombre: 'La Tazca de la Paz',
      sector: 'Gastronomía Tradicional & Eventos',
      pais: 'México (GTO)',
      pin: '1234',
      avatar: '🥘',
      color: '#f59e0b'
    },
    {
      slug: 'elfaro',
      nombre: 'Restaurante & Micheladas El Faro',
      sector: 'Bares & Vida Nocturna',
      pais: 'México (GTO)',
      pin: '1234',
      avatar: '🍻',
      color: '#3b82f6'
    },
    {
      slug: 'canirac',
      nombre: 'CANIRAC Guanajuato',
      sector: 'Cámara Restaurantera Institucional',
      pais: 'México (GTO)',
      pin: '1234',
      avatar: '🏛️',
      color: '#10b981'
    },
    {
      slug: 'blucare',
      nombre: 'Blucare Bucaramanga',
      sector: 'Salud, Belleza & Cuidado Personal',
      pais: 'Colombia (BGA)',
      pin: '1234',
      avatar: '✨',
      color: '#ec4899'
    },
    {
      slug: 'hidrogeo',
      nombre: 'HidroGeo Consultoría',
      sector: 'Modelos Matemáticos & Gestión del Agua',
      pais: 'México',
      pin: '1234',
      avatar: '💧',
      color: '#06b6d4'
    },
    {
      slug: 'galerenas',
      nombre: 'Club Satélite Galereñas',
      sector: 'Impacto Social & Comunidad',
      pais: 'México (GTO)',
      pin: '1234',
      avatar: '🤝',
      color: '#8b5cf6'
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
        { ve: 'Mantequilla y caldo reduciendo', dice: 'Hongos silvestres de temporada, vino blanco y 22 minutos de mimo constante.', como: 'Sensorial', texto: 'Palato · Guanajuato', seg: '12' },
        { ve: 'Platillo servido en mesa con copa de vino', dice: 'Ven a probar la experiencia esta noche.', como: 'Invitación cálida', texto: 'Reserva por WhatsApp', seg: '7' }
      ],
      requerimientos: 'Luz cálida de cocina y tomas en cámara lenta',
      notas: 'Pautar jueves a sábado en Guanajuato capital y León'
    },
    // Blucare Bucaramanga (Colombia)
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
        { ve: 'Slide 3: Foto producto Blucare con textura fluida', dice: 'Descubre nuestra fórmula con ácido hialurónico y acabado mate.', como: '', texto: 'Envíos a toda Colombia · Bucaramanga', seg: '' }
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
    'palato': {
      '2026-09': {
        resumen: 'Mes histórico en reservaciones digitales. Los dos Reels gastronómicos superaron los 48,000 views orgánicos en el Bajío.',
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
          { nombre: 'Alcance en Guanajuato', valor: '18,500', comparativo: '+14%', positivo: true },
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

function verifyMasterPin(pin) {
  return (db.masterPin || MASTER_PIN) === pin.trim();
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

function loginAsTeam(pin) {
  if (verifyMasterPin(pin)) {
    state.currentRole = 'team';
    state.activeTab = 'parrilla';
    openPortalWorkspace();
    return { success: true };
  }
  return { success: false, message: 'PIN maestro incorrecto.' };
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
      roleBadge.textContent = 'Modo Equipo Apex (Master)';
      roleBadge.style.background = 'rgba(255, 77, 40, 0.2)';
      roleBadge.style.color = '#ff856b';
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
      <div class="kpi-tile" style="border-left:3px solid var(--apex-orange);">
        <div class="kpi-label">Total Piezas Planificadas</div>
        <div class="kpi-val">${piezasMes.length}</div>
        <div class="kpi-trend neutral">${pubCount} publicadas</div>
      </div>
      ${(clientResults.kpis || []).map((kpi, idx) => `
        <div class="kpi-tile">
          <div class="kpi-label">${escapeHtml(kpi.nombre)}</div>
          <div class="kpi-val">${escapeHtml(kpi.valor)}</div>
          <div class="kpi-trend ${kpi.positivo ? 'positive' : 'neutral'}">${escapeHtml(kpi.comparativo)}</div>
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
  const pais = prompt('País / Ciudad (ej. México (GTO) o Colombia (BGA)):', 'México');
  const pin = prompt('Código PIN de 4 dígitos para que el cliente ingrese:', '1234');
  const slug = nombre.toLowerCase().replace(/[^a-z0-9]/g, '');

  db.clientes.push({
    slug,
    nombre,
    sector: sector || 'Comercial',
    pais: pais || 'México',
    pin: pin || '1234',
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
}

// Inicialización de Eventos DOM al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  renderAuthSelectOptions();

  // Cambio de pestañas en autenticación
  const tabClientBtn = document.getElementById('authTabClient');
  const tabTeamBtn = document.getElementById('authTabTeam');
  const groupClientSelect = document.getElementById('authGroupClientSelect');
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
      if (pinLabel) pinLabel.textContent = 'Ingresa el PIN de tu Marca (4 dígitos)';
      if (authErrorMsg) authErrorMsg.hidden = true;
    });

    tabTeamBtn.addEventListener('click', () => {
      state.authMode = 'team';
      tabTeamBtn.classList.add('active');
      tabClientBtn.classList.remove('active');
      if (groupClientSelect) groupClientSelect.hidden = true;
      if (pinLabel) pinLabel.textContent = 'PIN Maestro del Equipo Apex';
      if (authErrorMsg) authErrorMsg.hidden = true;
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
        const res = loginAsTeam(pin);
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
  // ej. ?portal=1 o ?cliente=palato&pin=1234
  const urlParams = new URLSearchParams(window.location.search);
  const paramCliente = urlParams.get('cliente');
  const paramPin = urlParams.get('pin');
  const paramPortal = urlParams.get('portal');

  if (paramCliente && paramPin) {
    openPortalModal();
    loginAsClient(paramCliente, paramPin);
  } else if (paramPortal) {
    openPortalModal();
  }
});
