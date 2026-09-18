const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  nativeImage,
  screen,
  ipcMain,
  dialog,
  shell,
  protocol,
} = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { pathToFileURL } = require('url');
const crypto = require('crypto');
const cleaner = require('./cleaner');
const llm = require('./llm');
const cutoutModel = require('./cutout-model');

const PET_W = 240;
const PET_H = 300;
const LOOK_W = 320;
const LOOK_H = 540;
const CARE_W = 300;
const CARE_H = 560;
const CHAT_W = 340;
const CHAT_H = 700;
const STATUS_W = 240;
const STATUS_H = 360;
const SAVE_FILE = 'pet-save.json';
const LIBRARY_FILE = 'look-library.json';
const ALLOWED_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp']);
const CUTOUT_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.bmp']);

let mainWindow = null;
let tray = null;
let isQuitting = false;
let panelMode = 'none'; // none | look | care | chat | status
let clickThrough = false;
let careState = {
  quiet: false,
  autoEnabled: true,
  remindWater: true,
  remindEyes: true,
  remindStretch: true,
  memo: '',
  pomodoroOn: false,
};

const CAPTURE_SHOTS = process.argv.includes('--capture-shots');
const CAPTURE_MENU = process.argv.includes('--capture-menu');
const CAPTURE_MODE = CAPTURE_SHOTS || CAPTURE_MENU;
/** Stable Run-key name (ASCII) so Chinese productName / Electron defaults don't create duplicates. */
const AUTOSTART_NAME = 'DesktopPet';
const AUTOSTART_LEGACY_NAMES = [
  AUTOSTART_NAME,
  '桌面宠物',
  'desktop-pet',
  'Electron',
];

if (CAPTURE_MODE) {
  app.disableHardwareAcceleration();
  app.setPath('userData', path.join(os.tmpdir(), 'desktop-pet-feature-shots'));
}

// Packaged autostart can register more than one Run entry (dev vs install path,
// productName vs package name). Without a single-instance lock, that yields two pets.
const gotTheLock = CAPTURE_MODE || app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.exit(0);
} else if (!CAPTURE_MODE) {
  app.on('second-instance', () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    if (!mainWindow.isVisible()) mainWindow.show();
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });
}

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'petskin',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      bypassCSP: true,
      stream: true,
    },
  },
]);

function savePath() {
  return path.join(app.getPath('userData'), SAVE_FILE);
}

function libraryPath() {
  return path.join(app.getPath('userData'), LIBRARY_FILE);
}

function customLooksDir() {
  return path.join(app.getPath('userData'), 'look-library');
}

function builtinLooksDir() {
  return path.join(__dirname, '..', 'assets', 'looks');
}

function loadSave() {
  try {
    return JSON.parse(fs.readFileSync(savePath(), 'utf8'));
  } catch {
    return null;
  }
}

function writeSave(data) {
  try {
    fs.mkdirSync(app.getPath('userData'), { recursive: true });
    fs.writeFileSync(savePath(), JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save:', err);
  }
}

function loadLibrary() {
  try {
    const data = JSON.parse(fs.readFileSync(libraryPath(), 'utf8'));
    return Array.isArray(data?.items) ? data.items : [];
  } catch {
    return [];
  }
}

function writeLibrary(items) {
  fs.mkdirSync(customLooksDir(), { recursive: true });
  fs.writeFileSync(
    libraryPath(),
    JSON.stringify({ items, updatedAt: Date.now() }, null, 2),
    'utf8',
  );
}

function resolveAppIcon(...relPaths) {
  for (const rel of relPaths) {
    const iconPath = path.join(__dirname, '..', rel);
    if (fs.existsSync(iconPath)) return iconPath;
  }
  return null;
}

function createTrayIcon() {
  const iconPath = resolveAppIcon('assets/tray.png', 'assets/icon.png');
  if (!iconPath) return nativeImage.createEmpty();
  const image = nativeImage.createFromPath(iconPath);
  if (image.isEmpty()) return nativeImage.createEmpty();
  const scale = screen.getPrimaryDisplay()?.scaleFactor || 1;
  const size = scale >= 1.5 ? 32 : 16;
  return image.resize({ width: size, height: size });
}

function clampToDisplay(x, y, w = PET_W, h = PET_H) {
  const point = { x: x + w / 2, y: y + h / 2 };
  const display = screen.getDisplayNearestPoint(point);
  const { workArea } = display;
  const maxX = workArea.x + workArea.width - w;
  const maxY = workArea.y + workArea.height - h;
  return {
    x: Math.min(Math.max(workArea.x, x), maxX),
    y: Math.min(Math.max(workArea.y, y), maxY),
    workArea,
  };
}

function currentSize() {
  if (panelMode === 'look') return { w: LOOK_W, h: LOOK_H };
  if (panelMode === 'care') return { w: CARE_W, h: CARE_H };
  if (panelMode === 'chat') return { w: CHAT_W, h: CHAT_H };
  if (panelMode === 'status') return { w: STATUS_W, h: STATUS_H };
  return { w: PET_W, h: PET_H };
}

/** Resize while keeping the pet's bottom-center anchored on screen. */
function setWindowSizeAnchored(w, h, fromBounds = null) {
  if (!mainWindow) return false;
  const prev = fromBounds || mainWindow.getBounds();
  const anchorX = prev.x + prev.width / 2;
  const anchorBottom = prev.y + prev.height;
  const nextX = Math.round(anchorX - w / 2);
  const nextY = Math.round(anchorBottom - h);
  const pos = clampToDisplay(nextX, nextY, w, h);
  mainWindow.setBounds({ x: pos.x, y: pos.y, width: w, height: h });
  return true;
}

function setPanelMode(mode) {
  if (!mainWindow) return false;
  const prev = mainWindow.getBounds();
  panelMode =
    mode === 'look' || mode === 'care' || mode === 'chat' || mode === 'status' ? mode : 'none';
  const { w, h } = currentSize();
  setWindowSizeAnchored(w, h, prev);
  return true;
}

function getChatConfig() {
  const saved = loadSave() || {};
  const builtin = llm.DEFAULT_ZHIPU_API_KEY;

  // One-time: wipe keys that leaked across providers from the shared password input,
  // and prefer free zhipu so UI no longer shows old doubao/deepseek "default" keys.
  if (!saved.chatKeyFieldsIsolatedV3) {
    try {
      writeSave({
        ...saved,
        chatProvider: 'zhipu',
        zhipuApiKey: '',
        doubaoApiKey: '',
        deepseekApiKey: '',
        doubaoEndpoint:
          typeof saved.doubaoEndpoint === 'string' ? saved.doubaoEndpoint : '',
        chatFreeProviderMigrated: true,
        chatKeyFieldsIsolatedV3: true,
        savedAt: Date.now(),
      });
    } catch {
      /* ignore */
    }
  }

  const fresh = loadSave() || {};
  let provider = llm.normalizeProvider(fresh.chatProvider || 'zhipu');

  let doubaoApiKey = typeof fresh.doubaoApiKey === 'string' ? fresh.doubaoApiKey.trim() : '';
  let deepseekApiKey =
    typeof fresh.deepseekApiKey === 'string' ? fresh.deepseekApiKey.trim() : '';
  let zhipuApiKey = typeof fresh.zhipuApiKey === 'string' ? fresh.zhipuApiKey.trim() : '';

  // Built-in key must never appear in any saved/UI slot
  if (doubaoApiKey === builtin) doubaoApiKey = '';
  if (deepseekApiKey === builtin) deepseekApiKey = '';
  if (zhipuApiKey === builtin) zhipuApiKey = '';

  return {
    provider,
    zhipuApiKey,
    deepseekApiKey,
    doubaoApiKey,
    doubaoEndpoint: typeof fresh.doubaoEndpoint === 'string' ? fresh.doubaoEndpoint : '',
  };
}

function resolveChatApiKey(cfg, provider) {
  const id = llm.normalizeProvider(provider);
  const field = llm.providerKeyField(id);
  const saved = cfg?.[field] || '';
  if (saved) return saved;
  // Only zhipu may fall back to the built-in free key
  if (id === 'zhipu') return llm.DEFAULT_ZHIPU_API_KEY;
  return '';
}

function setChatConfig(patch = {}) {
  const saved = loadSave() || {};
  const prev = getChatConfig();
  const builtin = llm.DEFAULT_ZHIPU_API_KEY;

  const nextZhipu =
    typeof patch.zhipuApiKey === 'string' ? patch.zhipuApiKey.trim() : prev.zhipuApiKey;
  let nextDeepseek =
    typeof patch.deepseekApiKey === 'string'
      ? patch.deepseekApiKey.trim()
      : prev.deepseekApiKey;
  let nextDoubao =
    typeof patch.doubaoApiKey === 'string' ? patch.doubaoApiKey.trim() : prev.doubaoApiKey;

  // Never persist built-in key into user-facing provider slots
  if (nextZhipu === builtin) {
    /* keep empty — runtime falls back via resolveChatApiKey */
  }
  if (nextDeepseek === builtin) nextDeepseek = '';
  if (nextDoubao === builtin) nextDoubao = '';

  const next = {
    ...saved,
    chatProvider: llm.normalizeProvider(
      patch.provider != null ? patch.provider : prev.provider,
    ),
    // Do not write the built-in key into save file
    zhipuApiKey: nextZhipu === builtin ? '' : nextZhipu,
    deepseekApiKey: nextDeepseek,
    doubaoApiKey: nextDoubao,
    doubaoEndpoint:
      typeof patch.doubaoEndpoint === 'string'
        ? patch.doubaoEndpoint.trim()
        : prev.doubaoEndpoint,
    savedAt: Date.now(),
  };
  writeSave(next);
  return getChatConfig();
}

function restoreWindowAfterMenu(savedBounds) {
  if (!mainWindow || mainWindow.isDestroyed() || !savedBounds) return;
  const { w, h } = currentSize();
  setWindowSizeAnchored(w, h, savedBounds);
  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  if (clickThrough) {
    mainWindow.setIgnoreMouseEvents(true, { forward: true });
  }
}

function setClickThrough(enabled) {
  clickThrough = !!enabled;
  if (!mainWindow) return false;
  if (clickThrough) {
    mainWindow.setIgnoreMouseEvents(true, { forward: true });
  } else {
    mainWindow.setIgnoreMouseEvents(false);
  }
  refreshMenus();
  return true;
}

function loginItemQuery() {
  return {
    path: process.execPath,
    args: [],
  };
}

function clearLegacyAutostartEntries() {
  // Older builds may have written extra Run values under productName / custom names.
  // Only clear those aliases — the default app entry is handled by setLoginItemSettings below.
  let defaultName = '';
  try {
    defaultName = app.getName() || '';
  } catch {
    defaultName = '';
  }
  for (const name of AUTOSTART_LEGACY_NAMES) {
    if (!name || name === defaultName) continue;
    try {
      app.setLoginItemSettings({
        openAtLogin: false,
        path: process.execPath,
        args: [],
        name,
      });
    } catch {
      /* ignore */
    }
  }
}

function isAutostartEnabled() {
  return !!app.getLoginItemSettings(loginItemQuery()).openAtLogin;
}

function setAutostart(enabled) {
  const want = !!enabled;
  clearLegacyAutostartEntries();
  // Use Electron's default registry value name (app.getName()). A custom `name`
  // made get/set disagree on Windows, so the UI never showed checked / persisted.
  app.setLoginItemSettings({
    openAtLogin: want,
    ...loginItemQuery(),
  });
  const on = isAutostartEnabled();
  refreshMenus();
  return on;
}

/** If a legacy duplicate entry is still enabled, collapse onto the default key. */
function normalizeAutostartRegistration() {
  if (CAPTURE_MODE || process.platform !== 'win32') return;
  let legacyOn = false;
  for (const name of AUTOSTART_LEGACY_NAMES) {
    try {
      if (app.getLoginItemSettings({ ...loginItemQuery(), name }).openAtLogin) {
        legacyOn = true;
        break;
      }
    } catch {
      /* ignore */
    }
  }
  if (legacyOn || isAutostartEnabled()) {
    setAutostart(true);
  }
}

async function snapToCorner(corner = 'bottom-right') {
  if (!mainWindow) return null;
  const { w, h } = currentSize();
  const b = mainWindow.getBounds();
  const display = screen.getDisplayNearestPoint({
    x: b.x + b.width / 2,
    y: b.y + b.height / 2,
  });
  const area = display.workArea;
  let x = area.x + area.width - w - 24;
  let y = area.y + area.height - h - 24;
  if (corner === 'bottom-left') {
    x = area.x + 24;
  } else if (corner === 'top-right') {
    y = area.y + 24;
  } else if (corner === 'top-left') {
    x = area.x + 24;
    y = area.y + 24;
  }
  const pos = clampToDisplay(x, y, w, h);
  mainWindow.setPosition(pos.x, pos.y);
  return pos;
}

function refreshMenus() {
  if (tray) tray.setContextMenu(buildTrayMenu());
}

function createWindow() {
  const saved = loadSave();
  const primary = screen.getPrimaryDisplay().workArea;
  let startX = primary.x + primary.width - PET_W - 40;
  let startY = primary.y + primary.height - PET_H - 40;

  if (saved?.window) {
    startX = saved.window.x ?? startX;
    startY = saved.window.y ?? startY;
  }

  const pos = clampToDisplay(startX, startY);

  const windowIcon = resolveAppIcon('assets/icon.png', 'assets/tray.png');
  mainWindow = new BrowserWindow({
    width: PET_W,
    height: PET_H,
    x: pos.x,
    y: pos.y,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    hasShadow: false,
    show: false,
    backgroundColor: '#00000000',
    ...(windowIcon ? { icon: windowIcon } : {}),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.showInactive();
  });

  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });
}

function sendAction(action) {
  mainWindow?.webContents.send('pet-action', action);
}

function buildPetContextMenuTemplate() {
  const login = isAutostartEnabled();
  return [
    { label: '摸摸', click: () => sendAction('pet') },
    { label: '喂食', click: () => sendAction('feed') },
    { label: '逗玩', click: () => sendAction('play') },
    { label: '跳舞', click: () => sendAction('dance') },
    { label: '蹦跳 / 空翻', click: () => sendAction(Math.random() > 0.5 ? 'jump' : 'flip') },
    { label: '疯跑一圈', click: () => sendAction('zoom') },
    { label: '睡觉', click: () => sendAction('sleep') },
    { label: '现在几点了', click: () => sendAction('tell-time') },
    { type: 'separator' },
    {
      label: '自由行动',
      type: 'checkbox',
      checked: careState.autoEnabled !== false,
      click: (item) => sendAction(item.checked ? 'wander-on' : 'wander-off'),
    },
    {
      label: '安静陪伴',
      type: 'checkbox',
      checked: !!careState.quiet,
      click: (item) => sendAction(item.checked ? 'quiet-on' : 'quiet-off'),
    },
    {
      label: '鼠标穿透',
      type: 'checkbox',
      checked: clickThrough,
      click: (item) => setClickThrough(item.checked),
    },
    {
      label: '开机自启',
      type: 'checkbox',
      checked: login,
      click: (item) => {
        const want = !!item.checked;
        const on = setAutostart(want);
        item.checked = on;
        if (want && !on) {
          sendAction('autostart-fail');
          return;
        }
        sendAction(on ? 'autostart-on' : 'autostart-off');
      },
    },
    { type: 'separator' },
    { label: '贴心助手', click: () => sendAction('toggle-care') },
    { label: 'AI 咨询', click: () => sendAction('toggle-chat') },
    { label: '清理垃圾', click: () => sendAction('clean-junk') },
    { label: '清理 C 盘', click: () => sendAction('clean-c-drive') },
    { label: '优化内存', click: () => sendAction('optimize-memory') },
    { label: '番茄钟 开始/停止', click: () => sendAction('pomodoro-toggle') },
    { label: '回到右下角', click: () => snapToCorner('bottom-right') },
    { label: '状态面板', click: () => sendAction('toggle-panel') },
    { label: '换形象 / 形象库', click: () => sendAction('change-look') },
    { type: 'separator' },
    { label: '隐藏', click: () => mainWindow?.hide() },
    {
      label: '退出',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ];
}

function popupPetContextMenu(position = null, { restore = true } = {}) {
  if (!mainWindow) return null;
  const savedBounds = { ...mainWindow.getBounds() };
  const menu = Menu.buildFromTemplate(buildPetContextMenuTemplate());
  if (restore) {
    // Windows may nudge frameless transparent windows when a native menu closes.
    menu.once('menu-will-close', () => {
      setImmediate(() => restoreWindowAfterMenu(savedBounds));
    });
  }
  const opts = { window: mainWindow };
  if (position && Number.isFinite(position.x) && Number.isFinite(position.y)) {
    opts.x = Math.round(position.x);
    opts.y = Math.round(position.y);
  }
  menu.popup(opts);
  return menu;
}

function buildTrayMenu() {
  const login = isAutostartEnabled();
  return Menu.buildFromTemplate([
    {
      label: '显示宠物',
      click: () => {
        if (!mainWindow) return;
        mainWindow.show();
        mainWindow.setAlwaysOnTop(true, 'screen-saver');
      },
    },
    { label: '隐藏宠物', click: () => mainWindow?.hide() },
    { type: 'separator' },
    {
      label: '自由行动',
      type: 'checkbox',
      checked: careState.autoEnabled !== false,
      click: (item) => sendAction(item.checked ? 'wander-on' : 'wander-off'),
    },
    {
      label: '安静陪伴',
      type: 'checkbox',
      checked: !!careState.quiet,
      click: (item) => sendAction(item.checked ? 'quiet-on' : 'quiet-off'),
    },
    {
      label: '鼠标穿透（不挡操作）',
      type: 'checkbox',
      checked: clickThrough,
      click: (item) => setClickThrough(item.checked),
    },
    {
      label: '开机自启',
      type: 'checkbox',
      checked: login,
      click: (item) => {
        const want = !!item.checked;
        const on = setAutostart(want);
        item.checked = on;
        if (want && !on) {
          sendAction('autostart-fail');
          return;
        }
        sendAction(on ? 'autostart-on' : 'autostart-off');
      },
    },
    { type: 'separator' },
    { label: '喂食', click: () => sendAction('feed') },
    { label: '逗玩', click: () => sendAction('play') },
    { label: '睡觉', click: () => sendAction('sleep') },
    { label: '现在几点了', click: () => sendAction('tell-time') },
    { type: 'separator' },
    { label: '贴心助手', click: () => sendAction('toggle-care') },
    { label: 'AI 咨询', click: () => sendAction('toggle-chat') },
    { label: '清理垃圾', click: () => sendAction('clean-junk') },
    { label: '清理 C 盘', click: () => sendAction('clean-c-drive') },
    { label: '优化内存', click: () => sendAction('optimize-memory') },
    { label: '番茄钟', click: () => sendAction('pomodoro-toggle') },
    { label: '回到右下角', click: () => snapToCorner('bottom-right') },
    { label: '状态面板', click: () => sendAction('toggle-panel') },
    { label: '换形象', click: () => sendAction('change-look') },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);
}

function createTray() {
  tray = new Tray(createTrayIcon());
  tray.setToolTip('桌面宠物');
  tray.setContextMenu(buildTrayMenu());
  tray.on('double-click', () => {
    if (!mainWindow) return;
    if (mainWindow.isVisible()) mainWindow.hide();
    else {
      mainWindow.show();
      mainWindow.setAlwaysOnTop(true, 'screen-saver');
    }
  });
}

function mimeFromExt(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return (
    {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.bmp': 'image/bmp',
      '.svg': 'image/svg+xml',
    }[ext] || 'application/octet-stream'
  );
}

function fileToDataUrl(filePath) {
  const buf = fs.readFileSync(filePath);
  return `data:${mimeFromExt(filePath)};base64,${buf.toString('base64')}`;
}

function resolveSkinPath(kind, id) {
  if (kind === 'builtin') {
    const safe = path.basename(String(id || ''));
    const root = path.resolve(builtinLooksDir());
    const file = path.resolve(root, safe);
    const rel = path.relative(root, file);
    if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return null;
    return fs.existsSync(file) ? file : null;
  }
  if (kind === 'custom') {
    const item = loadLibrary().find((x) => x.id === id);
    if (!item?.file) return null;
    const root = path.resolve(customLooksDir());
    const file = path.resolve(root, path.basename(item.file));
    const rel = path.relative(root, file);
    if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return null;
    return fs.existsSync(file) ? file : null;
  }
  return null;
}

function registerPetskinProtocol() {
  protocol.handle('petskin', async (request) => {
    try {
      const url = new URL(request.url);
      const kind = url.hostname;
      const id = decodeURIComponent((url.pathname || '').replace(/^\//, ''));
      const file = resolveSkinPath(kind, id);
      if (!file) {
        return new Response('Not Found', { status: 404 });
      }
      const body = fs.readFileSync(file);
      return new Response(body, {
        headers: {
          'Content-Type': mimeFromExt(file),
          'Cache-Control': 'no-cache',
        },
      });
    } catch (err) {
      return new Response(String(err), { status: 500 });
    }
  });
}

function resolveBuiltinRel(relPath) {
  const root = path.resolve(builtinLooksDir());
  const file = path.resolve(root, String(relPath || ''));
  const rel = path.relative(root, file);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return null;
  return fs.existsSync(file) ? file : null;
}

function loadLookAnimations(lookId) {
  const metaPath = path.join(builtinLooksDir(), 'index.json');
  let list = [];
  try {
    list = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  } catch {
    return {};
  }
  const item = list.find((x) => x.id === lookId);
  if (!item?.animations) return {};
  const out = {};
  for (const [key, cfg] of Object.entries(item.animations)) {
    const frames = [];
    for (const rel of cfg.files || []) {
      const file = resolveBuiltinRel(rel);
      if (!file) continue;
      try {
        frames.push(fileToDataUrl(file));
      } catch {
        /* skip */
      }
    }
    if (frames.length) {
      out[key] = { fps: cfg.fps || 8, frames };
    }
  }
  return out;
}

function getBuiltinLooks() {
  const metaPath = path.join(builtinLooksDir(), 'index.json');
  let list = [];
  try {
    list = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  } catch {
    list = [];
  }
  return list
    .map((item) => {
      const file = resolveSkinPath('builtin', item.file);
      if (!file) return null;
      let dataUrl = '';
      try {
        dataUrl = fileToDataUrl(file);
      } catch {
        return null;
      }
      const { animations: _animMeta, ...rest } = item;
      return {
        ...rest,
        source: 'builtin',
        thumbUrl: dataUrl,
        imageUrl: dataUrl,
        hasAnimations: !!item.animations,
      };
    })
    .filter(Boolean);
}

function getCustomLooks() {
  return loadLibrary()
    .map((item) => {
      const file = resolveSkinPath('custom', item.id);
      if (!file) return null;
      let dataUrl = '';
      try {
        dataUrl = fileToDataUrl(file);
      } catch {
        return null;
      }
      return {
        id: item.id,
        name: item.name || '自定义',
        source: 'custom',
        file: item.file,
        accent: item.accent || '#ff9a3c',
        greet: item.greet || ['换好啦！', '新衣服！', '喜欢吗？'],
        thumbUrl: dataUrl,
        imageUrl: dataUrl,
      };
    })
    .filter(Boolean);
}

async function importLooks(options = {}) {
  const wantCutout = !!options?.cutout;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: wantCutout ? '导入并抠图' : '导入宠物形象',
    properties: ['openFile', 'multiSelections'],
    filters: [
      {
        name: wantCutout ? '静图（可抠图）' : '图片',
        extensions: wantCutout
          ? ['png', 'jpg', 'jpeg', 'webp', 'bmp']
          : ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'],
      },
    ],
  });
  if (result.canceled || !result.filePaths.length) {
    return { ok: false, canceled: true, items: getCustomLooks() };
  }

  fs.mkdirSync(customLooksDir(), { recursive: true });
  const library = loadLibrary();
  const added = [];
  const cutoutIds = [];

  for (const src of result.filePaths) {
    const ext = path.extname(src).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) continue;
    if (wantCutout && !CUTOUT_EXT.has(ext)) continue;
    const id = `custom-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const fileName = `${id}${ext}`;
    const dest = path.join(customLooksDir(), fileName);
    fs.copyFileSync(src, dest);
    const base = path.basename(src, ext);
    const item = {
      id,
      name: base.slice(0, 20) || '自定义',
      file: fileName,
      accent: '#ff9a3c',
      createdAt: Date.now(),
    };
    library.unshift(item);
    added.push(item);
    if (wantCutout && CUTOUT_EXT.has(ext)) cutoutIds.push(id);
    // ensure unique ids when importing many in the same ms
    await new Promise((r) => setTimeout(r, 2));
  }

  writeLibrary(library);
  return {
    ok: true,
    addedCount: added.length,
    cutoutIds,
    items: getCustomLooks(),
  };
}

function deleteCustomLook(id) {
  const library = loadLibrary();
  const item = library.find((x) => x.id === id);
  if (!item) return { ok: false, items: getCustomLooks() };
  const file = path.join(customLooksDir(), path.basename(item.file));
  try {
    if (fs.existsSync(file)) fs.unlinkSync(file);
  } catch {
    /* ignore */
  }
  writeLibrary(library.filter((x) => x.id !== id));
  return { ok: true, items: getCustomLooks() };
}

/**
 * Replace a custom look file with a PNG buffer (after cutout).
 * @param {string} id
 * @param {ArrayBuffer|Buffer|Uint8Array} pngBytes
 */
function replaceLookPng(id, pngBytes) {
  const library = loadLibrary();
  const idx = library.findIndex((x) => x.id === id);
  if (idx < 0) return { ok: false, error: '形象不存在', items: getCustomLooks() };

  const item = library[idx];
  const dir = customLooksDir();
  const oldFile = path.join(dir, path.basename(item.file));
  const newName = `${id}.png`;
  const newFile = path.join(dir, newName);
  const buf = Buffer.isBuffer(pngBytes)
    ? pngBytes
    : Buffer.from(pngBytes instanceof ArrayBuffer ? new Uint8Array(pngBytes) : pngBytes);

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(newFile, buf);
  if (oldFile !== newFile && fs.existsSync(oldFile)) {
    try {
      fs.unlinkSync(oldFile);
    } catch {
      /* ignore */
    }
  }

  library[idx] = { ...item, file: newName, cutoutAt: Date.now() };
  writeLibrary(library);
  return { ok: true, items: getCustomLooks() };
}

function lookSupportsCutout(id) {
  const item = loadLibrary().find((x) => x.id === id);
  if (!item) return false;
  const ext = path.extname(item.file).toLowerCase();
  return CUTOUT_EXT.has(ext) || ext === '.png';
}

function registerIpc() {
  ipcMain.handle('get-save', () => loadSave());

  ipcMain.handle('save-state', (_e, data) => {
    const prev = loadSave() || {};
    const bounds = mainWindow?.getBounds();
    const builtin = llm.DEFAULT_ZHIPU_API_KEY;
    const scrub = (v) => {
      const s = typeof v === 'string' ? v.trim() : '';
      return s && s !== builtin ? s : '';
    };
    writeSave({
      ...prev,
      ...data,
      // Keep secrets managed by dedicated IPC if renderer omits them
      chatProvider:
        typeof data?.chatProvider === 'string'
          ? llm.normalizeProvider(data.chatProvider)
          : prev.chatProvider || 'zhipu',
      zhipuApiKey: scrub(
        typeof data?.zhipuApiKey === 'string' ? data.zhipuApiKey : prev.zhipuApiKey,
      ),
      deepseekApiKey: scrub(
        typeof data?.deepseekApiKey === 'string' ? data.deepseekApiKey : prev.deepseekApiKey,
      ),
      doubaoApiKey: scrub(
        typeof data?.doubaoApiKey === 'string' ? data.doubaoApiKey : prev.doubaoApiKey,
      ),
      doubaoEndpoint:
        typeof data?.doubaoEndpoint === 'string'
          ? data.doubaoEndpoint
          : prev.doubaoEndpoint || '',
      window: bounds ? { x: bounds.x, y: bounds.y } : data.window || prev.window,
      savedAt: Date.now(),
    });
    return true;
  });

  ipcMain.handle('get-work-area', () => {
    const bounds = mainWindow?.getBounds() || { x: 0, y: 0, width: PET_W, height: PET_H };
    return screen.getDisplayNearestPoint({
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2,
    }).workArea;
  });

  ipcMain.handle('get-bounds', () => mainWindow?.getBounds() || null);
  ipcMain.handle('get-cursor', () => screen.getCursorScreenPoint());

  ipcMain.handle('set-position', (_e, { x, y }) => {
    if (!mainWindow) return null;
    const { w, h } = currentSize();
    const pos = clampToDisplay(Math.round(x), Math.round(y), w, h);
    mainWindow.setPosition(pos.x, pos.y);
    return { x: pos.x, y: pos.y, workArea: pos.workArea };
  });

  ipcMain.handle('move-by', (_e, { dx, dy }) => {
    if (!mainWindow) return null;
    const b = mainWindow.getBounds();
    const { w, h } = currentSize();
    const pos = clampToDisplay(b.x + dx, b.y + dy, w, h);
    mainWindow.setPosition(pos.x, pos.y);
    return { x: pos.x, y: pos.y, workArea: pos.workArea };
  });

  ipcMain.handle('set-look-mode', (_e, enabled) => setPanelMode(enabled ? 'look' : 'none'));
  ipcMain.handle('set-panel-mode', (_e, mode) => setPanelMode(mode));
  ipcMain.handle('set-click-through', (_e, enabled) => setClickThrough(enabled));
  ipcMain.handle('get-click-through', () => clickThrough);
  ipcMain.handle('snap-corner', (_e, corner) => snapToCorner(corner || 'bottom-right'));
  ipcMain.handle('get-autostart', () => isAutostartEnabled());
  ipcMain.handle('set-autostart', (_e, enabled) => setAutostart(enabled));
  ipcMain.handle('sync-care-state', (_e, next) => {
    careState = { ...careState, ...(next || {}) };
    refreshMenus();
    return careState;
  });

  ipcMain.handle('get-clean-preview', async () => cleaner.getCleanPreview());
  ipcMain.handle('scan-c-drive', async () => cleaner.scanCDrive());
  ipcMain.handle('clean-junk', async (_e, options) => cleaner.cleanJunk(options || {}));
  ipcMain.handle('confirm-clean-items', async (_e, payload) => {
    const highRisk = Array.isArray(payload?.highRiskLabels) ? payload.highRiskLabels : [];
    if (!highRisk.length) {
      return { confirmed: true };
    }
    const result = await dialog.showMessageBox(mainWindow, {
      type: 'warning',
      buttons: ['取消', '确认删除'],
      defaultId: 0,
      cancelId: 0,
      title: '高风险清理确认',
      message: '以下项目风险较高，删除后可能无法恢复：',
      detail: highRisk.map((x) => `• ${x}`).join('\n'),
      noLink: true,
    });
    return { confirmed: result.response === 1 };
  });
  ipcMain.handle('optimize-memory', async () => cleaner.optimizeMemory());

  ipcMain.handle('get-chat-config', () => getChatConfig());

  ipcMain.handle('set-chat-config', (_e, patch) => {
    const cfg = setChatConfig(patch || {});
    const ready =
      cfg.provider === 'zhipu'
        ? true
        : cfg.provider === 'doubao'
          ? !!(cfg.doubaoApiKey && cfg.doubaoEndpoint)
          : !!resolveChatApiKey(cfg, cfg.provider);
    return {
      ok: true,
      ...cfg,
      hasKey: ready,
    };
  });

  // Back-compat aliases
  ipcMain.handle('get-deepseek-key', () => {
    const cfg = getChatConfig();
    return { hasKey: !!cfg.deepseekApiKey, apiKey: cfg.deepseekApiKey };
  });
  ipcMain.handle('set-deepseek-key', (_e, apiKey) => {
    const cfg = setChatConfig({ deepseekApiKey: apiKey });
    return { ok: true, hasKey: !!cfg.deepseekApiKey };
  });

  ipcMain.handle('chat-complete', async (_e, payload) => {
    const cfg = getChatConfig();
    const provider = llm.normalizeProvider(payload?.provider || cfg.provider);
    const keyFromPayload =
      typeof payload?.apiKey === 'string' && payload.apiKey.trim()
        ? payload.apiKey.trim()
        : '';
    const apiKey = keyFromPayload || resolveChatApiKey(cfg, provider);
    const endpoint =
      typeof payload?.endpoint === 'string' && payload.endpoint.trim()
        ? payload.endpoint.trim()
        : cfg.doubaoEndpoint;
    const streamId =
      typeof payload?.streamId === 'string' && payload.streamId.trim()
        ? payload.streamId.trim()
        : '';

    const sender = _e.sender;
    return llm.chatStream({
      provider,
      apiKey,
      endpoint,
      messages: payload?.messages,
      model: payload?.model,
      onDelta: (delta, full) => {
        if (!streamId || sender.isDestroyed()) return;
        sender.send('chat-stream-delta', { streamId, delta, full });
      },
      onStatus: (status) => {
        if (!streamId || sender.isDestroyed()) return;
        sender.send('chat-stream-delta', { streamId, status: String(status || '') });
      },
    });
  });

  ipcMain.handle('list-looks', () => ({
    builtin: getBuiltinLooks(),
    custom: getCustomLooks(),
  }));

  ipcMain.handle('get-look-animations', (_e, lookId) => loadLookAnimations(lookId));

  ipcMain.handle('import-looks', (_e, options) => importLooks(options || {}));
  ipcMain.handle('delete-look', (_e, id) => deleteCustomLook(id));
  ipcMain.handle('get-cutout-model', async () => {
    try {
      const buf = await cutoutModel.readCutoutModel();
      return { ok: true, data: buf };
    } catch (err) {
      return { ok: false, error: err?.message || String(err) };
    }
  });
  ipcMain.handle('replace-look-png', (_e, payload) => {
    const id = payload?.id;
    const data = payload?.data;
    if (!id || !data) return { ok: false, error: '参数无效', items: getCustomLooks() };
    try {
      return replaceLookPng(id, data);
    } catch (err) {
      return { ok: false, error: err?.message || String(err), items: getCustomLooks() };
    }
  });
  ipcMain.handle('look-supports-cutout', (_e, id) => lookSupportsCutout(id));
  ipcMain.handle('open-look-folder', async () => {
    fs.mkdirSync(customLooksDir(), { recursive: true });
    await shell.openPath(customLooksDir());
    return true;
  });

  ipcMain.handle('show-context-menu', () => {
    const menu = popupPetContextMenu();
    return !!menu;
  });

  ipcMain.handle('set-tray-title', (_e, title) => {
    if (tray && title) tray.setToolTip(String(title));
    return true;
  });

  ipcMain.handle('quit-app', () => {
    isQuitting = true;
    app.quit();
  });
}

app.whenReady().then(async () => {
  if (!gotTheLock) return;
  registerPetskinProtocol();
  fs.mkdirSync(customLooksDir(), { recursive: true });
  registerIpc();
  createWindow();
  if (CAPTURE_MODE) {
    const { runFeatureShotCapture, runMenuShotCapture } = require('../tools/capture-feature-shots');
    try {
      if (CAPTURE_MENU && !CAPTURE_SHOTS) {
        await runMenuShotCapture({
          mainWindow,
          sendAction,
          popupContextMenu: (pos) => popupPetContextMenu(pos, { restore: false }),
        });
      } else {
        await runFeatureShotCapture({
          mainWindow,
          sendAction,
          popupContextMenu: (pos) => popupPetContextMenu(pos, { restore: false }),
        });
      }
    } catch (err) {
      console.error('Feature shot capture failed:', err);
    }
    isQuitting = true;
    app.quit();
    return;
  }
  normalizeAutostartRegistration();
  createTray();
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  // Keep process alive for tray usage.
});
