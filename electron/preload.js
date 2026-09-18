const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('petAPI', {
  getSave: () => ipcRenderer.invoke('get-save'),
  saveState: (data) => ipcRenderer.invoke('save-state', data),
  getWorkArea: () => ipcRenderer.invoke('get-work-area'),
  getBounds: () => ipcRenderer.invoke('get-bounds'),
  getCursor: () => ipcRenderer.invoke('get-cursor'),
  setPosition: (x, y) => ipcRenderer.invoke('set-position', { x, y }),
  moveBy: (dx, dy) => ipcRenderer.invoke('move-by', { dx, dy }),
  setLookMode: (enabled) => ipcRenderer.invoke('set-look-mode', enabled),
  setPanelMode: (mode) => ipcRenderer.invoke('set-panel-mode', mode),
  setClickThrough: (enabled) => ipcRenderer.invoke('set-click-through', enabled),
  getClickThrough: () => ipcRenderer.invoke('get-click-through'),
  snapCorner: (corner) => ipcRenderer.invoke('snap-corner', corner),
  getAutostart: () => ipcRenderer.invoke('get-autostart'),
  setAutostart: (enabled) => ipcRenderer.invoke('set-autostart', enabled),
  syncCareState: (state) => ipcRenderer.invoke('sync-care-state', state),
  getCleanPreview: () => ipcRenderer.invoke('get-clean-preview'),
  scanCDrive: () => ipcRenderer.invoke('scan-c-drive'),
  cleanJunk: (options) => ipcRenderer.invoke('clean-junk', options || {}),
  confirmCleanItems: (payload) => ipcRenderer.invoke('confirm-clean-items', payload),
  optimizeMemory: () => ipcRenderer.invoke('optimize-memory'),
  getDeepseekKey: () => ipcRenderer.invoke('get-deepseek-key'),
  setDeepseekKey: (apiKey) => ipcRenderer.invoke('set-deepseek-key', apiKey),
  getChatConfig: () => ipcRenderer.invoke('get-chat-config'),
  setChatConfig: (patch) => ipcRenderer.invoke('set-chat-config', patch || {}),
  chatComplete: (payload, onDelta) => {
    const streamId = `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const listener = (_event, data) => {
      if (!data || data.streamId !== streamId) return;
      if (typeof onDelta !== 'function') return;
      if (data.status) {
        onDelta('', '', { status: data.status });
        return;
      }
      onDelta(data.delta || '', data.full || '', null);
    };
    ipcRenderer.on('chat-stream-delta', listener);
    return ipcRenderer
      .invoke('chat-complete', { ...(payload || {}), streamId })
      .finally(() => {
        ipcRenderer.removeListener('chat-stream-delta', listener);
      });
  },
  listLooks: () => ipcRenderer.invoke('list-looks'),
  getLookAnimations: (lookId) => ipcRenderer.invoke('get-look-animations', lookId),
  importLooks: (options) => ipcRenderer.invoke('import-looks', options || {}),
  deleteLook: (id) => ipcRenderer.invoke('delete-look', id),
  getCutoutModel: () => ipcRenderer.invoke('get-cutout-model'),
  replaceLookPng: (id, data) => ipcRenderer.invoke('replace-look-png', { id, data }),
  lookSupportsCutout: (id) => ipcRenderer.invoke('look-supports-cutout', id),
  openLookFolder: () => ipcRenderer.invoke('open-look-folder'),
  showContextMenu: () => ipcRenderer.invoke('show-context-menu'),
  setTrayTitle: (title) => ipcRenderer.invoke('set-tray-title', title),
  quit: () => ipcRenderer.invoke('quit-app'),
  onAction: (handler) => {
    const listener = (_event, action) => handler(action);
    ipcRenderer.on('pet-action', listener);
    return () => ipcRenderer.removeListener('pet-action', listener);
  },
});
