/* ==========================================================================
   APEX CREATIVO · MOTOR OPERATIVO & GESTOR DE DATOS
   Plataforma de Agencia Multicliente con Autenticación por PIN
   Datos compartidos en la nube (Firebase): lo que se edita se ve en cualquier dispositivo
   ========================================================================== */

'use strict';

const STORAGE_KEY = 'apex_creativo_db_v2'; // copia vieja guardada en cada navegador (ya no se usa; se conserva intacta)

// Miembros del equipo. Los PIN viven en la nube (no en este archivo).
const TEAM_MEMBERS = [
  // En la pantalla de acceso solo se muestra el código (no el nombre)
  { id: 'ale', codigo: 'APEX CEO1', nombre: 'Alejandra', rol: 'Dirección General & Estrategia' },
  { id: 'pablo', codigo: 'APEX CEO2', nombre: 'Pablo', rol: 'Dirección Operativa & Modelos' },
  { id: 'mitzi', codigo: 'APEX EQ1', nombre: 'Mitzi', rol: 'Levantamiento, Edición y Foto/Video' },
  { id: 'extra', codigo: 'APEX EQ2', nombre: 'Colaborador adicional', rol: 'Producción & Apoyo' }
];

// Proyecto de Firebase del portal. Estos datos son públicos por diseño:
// la seguridad la dan las reglas de Firestore y los PIN guardados en la nube.
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDevdQI20Fz7eh7AQqcGf9r8ZqFa3W_8Ig',
  authDomain: 'apex-creativo-portal.firebaseapp.com',
  projectId: 'apex-creativo-portal',
  storageBucket: 'apex-creativo-portal.firebasestorage.app',
  messagingSenderId: '456778205692',
  appId: '1:456778205692:web:1784044d39f93a593c8a79'
};
const FIREBASE_SDK_VERSION = '12.19.0';

// Datos públicos mínimos: solo la lista de acceso. Todo lo demás (parrilla, guiones,
// resultados y PIN) se carga desde la nube al ingresar con el PIN.
const DEFAULT_DATABASE = {
  version: '2.0',
  colaboradores: [],
  clientes: [
    {
      "slug": "tasca",
      "nombre": "La Tasca de la Paz",
      "sector": "Gastronomía Tradicional & Eventos",
      "pais": "México",
      "avatar": "🥘",
      "color": "#f59e0b"
    },
    {
      "slug": "palato",
      "nombre": "Restaurante Palato",
      "sector": "Gastronomía de Autor",
      "pais": "México",
      "avatar": "🍽️",
      "color": "#ff4d28"
    },
    {
      "slug": "elfaro",
      "nombre": "Restaurante & Micheladas El Faro",
      "sector": "Bares & Vida Nocturna",
      "pais": "México",
      "avatar": "🍻",
      "color": "#3b82f6"
    },
    {
      "slug": "canirac",
      "nombre": "CANIRAC",
      "sector": "Cámara Restaurantera Institucional",
      "pais": "México",
      "avatar": "🏛️",
      "color": "#10b981"
    },
    {
      "slug": "galerenas",
      "nombre": "Club Satélite Galereñas",
      "sector": "Impacto Social & Comunidad",
      "pais": "México",
      "avatar": "🤝",
      "color": "#8b5cf6"
    },
    {
      "slug": "blucare",
      "nombre": "Blucare",
      "sector": "Salud, Belleza & Cuidado Personal",
      "pais": "Colombia",
      "avatar": "✨",
      "color": "#ec4899"
    },
    {
      "slug": "hidrogeo",
      "nombre": "HidroGeo",
      "sector": "Modelos Matemáticos & Gestión del Agua",
      "pais": "México",
      "avatar": "💧",
      "color": "#06b6d4"
    }
  ],
  producciones: [],
  resultados: {}
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
  activeTab: 'resultados', // 'resultados' | 'planeacion' | 'parrilla' | 'produccion' | 'tareas' | 'ajustes' | 'pagos'
  
  // Calendario
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth(),
  selectedDayIso: '',
  
  // Editor de producción
  activeProdId: null,
  prodFilterStatus: '',
  
  // Tablero de tareas
  taskFilterAssignee: 'todos',
  
  // Resultados (mes elegido por cliente y edición en la página)
  resultsMonth: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
  mesResultados: {},
  kpiEditando: null,
  resumenEditando: false
};

// ==========================================================================
// INICIALIZACIÓN & GUARDADO (en la nube)
// ==========================================================================
function loadDatabase() {
  return JSON.parse(JSON.stringify(DEFAULT_DATABASE));
}

// Cada cambio se guarda en la nube (con una pequeña espera para agrupar lo que se escribe)
function saveDatabase() {
  db.updatedAt = new Date().toISOString();
  nubeProgramarGuardado();
  return true;
}

// ==========================================================================
// MÉTODOS DE AUTENTICACIÓN
// ==========================================================================
async function loginAsClient(slug, pin) {
  const pinLimpio = String(pin || '').trim();
  if (!slug || !pinLimpio) return { success: false, message: 'Selecciona tu marca e ingresa tu PIN.' };
  try {
    await nubeAbrirSesion({ rol: 'cliente', slug, pin: pinLimpio });
    await nubeCargarDatosConReintento();
  } catch (err) {
    console.warn('Acceso de cliente rechazado:', err);
    nube.sesion = null;
    return { success: false, message: nubeMensajeError(err, 'PIN incorrecto para este cliente.') };
  }
  state.currentRole = 'client';
  state.currentTeamMember = null;
  state.activeClientSlug = slug;
  state.activeTab = 'resultados';
  openPortalWorkspace();
  return { success: true };
}

async function loginAsTeam(memberId, pin) {
  const pinLimpio = String(pin || '').trim();
  const member = TEAM_MEMBERS.find(m => m.id === memberId);
  if (!member || !pinLimpio) return { success: false, message: 'Selecciona tu nombre e ingresa tu PIN.' };
  try {
    await nubeAbrirSesion({ rol: 'equipo', miembro: memberId, pin: pinLimpio });
    await nubeCargarDatosConReintento();
  } catch (err) {
    console.warn('Acceso de equipo rechazado:', err);
    nube.sesion = null;
    return { success: false, message: nubeMensajeError(err, 'PIN incorrecto para el colaborador seleccionado.') };
  }
  state.currentRole = 'team';
  state.currentTeamMember = member;
  if (!db.clientes.some(c => c.slug === state.activeClientSlug)) {
    state.activeClientSlug = db.clientes[0] ? db.clientes[0].slug : '';
  }
  state.activeTab = 'resultados';
  openPortalWorkspace();
  return { success: true };
}

async function logout() {
  try {
    if (nube.sesion) await nubeGuardarYa();
  } catch (err) {
    console.warn('No se pudieron guardar los últimos cambios:', err);
  }
  try {
    const user = nube.auth && nube.auth.currentUser;
    if (user && nube.fs) await nube.fs.collection('sesiones').doc(user.uid).delete();
  } catch (err) {
    console.warn('No se pudo cerrar la sesión en la nube:', err);
  }
  nube.sesion = null;
  nube.ultimo = {};
  nube.pinesEquipo = {};
  state.currentRole = null;
  state.currentTeamMember = null;
  db = loadDatabase();
  state.activeClientSlug = db.clientes[0] ? db.clientes[0].slug : 'palato';
  closePortalWorkspace();
  authLimpiarBusqueda();
  nubeCargarConfigPublica();
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
      nubeCargarConfigPublica();
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
      roleBadge.textContent = `Modo Equipo: ${state.currentTeamMember ? (state.currentTeamMember.codigo || state.currentTeamMember.nombre) : 'Apex'}`;
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
          `<option value="${c.slug}" ${c.slug === state.activeClientSlug ? 'selected' : ''}>${escapeHtml(c.nombre)} (${escapeHtml(c.pais)})</option>`
        ).join('') + `<option value="__NEW__">+ Agregar Nuevo Cliente...</option>`;
      }
    }
  }

  // 3. Encabezado de Cliente Activo
  const clientAvatarEl = document.getElementById('currentClientAvatar');
  const clientNameEl = document.getElementById('currentClientName');
  const clientSectorEl = document.getElementById('currentClientSector');
  if (clientAvatarEl) clientAvatarEl.textContent = inicialesCliente(activeClient.nombre);
  if (clientNameEl) clientNameEl.textContent = activeClient.nombre;
  if (clientSectorEl) clientSectorEl.textContent = `${activeClient.sector} · ${activeClient.pais}`;

  // 4. Pestañas visibles según rol
  const tabTareas = document.getElementById('tabBtnTareas');
  const tabAjustes = document.getElementById('tabBtnAjustes');
  if (tabTareas) tabTareas.hidden = state.currentRole !== 'team';
  if (tabAjustes) tabAjustes.hidden = state.currentRole !== 'team';

  // Si el cliente estaba en una pestaña de equipo, mandarlo a la primera pestaña (resultados)
  if (state.currentRole === 'client' && (state.activeTab === 'tareas' || state.activeTab === 'ajustes')) {
    state.activeTab = 'resultados';
  }

  // Activar botón de pestaña actual
  document.querySelectorAll('.portal-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === state.activeTab);
  });

  // Ocultar todos los paneles y mostrar el activo
  ['resultados', 'planeacion', 'parrilla', 'produccion', 'tareas', 'ajustes', 'pagos'].forEach(tabName => {
    const el = document.getElementById(`viewTab_${tabName}`);
    if (el) el.hidden = state.activeTab !== tabName;
  });

  // Renderizar contenido de la pestaña activa
  if (state.activeTab === 'parrilla') renderParrilla();
  if (state.activeTab === 'planeacion') renderPlaneacion();
  if (state.activeTab === 'pagos') renderPagos();
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
  const coloresDias = coloresCalendario(state.activeClientSlug, `${y}-${String(m + 1).padStart(2, '0')}`);
  const pintandoCal = modoPintar('cal');

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
    const colorDia = coloresDias[fechaIso] || '';

    gridHtml += `
      <div class="cal-cell ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''} ${colorDia ? 'has-color' : ''}" data-day="${fechaIso}" ${colorDia ? `style="--dia-color:${colorDia}"` : ''} onclick="clickDiaCalendario('${fechaIso}')">
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
  if (calBody) {
    calBody.innerHTML = gridHtml;
    calBody.classList.toggle('pintando', pintandoCal);
  }

  // Herramienta para colorear días (solo equipo)
  const calTools = document.getElementById('calColorTools');
  if (calTools) {
    calTools.innerHTML = state.currentRole === 'team'
      ? paletaColoresHtml('cal', 'Elige un color y toca los días. Si tocas un día con el mismo color, se lo quitas.')
      : '';
  }

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
        <h4 style="font-family:var(--font-display);font-size:16px;color:var(--text-strong);">📅 Contenido del ${formattedDate}</h4>
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
                <h5 style="color:var(--text-strong);font-size:15px;font-weight:600;">${escapeHtml(p.titulo || 'Sin título')}</h5>
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

  // Encabezado de la lista con el botón para agregar producciones (solo equipo)
  const headerLista = document.querySelector('#viewTab_produccion .sidebar-header');
  if (headerLista) {
    headerLista.style.display = 'flex';
    headerLista.style.alignItems = 'center';
    headerLista.style.justifyContent = 'space-between';
    headerLista.style.gap = '8px';
    headerLista.innerHTML = `
      <span class="mono" style="font-size:11px;color:var(--text-dim);text-transform:uppercase;">Producciones del Mes</span>
      ${state.currentRole === 'team' ? `<button class="btn btn-sm btn-primary" style="font-size:11px;padding:4px 10px;white-space:nowrap;" onclick="createProduction()" title="Agregar una nueva producción para este cliente">+ Agregar</button>` : ''}`;
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
        <h3 style="color:var(--text-strong);margin-bottom:12px;">Selecciona o crea una producción</h3>
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
        <h4 style="font-family:var(--font-display);font-size:15px;color:var(--text-strong);margin-bottom:2px;">
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
        <h3 style="font-family:var(--font-display);font-size:20px;color:var(--text-strong);margin-bottom:4px;">Tablero de Labores & Colaboradores</h3>
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
          <span>${client.nombre}</span>
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
// 4. MÓDULO RESULTADOS & MÉTRICAS (un reporte por mes)
// ==========================================================================
function mesActualIso() {
  const h = new Date();
  return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, '0')}`;
}

function nombreMes(iso) {
  const partes = String(iso || '').split('-').map(Number);
  if (!partes[0] || !partes[1]) return iso || '';
  return `${MESES_NOMBRES[partes[1] - 1]} ${partes[0]}`;
}

// Un documento del mes también guarda la planeación y los colores del calendario;
// solo cuenta como "reporte" si trae datos de resultados.
function tieneReporte(r) {
  if (!r) return false;
  return !!(String(r.resumen || '').trim() || (r.kpis || []).length || (r.imagenes || []).length ||
    r.detalle || r.tileFijo || r.plataformas);
}

function mesesConReporte(slug) {
  const delCliente = (db.resultados && db.resultados[slug]) || {};
  const meses = new Set(Object.keys(delCliente).filter(m => tieneReporte(delCliente[m])));
  Object.keys(reportesPlataformasDe(slug)).forEach(m => meses.add(m));
  return Array.from(meses).sort().reverse();
}

// Mes que se está viendo para el cliente activo (por defecto, el último con reporte)
function mesResultados(slug) {
  if (!state.mesResultados) state.mesResultados = {};
  const meses = mesesConReporte(slug);
  let mes = state.mesResultados[slug];
  if (!mes || (state.currentRole !== 'team' && meses.indexOf(mes) === -1)) mes = meses[0] || mesActualIso();
  state.mesResultados[slug] = mes;
  return mes;
}

// Meses del selector: los que tienen reporte y, para el equipo, los últimos 12 meses y el siguiente
function opcionesMeses(slug) {
  const meses = new Set(mesesConReporte(slug));
  if (state.currentRole === 'team') {
    const h = new Date();
    for (let i = -1; i < 12; i++) {
      const d = new Date(h.getFullYear(), h.getMonth() - i, 1);
      meses.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    meses.add(mesResultados(slug));
  }
  return Array.from(meses).sort().reverse();
}

function reporteMes(slug, mes, crear) {
  if (!db.resultados) db.resultados = {};
  if (!db.resultados[slug]) {
    if (!crear) return null;
    db.resultados[slug] = {};
  }
  if (!db.resultados[slug][mes]) {
    if (!crear) return null;
    db.resultados[slug][mes] = { resumen: '', kpis: [], imagenes: [] };
  }
  const r = db.resultados[slug][mes];
  if (!Array.isArray(r.kpis)) r.kpis = [];
  if (!Array.isArray(r.imagenes)) r.imagenes = [];
  return r;
}

// Si un mes se queda sin nada, se quita para que el cliente no vea un reporte vacío
function limpiarMesVacio(slug, mes) {
  const r = db.resultados[slug] && db.resultados[slug][mes];
  if (!r) return;
  const vacio = !tieneReporte(r) && !r.planeacion && !(r.calendarioColores && Object.keys(r.calendarioColores).length);
  if (vacio) {
    delete db.resultados[slug][mes];
    if (!Object.keys(db.resultados[slug]).length) delete db.resultados[slug];
  }
}

function enfocar(id) {
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.focus();
  }, 0);
}

function claseTendencia(kpi) {
  if (kpi.positivo === true) return 'positive';
  if (kpi.positivo === false) return 'negative';
  return 'neutral';
}

function formularioKpi(kpi, idx) {
  const k = kpi || { nombre: '', valor: '', comparativo: '', positivo: true };
  const tendencia = k.positivo === true ? 'sube' : (k.positivo === false ? 'baja' : 'neutral');
  const campo = 'display:block;width:100%;box-sizing:border-box;font-size:12px;padding:6px 8px;margin-bottom:8px;';
  return `
    <div class="kpi-tile" style="border:1px solid var(--apex-orange);">
      <label class="form-label" for="kpiNombre" style="display:block;font-size:10px;margin-bottom:3px;">Indicador</label>
      <input id="kpiNombre" class="form-control" style="${campo}" value="${escapeHtml(k.nombre)}" placeholder="Ej. Alcance · Instagram">
      <label class="form-label" for="kpiValor" style="display:block;font-size:10px;margin-bottom:3px;">Valor</label>
      <input id="kpiValor" class="form-control" style="${campo}" value="${escapeHtml(k.valor)}" placeholder="Ej. 21,052">
      <label class="form-label" for="kpiComparativo" style="display:block;font-size:10px;margin-bottom:3px;">Comparativo</label>
      <input id="kpiComparativo" class="form-control" style="${campo}" value="${escapeHtml(k.comparativo)}" placeholder="Ej. +12% vs mes anterior">
      ${idx === 'fijo' ? '' : `
      <label class="form-label" for="kpiTendencia" style="display:block;font-size:10px;margin-bottom:3px;">Tendencia</label>
      <select id="kpiTendencia" class="form-control" style="${campo}margin-bottom:8px;">
        <option value="sube" ${tendencia === 'sube' ? 'selected' : ''}>Sube (verde)</option>
        <option value="baja" ${tendencia === 'baja' ? 'selected' : ''}>Baja (rojo)</option>
        <option value="neutral" ${tendencia === 'neutral' ? 'selected' : ''}>Sin cambio (gris)</option>
      </select>`}
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">
        <button class="btn btn-sm btn-primary" style="font-size:11px;padding:4px 10px;" onclick="guardarKpi()">Guardar</button>
        <button class="btn btn-sm btn-secondary" style="font-size:11px;padding:4px 10px;" onclick="cancelarKpi()">Cancelar</button>
        ${idx !== 'nuevo' ? `<button class="btn btn-sm btn-secondary" style="font-size:11px;padding:4px 10px;color:#f87171;" onclick="borrarKpi('${idx}')">Eliminar</button>` : ''}
      </div>
    </div>`;
}

function renderResultados() {
  const container = document.getElementById('viewTab_resultados');
  if (!container) return;

  const slug = state.activeClientSlug;
  const esEquipo = state.currentRole === 'team';
  const conReporte = mesesConReporte(slug);

  if (!esEquipo && !conReporte.length) {
    container.innerHTML = `
      <div class="editor-card" style="text-align:center;padding:40px 20px;">
        <h3 style="font-family:var(--font-display);font-size:18px;color:var(--text-strong);margin-bottom:8px;">Todavía no hay reportes publicados</h3>
        <p style="font-size:13.5px;color:var(--text-muted);">Aquí verás tus resultados de cada mes en cuanto el equipo los publique.</p>
      </div>`;
    return;
  }

  const mes = mesResultados(slug);
  const reporte = reporteMes(slug, mes, false);
  const datos = reporte || { resumen: '', kpis: [], imagenes: [] };
  const plataformasCargadas = obtenerPlataformas(slug, mes);
  const plataformas = plataformasCargadas || (esEquipo ? plantillaPlataformas() : null);
  const esCEO = puedeEditarReporte();
  if (state.rpEditando && !(esCEO && state.rpEditando.slug === slug && state.rpEditando.mes === mes)) state.rpEditando = null;
  const edicion = state.rpEditando;
  const kpis = Array.isArray(datos.kpis) ? datos.kpis : [];
  const piezasMes = db.producciones.filter(p => p.clienteSlug === slug && (p.fecha || '').startsWith(mes));
  const pubCount = piezasMes.filter(p => p.estado === 'Publicado').length;
  const editando = state.kpiEditando;

  const selector = `
    <select class="form-control" style="width:auto;min-width:200px;font-size:13px;padding:6px 12px;" onchange="cambiarMesResultados(this.value)" aria-label="Mes del reporte" ${edicion ? 'disabled' : ''}>
      ${opcionesMeses(slug).map(m => `<option value="${m}" ${m === mes ? 'selected' : ''}>${nombreMes(m)}${esEquipo && conReporte.indexOf(m) === -1 ? ' · sin reporte' : ''}</option>`).join('')}
    </select>`;

  let tileFijo;
  if (datos.tileFijo && esEquipo && editando === 'fijo') {
    tileFijo = formularioKpi(datos.tileFijo, 'fijo');
  } else if (datos.tileFijo) {
    tileFijo = `
      <div class="kpi-tile" style="border-left:3px solid var(--apex-orange);">
        <div class="kpi-label">${escapeHtml(datos.tileFijo.nombre)}</div>
        <div class="kpi-val">${escapeHtml(datos.tileFijo.valor)}</div>
        <div class="kpi-trend neutral">${escapeHtml(datos.tileFijo.comparativo)}</div>
        ${esEquipo ? `<div style="margin-top:8px;"><button class="btn btn-sm btn-secondary" style="font-size:10px;padding:2px 6px;" onclick="editarKpi('fijo')">Editar</button></div>` : ''}
      </div>`;
  } else {
    tileFijo = `
      <div class="kpi-tile" style="border-left:3px solid var(--apex-orange);">
        <div class="kpi-label">Total Piezas Planificadas</div>
        <div class="kpi-val">${piezasMes.length}</div>
        <div class="kpi-trend neutral">${pubCount} publicadas</div>
      </div>`;
  }

  const tiles = kpis.map((kpi, idx) => {
    if (esEquipo && editando === idx) return formularioKpi(kpi, idx);
    return `
      <div class="kpi-tile">
        <div class="kpi-label">${escapeHtml(kpi.nombre)}</div>
        <div class="kpi-val">${escapeHtml(kpi.valor)}</div>
        <div class="kpi-trend ${claseTendencia(kpi)}">${escapeHtml(kpi.comparativo)}</div>
        ${esEquipo ? `<div style="margin-top:8px;"><button class="btn btn-sm btn-secondary" style="font-size:10px;padding:2px 6px;" onclick="editarKpi(${idx})">Editar</button></div>` : ''}
      </div>`;
  }).join('') + (esEquipo && editando === 'nuevo' ? formularioKpi(null, 'nuevo') : '');

  container.innerHTML = `
    <div class="results-header">
      <div>
        <h3 style="font-family:var(--font-display);font-size:20px;color:var(--text-strong);margin-bottom:4px;">Reporte de Resultados · ${nombreMes(mes)}</h3>
        <p style="font-size:13px;color:var(--text-muted);">Métricas verificadas de impacto, interacciones y conversiones para la marca.</p>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        ${selector}
        ${esEquipo && !plataformas ? `<button class="btn btn-sm btn-primary" onclick="agregarKpi()">+ Agregar Indicador</button>` : ''}
        ${esCEO && plataformas && !edicion ? `<button class="btn btn-sm btn-primary" onclick="rpIniciarEdicion()">✏️ Editar reporte</button>` : ''}
        ${edicion ? `<button class="btn btn-sm btn-secondary" onclick="rpCancelarEdicion()">Cancelar</button><button class="btn btn-sm btn-primary" onclick="rpGuardarEdicion()">Guardar cambios</button>` : ''}
      </div>
    </div>

    ${plataformas ? (edicion ? renderEditorPlataformas(edicion.datos, mes) : renderReportePlataformas(plataformas, mes, !plataformasCargadas)) : ''}

    ${esEquipo && !reporte && !plataformas ? `
      <div class="res-aviso">${nombreMes(mes)} todavía no tiene reporte. Lo que agregues aquí se guarda en la nube y el cliente lo verá al entrar.</div>
    ` : ''}

    <!-- Tarjetas de Métricas (formato anterior; se ocultan cuando hay reporte por plataforma) -->
    ${plataformas ? '' : `
    <div class="kpi-tiles-grid">
      ${tileFijo}
      ${tiles}
    </div>`}

    ${plataformas ? '' : renderDetalleResultados(datos.detalle)}
  `;
  rpCargarPortadas(container);
}

function cambiarMesResultados(mes) {
  state.rpEditando = null;
  if (!state.mesResultados) state.mesResultados = {};
  state.mesResultados[state.activeClientSlug] = mes;
  state.kpiEditando = null;
  state.resumenEditando = false;
  renderResultados();
}

function agregarKpi() {
  state.kpiEditando = 'nuevo';
  renderResultados();
  enfocar('kpiNombre');
}

function editarKpi(idx) {
  state.kpiEditando = idx;
  renderResultados();
  enfocar('kpiNombre');
}

function cancelarKpi() {
  state.kpiEditando = null;
  renderResultados();
}

function guardarKpi() {
  const valor = id => ((document.getElementById(id) || {}).value || '').trim();
  const nombre = valor('kpiNombre');
  if (!nombre) {
    alert('Escribe el nombre del indicador.');
    return;
  }
  const slug = state.activeClientSlug;
  const mes = mesResultados(slug);
  const r = reporteMes(slug, mes, true);
  const editando = state.kpiEditando;
  if (editando === 'fijo') {
    r.tileFijo = { nombre, valor: valor('kpiValor'), comparativo: valor('kpiComparativo') };
  } else {
    const kpi = { nombre, valor: valor('kpiValor'), comparativo: valor('kpiComparativo') };
    const tendencia = valor('kpiTendencia');
    if (tendencia === 'sube') kpi.positivo = true;
    else if (tendencia === 'baja') kpi.positivo = false;
    if (editando === 'nuevo') r.kpis.push(kpi);
    else if (typeof editando === 'number' && r.kpis[editando]) r.kpis[editando] = kpi;
  }
  state.kpiEditando = null;
  saveDatabase();
  renderResultados();
}

function borrarKpi(idx) {
  const slug = state.activeClientSlug;
  const mes = mesResultados(slug);
  const r = reporteMes(slug, mes, false);
  if (!r) return;
  if (idx === 'fijo') {
    if (!r.tileFijo || !confirm(`¿Eliminar el indicador "${r.tileFijo.nombre}"?`)) return;
    delete r.tileFijo;
  } else {
    const i = Number(idx);
    if (!r.kpis[i] || !confirm(`¿Eliminar el indicador "${r.kpis[i].nombre}"?`)) return;
    r.kpis.splice(i, 1);
  }
  state.kpiEditando = null;
  limpiarMesVacio(slug, mes);
  saveDatabase();
  renderResultados();
}

function editarResumen() {
  state.resumenEditando = true;
  renderResultados();
  enfocar('resumenTexto');
}

function cancelarResumen() {
  state.resumenEditando = false;
  renderResultados();
}

function guardarResumen() {
  const texto = ((document.getElementById('resumenTexto') || {}).value || '').trim();
  const slug = state.activeClientSlug;
  const mes = mesResultados(slug);
  const r = reporteMes(slug, mes, true);
  r.resumen = texto;
  state.resumenEditando = false;
  limpiarMesVacio(slug, mes);
  saveDatabase();
  renderResultados();
}

function verCaptura(idx) {
  const r = reporteMes(state.activeClientSlug, mesResultados(state.activeClientSlug), false);
  if (r && r.imagenes[idx]) openLightbox(r.imagenes[idx]);
}

function borrarCaptura(idx) {
  const slug = state.activeClientSlug;
  const mes = mesResultados(slug);
  const r = reporteMes(slug, mes, false);
  if (!r || !r.imagenes[idx]) return;
  if (!confirm('¿Quitar esta captura del reporte?')) return;
  r.imagenes.splice(idx, 1);
  limpiarMesVacio(slug, mes);
  saveDatabase();
  renderResultados();
}

function handleKpiImageUpload(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const slug = state.activeClientSlug;
  const mes = mesResultados(slug);

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
      reporteMes(slug, mes, true).imagenes.push(compressedDataUrl);
      saveDatabase();
      renderResultados();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
  input.value = '';
}

// Guarda lo pendiente y trae lo último de la nube (botón 🔄 Actualizar)
async function actualizarDesdeNube() {
  const btn = document.getElementById('btnActualizarNube');
  if (btn && btn.disabled) return;
  const texto = btn ? btn.textContent : '';
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Actualizando…';
  }
  try {
    await nubeGuardarYa();
    await nubeCargarDatosConReintento();
    state.kpiEditando = null;
    state.resumenEditando = false;
    if (state.currentRole) renderPortalWorkspace();
    nubeEstado('actualizado');
  } catch (err) {
    console.warn('No se pudo actualizar desde la nube:', err);
    if (String((err && err.code) || '').indexOf('permission-denied') !== -1) nubeSesionVencida();
    else nubeEstado('error-actualizar');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = texto;
    }
  }
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

  `;
}

// ==========================================================================
// 4b. REPORTE POR PLATAFORMA (Instagram, Facebook, TikTok, Google)
//     Los datos se capturan en reportes.js (o en la nube como reporte.plataformas)
// ==========================================================================
const PLATAFORMAS_INFO = [
  { id: 'instagram', nombre: 'Instagram', sigla: 'IG', clase: 'ig' },
  { id: 'facebook', nombre: 'Facebook', sigla: 'f', clase: 'fb' },
  { id: 'tiktok', nombre: 'TikTok', sigla: 'TT', clase: 'tt' },
  { id: 'google', nombre: 'Google', sigla: 'G', clase: 'gg' }
];

function reportesPlataformasDe(slug) {
  try {
    if (typeof REPORTES_PLATAFORMAS !== 'undefined' && REPORTES_PLATAFORMAS[slug]) return REPORTES_PLATAFORMAS[slug];
  } catch (e) { /* sin archivo de reportes */ }
  return {};
}

function plantillaPlataformas() {
  try { if (typeof plantillaReporte === 'function') return plantillaReporte(); } catch (e) { /* sin plantilla */ }
  return null;
}

// Primero lo guardado en la nube (reporte.plataformas); si no, lo capturado en reportes.js
function obtenerPlataformas(slug, mes) {
  const r = db.resultados && db.resultados[slug] && db.resultados[slug][mes];
  if (r && r.plataformas) return r.plataformas;
  return reportesPlataformasDe(slug)[mes] || null;
}

function mesAnteriorIso(mes) {
  const p = String(mes).split('-').map(Number);
  const d = new Date(p[0], p[1] - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function rpVacio(v) { return v === null || v === undefined || v === ''; }

function rpFormato(v, tipo) {
  if (rpVacio(v)) return '';
  if (typeof v !== 'number') return escapeHtml(String(v));
  if (tipo === 'porcentaje') return `${v.toLocaleString('es-MX', { maximumFractionDigits: 2 })}%`;
  if (tipo === 'calificacion') return `${v.toLocaleString('es-MX', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ★`;
  return v.toLocaleString('es-MX');
}

// Diferencia, % y dirección (sube / baja / igual / sin dato)
function rpComparar(m) {
  const tipo = m.tipo;
  let dif = null, pct = null, dir = 'nd';
  if (typeof m.actual === 'number' && typeof m.anterior === 'number') {
    const d = Math.round((m.actual - m.anterior) * 100) / 100;
    dir = d > 0 ? 'up' : (d < 0 ? 'down' : 'flat');
    const signo = d > 0 ? '+' : (d < 0 ? '−' : '');
    if (tipo === 'porcentaje') {
      dif = `${signo}${Math.abs(d).toLocaleString('es-MX', { maximumFractionDigits: 2 })} pts`;
    } else {
      dif = `${signo}${Math.abs(d).toLocaleString('es-MX', { maximumFractionDigits: 2 })}`;
      if (m.anterior > 0 && m.actual >= 0) { // % solo con base positiva
        const p = (d / Math.abs(m.anterior)) * 100;
        pct = `${p > 0 ? '+' : (p < 0 ? '−' : '')}${Math.abs(p).toLocaleString('es-MX', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
      }
    }
  }
  if (!rpVacio(m.diferencia)) dif = String(m.diferencia);
  if (!rpVacio(m.variacion)) pct = String(m.variacion);
  if (dir === 'nd' && pct) dir = /^[−-]/.test(pct) ? 'down' : (/^\+/.test(pct) ? 'up' : 'flat');
  return { dif, pct, dir };
}

function rpChip(c) {
  if (c.dir === 'nd' && !c.pct) return '<span class="rp-chip rp-chip-nd">Sin comparación</span>';
  const flecha = c.dir === 'up' ? '▲' : (c.dir === 'down' ? '▼' : '=');
  const texto = c.pct || c.dif || 'Sin cambio';
  const leyenda = c.dir === 'up' ? 'Aumento' : (c.dir === 'down' ? 'Disminución' : 'Sin cambio');
  return `<span class="rp-chip rp-chip-${c.dir}" title="${leyenda}"><span aria-hidden="true">${flecha}</span> ${escapeHtml(texto)}<span class="rp-sr"> (${leyenda})</span></span>`;
}

function rpValor(v, tipo) {
  return rpVacio(v) ? '<span class="rp-pend">Por completar</span>' : rpFormato(v, tipo);
}

// Línea de comparación: "+294.0% vs agosto (5,343)"
function rpLineaComparacion(m, etiqueta, mesAnt) {
  if (rpVacio(m.actual)) return '';
  const c = rpComparar(m);
  const cls = `rp-comp rp-comp-${c.dir === 'nd' ? 'nd' : c.dir}`;
  const ant = rpVacio(m.anterior) ? '' : rpFormato(m.anterior, m.tipo);
  let texto;
  if (m.tipo === 'porcentaje') {
    if (!ant) return `<p class="rp-comp rp-comp-nd">${escapeHtml(mesAnt)}: —</p>`;
    texto = `${escapeHtml(mesAnt)}: ${ant}${c.dif ? ` · ${escapeHtml(c.dif)}` : ''}`;
  } else if (c.pct && c.dif && typeof m.actual !== 'number') {
    texto = `${escapeHtml(c.dif)} (${escapeHtml(c.pct)}) vs ${escapeHtml(etiqueta)}`;
  } else if (c.pct) {
    texto = `${escapeHtml(c.pct)} vs ${escapeHtml(etiqueta)}${ant ? ` (${ant})` : ''}`;
  } else if (c.dif) {
    texto = `${escapeHtml(c.dif)} vs ${escapeHtml(etiqueta)}${ant ? ` (${ant})` : ''}`;
  } else {
    return `<p class="rp-comp rp-comp-nd">${escapeHtml(mesAnt)}: ${ant || '—'}</p>`;
  }
  const flecha = c.dir === 'up' ? '▲' : (c.dir === 'down' ? '▼' : '');
  const leyenda = c.dir === 'up' ? 'aumento' : (c.dir === 'down' ? 'disminución' : 'sin cambio');
  return `<p class="${cls}">${flecha ? `<span aria-hidden="true">${flecha}</span> ` : ''}${texto}<span class="rp-sr"> (${leyenda})</span></p>`;
}

function rpTarjeta(m, mesAnt, etiqueta, destacada) {
  const esGrupo = m.tipo === 'grupo';
  const sub = (m.sub || []).map(s => `
      <li class="rp-sub">
        <div class="rp-sub-fila">
          <span class="rp-sub-nombre">${escapeHtml(s.nombre)}</span>
          <span class="rp-sub-valor">${rpValor(s.actual, s.tipo)}</span>
        </div>
        ${s.sinComparacion ? '' : rpLineaComparacion(s, etiqueta, mesAnt)}
      </li>`).join('');
  return `
    <article class="rp-card${esGrupo ? ' rp-card-grupo' : ''}${destacada ? ' rp-card-destacada' : ''}">
      <h5 class="rp-card-label">${escapeHtml(m.nombre)}</h5>
      ${esGrupo ? '' : `
        <div class="rp-card-valor">${rpValor(m.actual, m.tipo)}</div>
        ${rpLineaComparacion(m, etiqueta, mesAnt)}`}
      ${sub ? `<ul class="rp-subs">${sub}</ul>` : ''}
      ${m.nota ? `<p class="rp-nota">${escapeHtml(m.nota)}</p>` : ''}
    </article>`;
}

// ---------- Principal contenido (Top 3) con link al video ----------
const RP_TOP_MAX = 3;
const RP_IFRAME_ANCHO = 340;   // ancho base de las vistas previas incrustadas
const RP_IFRAME_ALTO = 425;    // 4:5, igual que el recuadro de portada
const rpPortadasCache = new Map();

// Solo se aceptan links http(s)
function rpLinkSeguro(link) {
  try {
    const u = new URL(String(link || '').trim());
    return /^https?:$/.test(u.protocol) ? u.href : '';
  } catch (e) {
    return '';
  }
}

// Detecta la red del link y cómo mostrar su portada
function rpInfoVideo(link) {
  const seguro = rpLinkSeguro(link);
  if (!seguro) return null;
  const u = new URL(seguro);
  const host = u.hostname.replace(/^(www|m|mobile|web|vm|vt)\./, '');
  const ruta = u.pathname;
  if (/(^|\.)youtube\.com$/.test(host) || host === 'youtu.be') {
    let id = '';
    if (host === 'youtu.be') id = ruta.split('/')[1] || '';
    else if (u.searchParams.get('v')) id = u.searchParams.get('v');
    else {
      const m = ruta.match(/\/(shorts|embed|live)\/([A-Za-z0-9_-]{6,})/);
      if (m) id = m[2];
    }
    return { red: 'YouTube', link: seguro, img: id ? `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg` : '' };
  }
  if (/(^|\.)instagram\.com$/.test(host)) {
    const m = ruta.match(/\/(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
    if (!m) return { red: 'Instagram', link: seguro };
    const tipo = m[1] === 'reels' ? 'reel' : m[1];
    return { red: 'Instagram', link: seguro, embed: `https://www.instagram.com/${tipo}/${m[2]}/embed/` };
  }
  if (/(^|\.)tiktok\.com$/.test(host)) {
    const m = ruta.match(/\/(video|photo)\/(\d+)/);
    return { red: 'TikTok', link: seguro, oembed: `https://www.tiktok.com/oembed?url=${encodeURIComponent(seguro)}`, embed: m ? `https://www.tiktok.com/embed/v2/${m[2]}` : '' };
  }
  if (/(^|\.)facebook\.com$/.test(host) || host === 'fb.watch') {
    const esVideo = host === 'fb.watch' || /\/(videos|reel|watch)\b|\/share\/(r|v)\//.test(ruta);
    const plugin = esVideo ? 'video' : 'post';
    return { red: 'Facebook', link: seguro, embed: `https://www.facebook.com/plugins/${plugin}.php?href=${encodeURIComponent(seguro)}&show_text=false&width=${RP_IFRAME_ANCHO}` };
  }
  return { red: '', link: seguro };
}

// Contenido del recuadro de portada (la portada real se carga después con rpCargarPortadas)
function rpPortadaInterior(it, i, red, editando) {
  it = it || {};
  const link = rpLinkSeguro(it.link);
  const rank = `<span class="rp-top-rank">${i + 1}</span>`;
  if (link) {
    const etiqueta = `Ver el contenido ${i + 1} de ${red}${it.titulo ? ': ' + it.titulo : ''} (se abre en otra pestaña)`;
    return `${rank}
      <a class="rp-cover" href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(etiqueta)}">
        <span class="rp-cover-media" data-link="${escapeHtml(link)}" data-portada="${escapeHtml(it.portada || '')}"><span class="rp-cover-cargando">Cargando portada…</span></span>
        <span class="rp-top-play" aria-hidden="true">▶</span>
        <span class="rp-cover-ver" aria-hidden="true">Ver video ↗</span>
      </a>`;
  }
  if (it.portada) {
    return `${rank}<img src="${escapeHtml(it.portada)}" alt="Portada del contenido ${i + 1} de ${escapeHtml(red)}" loading="lazy" decoding="async" onclick="openLightbox(this.src)">`;
  }
  return `${rank}<span class="rp-top-vacio-texto">${editando ? 'Pega el link del video para ver su portada' : 'Portada por completar'}</span>`;
}

function rpTop(top, red) {
  if (!top) return '';
  const items = (top.items || []).slice(0, RP_TOP_MAX);
  while (items.length < RP_TOP_MAX) items.push({});
  return `
    <div class="rp-bloque">
      <div class="rp-bloque-head">
        <h5 class="rp-bloque-titulo">Principal contenido · Top ${RP_TOP_MAX}</h5>
        <span class="rp-bloque-meta">Según ${escapeHtml(top.criterio || 'visualizaciones')}</span>
      </div>
      <ol class="rp-top">
        ${items.map((it, i) => `
          <li class="rp-top-item">
            <div class="rp-top-portada${(rpLinkSeguro(it.link) || it.portada) ? '' : ' rp-top-portada-vacia'}">${rpPortadaInterior(it, i, red, false)}</div>
            <p class="rp-top-titulo">${it.titulo ? escapeHtml(it.titulo) : '<span class="rp-pend">Contenido por completar</span>'}</p>
            <p class="rp-top-valor">${it.valor ? escapeHtml(it.valor) : '<span class="rp-pend">Métrica por completar</span>'}</p>
            ${it.detalle ? `<p class="rp-top-detalle">${escapeHtml(it.detalle)}</p>` : ''}
          </li>`).join('')}
      </ol>
      ${top.nota ? `<p class="rp-nota">${escapeHtml(top.nota)}</p>` : ''}
    </div>`;
}

function rpEscalarIframe(caja) {
  const frame = caja.querySelector('iframe');
  if (!frame) return;
  const escala = caja.clientWidth / RP_IFRAME_ANCHO;
  if (escala > 0) frame.style.transform = `scale(${escala})`;
}

const rpObservadorTamano = typeof ResizeObserver === 'function'
  ? new ResizeObserver(entradas => entradas.forEach(e => rpEscalarIframe(e.target)))
  : null;

function rpPonerImagen(caja, src) {
  caja.innerHTML = `<img src="${escapeHtml(src)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">`;
  const img = caja.querySelector('img');
  img.addEventListener('error', () => rpPonerGenerica(caja), { once: true });
}

function rpPonerIframe(caja, src) {
  caja.innerHTML = `<iframe class="rp-cover-frame" src="${escapeHtml(src)}" loading="lazy" scrolling="no" tabindex="-1" aria-hidden="true" title="Vista previa del video" referrerpolicy="strict-origin-when-cross-origin" style="width:${RP_IFRAME_ANCHO}px;height:${RP_IFRAME_ALTO}px"></iframe>`;
  rpEscalarIframe(caja);
  if (rpObservadorTamano) rpObservadorTamano.observe(caja);
}

function rpPonerGenerica(caja) {
  const info = rpInfoVideo(caja.dataset.link) || {};
  caja.innerHTML = `<span class="rp-cover-generica"><span class="rp-cover-red">${escapeHtml(info.red || 'Video')}</span><span>Toca para ver el video</span></span>`;
}

async function rpPortadaTikTok(info) {
  if (rpPortadasCache.has(info.link)) return rpPortadasCache.get(info.link);
  let img = '';
  try {
    const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    const t = ctrl ? setTimeout(() => ctrl.abort(), 7000) : null;
    const res = await fetch(info.oembed, ctrl ? { signal: ctrl.signal } : {});
    if (t) clearTimeout(t);
    if (res.ok) {
      const json = await res.json();
      img = (json && json.thumbnail_url) || '';
    }
  } catch (e) {
    img = '';
  }
  rpPortadasCache.set(info.link, img);
  return img;
}

// Busca y muestra la portada de cada link dentro de `raiz`
function rpCargarPortadas(raiz) {
  if (!raiz) return;
  raiz.querySelectorAll('.rp-cover-media[data-link]').forEach(async caja => {
    if (caja.dataset.cargada === '1') return;
    caja.dataset.cargada = '1';
    const info = rpInfoVideo(caja.dataset.link);
    if (!info) return rpPonerGenerica(caja);
    if (caja.dataset.portada) return rpPonerImagen(caja, caja.dataset.portada);
    if (info.img) return rpPonerImagen(caja, info.img);
    if (info.oembed) {
      const img = await rpPortadaTikTok(info);
      if (!caja.isConnected) return;
      if (img) return rpPonerImagen(caja, img);
    }
    if (info.embed) return rpPonerIframe(caja, info.embed);
    rpPonerGenerica(caja);
  });
}

function rpEstrellas(n) {
  if (typeof n !== 'number') return '';
  const llenas = Math.max(0, Math.min(5, Math.round(n)));
  return `<span class="rp-estrellas" aria-label="${n} de 5 estrellas">${'★'.repeat(llenas)}<span>${'★'.repeat(5 - llenas)}</span></span>`;
}

function rpResenas(resenas) {
  if (!resenas) return '';
  const tarjeta = (r, tipo, titulo) => {
    r = r || {};
    const vacia = rpVacio(r.texto);
    return `
      <article class="rp-resena rp-resena-${tipo}">
        <h6>${titulo}</h6>
        ${vacia ? '<p class="rp-pend">Reseña por completar</p>' : `
          <div class="rp-resena-meta">${rpEstrellas(r.calificacion)} ${r.autor ? `<strong>${escapeHtml(r.autor)}</strong>` : ''} ${r.fecha ? `<span>${escapeHtml(r.fecha)}</span>` : ''}</div>
          <blockquote>${escapeHtml(r.texto)}</blockquote>`}
      </article>`;
  };
  return `
    <div class="rp-bloque">
      <div class="rp-bloque-head"><h5 class="rp-bloque-titulo">Reseñas destacadas del mes</h5></div>
      <div class="rp-resenas">
        ${tarjeta(resenas.positiva, 'pos', 'Reseña positiva destacada')}
        ${tarjeta(resenas.negativa, 'neg', 'Reseña negativa destacada')}
      </div>
    </div>`;
}

function rpPlataforma(info, p, mes) {
  p = p || {};
  const mesAnt = MESES_NOMBRES[Number(mesAnteriorIso(mes).split('-')[1]) - 1];
  const mesAct = MESES_NOMBRES[Number(String(mes).split('-')[1]) - 1];
  const metricas = p.metricas || [];
  return `
    <section class="rp-plataforma rp-${info.clase}" id="rp-${info.id}" aria-labelledby="rp-t-${info.id}">
      <header class="rp-plat-head">
        <span class="rp-plat-icono" aria-hidden="true">${info.sigla}</span>
        <div>
          <h4 id="rp-t-${info.id}">${info.nombre}</h4>
          <p class="rp-plat-periodo">
            <span><b>${mesAct}:</b> ${p.periodo ? escapeHtml(p.periodo) : 'periodo por completar'}</span>
            <span><b>Comparado con:</b> ${p.periodoAnterior ? escapeHtml(p.periodoAnterior) : 'mes anterior'}</span>
          </p>
        </div>
      </header>

      <div class="rp-cards">${metricas.map((m, i) => rpTarjeta(m, mesAnt, p.comparadoCon || mesAnt.toLowerCase(), i === 0)).join('')}</div>

      ${info.id === 'google' ? rpResenas(p.resenas) : rpTop(p.top, info.nombre)}
    </section>`;
}

function renderReportePlataformas(plataformas, mes, esPlantilla) {
  return `
    ${esPlantilla ? `<div class="res-aviso">Este cliente todavía no tiene métricas por plataforma para ${nombreMes(mes)}. ${puedeEditarReporte() ? 'Usa «✏️ Editar reporte» para capturarlas.' : 'El perfil APEX CEO1 puede capturarlas con «Editar reporte».'}</div>` : ''}
    <div class="rp-toolbar">
      <nav class="rp-saltos" aria-label="Ir a la plataforma">
        ${PLATAFORMAS_INFO.map(i => `<a href="#rp-${i.id}" class="rp-salto rp-salto-${i.clase}" onclick="event.preventDefault(); var el=document.getElementById('rp-${i.id}'); if(el) el.scrollIntoView({behavior:'smooth', block:'start'});">${i.nombre}</a>`).join('')}
      </nav>
    </div>
    <div class="rp-plataformas">
      ${PLATAFORMAS_INFO.map(i => rpPlataforma(i, plataformas[i.id], mes)).join('')}
    </div>`;
}

// ==========================================================================
// 1b. COLORES (calendario y planeación) + PESTAÑA PLANEACIÓN DEL MES
//     Se guardan en la nube dentro del documento del mes de cada cliente
//     (resultados/<cliente>__<AAAA-MM>): campos "planeacion" y "calendarioColores".
// ==========================================================================
const COLORES_CELDA = [
  { nombre: 'Sin color', hex: '' },
  { nombre: 'Rojo', hex: '#fde2e1' },
  { nombre: 'Naranja', hex: '#ffe2cc' },
  { nombre: 'Amarillo', hex: '#fff1b8' },
  { nombre: 'Verde', hex: '#d6f2df' },
  { nombre: 'Azul', hex: '#d8e8fb' },
  { nombre: 'Morado', hex: '#eadcf7' },
  { nombre: 'Rosa', hex: '#fbdaea' },
  { nombre: 'Gris', hex: '#e9e5ec' }
];
const PLAN_COLUMNAS_DEFAULT = ['Fecha', 'Tema / actividad', 'Notas'];
const PLAN_FILAS_INICIALES = 5;

function colorValido(hex) {
  return COLORES_CELDA.some(c => c.hex && c.hex === hex) ? hex : '';
}

function modoPintar(ambito) {
  return !!(state.pintar && state.pintar.ambito === ambito && state.currentRole === 'team');
}

function rerenderPintar(ambito) {
  if (ambito === 'cal') renderParrilla();
  else renderPlaneacion();
}

function activarPintar(ambito) {
  state.pintar = { ambito, color: COLORES_CELDA[3].hex };
  rerenderPintar(ambito);
}

function elegirColorPintar(hex) {
  if (!state.pintar) return;
  state.pintar.color = colorValido(hex);
  rerenderPintar(state.pintar.ambito);
}

function terminarPintar() {
  const ambito = state.pintar ? state.pintar.ambito : 'plan';
  state.pintar = null;
  rerenderPintar(ambito);
}

// Botón "Colorear" o, si está activo, la barra de colores
function paletaColoresHtml(ambito, instruccion) {
  const etiqueta = ambito === 'cal' ? 'Colorear días' : 'Colorear celdas';
  if (!modoPintar(ambito)) {
    return `<button type="button" class="btn btn-sm btn-secondary paleta-abrir" onclick="activarPintar('${ambito}')">🎨 ${etiqueta}</button>`;
  }
  const actual = state.pintar.color;
  return `
    <div class="paleta-barra" role="toolbar" aria-label="${etiqueta}">
      <span class="paleta-instr">${escapeHtml(instruccion)}</span>
      <div class="paleta-swatches">
        ${COLORES_CELDA.map(c => `
          <button type="button" class="swatch${c.hex ? '' : ' swatch-ninguno'}${actual === c.hex ? ' activo' : ''}"
            ${c.hex ? `style="background:${c.hex}"` : ''} title="${c.nombre}" aria-label="${c.nombre}" aria-pressed="${actual === c.hex}"
            onclick="elegirColorPintar('${c.hex}')"></button>`).join('')}
      </div>
      <button type="button" class="btn btn-sm btn-primary" onclick="terminarPintar()">Listo</button>
    </div>`;
}

// ---------- Calendario ----------
function coloresCalendario(slug, mes) {
  const r = db.resultados && db.resultados[slug] && db.resultados[slug][mes];
  return (r && r.calendarioColores) || {};
}

function clickDiaCalendario(fechaIso) {
  if (modoPintar('cal')) pintarDia(fechaIso);
  else selectDay(fechaIso);
}

function pintarDia(fechaIso) {
  const slug = state.activeClientSlug;
  const mes = fechaIso.slice(0, 7);
  const elegido = colorValido(state.pintar ? state.pintar.color : '');
  const actual = coloresCalendario(slug, mes)[fechaIso] || '';
  const nuevo = elegido === actual ? '' : elegido; // tocar de nuevo con el mismo color lo quita
  if (nuevo === actual) return;
  const r = reporteMes(slug, mes, true);
  const mapa = Object.assign({}, r.calendarioColores || {});
  if (nuevo) mapa[fechaIso] = nuevo;
  else delete mapa[fechaIso];
  if (Object.keys(mapa).length) r.calendarioColores = mapa;
  else delete r.calendarioColores;
  limpiarMesVacio(slug, mes);
  saveDatabase();
  renderParrilla();
}

// ---------- Planeación ----------
function planMesIso() {
  return `${state.calYear}-${String(state.calMonth + 1).padStart(2, '0')}`;
}

function planFilaNueva(id) {
  return { id: id || ('f' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)), textos: ['', '', ''], colores: ['', '', ''] };
}

function planFilasIniciales() {
  return Array.from({ length: PLAN_FILAS_INICIALES }, (_, i) => planFilaNueva('ini' + (i + 1)));
}

function planLeer(slug, mes) {
  const r = db.resultados && db.resultados[slug] && db.resultados[slug][mes];
  return (r && r.planeacion) || null;
}

function planNormalizar(plan) {
  if (!Array.isArray(plan.columnas)) plan.columnas = PLAN_COLUMNAS_DEFAULT.slice();
  for (let i = 0; i < 3; i++) if (typeof plan.columnas[i] !== 'string') plan.columnas[i] = PLAN_COLUMNAS_DEFAULT[i];
  plan.columnas = plan.columnas.slice(0, 3);
  if (!Array.isArray(plan.filas)) plan.filas = [];
  plan.filas.forEach(f => {
    if (!Array.isArray(f.textos)) f.textos = ['', '', ''];
    if (!Array.isArray(f.colores)) f.colores = ['', '', ''];
    for (let i = 0; i < 3; i++) {
      if (typeof f.textos[i] !== 'string') f.textos[i] = '';
      if (typeof f.colores[i] !== 'string') f.colores[i] = '';
    }
  });
  return plan;
}

// Devuelve la planeación del mes dentro de `db` (la crea si todavía no existe)
function planAsegurar() {
  const r = reporteMes(state.activeClientSlug, planMesIso(), true);
  if (!r.planeacion) r.planeacion = { columnas: PLAN_COLUMNAS_DEFAULT.slice(), filas: planFilasIniciales() };
  return planNormalizar(r.planeacion);
}

function planBuscarFila(plan, filaId) {
  return plan.filas.find(f => f.id === filaId) || null;
}

function planAutoAltura(el) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = (el.scrollHeight + 2) + 'px';
}

function planEditarCelda(el, filaId, col) {
  planAutoAltura(el);
  const plan = planAsegurar();
  const fila = planBuscarFila(plan, filaId);
  if (!fila) return;
  fila.textos[col] = el.value;
  saveDatabase();
}

function planEditarColumna(el, col) {
  const plan = planAsegurar();
  plan.columnas[col] = el.value;
  saveDatabase();
}

function planClickCelda(ev, filaId, col) {
  if (modoPintar('plan')) {
    planPintarCelda(filaId, col);
    return;
  }
  const area = ev.currentTarget.querySelector('textarea');
  if (area && ev.target !== area) area.focus();
}

function planPintarCelda(filaId, col) {
  const plan = planAsegurar();
  const fila = planBuscarFila(plan, filaId);
  if (!fila) return;
  const elegido = colorValido(state.pintar ? state.pintar.color : '');
  fila.colores[col] = fila.colores[col] === elegido ? '' : elegido;
  saveDatabase();
  renderPlaneacion();
}

function planAgregarFilas() {
  const sel = document.getElementById('planCantidadFilas');
  const n = Math.max(1, Math.min(20, Number(sel ? sel.value : 1) || 1));
  const plan = planAsegurar();
  const nuevas = Array.from({ length: n }, () => planFilaNueva());
  plan.filas.push(...nuevas);
  saveDatabase();
  renderPlaneacion();
  const primera = document.querySelector(`[data-fila="${nuevas[0].id}"] textarea`);
  if (primera) primera.focus();
}

function planInsertarDebajo(filaId) {
  const plan = planAsegurar();
  const i = plan.filas.findIndex(f => f.id === filaId);
  const nueva = planFilaNueva();
  plan.filas.splice(i === -1 ? plan.filas.length : i + 1, 0, nueva);
  saveDatabase();
  renderPlaneacion();
  const area = document.querySelector(`[data-fila="${nueva.id}"] textarea`);
  if (area) area.focus();
}

function planEliminarFila(filaId) {
  const plan = planAsegurar();
  const fila = planBuscarFila(plan, filaId);
  if (!fila) return;
  const conTexto = fila.textos.some(t => String(t || '').trim());
  if (conTexto && !confirm('¿Eliminar esta fila y su contenido?')) return;
  plan.filas = plan.filas.filter(f => f.id !== filaId);
  saveDatabase();
  renderPlaneacion();
}

function planCambiarMes(delta) {
  if (delta === 0) {
    const h = new Date();
    state.calYear = h.getFullYear();
    state.calMonth = h.getMonth();
  } else {
    state.calMonth += delta;
    if (state.calMonth < 0) { state.calMonth = 11; state.calYear--; }
    if (state.calMonth > 11) { state.calMonth = 0; state.calYear++; }
  }
  renderPlaneacion();
}

function renderPlaneacion() {
  const container = document.getElementById('viewTab_planeacion');
  if (!container) return;
  const esEquipo = state.currentRole === 'team';
  const slug = state.activeClientSlug;
  const mes = planMesIso();
  const guardada = planLeer(slug, mes);
  const plan = planNormalizar(guardada
    ? JSON.parse(JSON.stringify(guardada))
    : { columnas: PLAN_COLUMNAS_DEFAULT.slice(), filas: esEquipo ? planFilasIniciales() : [] });
  const pintando = modoPintar('plan');
  const titulo = `${MESES_NOMBRES[state.calMonth]} ${state.calYear}`;

  const encabezados = plan.columnas.map((c, i) => esEquipo
    ? `<th scope="col"><input class="plan-col-input" value="${escapeHtml(c)}" aria-label="Nombre de la columna ${i + 1}" oninput="planEditarColumna(this, ${i})" ${pintando ? 'readonly' : ''}></th>`
    : `<th scope="col">${escapeHtml(c)}</th>`).join('');

  const filas = plan.filas.map((f, n) => `
    <tr data-fila="${escapeHtml(f.id)}">
      <td class="plan-num">${n + 1}</td>
      ${[0, 1, 2].map(col => {
        const color = colorValido(f.colores[col]);
        const estilo = color ? ` style="background:${color}"` : '';
        if (!esEquipo) return `<td class="plan-celda"${estilo}><div class="plan-texto">${escapeHtml(f.textos[col])}</div></td>`;
        return `<td class="plan-celda"${estilo} onclick="planClickCelda(event, '${escapeHtml(f.id)}', ${col})">
          <textarea rows="1" aria-label="${escapeHtml(plan.columnas[col])}, fila ${n + 1}" oninput="planEditarCelda(this, '${escapeHtml(f.id)}', ${col})" ${pintando ? 'readonly tabindex="-1"' : ''}>${escapeHtml(f.textos[col])}</textarea>
        </td>`;
      }).join('')}
      ${esEquipo ? `
      <td class="plan-acc">
        <button type="button" class="plan-btn" title="Insertar fila debajo" aria-label="Insertar fila debajo de la fila ${n + 1}" onclick="planInsertarDebajo('${escapeHtml(f.id)}')">＋</button>
        <button type="button" class="plan-btn plan-btn-borrar" title="Eliminar fila" aria-label="Eliminar la fila ${n + 1}" onclick="planEliminarFila('${escapeHtml(f.id)}')">✕</button>
      </td>` : ''}
    </tr>`).join('');

  container.innerHTML = `
    <div class="results-header">
      <div>
        <h3 style="font-family:var(--font-display);font-size:20px;color:var(--text-strong);margin-bottom:4px;">Planeación del mes · ${titulo}</h3>
        <p style="font-size:13px;color:var(--text-muted);">Fechas, temas y pendientes del mes para la marca.</p>
      </div>
      <div class="cal-nav">
        <button class="btn btn-sm btn-secondary" onclick="planCambiarMes(-1)" aria-label="Mes anterior">‹</button>
        <div class="cal-title-display">${titulo}</div>
        <button class="btn btn-sm btn-secondary" onclick="planCambiarMes(1)" aria-label="Mes siguiente">›</button>
        <button class="btn btn-sm btn-secondary" onclick="planCambiarMes(0)">Hoy</button>
      </div>
    </div>

    ${esEquipo ? `
    <div class="plan-toolbar">
      <div class="plan-toolbar-izq">${paletaColoresHtml('plan', 'Elige un color y toca las celdas. Si tocas una celda con el mismo color, se lo quitas.')}</div>
      ${pintando ? '' : `
      <div class="plan-toolbar-der">
        <label for="planCantidadFilas" class="plan-label">Agregar</label>
        <select id="planCantidadFilas" class="form-control plan-select">
          <option value="1">1 fila</option>
          <option value="3">3 filas</option>
          <option value="5">5 filas</option>
          <option value="10">10 filas</option>
        </select>
        <button type="button" class="btn btn-sm btn-primary" onclick="planAgregarFilas()">+ Agregar filas</button>
      </div>`}
    </div>` : ''}

    ${(!esEquipo && !plan.filas.length) ? `
      <div class="editor-card" style="text-align:center;padding:40px 20px;">
        <h3 style="font-family:var(--font-display);font-size:18px;color:var(--text-strong);margin-bottom:8px;">Todavía no hay planeación para ${titulo}</h3>
        <p style="font-size:13.5px;color:var(--text-muted);">Aquí verás la planeación del mes en cuanto el equipo la publique.</p>
      </div>` : `
    <div class="plan-tabla-wrap">
      <table class="plan-tabla${pintando ? ' pintando' : ''}${esEquipo ? ' editable' : ''}">
        <colgroup>
          <col class="plan-col-num"><col class="plan-col-1"><col class="plan-col-2"><col class="plan-col-3">${esEquipo ? '<col class="plan-col-acc">' : ''}
        </colgroup>
        <thead><tr><th scope="col" class="plan-num">#</th>${encabezados}${esEquipo ? '<th scope="col" class="plan-acc"><span class="rp-sr">Acciones</span></th>' : ''}</tr></thead>
        <tbody>${filas || `<tr><td colspan="${esEquipo ? 5 : 4}" class="plan-vacia">Sin filas. Usa "+ Agregar filas".</td></tr>`}</tbody>
      </table>
    </div>
    ${esEquipo && !pintando ? `<button type="button" class="plan-agregar-linea" onclick="document.getElementById('planCantidadFilas').value='1'; planAgregarFilas();">+ Agregar fila</button>` : ''}`}
  `;
  container.querySelectorAll('.plan-celda textarea').forEach(planAutoAltura);
}

// ==========================================================================
// 4c. EDICIÓN DEL REPORTE DESDE EL PORTAL (solo perfil APEX CEO1 · Alejandra)
//     Lo guardado aquí va a la nube (reporte.plataformas) y tiene prioridad
//     sobre lo capturado en reportes.js.
// ==========================================================================
function puedeEditarReporte() {
  return state.currentRole === 'team' && !!state.currentTeamMember && state.currentTeamMember.id === 'ale';
}

// Asegura que el reporte tenga las 4 redes, 3 lugares de Top y las 2 reseñas
function rpCompletarEstructura(datos) {
  const base = plantillaPlataformas() || {};
  PLATAFORMAS_INFO.forEach(info => {
    if (!datos[info.id]) datos[info.id] = base[info.id] ? JSON.parse(JSON.stringify(base[info.id])) : { metricas: [] };
    const p = datos[info.id];
    if (!Array.isArray(p.metricas)) p.metricas = [];
    if (info.id === 'google') {
      if (!p.resenas) p.resenas = {};
      ['positiva', 'negativa'].forEach(k => { if (!p.resenas[k]) p.resenas[k] = { autor: null, calificacion: null, fecha: null, texto: null }; });
    } else {
      if (!p.top) p.top = { criterio: 'Visualizaciones', items: [] };
      if (!Array.isArray(p.top.items)) p.top.items = [];
      p.top.items = p.top.items.slice(0, RP_TOP_MAX);
      while (p.top.items.length < RP_TOP_MAX) p.top.items.push({ link: null, portada: null, titulo: null, valor: null, detalle: null });
    }
  });
  return datos;
}

function rpIniciarEdicion() {
  if (!puedeEditarReporte()) return;
  const slug = state.activeClientSlug;
  const mes = mesResultados(slug);
  const base = obtenerPlataformas(slug, mes) || plantillaPlataformas() || {};
  state.rpEditando = { slug, mes, datos: rpCompletarEstructura(JSON.parse(JSON.stringify(base))) };
  renderResultados();
}

function rpCancelarEdicion() {
  if (state.rpEditando && !confirm('¿Salir sin guardar los cambios del reporte?')) return;
  state.rpEditando = null;
  renderResultados();
}

function rpGuardarEdicion() {
  const ed = state.rpEditando;
  if (!ed || !puedeEditarReporte()) return;
  const r = reporteMes(ed.slug, ed.mes, true);
  r.plataformas = nubeLimpio(ed.datos);
  state.rpEditando = null;
  saveDatabase();
  renderResultados();
}

// "21,052" → 21052 · "70.3%" → 70.3 · "10 mil" se queda como texto · vacío → null
function rpLeerValor(texto) {
  const t = String(texto == null ? '' : texto).trim().replace(/−/g, '-');
  if (!t) return null;
  const sinPct = t.replace(/%$/, '').trim();
  if (/^[-+]?\d{1,3}(,\d{3})+(\.\d+)?$/.test(sinPct) || /^[-+]?\d+(\.\d+)?$/.test(sinPct)) return Number(sinPct.replace(/,/g, ''));
  return t;
}

function rpValorInput(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') return v.toLocaleString('es-MX', { maximumFractionDigits: 2 });
  return String(v);
}

function rpRuta(obj, ruta) {
  const partes = String(ruta).split('.');
  let o = obj;
  for (let i = 0; i < partes.length - 1; i++) {
    const k = /^\d+$/.test(partes[i]) ? Number(partes[i]) : partes[i];
    if (o[k] === null || o[k] === undefined) o[k] = /^\d+$/.test(partes[i + 1]) ? [] : {};
    o = o[k];
  }
  const ultima = partes[partes.length - 1];
  return [o, /^\d+$/.test(ultima) ? Number(ultima) : ultima];
}

// Guarda en la copia de trabajo lo que se escribe (sin volver a dibujar la página)
function rpEditar(el) {
  const ed = state.rpEditando;
  if (!ed || !el.dataset.ruta) return;
  const [obj, clave] = rpRuta(ed.datos, el.dataset.ruta);
  let v = el.value;
  if (el.dataset.tipo === 'num') v = rpLeerValor(v);
  else if (el.dataset.tipo === 'estrellas') v = v === '' ? null : Number(v);
  else v = String(v).trim() === '' ? null : v;
  obj[clave] = v;
  if (clave === 'link') {
    obj.portada = null; // la imagen anterior ya no corresponde al nuevo link
    rpProgramarVistaPrevia(el);
  }
}

const rpTimersVista = {};
function rpProgramarVistaPrevia(el) {
  const ruta = el.dataset.ruta;
  clearTimeout(rpTimersVista[ruta]);
  rpTimersVista[ruta] = setTimeout(() => {
    const ed = state.rpEditando;
    if (!ed) return;
    const m = ruta.match(/^(\w+)\.top\.items\.(\d+)\.link$/);
    if (!m) return;
    const caja = document.getElementById(`rpPrev_${m[1]}_${m[2]}`);
    const info = PLATAFORMAS_INFO.find(x => x.id === m[1]) || { nombre: '' };
    const item = ((ed.datos[m[1]] || {}).top || {}).items[Number(m[2])] || {};
    if (!caja) return;
    caja.classList.toggle('rp-top-portada-vacia', !rpLinkSeguro(item.link));
    caja.innerHTML = rpPortadaInterior(item, Number(m[2]), info.nombre, true);
    rpCargarPortadas(caja);
  }, 450);
}

function rpCampo(base, ruta, valor, opts) {
  opts = opts || {};
  return `<input class="rp-in${opts.cls ? ' ' + opts.cls : ''}" data-ruta="${base}.${ruta}"${opts.tipo ? ` data-tipo="${opts.tipo}"` : ''}
    type="${opts.type || 'text'}" value="${escapeHtml(rpValorInput(valor))}" placeholder="${escapeHtml(opts.ph || '')}"
    ${opts.label ? `aria-label="${escapeHtml(opts.label)}"` : ''} oninput="rpEditar(this)">`;
}

function rpTexto(base, ruta, valor, ph) {
  return `<textarea class="rp-in rp-in-area" data-ruta="${base}.${ruta}" placeholder="${escapeHtml(ph || '')}" oninput="rpEditar(this)">${escapeHtml(valor || '')}</textarea>`;
}

function rpEditorTarjeta(base, m, i, mesAct, mesAnt) {
  const grupo = m.tipo === 'grupo';
  const manual = !rpVacio(m.variacion) || !rpVacio(m.diferencia);
  const subs = (m.sub || []).map((s, j) => `
    <div class="rp-edit-sub">
      ${rpCampo(base, `metricas.${i}.sub.${j}.nombre`, s.nombre, { cls: 'rp-in-sub', label: 'Nombre del dato' })}
      <div class="rp-edit-grid">
        <label>${mesAct}${rpCampo(base, `metricas.${i}.sub.${j}.actual`, s.actual, { tipo: 'num' })}</label>
        <label>${mesAnt}${rpCampo(base, `metricas.${i}.sub.${j}.anterior`, s.anterior, { tipo: 'num' })}</label>
      </div>
    </div>`).join('');
  return `
    <article class="rp-card rp-card-edit${i === 0 ? ' rp-card-destacada' : ''}">
      ${rpCampo(base, `metricas.${i}.nombre`, m.nombre, { cls: 'rp-in-nombre', label: 'Nombre del indicador' })}
      ${grupo ? '' : `
      <div class="rp-edit-grid">
        <label>${mesAct}${rpCampo(base, `metricas.${i}.actual`, m.actual, { tipo: 'num', ph: 'Ej. 21,052' })}</label>
        <label>${mesAnt}${rpCampo(base, `metricas.${i}.anterior`, m.anterior, { tipo: 'num', ph: 'Ej. 5,343' })}</label>
      </div>
      <details class="rp-edit-mas"${manual ? ' open' : ''}>
        <summary>Variación manual (si la red solo da el %)</summary>
        <div class="rp-edit-grid">
          <label>Variación${rpCampo(base, `metricas.${i}.variacion`, m.variacion, { ph: 'Ej. +282%' })}</label>
          <label>Diferencia${rpCampo(base, `metricas.${i}.diferencia`, m.diferencia, { ph: 'Ej. −1.9 mil' })}</label>
        </div>
      </details>`}
      ${subs}
      <label class="rp-edit-nota">Nota (opcional)${rpTexto(base, `metricas.${i}.nota`, m.nota, 'Texto pequeño debajo del indicador')}</label>
    </article>`;
}

function rpEditorTop(base, top, red) {
  const items = (top.items || []).slice(0, RP_TOP_MAX);
  return `
    <div class="rp-bloque">
      <div class="rp-bloque-head">
        <h5 class="rp-bloque-titulo">Principal contenido · Top ${RP_TOP_MAX}</h5>
        <label class="rp-edit-inline">Según ${rpCampo(base, 'top.criterio', top.criterio, { ph: 'Visualizaciones' })}</label>
      </div>
      <ol class="rp-top rp-top-edit">
        ${items.map((it, i) => `
          <li class="rp-top-item">
            <div class="rp-top-portada${rpLinkSeguro(it.link) || it.portada ? '' : ' rp-top-portada-vacia'}" id="rpPrev_${base}_${i}">${rpPortadaInterior(it, i, red, true)}</div>
            <label>Link del video${rpCampo(base, `top.items.${i}.link`, it.link, { type: 'url', ph: 'https://www.instagram.com/reel/…' })}</label>
            <label>Título${rpCampo(base, `top.items.${i}.titulo`, it.titulo, { ph: 'Ej. Una michelada siempre es buena idea' })}</label>
            <label>Métrica${rpCampo(base, `top.items.${i}.valor`, it.valor, { ph: 'Ej. 1.7 mil visualizaciones' })}</label>
            <label>Detalle (opcional)${rpCampo(base, `top.items.${i}.detalle`, it.detalle, { ph: 'Ej. 21 me gusta · 4 reposts' })}</label>
          </li>`).join('')}
      </ol>
      <label class="rp-edit-nota">Nota (opcional)${rpTexto(base, 'top.nota', top.nota, 'Ej. TikTok muestra este ranking con 7 días')}</label>
    </div>`;
}

function rpEditorResenas(base, resenas) {
  const tarjeta = (k, tipo, titulo) => {
    const r = resenas[k] || {};
    return `
      <article class="rp-resena rp-resena-${tipo} rp-resena-edit">
        <h6>${titulo}</h6>
        <div class="rp-edit-grid rp-edit-grid-3">
          <label>Autor${rpCampo(base, `resenas.${k}.autor`, r.autor)}</label>
          <label>Calificación
            <select class="rp-in" data-ruta="${base}.resenas.${k}.calificacion" data-tipo="estrellas" onchange="rpEditar(this)">
              <option value="">—</option>
              ${[5, 4, 3, 2, 1].map(n => `<option value="${n}" ${Number(r.calificacion) === n ? 'selected' : ''}>${'★'.repeat(n)} (${n})</option>`).join('')}
            </select>
          </label>
          <label>Fecha${rpCampo(base, `resenas.${k}.fecha`, r.fecha, { ph: 'Ej. 12 sep 2026' })}</label>
        </div>
        <label class="rp-edit-nota">Reseña${rpTexto(base, `resenas.${k}.texto`, r.texto, 'Texto de la reseña')}</label>
      </article>`;
  };
  return `
    <div class="rp-bloque">
      <div class="rp-bloque-head"><h5 class="rp-bloque-titulo">Reseñas destacadas del mes</h5></div>
      <div class="rp-resenas">
        ${tarjeta('positiva', 'pos', 'Reseña positiva destacada')}
        ${tarjeta('negativa', 'neg', 'Reseña negativa destacada')}
      </div>
    </div>`;
}

function rpEditorPlataforma(info, p, mes) {
  const base = info.id;
  const mesAnt = MESES_NOMBRES[Number(mesAnteriorIso(mes).split('-')[1]) - 1];
  const mesAct = MESES_NOMBRES[Number(String(mes).split('-')[1]) - 1];
  return `
    <section class="rp-plataforma rp-${info.clase} editando" id="rp-${info.id}" aria-labelledby="rp-t-${info.id}">
      <header class="rp-plat-head">
        <span class="rp-plat-icono" aria-hidden="true">${info.sigla}</span>
        <div><h4 id="rp-t-${info.id}">${info.nombre}</h4></div>
      </header>
      <div class="rp-edit-periodos">
        <label>Periodo de ${mesAct}${rpCampo(base, 'periodo', p.periodo, { ph: 'Ej. 1 – 30 sep 2026' })}</label>
        <label>Se compara con${rpCampo(base, 'periodoAnterior', p.periodoAnterior, { ph: 'Ej. 1 – 31 ago 2026' })}</label>
        <label>Texto en las tarjetas ("vs …")${rpCampo(base, 'comparadoCon', p.comparadoCon, { ph: mesAnt.toLowerCase() })}</label>
      </div>
      <div class="rp-cards">${(p.metricas || []).map((m, i) => rpEditorTarjeta(base, m, i, mesAct, mesAnt)).join('')}</div>
      ${info.id === 'google' ? rpEditorResenas(base, p.resenas || {}) : rpEditorTop(base, p.top || { items: [] }, info.nombre)}
    </section>`;
}

function renderEditorPlataformas(datos, mes) {
  const cliente = db.clientes.find(c => c.slug === state.activeClientSlug) || {};
  return `
    <div class="res-aviso">Estás editando el reporte de ${nombreMes(mes)} de ${escapeHtml(cliente.nombre || '')}. Los números se escriben sin texto (ej. 21052 o 70.3); si la red solo da un valor redondeado, escríbelo como texto (ej. 10 mil). Al guardar, el cliente verá los cambios.</div>
    <div class="rp-toolbar">
      <nav class="rp-saltos" aria-label="Ir a la plataforma">
        ${PLATAFORMAS_INFO.map(i => `<a href="#rp-${i.id}" class="rp-salto rp-salto-${i.clase}" onclick="event.preventDefault(); var el=document.getElementById('rp-${i.id}'); if(el) el.scrollIntoView({behavior:'smooth', block:'start'});">${i.nombre}</a>`).join('')}
      </nav>
    </div>
    <div class="rp-plataformas">
      ${PLATAFORMAS_INFO.map(i => rpEditorPlataforma(i, datos[i.id] || {}, mes)).join('')}
    </div>
    <div class="rp-edit-barra" role="region" aria-label="Guardar reporte">
      <span>Editando · ${nombreMes(mes)}</span>
      <div>
        <button type="button" class="btn btn-sm btn-secondary" onclick="rpCancelarEdicion()">Cancelar</button>
        <button type="button" class="btn btn-sm btn-primary" onclick="rpGuardarEdicion()">Guardar cambios</button>
      </div>
    </div>`;
}

// ==========================================================================
// 1c. PESTAÑA PAGOS: tabla por cliente (4 columnas y 5 filas al inicio)
//     Se guarda en la nube en resultados/<cliente>__pagos (campo "pagos").
//     El equipo la edita; el cliente la ve en solo lectura.
// ==========================================================================
const PAGOS_CLAVE = 'pagos';
const PAGOS_COLUMNAS_DEFAULT = ['Fecha', 'Concepto', 'Monto', 'Estatus'];
const PAGOS_FILAS_INICIALES = 5;
const PAGOS_MAX_COLUMNAS = 10;

function pagosFilaNueva(n, id) {
  return { id: id || ('p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)), textos: Array.from({ length: n }, () => '') };
}

function pagosIniciales() {
  return {
    columnas: PAGOS_COLUMNAS_DEFAULT.slice(),
    filas: Array.from({ length: PAGOS_FILAS_INICIALES }, (_, i) => pagosFilaNueva(PAGOS_COLUMNAS_DEFAULT.length, 'pini' + (i + 1)))
  };
}

function pagosNormalizar(t) {
  if (!Array.isArray(t.columnas) || !t.columnas.length) t.columnas = PAGOS_COLUMNAS_DEFAULT.slice();
  t.columnas = t.columnas.map(c => (typeof c === 'string' ? c : ''));
  const n = t.columnas.length;
  if (!Array.isArray(t.filas)) t.filas = [];
  t.filas.forEach(f => {
    const previos = Array.isArray(f.textos) ? f.textos : [];
    f.textos = Array.from({ length: n }, (_, i) => (typeof previos[i] === 'string' ? previos[i] : ''));
  });
  return t;
}

function pagosLeer(slug) {
  const r = db.resultados && db.resultados[slug] && db.resultados[slug][PAGOS_CLAVE];
  return (r && r.pagos) || null;
}

// Devuelve la tabla de pagos del cliente dentro de `db` (la crea si no existe)
function pagosAsegurar() {
  const slug = state.activeClientSlug;
  if (!db.resultados) db.resultados = {};
  if (!db.resultados[slug]) db.resultados[slug] = {};
  if (!db.resultados[slug][PAGOS_CLAVE]) db.resultados[slug][PAGOS_CLAVE] = {};
  const r = db.resultados[slug][PAGOS_CLAVE];
  if (!r.pagos) r.pagos = pagosIniciales();
  return pagosNormalizar(r.pagos);
}

function pagosBuscarFila(t, filaId) {
  return t.filas.find(f => f.id === filaId) || null;
}

function pagosEditarCelda(el, filaId, col) {
  planAutoAltura(el);
  const t = pagosAsegurar();
  const fila = pagosBuscarFila(t, filaId);
  if (!fila || col >= t.columnas.length) return;
  fila.textos[col] = el.value;
  saveDatabase();
}

function pagosEditarColumna(el, col) {
  const t = pagosAsegurar();
  if (col >= t.columnas.length) return;
  t.columnas[col] = el.value;
  saveDatabase();
}

function pagosClickCelda(ev) {
  const area = ev.currentTarget.querySelector('textarea');
  if (area && ev.target !== area) area.focus();
}

function pagosAgregarFilas() {
  const sel = document.getElementById('pagosCantidadFilas');
  const n = Math.max(1, Math.min(20, Number(sel ? sel.value : 1) || 1));
  const t = pagosAsegurar();
  const nuevas = Array.from({ length: n }, () => pagosFilaNueva(t.columnas.length));
  t.filas.push(...nuevas);
  saveDatabase();
  renderPagos();
  const primera = document.querySelector(`#viewTab_pagos [data-fila="${nuevas[0].id}"] textarea`);
  if (primera) primera.focus();
}

function pagosInsertarDebajo(filaId) {
  const t = pagosAsegurar();
  const i = t.filas.findIndex(f => f.id === filaId);
  const nueva = pagosFilaNueva(t.columnas.length);
  t.filas.splice(i === -1 ? t.filas.length : i + 1, 0, nueva);
  saveDatabase();
  renderPagos();
  const area = document.querySelector(`#viewTab_pagos [data-fila="${nueva.id}"] textarea`);
  if (area) area.focus();
}

function pagosEliminarFila(filaId) {
  const t = pagosAsegurar();
  const fila = pagosBuscarFila(t, filaId);
  if (!fila) return;
  if (fila.textos.some(x => String(x || '').trim()) && !confirm('¿Eliminar esta fila y su contenido?')) return;
  t.filas = t.filas.filter(f => f.id !== filaId);
  saveDatabase();
  renderPagos();
}

function pagosAgregarColumna() {
  const t = pagosAsegurar();
  if (t.columnas.length >= PAGOS_MAX_COLUMNAS) {
    alert(`La tabla admite hasta ${PAGOS_MAX_COLUMNAS} columnas.`);
    return;
  }
  t.columnas.push('Nueva columna');
  t.filas.forEach(f => f.textos.push(''));
  saveDatabase();
  renderPagos();
  const inputs = document.querySelectorAll('#viewTab_pagos .plan-col-input');
  const ultimo = inputs[inputs.length - 1];
  if (ultimo) { ultimo.focus(); ultimo.select(); }
}

function pagosEliminarColumna(col) {
  const t = pagosAsegurar();
  if (t.columnas.length <= 1) {
    alert('La tabla necesita al menos una columna.');
    return;
  }
  const nombre = t.columnas[col] || `Columna ${col + 1}`;
  const conTexto = t.filas.some(f => String(f.textos[col] || '').trim());
  if (!confirm(conTexto ? `¿Eliminar la columna "${nombre}" y todo su contenido?` : `¿Eliminar la columna "${nombre}"?`)) return;
  t.columnas.splice(col, 1);
  t.filas.forEach(f => f.textos.splice(col, 1));
  saveDatabase();
  renderPagos();
}

function renderPagos() {
  const container = document.getElementById('viewTab_pagos');
  if (!container) return;
  const esEquipo = state.currentRole === 'team';
  const guardada = pagosLeer(state.activeClientSlug);
  const t = pagosNormalizar(guardada ? JSON.parse(JSON.stringify(guardada)) : (esEquipo ? pagosIniciales() : { columnas: PAGOS_COLUMNAS_DEFAULT.slice(), filas: [] }));
  const n = t.columnas.length;

  const encabezados = t.columnas.map((c, i) => esEquipo
    ? `<th scope="col">
        <div class="pagos-th">
          <input class="plan-col-input" value="${escapeHtml(c)}" aria-label="Nombre de la columna ${i + 1}" oninput="pagosEditarColumna(this, ${i})">
          <button type="button" class="pagos-col-borrar" title="Eliminar columna" aria-label="Eliminar la columna ${escapeHtml(c || String(i + 1))}" onclick="pagosEliminarColumna(${i})">✕</button>
        </div>
      </th>`
    : `<th scope="col">${escapeHtml(c)}</th>`).join('');

  const filas = t.filas.map((f, k) => `
    <tr data-fila="${escapeHtml(f.id)}">
      <td class="plan-num">${k + 1}</td>
      ${f.textos.map((txt, col) => esEquipo
        ? `<td class="plan-celda" onclick="pagosClickCelda(event)"><textarea rows="1" aria-label="${escapeHtml(t.columnas[col] || 'Columna ' + (col + 1))}, fila ${k + 1}" oninput="pagosEditarCelda(this, '${escapeHtml(f.id)}', ${col})">${escapeHtml(txt)}</textarea></td>`
        : `<td class="plan-celda"><div class="plan-texto">${escapeHtml(txt)}</div></td>`).join('')}
      ${esEquipo ? `
      <td class="plan-acc">
        <button type="button" class="plan-btn" title="Insertar fila debajo" aria-label="Insertar fila debajo de la fila ${k + 1}" onclick="pagosInsertarDebajo('${escapeHtml(f.id)}')">＋</button>
        <button type="button" class="plan-btn plan-btn-borrar" title="Eliminar fila" aria-label="Eliminar la fila ${k + 1}" onclick="pagosEliminarFila('${escapeHtml(f.id)}')">✕</button>
      </td>` : ''}
    </tr>`).join('');

  container.innerHTML = `
    <div class="results-header">
      <div>
        <h3 style="font-family:var(--font-display);font-size:20px;color:var(--text-strong);margin-bottom:4px;">Pagos</h3>
        <p style="font-size:13px;color:var(--text-muted);">Registro de pagos de la marca.</p>
      </div>
    </div>

    ${esEquipo ? `
    <div class="plan-toolbar">
      <div class="plan-toolbar-izq">
        <button type="button" class="btn btn-sm btn-secondary" onclick="pagosAgregarColumna()" ${n >= PAGOS_MAX_COLUMNAS ? 'disabled' : ''}>+ Agregar columna</button>
      </div>
      <div class="plan-toolbar-der">
        <label for="pagosCantidadFilas" class="plan-label">Agregar</label>
        <select id="pagosCantidadFilas" class="form-control plan-select">
          <option value="1">1 fila</option>
          <option value="3">3 filas</option>
          <option value="5">5 filas</option>
          <option value="10">10 filas</option>
        </select>
        <button type="button" class="btn btn-sm btn-primary" onclick="pagosAgregarFilas()">+ Agregar filas</button>
      </div>
    </div>` : ''}

    ${(!esEquipo && !t.filas.length) ? `
      <div class="editor-card" style="text-align:center;padding:40px 20px;">
        <h3 style="font-family:var(--font-display);font-size:18px;color:var(--text-strong);margin-bottom:8px;">Todavía no hay pagos registrados</h3>
        <p style="font-size:13.5px;color:var(--text-muted);">Aquí verás tus pagos en cuanto el equipo los registre.</p>
      </div>` : `
    <div class="plan-tabla-wrap">
      <table class="plan-tabla pagos-tabla${esEquipo ? ' editable' : ''}" style="min-width:${Math.max(560, 150 * n + (esEquipo ? 120 : 44))}px">
        <colgroup>
          <col class="plan-col-num">${t.columnas.map(() => '<col>').join('')}${esEquipo ? '<col class="plan-col-acc">' : ''}
        </colgroup>
        <thead><tr><th scope="col" class="plan-num">#</th>${encabezados}${esEquipo ? '<th scope="col" class="plan-acc"><span class="rp-sr">Acciones</span></th>' : ''}</tr></thead>
        <tbody>${filas || `<tr><td colspan="${n + (esEquipo ? 2 : 1)}" class="plan-vacia">Sin filas. Usa "+ Agregar filas".</td></tr>`}</tbody>
      </table>
    </div>
    ${esEquipo ? `<button type="button" class="plan-agregar-linea" onclick="document.getElementById('pagosCantidadFilas').value='1'; pagosAgregarFilas();">+ Agregar fila</button>` : ''}`}
  `;
  container.querySelectorAll('.plan-celda textarea').forEach(planAutoAltura);
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
      <h3 style="font-family:var(--font-display);font-size:20px;color:var(--text-strong);margin-bottom:6px;">Panel de Ajustes de la Agencia</h3>
      <p style="font-size:13px;color:var(--text-muted);margin-bottom:24px;">Administra tus clientes, contraseñas PIN, colaboradores del equipo y respaldos.</p>

      <!-- Gestor de Clientes -->
      <div class="editor-card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
          <h4 style="font-family:var(--font-display);font-size:16px;color:var(--text-strong);">Clientes Activos (${db.clientes.length})</h4>
          <button class="btn btn-sm btn-primary" onclick="addNewClientPrompt()">+ Agregar Cliente</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${db.clientes.map(c => `
            <div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg-surface-elevated);padding:10px 14px;border-radius:var(--radius-md);border:1px solid var(--border-subtle);flex-wrap:wrap;gap:8px;">
              <div>
                <strong style="color:var(--text-strong);font-size:14px;">${c.nombre}</strong>
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
          <h4 style="font-family:var(--font-display);font-size:16px;color:var(--text-strong);">Equipo & Colaboradores (${db.colaboradores.length})</h4>
          <button class="btn btn-sm btn-primary" onclick="addNewCollabPrompt()">+ Agregar Colaborador</button>
        </div>
        <p style="font-size:12.5px;color:var(--text-muted);margin-bottom:14px;">
          Como el equipo puede variar (Mitzi, Alexa, Influencers), puedes añadir o actualizar los roles aquí.
        </p>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${db.colaboradores.map((col, idx) => `
            <div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg-surface-elevated);padding:10px 14px;border-radius:var(--radius-md);border:1px solid var(--border-subtle);flex-wrap:wrap;gap:8px;">
              <div>
                <strong style="color:var(--text-strong);font-size:14px;">${col.nombre}</strong>
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
        <h4 style="font-family:var(--font-display);font-size:16px;color:var(--text-strong);margin-bottom:8px;">Respaldo y Seguridad de Datos</h4>
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
// NUBE · FIREBASE
// Todo lo que se edita en el portal se guarda aquí y se ve en cualquier
// navegador o dispositivo. Los PIN se verifican en la nube (reglas de Firestore),
// así que no están escritos en este archivo.
// ==========================================================================
const nube = {
  app: null,
  auth: null,
  fs: null,
  sesion: null,        // { rol: 'equipo', miembro } | { rol: 'cliente', slug }
  ultimo: {},          // ruta → documento tal como quedó en la nube (para guardar solo lo que cambia)
  pinesEquipo: {},     // PIN del equipo (solo se cargan en una sesión de equipo)
  timer: null,
  guardando: false,
  pendiente: false,
  promesa: null,
  ultimaCarga: 0
};
let nubeSdkPromesa = null;

// Carga el SDK de Firebase solo cuando se necesita (la página pública no lo descarga)
function nubeCargarSDK() {
  if (typeof firebase !== 'undefined' && firebase.auth && firebase.firestore) return Promise.resolve(true);
  if (nubeSdkPromesa) return nubeSdkPromesa;
  const base = `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/`;
  const cargar = archivo => new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = base + archivo;
    s.async = false;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('No se pudo cargar ' + archivo));
    document.head.appendChild(s);
  });
  nubeSdkPromesa = cargar('firebase-app-compat.js')
    .then(() => Promise.all([cargar('firebase-auth-compat.js'), cargar('firebase-firestore-compat.js')]))
    .then(() => true)
    .catch(err => {
      console.error('Firebase no disponible:', err);
      nubeSdkPromesa = null;
      return false;
    });
  return nubeSdkPromesa;
}

async function nubePreparar() {
  if (nube.app) return true;
  const ok = await nubeCargarSDK();
  if (!ok || typeof firebase === 'undefined') return false;
  try {
    try {
      nube.app = firebase.app();
    } catch (e) {
      nube.app = null;
    }
    if (!nube.app) nube.app = firebase.initializeApp(FIREBASE_CONFIG);
    nube.auth = firebase.auth();
    nube.fs = firebase.firestore();
    return true;
  } catch (err) {
    console.error('No se pudo iniciar Firebase:', err);
    nube.app = null;
    return false;
  }
}

function nubeEsperarUsuario() {
  return new Promise(resolve => {
    const quitar = nube.auth.onAuthStateChanged(user => {
      if (typeof quitar === 'function') quitar();
      resolve(user);
    });
  });
}

async function nubeUsuario() {
  let user = nube.auth.currentUser || await nubeEsperarUsuario();
  if (!user) user = (await nube.auth.signInAnonymously()).user;
  return user;
}

function nubeLimpio(v) {
  return JSON.parse(JSON.stringify(v === undefined ? null : v));
}

function nubeEstable(v) {
  if (Array.isArray(v)) return '[' + v.map(nubeEstable).join(',') + ']';
  if (v && typeof v === 'object') {
    return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + nubeEstable(v[k])).join(',') + '}';
  }
  return JSON.stringify(v === undefined ? null : v);
}

function nubeHuella(texto) {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36) + texto.length.toString(36);
}

function nubeMensajeError(err, mensajePin) {
  const code = err && err.code ? String(err.code) : '';
  if (code.indexOf('permission-denied') !== -1) return mensajePin;
  if (code === 'sin-nube') return 'No se pudo cargar la conexión con la nube. Revisa tu internet y recarga la página.';
  return 'No se pudo conectar con la nube. Revisa tu internet e intenta de nuevo.';
}

// Lista pública de clientes y colaboradores (para la pantalla de acceso)
function nubeAplicarConfig(cfg) {
  if (!cfg || !Array.isArray(cfg.clientes) || !cfg.clientes.length) return;
  db.version = cfg.version || db.version;
  db.clientes = cfg.clientes.map(c => Object.assign({}, c));
  db.colaboradores = Array.isArray(cfg.colaboradores) ? cfg.colaboradores : [];
}

async function nubeCargarConfigPublica() {
  if (!(await nubePreparar())) return;
  try {
    const snap = await nube.fs.collection('portal').doc('config').get();
    if (snap.exists && !nube.sesion && !state.currentRole) {
      const select = document.getElementById('authClientSelect');
      const elegido = select ? select.value : '';
      nubeAplicarConfig(snap.data());
      renderAuthSelectOptions();
      if (select && elegido && db.clientes.some(c => c.slug === elegido)) select.value = elegido;
    }
  } catch (err) {
    console.warn('No se pudo leer la lista de clientes de la nube:', err);
  }
}

async function nubeAbrirSesion(datos) {
  if (!(await nubePreparar())) {
    const e = new Error('Firebase no disponible');
    e.code = 'sin-nube';
    throw e;
  }
  const user = await nubeUsuario();
  const doc = { rol: datos.rol, pin: String(datos.pin || '').trim(), creado: new Date().toISOString() };
  if (datos.rol === 'cliente') doc.slug = datos.slug;
  else doc.miembro = datos.miembro;
  await nube.fs.collection('sesiones').doc(user.uid).set(doc);
  nube.sesion = datos.rol === 'cliente'
    ? { rol: 'cliente', slug: datos.slug }
    : { rol: 'equipo', miembro: datos.miembro };
}

// Trae de la nube todo lo que la sesión puede ver y lo deja en `db`
async function nubeCargarDatos() {
  const s = nube.sesion;
  if (!s) return;
  const equipo = s.rol === 'equipo';
  const col = nombre => nube.fs.collection(nombre);
  const [cfg, prod, res, img, pines] = await Promise.all([
    col('portal').doc('config').get(),
    (equipo ? col('producciones') : col('producciones').where('clienteSlug', '==', s.slug)).get(),
    (equipo ? col('resultados') : col('resultados').where('slug', '==', s.slug)).get(),
    (equipo ? col('imagenes') : col('imagenes').where('slug', '==', s.slug)).get(),
    equipo ? col('privado').doc('pines').get() : Promise.resolve(null)
  ]);

  const nuevo = loadDatabase();
  if (cfg.exists) {
    const c = cfg.data();
    if (Array.isArray(c.clientes) && c.clientes.length) nuevo.clientes = c.clientes.map(x => Object.assign({}, x));
    nuevo.colaboradores = Array.isArray(c.colaboradores) ? c.colaboradores : [];
    nuevo.version = c.version || nuevo.version;
  }

  const imagenes = {};
  img.forEach(d => { imagenes[d.id] = (d.data() || {}).data; });

  nuevo.producciones = [];
  prod.forEach(d => { nuevo.producciones.push(Object.assign({}, d.data(), { id: d.id })); });
  nuevo.producciones.sort((a, b) =>
    String(a.fecha || '').localeCompare(String(b.fecha || '')) || String(a.id).localeCompare(String(b.id)));

  nuevo.resultados = {};
  res.forEach(d => {
    const r = Object.assign({}, d.data());
    const slug = r.slug;
    const mes = r.mes;
    if (!slug || !mes) return;
    delete r.slug;
    delete r.mes;
    r.imagenes = (Array.isArray(r.imagenes) ? r.imagenes : [])
      .map(src => (typeof src === 'string' && src.indexOf('nube-img:') === 0) ? (imagenes[src.slice(9)] || null) : src)
      .filter(Boolean);
    if (!nuevo.resultados[slug]) nuevo.resultados[slug] = {};
    nuevo.resultados[slug][mes] = r;
  });

  nube.pinesEquipo = {};
  if (pines && pines.exists) {
    const p = pines.data() || {};
    nube.pinesEquipo = Object.assign({}, p.equipo || {});
    const pc = p.clientes || {};
    nuevo.clientes = nuevo.clientes.map(c => Object.assign({}, c, pc[c.slug] ? { pin: String(pc[c.slug]) } : {}));
  }

  db = nuevo;
  // Lo recién cargado es la referencia: después solo se guarda lo que cambie
  nube.ultimo = {};
  const docs = nubeConstruirDocs(db);
  Object.keys(docs).forEach(ruta => { nube.ultimo[ruta] = nubeLimpio(docs[ruta]); });
  nube.ultimaCarga = Date.now();
}

// Un rechazo justo después de abrir la sesión puede ser momentáneo: se reintenta una vez
async function nubeCargarDatosConReintento() {
  try {
    await nubeCargarDatos();
  } catch (err) {
    if (String((err && err.code) || '').indexOf('permission-denied') === -1) throw err;
    await new Promise(r => setTimeout(r, 900));
    await nubeCargarDatos();
  }
}

// Convierte `db` en los documentos que la sesión actual puede escribir
function nubeConstruirDocs(d) {
  const s = nube.sesion;
  const docs = {};
  if (!s) return docs;
  const equipo = s.rol === 'equipo';

  if (equipo) {
    if (Array.isArray(d.clientes) && d.clientes.length) {
      docs['portal/config'] = {
        version: d.version || '2.0',
        clientes: d.clientes.map(c => { const copia = Object.assign({}, c); delete copia.pin; return copia; }),
        colaboradores: d.colaboradores || []
      };
    }
    // Los PIN del equipo nunca se escriben vacíos (evita dejar al equipo sin acceso)
    if (Object.keys(nube.pinesEquipo || {}).length) {
      const pinesClientes = {};
      (d.clientes || []).forEach(c => { if (c.pin) pinesClientes[c.slug] = String(c.pin).trim(); });
      docs['privado/pines'] = { clientes: pinesClientes, equipo: Object.assign({}, nube.pinesEquipo) };
    }
  }

  (d.producciones || []).forEach(p => {
    if (p && p.id && (equipo || p.clienteSlug === s.slug)) docs['producciones/' + p.id] = p;
  });

  if (equipo) {
    Object.keys(d.resultados || {}).forEach(slug => {
      const meses = d.resultados[slug] || {};
      Object.keys(meses).forEach(mes => {
        const r = nubeLimpio(meses[mes] || {});
        r.imagenes = (Array.isArray(r.imagenes) ? r.imagenes : []).map(src => {
          if (typeof src === 'string' && src.indexOf('data:') === 0) {
            const id = 'img_' + nubeHuella(slug + '|' + mes + '|' + src);
            docs['imagenes/' + id] = { slug, mes, data: src };
            return 'nube-img:' + id;
          }
          return src;
        });
        r.slug = slug;
        r.mes = mes;
        docs['resultados/' + slug + '__' + mes] = r;
      });
    });
  }
  return docs;
}

function nubeProgramarGuardado() {
  if (!nube.sesion) return;
  clearTimeout(nube.timer);
  nube.timer = setTimeout(() => {
    nube.timer = null;
    nubeSincronizar();
  }, 900);
}

async function nubeGuardarYa() {
  if (nube.timer) {
    clearTimeout(nube.timer);
    nube.timer = null;
  }
  await nubeSincronizar();
}

async function nubeSincronizar() {
  if (!nube.sesion || !nube.fs) return;
  if (nube.guardando) {
    nube.pendiente = true;
    return nube.promesa;
  }
  nube.guardando = true;
  nube.pendiente = false;
  const trabajo = (async () => {
    const actuales = nubeConstruirDocs(db);
    const ops = [];
    Object.keys(actuales).forEach(ruta => {
      const nuevo = nubeLimpio(actuales[ruta]);
      const previo = nube.ultimo[ruta];
      if (!previo) {
        ops.push({ ruta, tipo: 'crear', doc: nuevo });
        return;
      }
      const claves = new Set(Object.keys(previo).concat(Object.keys(nuevo)));
      const cambiadas = Array.from(claves).filter(k => nubeEstable(previo[k]) !== nubeEstable(nuevo[k]));
      if (cambiadas.length) ops.push({ ruta, tipo: 'actualizar', doc: nuevo, campos: cambiadas });
    });
    if (nube.sesion.rol === 'equipo') {
      Object.keys(nube.ultimo).forEach(ruta => {
        if (!(ruta in actuales) && /^(producciones|resultados|imagenes)\//.test(ruta)) ops.push({ ruta, tipo: 'borrar' });
      });
    }
    if (!ops.length) return;

    nubeEstado('guardando');
    const resultados = await Promise.allSettled(ops.map(op => {
      const ref = nube.fs.doc(op.ruta);
      if (op.tipo === 'borrar') return ref.delete();
      if (op.tipo === 'crear') return ref.set(op.doc);
      const datos = {};
      op.campos.forEach(k => { datos[k] = (k in op.doc) ? op.doc[k] : firebase.firestore.FieldValue.delete(); });
      return ref.set(datos, { mergeFields: op.campos });
    }));
    let fallos = 0;
    resultados.forEach((r, i) => {
      const op = ops[i];
      if (r.status === 'fulfilled') {
        if (op.tipo === 'borrar') delete nube.ultimo[op.ruta];
        else nube.ultimo[op.ruta] = op.doc;
      } else {
        fallos++;
        console.error('No se pudo guardar en la nube:', op.ruta, r.reason);
      }
    });
    nubeEstado(fallos ? 'error' : 'guardado');
  })();
  nube.promesa = trabajo;
  try {
    await trabajo;
  } finally {
    nube.guardando = false;
    if (nube.pendiente) {
      nube.pendiente = false;
      await nubeSincronizar();
    }
  }
}

// Al volver a la pestaña o cambiar de sección se traen los cambios de los demás
async function nubeRefrescar(forzar) {
  if (!nube.sesion || nube.guardando || nube.timer) return;
  if (!forzar && Date.now() - nube.ultimaCarga < 15000) return;
  try {
    await nubeCargarDatosConReintento();
  } catch (err) {
    console.warn('No se pudo actualizar desde la nube:', err);
    if (err && String(err.code || '').indexOf('permission-denied') !== -1) nubeSesionVencida();
    return;
  }
  const activo = document.activeElement;
  const escribiendo = activo && /^(INPUT|TEXTAREA|SELECT)$/.test(activo.tagName);
  const editandoResultados = state.kpiEditando != null || state.resumenEditando || !!state.rpEditando;
  if (!escribiendo && !editandoResultados && state.currentRole) renderPortalWorkspace();
}

function nubeSesionVencida() {
  nube.sesion = null;
  nube.ultimo = {};
  nube.pinesEquipo = {};
  state.currentRole = null;
  state.currentTeamMember = null;
  db = loadDatabase();
  closePortalWorkspace();
  const msg = document.getElementById('authErrorMsg');
  if (msg) {
    msg.textContent = 'Tu sesión terminó. Vuelve a ingresar con tu PIN.';
    msg.hidden = false;
  }
  nubeCargarConfigPublica();
}

function nubeEstado(estado) {
  let el = document.getElementById('nubeEstado');
  if (!el) {
    el = document.createElement('div');
    el.id = 'nubeEstado';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:100000;padding:8px 14px;border-radius:999px;' +
      'font-size:12.5px;font-weight:600;box-shadow:0 6px 20px rgba(0,0,0,.35);transition:opacity .3s;pointer-events:none;opacity:0;';
    document.body.appendChild(el);
  }
  clearTimeout(el._t);
  const estilos = {
    guardando: ['Guardando en la nube…', '#441a46', '#f2e7f3'],
    guardado: ['Guardado en la nube ✓', '#065f46', '#d1fae5'],
    error: ['No se pudo guardar. Revisa tu conexión.', '#7f1d1d', '#fee2e2'],
    actualizado: ['Información al día ✓', '#065f46', '#d1fae5'],
    'error-actualizar': ['No se pudo actualizar. Revisa tu conexión.', '#7f1d1d', '#fee2e2']
  }[estado];
  if (!estilos) {
    el.style.opacity = '0';
    return;
  }
  el.textContent = estilos[0];
  el.style.background = estilos[1];
  el.style.color = estilos[2];
  el.style.opacity = '1';
  if (estado === 'guardado' || estado === 'actualizado') el._t = setTimeout(() => { el.style.opacity = '0'; }, 2200);
}

function nubeArranque() {
  // En app.html (portal directo) se conecta de inmediato; en index.html, al abrir el portal
  if (!document.getElementById('portalOverlay')) nubeCargarConfigPublica();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      if (nube.timer) nubeGuardarYa();
    } else {
      nubeRefrescar(false);
    }
  });
  window.addEventListener('focus', () => nubeRefrescar(false));
  window.addEventListener('pagehide', () => { if (nube.timer) nubeGuardarYa(); });
  window.addEventListener('beforeunload', e => {
    if (nube.timer || nube.guardando) {
      nubeGuardarYa();
      e.preventDefault();
      e.returnValue = '';
    }
  });
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
  // Clientes: ya no se muestra la lista; se busca al escribir (ver authBuscarClientes)
  const search = document.getElementById('authClientSearch');
  const lista = document.getElementById('authClientSugerencias');
  if (search && lista && !lista.hidden) authRenderSugerencias();
  const teamSelect = document.getElementById('authTeamSelect');
  if (teamSelect) {
    teamSelect.innerHTML = TEAM_MEMBERS.map(m =>
      `<option value="${m.id}">${escapeHtml(m.codigo || m.nombre)}</option>`
    ).join('');
  }
}

// Iniciales para el recuadro del cliente (en lugar de emoji)
function inicialesCliente(nombre) {
  const omitir = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'y', '&']);
  const palabras = String(nombre || '').split(/\s+/).filter(w => w && !omitir.has(w.toLowerCase()));
  if (!palabras.length) return '';
  const letras = palabras.length > 1 ? palabras[0][0] + palabras[1][0] : palabras[0].slice(0, 2);
  return letras.toUpperCase();
}

// ---------- Acceso de clientes: buscar la marca al escribir ----------
const BUSQUEDA_MIN = 3;
const authBusqueda = { activo: -1, opciones: [] };

function normalizarTexto(t) {
  return String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

// Coincide si cada palabra escrita es el inicio de una palabra del nombre (ej. "faro" → "El Faro")
function authBuscarClientes(texto) {
  const q = normalizarTexto(texto);
  const junto = q.replace(/\s/g, '');
  if (junto.length < BUSQUEDA_MIN) return [];
  const palabrasQ = q.split(' ');
  return db.clientes.filter(c => {
    const nombre = normalizarTexto(c.nombre);
    const palabras = nombre.split(' ');
    const porPalabras = palabrasQ.every(w => palabras.some(pal => pal.startsWith(w)));
    return porPalabras || (junto.length >= 4 && nombre.replace(/\s/g, '').includes(junto));
  }).slice(0, 5);
}

function authRenderSugerencias() {
  const input = document.getElementById('authClientSearch');
  const lista = document.getElementById('authClientSugerencias');
  if (!input || !lista) return;
  const largo = normalizarTexto(input.value).replace(/\s/g, '').length;
  const opciones = authBuscarClientes(input.value);
  authBusqueda.opciones = opciones;
  if (authBusqueda.activo >= opciones.length || authBusqueda.activo < 0) authBusqueda.activo = opciones.length ? 0 : -1;
  if (largo < BUSQUEDA_MIN) {
    authCerrarSugerencias();
    return;
  }
  lista.innerHTML = opciones.length
    ? opciones.map((c, i) => `
        <li role="option" id="authSug_${i}" class="auth-sug${i === authBusqueda.activo ? ' activo' : ''}" aria-selected="${i === authBusqueda.activo}"
          onmousedown="event.preventDefault(); authElegirCliente(${i})">
          <span class="auth-sug-nombre">${escapeHtml(c.nombre)}</span>
          <span class="auth-sug-pais">${escapeHtml(c.pais || '')}</span>
        </li>`).join('')
    : '<li class="auth-sug-vacio" role="option" aria-disabled="true">No encontramos una marca con ese nombre.</li>';
  lista.hidden = false;
  input.setAttribute('aria-expanded', 'true');
  if (authBusqueda.activo >= 0) input.setAttribute('aria-activedescendant', `authSug_${authBusqueda.activo}`);
  else input.removeAttribute('aria-activedescendant');
}

function authCerrarSugerencias() {
  const input = document.getElementById('authClientSearch');
  const lista = document.getElementById('authClientSugerencias');
  if (lista) {
    lista.hidden = true;
    lista.innerHTML = '';
  }
  if (input) {
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
  }
}

function authElegirCliente(i) {
  const c = authBusqueda.opciones[i];
  if (!c) return;
  const input = document.getElementById('authClientSearch');
  const oculto = document.getElementById('authClientSelect');
  if (input) {
    input.value = c.nombre;
    input.classList.add('elegido');
  }
  if (oculto) oculto.value = c.slug;
  authCerrarSugerencias();
  const err = document.getElementById('authErrorMsg');
  if (err) err.hidden = true;
  const pin = document.getElementById('authPinInput');
  if (pin) pin.focus();
}

// Devuelve el slug elegido; si no eligió pero solo hay una coincidencia, la toma
function authClienteElegido() {
  const oculto = document.getElementById('authClientSelect');
  if (oculto && oculto.value) return oculto.value;
  const input = document.getElementById('authClientSearch');
  const opciones = authBuscarClientes(input ? input.value : '');
  if (opciones.length === 1) {
    authBusqueda.opciones = opciones;
    authElegirCliente(0);
    return opciones[0].slug;
  }
  return '';
}

function authLimpiarBusqueda() {
  const input = document.getElementById('authClientSearch');
  const oculto = document.getElementById('authClientSelect');
  if (input) {
    input.value = '';
    input.classList.remove('elegido');
  }
  if (oculto) oculto.value = '';
  authBusqueda.activo = -1;
  authBusqueda.opciones = [];
  authCerrarSugerencias();
}

// Inicialización de Eventos DOM al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  renderAuthSelectOptions();
  nubeArranque();

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

  // Buscador de marca (acceso clientes)
  const authClientSearch = document.getElementById('authClientSearch');
  if (authClientSearch) {
    authClientSearch.addEventListener('input', () => {
      const oculto = document.getElementById('authClientSelect');
      if (oculto) oculto.value = '';
      authClientSearch.classList.remove('elegido');
      authBusqueda.activo = 0;
      authRenderSugerencias();
    });
    authClientSearch.addEventListener('focus', () => {
      const oculto = document.getElementById('authClientSelect');
      if (!(oculto && oculto.value)) authRenderSugerencias();
    });
    authClientSearch.addEventListener('blur', () => setTimeout(authCerrarSugerencias, 150));
    authClientSearch.addEventListener('keydown', (e) => {
      const lista = document.getElementById('authClientSugerencias');
      const abierta = lista && !lista.hidden && authBusqueda.opciones.length;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (!abierta) { authRenderSugerencias(); return; }
        e.preventDefault();
        const n = authBusqueda.opciones.length;
        authBusqueda.activo = (authBusqueda.activo + (e.key === 'ArrowDown' ? 1 : -1) + n) % n;
        authRenderSugerencias();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (abierta) authElegirCliente(Math.max(0, authBusqueda.activo));
        else if (authClienteElegido() && authPinInput) authPinInput.focus();
      } else if (e.key === 'Escape') {
        authCerrarSugerencias();
      }
    });
  }

  // Submit de autenticación
  if (authSubmitBtn && authPinInput) {
    authSubmitBtn.addEventListener('click', async () => {
      if (state.authMode === 'client' && !authClienteElegido()) {
        showAuthError('Escribe el nombre de tu marca y elígela de las opciones.');
        const buscador = document.getElementById('authClientSearch');
        if (buscador) buscador.focus();
        return;
      }
      const pin = authPinInput.value;
      if (!pin) {
        showAuthError('Por favor ingresa un código PIN.');
        return;
      }
      if (authSubmitBtn.disabled) return;
      const textoBoton = authSubmitBtn.textContent;
      authSubmitBtn.disabled = true;
      authSubmitBtn.textContent = 'Verificando PIN...';
      if (authErrorMsg) authErrorMsg.hidden = true;
      try {
        let res;
        if (state.authMode === 'client') {
          const slug = authClienteElegido();
          res = await loginAsClient(slug, pin);
        } else {
          const teamSelect = document.getElementById('authTeamSelect');
          const memberId = teamSelect ? teamSelect.value : TEAM_MEMBERS[0].id;
          res = await loginAsTeam(memberId, pin);
        }
        if (!res.success) showAuthError(res.message);
        else authPinInput.value = '';
      } finally {
        authSubmitBtn.disabled = false;
        authSubmitBtn.textContent = textoBoton;
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
      state.pintar = null;
      state.kpiEditando = null;
      state.resumenEditando = false;
      renderPortalWorkspace();
      nubeRefrescar(false);
    });
  });

  // Selector de cliente de equipo
  const clientSwitcherSelect = document.getElementById('clientSwitcherSelect');
  if (clientSwitcherSelect) {
    clientSwitcherSelect.addEventListener('change', (e) => {
      if (e.target.value === '__NEW__') {
        addNewClientPrompt();
      } else {
        if (state.rpEditando && !confirm('Tienes cambios sin guardar en el reporte. ¿Cambiar de cliente sin guardarlos?')) {
          e.target.value = state.activeClientSlug;
          return;
        }
        state.rpEditando = null;
        state.activeClientSlug = e.target.value;
        state.kpiEditando = null;
        state.resumenEditando = false;
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
    loginAsClient(paramCliente, paramPin).then(res => { if (!res.success) showAuthError(res.message); });
  } else if (paramTeam && paramPin) {
    openPortalModal();
    loginAsTeam(paramTeam, paramPin).then(res => { if (!res.success) showAuthError(res.message); });
  } else if (paramPortal) {
    openPortalModal();
  }
});
