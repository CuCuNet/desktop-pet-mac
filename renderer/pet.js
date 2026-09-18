(() => {
  const petEl = document.getElementById('pet');
  const spriteEl = document.getElementById('pet-sprite');
  const bubbleEl = document.getElementById('bubble');
  const panelEl = document.getElementById('panel');
  const panelTitle = document.getElementById('panel-title');
  const panelCloseBtn = document.getElementById('panel-close');
  const lookPanelEl = document.getElementById('look-panel');
  const lookBuiltinEl = document.getElementById('look-builtin');
  const lookCustomEl = document.getElementById('look-custom');
  const lookEmptyEl = document.getElementById('look-empty');
  const lookCloseBtn = document.getElementById('look-close');
  const lookImportBtn = document.getElementById('look-import');
  const lookImportCutoutBtn = document.getElementById('look-import-cutout');
  const lookFolderBtn = document.getElementById('look-folder');
  const carePanelEl = document.getElementById('care-panel');
  const careCloseBtn = document.getElementById('care-close');
  const careQuiet = document.getElementById('care-quiet');
  const careAuto = document.getElementById('care-auto');
  const careClickThrough = document.getElementById('care-clickthrough');
  const careAutostart = document.getElementById('care-autostart');
  const careWater = document.getElementById('care-water');
  const careEyes = document.getElementById('care-eyes');
  const careStretch = document.getElementById('care-stretch');
  const careMemo = document.getElementById('care-memo');
  const carePomoText = document.getElementById('care-pomo-text');
  const carePomoToggle = document.getElementById('care-pomo-toggle');
  const careCornerBtn = document.getElementById('care-corner');
  const careCleanBtn = document.getElementById('care-clean');
  const careCleanCBtn = document.getElementById('care-clean-c');
  const careMemoryBtn = document.getElementById('care-memory');
  const careSysText = document.getElementById('care-sys-text');
  const careSysResult = document.getElementById('care-sys-result');
  const cleanConfirmEl = document.getElementById('clean-confirm');
  const cleanSafeList = document.getElementById('clean-safe-list');
  const cleanUncertainList = document.getElementById('clean-uncertain-list');
  const cleanUncertainEmpty = document.getElementById('clean-uncertain-empty');
  const cleanConfirmGo = document.getElementById('clean-confirm-go');
  const cleanConfirmCancel = document.getElementById('clean-confirm-cancel');
  const chatPanelEl = document.getElementById('chat-panel');
  const chatCloseBtn = document.getElementById('chat-close');
  const chatApiKeyDoubao = document.getElementById('chat-api-key-doubao');
  const chatApiKeyDeepseek = document.getElementById('chat-api-key-deepseek');
  const chatEndpointInput = document.getElementById('chat-endpoint');
  const chatEndpointWrap = document.getElementById('chat-endpoint-wrap');
  const chatKeyTitle = document.getElementById('chat-key-title');
  const chatKeyRow = document.getElementById('chat-key-row');
  const chatProviderZhipu = document.getElementById('chat-provider-zhipu');
  const chatProviderDoubao = document.getElementById('chat-provider-doubao');
  const chatProviderDeepseek = document.getElementById('chat-provider-deepseek');
  const chatSaveKeyBtn = document.getElementById('chat-save-key');
  const chatKeyTip = document.getElementById('chat-key-tip');
  const chatMessagesEl = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const chatSendBtn = document.getElementById('chat-send');
  const chatClearBtn = document.getElementById('chat-clear');
  const panelExtra = document.getElementById('panel-extra');
  const fxLayer = document.getElementById('fx-layer');
  const barMood = document.getElementById('bar-mood');
  const barHunger = document.getElementById('bar-hunger');
  const barEnergy = document.getElementById('bar-energy');

  const FOCUS_MS = 25 * 60 * 1000;
  const BREAK_MS = 5 * 60 * 1000;
  const WATER_MS = 45 * 60 * 1000;
  const EYES_MS = 50 * 60 * 1000;
  const STRETCH_MS = 60 * 60 * 1000;
  const MEMO_MS = 30 * 60 * 1000;

  const LINES = {
    pet: ['呼噜呼噜～', '再摸摸嘛', '好舒服！', '开心♥', '最喜欢被摸了'],
    feed: ['好好吃！', '谢谢投喂～', '还想再来一点…', '吧唧吧唧'],
    play: ['来玩来玩！', '抓不到我吧', '蹦蹦跳跳～', '再来一次！'],
    sleep: ['困了…Zzz', '先眯一会儿', '晚安'],
    hungry: ['肚子饿了…', '想吃零食', '喂喂我嘛'],
    tired: ['好累哦', '想趴一会儿', '电池见底了'],
    bored: ['好无聊…', '陪我玩嘛', '戳戳我呀'],
    wake: ['醒啦！', '睡得真香', '精神满满'],
    look: ['换好啦！', '喜欢这个吗？', '新形象闪亮登场'],
    water: ['该喝口水啦～', '补充水分！', '喝水时间到'],
    eyes: ['看看远处歇歇眼', '眨眼眨眨眼', '护眼时间到啦'],
    stretch: ['起来走一走吧', '伸个懒腰！', '久坐要活动一下'],
    dance: ['跟着我一起扭！', '嗨起来～', '今晚不回家！'],
    spin: ['转圈圈～', '头晕晕的', '哇哦！'],
    chase: ['追你啦！', '别跑！', '抓到你算我输'],
    surprise: ['哇啊！', '吓我一跳！', '你干嘛突然靠近'],
    wave: ['嗨～', '看到你啦', '招招手'],
    jump: ['蹦！', '我飞起来啦', '再高一点！'],
    roll: ['滚滚滚～', '地毯真舒服', '翻个跟头'],
    think: ['让我想想…', '嗯……', '有个好主意！'],
    celebrate: ['太棒啦！', '耶——！', '胜利姿势！'],
    sneeze: ['阿嚏！', '鼻子好痒', '谁说我名字了'],
    clean: ['梳梳毛～', '要保持漂亮', '舔舔爪子'],
    tip: ['哎呀歪了', '重心不稳…', '扶一下嘛'],
    crawl: ['偷偷摸摸…', '低空飞行', '悄悄靠近'],
    roam: ['去那边逛逛～', '全屏探险开始！', '走走停停～', '屏幕好大呀'],
    climb: ['往上爬！', '够一够～', '登高望远'],
    glide: ['轻轻落下去～', '滑翔中…', '落地姿势满分'],
    flip: ['空翻！', '帅不帅', '再来一个'],
    angry: ['哼！', '生气气', '不理你了'],
    beg: ['求投喂～', '拜托嘛', '看我可怜的小眼神'],
    slide: ['滑铲——！', '地板好滑', '酷炫抵达'],
    zoom: ['疯跑模式开启！', '停不下来！', '精力过剩！'],
    lay: ['摊平了…', '融化中', '今日份咸鱼'],
    wiggle: ['扭扭扭', '开心到摇起来', '有点小兴奋'],
    peek: ['我在这！', '偷瞄一下', '你看见我了吗'],
    nod: ['嗯嗯！', '说得对', '收到～'],
    cleanpc: ['打扫中…灰扑扑的！', '垃圾清扫启动！', '让我来收拾一下'],
    mempc: ['给内存按按背～', '挤一挤，腾点空！', '优化内存中…'],
    chat: ['让我想想…', '嗯，好问题！', '小橘来答～'],
    chatOk: ['答完啦！', '还有想问的吗？', '有用就好～'],
    chatErr: ['好像卡住了…', '再试一次好不好', '网络打瞌睡了'],
  };

  const PARTICLE_SETS = {
    heart: ['♥', '💕', '✨'],
    food: ['🐟', '✨', '💛'],
    star: ['✦', '✧', '⭐'],
    music: ['♪', '♫', '✨'],
    sweat: ['💧', '💦'],
    spark: ['✨', '🌟', '·'],
  };

  const state = {
    lookId: 'mikan',
    lookSource: 'builtin',
    lookAnims: {},
    spritePlaying: false,
    catalog: { builtin: [], custom: [] },
    mood: 80,
    hunger: 70,
    energy: 85,
    action: 'idle',
    facing: 'right',
    lockedUntil: 0,
    autoEnabled: true,
    quiet: false,
    remindWater: true,
    remindEyes: true,
    remindStretch: true,
    memo: '',
    panelOpen: false,
    lookPanelOpen: false,
    carePanelOpen: false,
    chatPanelOpen: false,
    chatBusy: false,
    chatHistory: [],
    chatProvider: 'zhipu',
    bubbleTimer: null,
    saveTimer: null,
    dragging: false,
    didDrag: false,
    dragOffsetX: 0,
    dragOffsetY: 0,
    clickCount: 0,
    clickTimer: null,
    lastWaterAt: Date.now(),
    lastEyesAt: Date.now(),
    lastStretchAt: Date.now(),
    lastMemoAt: Date.now(),
    lastCursorReactAt: 0,
    lastCursorDist: 9999,
    combo: 0,
    comboTimer: null,
    pomo: {
      on: false,
      phase: 'focus',
      endsAt: 0,
      timer: null,
    },
  };

  function clamp(n, min = 0, max = 100) {
    return Math.max(min, Math.min(max, n));
  }

  function isOverlayPanelOpen() {
    return state.lookPanelOpen || state.carePanelOpen || state.chatPanelOpen;
  }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function now() {
    return Date.now();
  }

  function isLocked() {
    return now() < state.lockedUntil || state.dragging;
  }

  function allLooks() {
    return [...state.catalog.builtin, ...state.catalog.custom];
  }

  function getLook(id = state.lookId, source = state.lookSource) {
    return (
      allLooks().find((item) => item.id === id && item.source === source) ||
      allLooks().find((item) => item.id === id) ||
      state.catalog.builtin[0] ||
      null
    );
  }

  function refreshPetClass() {
    petEl.className = `pet state-${state.action} face-${state.facing}${
      state.spritePlaying ? ' has-sprite-anim' : ''
    }`;
  }

  /**
   * Map "look / move toward +X" to CSS face class.
   * Source art (builtin and custom) is treated as facing left.
   * `.face-left` applies scaleX(-1), which makes the sprite look right.
   */
  function facingTowardPositiveX(towardPositiveX) {
    return towardPositiveX ? 'left' : 'right';
  }

  function setAction(action, facing = state.facing) {
    if (state.action === action && state.facing === facing) {
      if (!state.spritePlaying) syncSpriteAnim();
      return;
    }
    state.action = action;
    state.facing = facing;
    refreshPetClass();
    syncSpriteAnim();
  }

  const ANIM_ALIAS = {
    idle: 'idle',
    walk: 'walk',
    run: 'run',
    crawl: 'walk',
    slide: 'run',
    zoom: 'run',
    climb: 'climb',
    glide: 'glide',
    bounce: 'glide',
    jump: 'jump',
    hopside: 'jump',
    land: 'jump',
    fall: 'glide',
    sit: 'sit',
    lay: 'sit',
    beg: 'sit',
    sleep: 'sleep',
    happy: 'happy',
    celebrate: 'happy',
    dance: 'happy',
    play: 'happy',
    wave: 'wave',
    drag: 'idle',
    eat: 'happy',
    stretch: 'idle',
    yawn: 'sleep',
    think: 'idle',
    peek: 'idle',
    shy: 'idle',
    surprise: 'happy',
    shake: 'idle',
    squish: 'sit',
    spin: 'happy',
    roll: 'happy',
    flip: 'jump',
    sneeze: 'idle',
    clean: 'idle',
    tip: 'sit',
    nod: 'wave',
    angry: 'idle',
    wiggle: 'happy',
  };

  const spriteAnim = {
    timer: null,
    key: '',
    index: 0,
    frames: [],
    fps: 8,
    pingPong: false,
    dir: 1,
  };

  function stopSpriteAnim() {
    if (spriteAnim.timer) {
      clearInterval(spriteAnim.timer);
      spriteAnim.timer = null;
    }
    spriteAnim.key = '';
    spriteAnim.frames = [];
    spriteAnim.dir = 1;
    state.spritePlaying = false;
  }

  function preloadFrames(frames) {
    for (const url of frames) {
      const img = new Image();
      img.src = url;
    }
  }

  function resolveAnimForAction(action) {
    const key = ANIM_ALIAS[action] || 'idle';
    const pack = state.lookAnims?.[key] || state.lookAnims?.idle;
    if (!pack?.frames?.length) return null;
    let fps = pack.fps || 8;
    if (action === 'crawl') fps = Math.max(3, Math.round(fps * 0.5));
    if (action === 'slide' || action === 'zoom') fps = Math.round(fps * 1.1);
    const pingPong = key === 'idle' || key === 'sleep' || key === 'sit' || key === 'glide';
    return { key, frames: pack.frames, fps, pingPong };
  }

  function syncSpriteAnim() {
    const look = getLook();
    const anim = state.lookSource === 'builtin' ? resolveAnimForAction(state.action) : null;
    if (!anim) {
      stopSpriteAnim();
      const url = look?.imageUrl || look?.thumbUrl;
      if (url && spriteEl.src !== url) spriteEl.src = url;
      refreshPetClass();
      return;
    }
    if (spriteAnim.key === anim.key && spriteAnim.timer) {
      state.spritePlaying = true;
      refreshPetClass();
      return;
    }
    stopSpriteAnim();
    state.spritePlaying = true;
    spriteAnim.key = anim.key;
    spriteAnim.frames = anim.frames;
    spriteAnim.fps = anim.fps;
    spriteAnim.pingPong = !!anim.pingPong;
    spriteAnim.index = 0;
    spriteAnim.dir = 1;
    preloadFrames(anim.frames);
    spriteEl.src = anim.frames[0];
    const ms = Math.max(50, Math.round(1000 / anim.fps));
    spriteAnim.timer = setInterval(() => {
      const list = spriteAnim.frames;
      if (!list.length) return;
      if (spriteAnim.pingPong && list.length > 1) {
        spriteAnim.index += spriteAnim.dir;
        if (spriteAnim.index >= list.length - 1) {
          spriteAnim.index = list.length - 1;
          spriteAnim.dir = -1;
        } else if (spriteAnim.index <= 0) {
          spriteAnim.index = 0;
          spriteAnim.dir = 1;
        }
      } else {
        spriteAnim.index = (spriteAnim.index + 1) % list.length;
      }
      spriteEl.src = list[spriteAnim.index];
    }, ms);
    refreshPetClass();
  }

  function lockFor(ms) {
    state.lockedUntil = now() + ms;
  }

  function spawnParticles(kind = 'spark', count = 6) {
    if (!fxLayer) return;
    const set = PARTICLE_SETS[kind] || PARTICLE_SETS.spark;
    const rect = petEl.getBoundingClientRect();
    const stageRect = fxLayer.getBoundingClientRect();
    for (let i = 0; i < count; i += 1) {
      const el = document.createElement('span');
      el.className = 'fx-particle';
      el.textContent = pick(set);
      const x = rect.left - stageRect.left + rect.width * (0.25 + Math.random() * 0.5);
      const y = rect.top - stageRect.top + rect.height * (0.2 + Math.random() * 0.4);
      const dx = `${(Math.random() - 0.5) * 70}px`;
      const dy = `${-30 - Math.random() * 55}px`;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.setProperty('--dx', dx);
      el.style.setProperty('--dy', dy);
      el.style.fontSize = `${12 + Math.random() * 8}px`;
      fxLayer.appendChild(el);
      setTimeout(() => el.remove(), 950);
    }
  }

  function afterAnim(ms, next = null) {
    lockFor(ms);
    setTimeout(() => {
      if (state.dragging) return;
      if (next) setAction(next);
      else setAction(state.quiet ? 'sit' : 'idle');
    }, ms);
  }

  function playSpecial(action, ms, lineKey, particle) {
    if (state.dragging) return;
    setAction(action);
    if (lineKey) sayKey(lineKey);
    if (particle) spawnParticles(particle, 7);
    afterAnim(ms);
  }

  function dance() {
    state.mood = clamp(state.mood + 10);
    state.energy = clamp(state.energy - 4);
    updateBars();
    playSpecial('dance', 2800, 'dance', 'music');
    scheduleSave();
  }

  function spin() {
    state.mood = clamp(state.mood + 8);
    updateBars();
    playSpecial('spin', 900, 'spin', 'star');
    scheduleSave();
  }

  async function moveToward(targetX, targetY, speed = 4, action = 'run') {
    const bounds = await window.petAPI.getBounds();
    const work = await window.petAPI.getWorkArea();
    if (!bounds || !work) return;

    const cx = bounds.x + bounds.width / 2;
    const facing = facingTowardPositiveX(targetX >= cx);
    setAction(action, facing);
    lockFor(1600);

    let frames = 0;
    const timer = setInterval(async () => {
      if (state.dragging) {
        clearInterval(timer);
        return;
      }
      frames += 1;
      const b = await window.petAPI.getBounds();
      if (!b) {
        clearInterval(timer);
        return;
      }
      const dx = targetX - (b.x + b.width / 2);
      const dy = targetY - (b.y + b.height / 2);
      const dist = Math.hypot(dx, dy);
      if (dist < 24 || frames > 40) {
        clearInterval(timer);
        setAction(Math.random() > 0.5 ? 'happy' : 'sit', facing);
        afterAnim(900);
        return;
      }
      const nx = b.x + (dx / dist) * speed;
      const ny = b.y + (dy / dist) * speed * 0.35;
      await window.petAPI.setPosition(nx, ny);
    }, 28);
  }

  async function chaseCursor() {
    if (isLocked() || state.quiet || isOverlayPanelOpen()) return;
    const cursor = await window.petAPI.getCursor();
    if (!cursor) return;
    sayKey('chase');
    spawnParticles('spark', 5);
    state.energy = clamp(state.energy - 3);
    updateBars();
    await moveToward(cursor.x, cursor.y, 5.5, 'run');
  }

  async function reactToCursor() {
    if (isLocked() || state.dragging || isOverlayPanelOpen()) return;
    const cursor = await window.petAPI.getCursor();
    const bounds = await window.petAPI.getBounds();
    if (!cursor || !bounds) return;

    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    const dist = Math.hypot(cursor.x - cx, cursor.y - cy);
    const approaching = dist < state.lastCursorDist - 18;
    state.lastCursorDist = dist;

    if (!state.quiet && !['walk', 'run', 'fall', 'drag'].includes(state.action)) {
      const facing = facingTowardPositiveX(cursor.x >= cx);
      if (facing !== state.facing && ['idle', 'sit'].includes(state.action)) {
        state.facing = facing;
        refreshPetClass();
      }
    }

    const nowTs = Date.now();
    if (nowTs - state.lastCursorReactAt < 3500) return;

    if (dist < 140 && approaching && state.mood > 40) {
      state.lastCursorReactAt = nowTs;
      playSpecial('surprise', 800, 'surprise', 'sweat');
      return;
    }

    if (dist < 220 && Math.random() < 0.08 && !state.quiet) {
      state.lastCursorReactAt = nowTs;
      if (Math.random() > 0.45) chaseCursor();
      else playSpecial('wave', 1000, 'wave', 'spark');
    }
  }

  function handlePetClick() {
    state.combo += 1;
    clearTimeout(state.comboTimer);
    state.comboTimer = setTimeout(() => {
      const n = state.combo;
      state.combo = 0;
      if (n >= 4) {
        dance();
      } else if (n === 3) {
        spin();
      } else if (n === 2) {
        state.mood = clamp(state.mood + 14);
        updateBars();
        playSpecial('happy', 1400, 'play', 'heart');
        scheduleSave();
      } else {
        pet();
      }
    }, 260);
  }

  function say(text, ms = 2800) {
    bubbleEl.textContent = text;
    bubbleEl.classList.remove('hidden');
    clearTimeout(state.bubbleTimer);
    state.bubbleTimer = setTimeout(() => {
      bubbleEl.classList.add('hidden');
    }, ms);
  }

  function formatClock(date = new Date()) {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  function timeGreeting() {
    const h = new Date().getHours();
    if (h < 6) return '夜深了，早点休息哦';
    if (h < 11) return '早上好！新的一天加油';
    if (h < 14) return '中午好，记得吃饭喝水';
    if (h < 18) return '下午好，状态还好吗';
    if (h < 22) return '傍晚啦，适当放松一下';
    return '晚上了，别熬太晚哦';
  }

  function tellTime() {
    say(`现在 ${formatClock()}，${timeGreeting()}`, 3500);
    setAction('happy');
    lockFor(1200);
    setTimeout(() => {
      if (!isLocked()) setAction(state.quiet ? 'sit' : 'idle');
    }, 1200);
  }

  function updatePanelExtra() {
    const bits = [];
    if (state.autoEnabled) bits.push('自由行动');
    if (state.quiet) bits.push('安静中');
    if (state.pomo.on) {
      const left = Math.max(0, state.pomo.endsAt - Date.now());
      const m = Math.floor(left / 60000);
      const s = Math.floor((left % 60000) / 1000);
      bits.push(`${state.pomo.phase === 'focus' ? '专注' : '休息'} ${m}:${String(s).padStart(2, '0')}`);
    }
    if (state.memo.trim()) bits.push(`便签：${state.memo.trim().slice(0, 18)}`);
    panelExtra.textContent = bits.join(' · ');
  }

  function syncCareUi() {
    if (careAuto) careAuto.checked = !!state.autoEnabled;
    careQuiet.checked = !!state.quiet;
    careWater.checked = !!state.remindWater;
    careEyes.checked = !!state.remindEyes;
    careStretch.checked = !!state.remindStretch;
    careMemo.value = state.memo || '';
    carePomoToggle.textContent = state.pomo.on ? '停止番茄钟' : '开始番茄钟';
    if (!state.pomo.on) {
      carePomoText.textContent = '未开始 · 25 分专注 / 5 分休息';
    }
    updatePanelExtra();
  }

  async function pushCareState() {
    await window.petAPI.syncCareState({
      quiet: state.quiet,
      autoEnabled: state.autoEnabled,
      remindWater: state.remindWater,
      remindEyes: state.remindEyes,
      remindStretch: state.remindStretch,
      memo: state.memo,
      pomodoroOn: state.pomo.on,
    });
  }

  function setQuiet(enabled, silent = false) {
    state.quiet = !!enabled;
    careQuiet.checked = state.quiet;
    if (state.quiet) {
      if (!silent) say('好，我安静陪着你');
      // Quiet only changes mannerisms / resting pose — not locomotion
      if (!['walk', 'run', 'crawl', 'slide', 'fall', 'drag', 'climb', 'glide', 'zoom'].includes(state.action)) {
        lockFor(600);
        setAction('sit');
      }
    } else if (!silent) {
      say('好的，不那么安静啦');
    }
    pushCareState();
    scheduleSave();
    updatePanelExtra();
  }

  function setAutoEnabled(enabled, silent = false) {
    state.autoEnabled = !!enabled;
    if (careAuto) careAuto.checked = state.autoEnabled;
    if (state.autoEnabled) {
      state.lockedUntil = 0;
      if (!['walk', 'run', 'fall', 'drag'].includes(state.action)) {
        setAction(state.quiet ? 'sit' : 'idle');
      }
      if (!silent) say('自由行动开启，我可以到处走走啦');
    } else {
      // Free roam only stops movement; keep quiet/resting pose otherwise
      lockFor(400);
      setAction(state.quiet ? 'sit' : 'idle');
      if (!silent) say('自由行动关闭，我先待在这儿');
    }
    pushCareState();
    scheduleSave();
    updatePanelExtra();
  }

  function updatePomoText() {
    if (!state.pomo.on) {
      carePomoText.textContent = '未开始 · 25 分专注 / 5 分休息';
      carePomoToggle.textContent = '开始番茄钟';
      updatePanelExtra();
      return;
    }
    const left = Math.max(0, state.pomo.endsAt - Date.now());
    const m = Math.floor(left / 60000);
    const s = Math.floor((left % 60000) / 1000);
    const label = state.pomo.phase === 'focus' ? '专注中' : '休息中';
    carePomoText.textContent = `${label} · 剩余 ${m}:${String(s).padStart(2, '0')}`;
    carePomoToggle.textContent = '停止番茄钟';
    updatePanelExtra();
  }

  function stopPomodoro(silent = false) {
    state.pomo.on = false;
    state.pomo.endsAt = 0;
    clearInterval(state.pomo.timer);
    state.pomo.timer = null;
    updatePomoText();
    pushCareState();
    if (!silent) say('番茄钟已结束');
  }

  function startPomodoroPhase(phase) {
    state.pomo.on = true;
    state.pomo.phase = phase;
    state.pomo.endsAt = Date.now() + (phase === 'focus' ? FOCUS_MS : BREAK_MS);
    clearInterval(state.pomo.timer);
    state.pomo.timer = setInterval(() => {
      updatePomoText();
      if (Date.now() >= state.pomo.endsAt) {
        if (state.pomo.phase === 'focus') {
          say('专注结束！休息 5 分钟吧', 4000);
          setAction('happy');
          startPomodoroPhase('break');
        } else {
          say('休息结束，开始下一段专注？点菜单可继续', 4000);
          stopPomodoro(true);
          setAction('sit');
        }
      }
    }, 1000);
    updatePomoText();
    pushCareState();
  }

  function togglePomodoro() {
    if (state.pomo.on) {
      stopPomodoro();
      return;
    }
    setQuiet(true, true);
    setAutoEnabled(false, true);
    startPomodoroPhase('focus');
    say('番茄钟开始：专注 25 分钟！', 3500);
  }

  function checkCareReminders() {
    const t = Date.now();
    if (state.remindWater && t - state.lastWaterAt >= WATER_MS) {
      state.lastWaterAt = t;
      sayKey('water');
      setAction('happy');
      return;
    }
    if (state.remindEyes && t - state.lastEyesAt >= EYES_MS) {
      state.lastEyesAt = t;
      sayKey('eyes');
      setAction('sit');
      return;
    }
    if (state.remindStretch && t - state.lastStretchAt >= STRETCH_MS) {
      state.lastStretchAt = t;
      sayKey('stretch');
      setAction('happy');
      return;
    }
    if (state.memo.trim() && t - state.lastMemoAt >= MEMO_MS) {
      state.lastMemoAt = t;
      say(`记得：${state.memo.trim()}`, 4000);
      setAction('sit');
    }
  }

  function sayKey(key) {
    const look = getLook();
    if (key === 'greet' && look?.greet?.length) {
      say(pick(look.greet));
      return;
    }
    say(pick(LINES[key] || look?.greet || ['嗨～']));
  }

  function updateBars() {
    barMood.style.width = `${state.mood}%`;
    barHunger.style.width = `${state.hunger}%`;
    barEnergy.style.width = `${state.energy}%`;
  }

  function applyLookVisual(look) {
    if (!look || !spriteEl) return;
    const url = look.imageUrl || look.thumbUrl;
    if (!url) return;
    spriteEl.style.opacity = '1';
    spriteEl.style.visibility = 'visible';
    spriteEl.onload = () => {
      spriteEl.style.opacity = '1';
    };
    spriteEl.onerror = () => {
      console.error('pet sprite load failed');
      stopSpriteAnim();
      spriteEl.src =
        "data:image/svg+xml," +
        encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
            <ellipse cx="60" cy="78" rx="34" ry="26" fill="#ff9c40"/>
            <circle cx="70" cy="48" r="28" fill="#ff9c40"/>
            <circle cx="60" cy="46" r="4" fill="#3a2414"/>
            <circle cx="82" cy="46" r="4" fill="#3a2414"/>
          </svg>`,
        );
    };
    if (!state.spritePlaying && spriteEl.src !== url) spriteEl.src = url;
    document.documentElement.style.setProperty('--accent', look.accent || '#ff9a3c');
    panelTitle.textContent = look.name;
    document.title = look.name;
    petEl.title = `拖我走走，点我摸摸（${look.name}）`;
  }

  let cutoutBusy = false;
  let cutoutModelBytes = null;

  function toUint8(data) {
    if (!data) return null;
    if (data instanceof Uint8Array) return data;
    if (data instanceof ArrayBuffer) return new Uint8Array(data);
    if (ArrayBuffer.isView(data)) {
      return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    }
    if (data.type === 'Buffer' && Array.isArray(data.data)) {
      return Uint8Array.from(data.data);
    }
    return new Uint8Array(data);
  }

  async function loadCutoutModel(onStatus) {
    if (cutoutModelBytes) return cutoutModelBytes;
    onStatus?.('首次抠图需下载模型…');
    const res = await window.petAPI.getCutoutModel();
    if (!res?.ok || !res.data) {
      throw new Error(res?.error || '模型下载失败');
    }
    cutoutModelBytes = toUint8(res.data);
    if (!cutoutModelBytes?.byteLength) {
      throw new Error('模型数据无效');
    }
    return cutoutModelBytes;
  }

  async function runCutoutOnLook(look, { silent = false } = {}) {
    if (!look || look.source !== 'custom') return { ok: false, error: '仅支持自定义形象' };
    if (!window.petCutout?.removeBackground) {
      return { ok: false, error: '抠图模块未加载' };
    }
    const src = look.imageUrl || look.thumbUrl;
    if (!src) return { ok: false, error: '找不到图片' };

    const model = await loadCutoutModel((msg) => {
      if (!silent) say(msg);
    });
    if (!silent) say('正在抠图…');
    const png = await window.petCutout.removeBackground(src, model);
    const result = await window.petAPI.replaceLookPng(look.id, png);
    if (!result?.ok) {
      throw new Error(result?.error || '保存失败');
    }
    state.catalog.custom = result.items || [];
    return { ok: true, items: state.catalog.custom };
  }

  async function importLooksWithOptions({ cutout = false } = {}) {
    if (cutoutBusy) {
      say('正在处理上一张，稍等～');
      return;
    }
    const result = await window.petAPI.importLooks({ cutout });
    if (result?.canceled) return;
    state.catalog.custom = result.items || [];
    renderLookLibrary();

    if (!(result.addedCount > 0)) {
      say('没有导入新形象');
      return;
    }

    const newest = state.catalog.custom[0];
    if (newest) applyLook(newest.id, 'custom', true);

    if (!cutout) {
      say(`已导入 ${result.addedCount} 张形象`);
      return;
    }

    const ids = result.cutoutIds?.length
      ? result.cutoutIds
      : state.catalog.custom.slice(0, result.addedCount).map((x) => x.id);

    cutoutBusy = true;
    lookImportCutoutBtn && (lookImportCutoutBtn.disabled = true);
    lookImportBtn && (lookImportBtn.disabled = true);
    try {
      await loadCutoutModel((msg) => say(msg));
      let okCount = 0;
      for (let i = 0; i < ids.length; i += 1) {
        const look = state.catalog.custom.find((x) => x.id === ids[i]);
        if (!look) continue;
        say(`抠图中 ${i + 1}/${ids.length}…`);
        await runCutoutOnLook(look, { silent: true });
        okCount += 1;
        renderLookLibrary();
        if (state.lookId === look.id && state.lookSource === 'custom') {
          const updated = state.catalog.custom.find((x) => x.id === look.id);
          if (updated) applyLookVisual(updated);
        }
      }
      say(okCount > 0 ? `抠图完成 ${okCount} 张` : '抠图未完成');
    } catch (err) {
      console.error(err);
      say(err?.message || '抠图失败，请检查网络后重试');
      renderLookLibrary();
    } finally {
      cutoutBusy = false;
      lookImportCutoutBtn && (lookImportCutoutBtn.disabled = false);
      lookImportBtn && (lookImportBtn.disabled = false);
    }
  }

  function makeCard(look) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `look-card${look.id === state.lookId && look.source === state.lookSource ? ' active' : ''}`;
    btn.title = look.name;

    const img = document.createElement('img');
    img.src = look.thumbUrl || look.imageUrl;
    img.alt = look.name;

    const name = document.createElement('span');
    name.className = 'look-name';
    name.textContent = look.name;

    btn.append(img, name);

    if (look.source === 'custom') {
      const cut = document.createElement('button');
      cut.type = 'button';
      cut.className = 'look-cutout';
      cut.title = '抠图（去掉背景）';
      cut.textContent = '抠';
      cut.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (cutoutBusy) {
          say('正在处理中…');
          return;
        }
        cutoutBusy = true;
        cut.disabled = true;
        try {
          await runCutoutOnLook(look);
          renderLookLibrary();
          if (state.lookId === look.id && state.lookSource === 'custom') {
            const updated = state.catalog.custom.find((x) => x.id === look.id);
            if (updated) applyLookVisual(updated);
          }
          say('抠好啦！');
        } catch (err) {
          console.error(err);
          say(err?.message || '抠图失败');
        } finally {
          cutoutBusy = false;
          cut.disabled = false;
        }
      });
      btn.appendChild(cut);

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'look-del';
      del.title = '删除';
      del.textContent = '×';
      del.addEventListener('click', async (e) => {
        e.stopPropagation();
        const result = await window.petAPI.deleteLook(look.id);
        state.catalog.custom = result.items || [];
        if (state.lookId === look.id && state.lookSource === 'custom') {
          applyLook(state.catalog.builtin[0]?.id, 'builtin', true);
        } else {
          renderLookLibrary();
          scheduleSave();
        }
      });
      btn.appendChild(del);
    }

    btn.addEventListener('click', () => {
      applyLook(look.id, look.source, true);
    });
    return btn;
  }

  function renderLookLibrary() {
    lookBuiltinEl.innerHTML = '';
    lookCustomEl.innerHTML = '';
    state.catalog.builtin.forEach((look) => lookBuiltinEl.appendChild(makeCard(look)));
    state.catalog.custom.forEach((look) => lookCustomEl.appendChild(makeCard(look)));
    lookEmptyEl.classList.toggle('hidden', state.catalog.custom.length > 0);
  }

  async function applyLook(lookId, source = 'builtin', fromUser = false) {
    const look = getLook(lookId, source);
    if (!look) return;

    state.lookId = look.id;
    state.lookSource = look.source;
    stopSpriteAnim();
    state.lookAnims = {};
    if (look.source === 'builtin' && window.petAPI.getLookAnimations) {
      try {
        state.lookAnims = (await window.petAPI.getLookAnimations(look.id)) || {};
      } catch {
        state.lookAnims = {};
      }
    }
    applyLookVisual(look);
    syncSpriteAnim();
    refreshPetClass();
    if (state.lookPanelOpen) renderLookLibrary();

    window.petAPI.setTrayTitle?.(`桌面宠物 · ${look.name}`);

    if (fromUser) {
      state.mood = clamp(state.mood + 6);
      updateBars();
      sayKey('look');
      setAction('happy');
      lockFor(1200);
      setTimeout(() => {
        if (!isLocked()) setAction('idle');
      }, 1200);
      scheduleSave();
    }
  }

  function scheduleSave() {
    clearTimeout(state.saveTimer);
    state.saveTimer = setTimeout(persist, 400);
  }

  async function persist() {
    const bounds = await window.petAPI.getBounds();
    await window.petAPI.saveState({
      lookId: state.lookId,
      lookSource: state.lookSource,
      mood: state.mood,
      hunger: state.hunger,
      energy: state.energy,
      autoEnabled: state.autoEnabled,
      quiet: state.quiet,
      remindWater: state.remindWater,
      remindEyes: state.remindEyes,
      remindStretch: state.remindStretch,
      memo: state.memo,
      window: bounds ? { x: bounds.x, y: bounds.y } : undefined,
    });
  }

  async function refreshSysStats() {
    if (!careSysText) return;
    try {
      const preview = await window.petAPI.getCleanPreview();
      const mem = preview.memory;
      const junk = preview.junk;
      careSysText.textContent =
        `内存 ${mem.usedPercent}% · 已用 ${mem.usedText} / ${mem.totalText}\n` +
        `C盘可清理约 ${junk.approxText}（安全 ${junk.safeBytesText || junk.tempText}` +
        (junk.uncertainCount ? ` · 待确认 ${junk.uncertainCount} 项` : '') +
        '）';
    } catch {
      careSysText.textContent = '暂时读不到系统信息';
    }
  }

  function hideCleanConfirm() {
    cleanConfirmEl?.classList.add('hidden');
  }

  function renderCleanScan(scan) {
    if (!cleanConfirmEl) return;
    cleanSafeList.innerHTML = '';
    cleanUncertainList.innerHTML = '';

    (scan.safe || []).forEach((item) => {
      const row = document.createElement('div');
      row.className = 'clean-item';
      row.innerHTML =
        `<div><div>${item.label} · ${item.bytesText}</div>` +
        `<div class="clean-meta">${item.reason || ''}</div></div>`;
      cleanSafeList.appendChild(row);
    });

    const uncertain = scan.uncertain || [];
    cleanUncertainEmpty.classList.toggle('hidden', uncertain.length > 0);
    uncertain.forEach((item) => {
      const row = document.createElement('label');
      row.className = `clean-item risk-${item.risk || 'medium'}`;
      row.innerHTML =
        `<input type="checkbox" data-clean-id="${item.id}" ${item.risk === 'high' ? '' : 'checked'} />` +
        `<div><div>${item.label} · ${item.bytesText}${item.risk === 'high' ? '（高风险）' : ''}</div>` +
        `<div class="clean-meta">${item.reason || ''}</div></div>`;
      cleanUncertainList.appendChild(row);
    });

    cleanConfirmEl.classList.remove('hidden');
  }

  async function openCDriveClean() {
    if (!state.carePanelOpen) await openCarePanel();
    say('我先扫描 C 盘，不清楚的会问你');
    setAction('think');
    if (careSysResult) careSysResult.textContent = '正在扫描 C 盘垃圾项…';
    if (careCleanCBtn) careCleanCBtn.disabled = true;
    try {
      const scan = await window.petAPI.scanCDrive();
      renderCleanScan(scan);
      const tip =
        `扫描完成：安全约 ${scan.safeBytesText}` +
        (scan.uncertain.length
          ? `，另有 ${scan.uncertain.length} 项需你确认（约 ${scan.uncertainBytesText}）`
          : '，没有需要确认的不确定项');
      if (careSysResult) careSysResult.textContent = tip;
      say(scan.uncertain.length ? '有几项拿不准，你勾选后我再清' : '都是安全项，确认后我就开干');
      playSpecial('nod', 900, 'nod', null);
    } catch {
      if (careSysResult) careSysResult.textContent = 'C 盘扫描失败';
      say('扫描时卡住了…');
    } finally {
      if (careCleanCBtn) careCleanCBtn.disabled = false;
    }
  }

  async function runCleanJunk(options = {}) {
    if (careCleanBtn?.disabled) return;
    if (careCleanBtn) careCleanBtn.disabled = true;
    if (careCleanCBtn) careCleanCBtn.disabled = true;
    if (careMemoryBtn) careMemoryBtn.disabled = true;
    sayKey('cleanpc');
    setAction('clean');
    spawnParticles('spark', 6);
    lockFor(1200);
    if (careSysResult) {
      careSysResult.textContent = options.includeIds
        ? '正在按你的选择清理 C 盘…'
        : '正在快速清理安全垃圾…';
    }
    try {
      const result = await window.petAPI.cleanJunk(options);
      const msg = `清理完成：${result.files} 项，约释放 ${result.bytesText}`;
      if (careSysResult) careSysResult.textContent = msg;
      say(`打扫好啦！清掉约 ${result.bytesText}`, 3500);
      playSpecial('celebrate', 1100, 'celebrate', 'star');
      state.mood = clamp(state.mood + 8);
      updateBars();
      scheduleSave();
      hideCleanConfirm();
      await refreshSysStats();
    } catch (err) {
      if (careSysResult) careSysResult.textContent = '清理失败，请稍后重试';
      say('清理时遇到了点小问题…');
      playSpecial('shy', 900, null, 'sweat');
    } finally {
      if (careCleanBtn) careCleanBtn.disabled = false;
      if (careCleanCBtn) careCleanCBtn.disabled = false;
      if (careMemoryBtn) careMemoryBtn.disabled = false;
    }
  }

  async function confirmAndCleanSelected() {
    const checked = [...cleanUncertainList.querySelectorAll('input[data-clean-id]:checked')];
    const includeIds = checked.map((el) => el.dataset.cleanId);
    const highRiskLabels = checked
      .map((el) => {
        const row = el.closest('.clean-item');
        return row?.classList.contains('risk-high')
          ? row.querySelector('div > div')?.textContent || el.dataset.cleanId
          : null;
      })
      .filter(Boolean);

    if (highRiskLabels.length) {
      const ans = await window.petAPI.confirmCleanItems({ highRiskLabels });
      if (!ans?.confirmed) {
        say('好，高风险的先留着');
        return;
      }
    }

    await runCleanJunk({ includeSafe: true, includeIds });
  }

  async function runOptimizeMemory() {
    if (careMemoryBtn?.disabled) return;
    if (careCleanBtn) careCleanBtn.disabled = true;
    if (careMemoryBtn) careMemoryBtn.disabled = true;
    sayKey('mempc');
    setAction('stretch');
    spawnParticles('star', 5);
    lockFor(1000);
    if (careSysResult) careSysResult.textContent = '正在尝试释放内存…';
    try {
      const result = await window.petAPI.optimizeMemory();
      const after = result.after;
      const msg = result.freed > 0
        ? `内存优化完成：约腾出 ${result.freedText}，当前占用 ${after.usedPercent}%`
        : `内存已整理：当前占用 ${after.usedPercent}%（${after.usedText} / ${after.totalText}）`;
      if (careSysResult) careSysResult.textContent = msg;
      say(result.freed > 0 ? `挤出了约 ${result.freedText} 内存！` : '内存整理好啦～', 3500);
      playSpecial('happy', 1200, null, 'spark');
      state.mood = clamp(state.mood + 6);
      updateBars();
      scheduleSave();
      await refreshSysStats();
    } catch {
      if (careSysResult) careSysResult.textContent = '优化失败，请稍后重试';
      say('优化时卡住了一下…');
      playSpecial('tip', 1000, 'tip', 'sweat');
    } finally {
      if (careCleanBtn) careCleanBtn.disabled = false;
      if (careMemoryBtn) careMemoryBtn.disabled = false;
    }
  }

  async function refreshCatalog() {
    const data = await window.petAPI.listLooks();
    state.catalog.builtin = data.builtin || [];
    state.catalog.custom = data.custom || [];
  }

  async function restore() {
    await refreshCatalog();
    const saved = await window.petAPI.getSave();
    careAutostart.checked = !!(await window.petAPI.getAutostart());
    careClickThrough.checked = !!(await window.petAPI.getClickThrough());

    if (!saved) {
      applyLook(state.catalog.builtin[0]?.id || 'mikan', 'builtin');
      syncCareUi();
      pushCareState();
      return;
    }
    state.mood = clamp(saved.mood ?? state.mood);
    state.hunger = clamp(saved.hunger ?? state.hunger);
    state.energy = clamp(saved.energy ?? state.energy);
    state.quiet = !!saved.quiet;
    state.autoEnabled = saved.autoEnabled !== false;
    state.remindWater = saved.remindWater !== false;
    state.remindEyes = saved.remindEyes !== false;
    state.remindStretch = saved.remindStretch !== false;
    state.memo = typeof saved.memo === 'string' ? saved.memo : '';
    const source = saved.lookSource || 'builtin';
    const id = saved.lookId || state.catalog.builtin[0]?.id;
    if (!getLook(id, source)) {
      applyLook(state.catalog.builtin[0]?.id, 'builtin');
    } else {
      applyLook(id, source);
    }
    updateBars();
    syncCareUi();
    pushCareState();
  }

  function togglePanel() {
    if (state.lookPanelOpen) closeLookPanel();
    if (state.carePanelOpen) closeCarePanel();
    if (state.chatPanelOpen) closeChatPanel();
    state.panelOpen = !state.panelOpen;
    panelEl.classList.toggle('hidden', !state.panelOpen);
    if (state.panelOpen) {
      window.petAPI.setPanelMode?.('status');
      updatePanelExtra();
    } else {
      window.petAPI.setPanelMode?.('none');
    }
  }

  function closeStatusPanel() {
    state.panelOpen = false;
    panelEl.classList.add('hidden');
    window.petAPI.setPanelMode?.('none');
  }

  async function openLookPanel() {
    if (state.carePanelOpen) await closeCarePanel();
    if (state.chatPanelOpen) await closeChatPanel();
    state.lookPanelOpen = true;
    state.panelOpen = false;
    panelEl.classList.add('hidden');
    await window.petAPI.setPanelMode('look');
    await refreshCatalog();
    renderLookLibrary();
    lookPanelEl.classList.remove('hidden');
  }

  async function closeLookPanel() {
    state.lookPanelOpen = false;
    lookPanelEl.classList.add('hidden');
    await window.petAPI.setPanelMode('none');
  }

  async function openCarePanel() {
    if (state.lookPanelOpen) await closeLookPanel();
    if (state.chatPanelOpen) await closeChatPanel();
    state.carePanelOpen = true;
    state.panelOpen = false;
    panelEl.classList.add('hidden');
    await window.petAPI.setPanelMode('care');
    careClickThrough.checked = !!(await window.petAPI.getClickThrough());
    careAutostart.checked = !!(await window.petAPI.getAutostart());
    syncCareUi();
    await refreshSysStats();
    carePanelEl.classList.remove('hidden');
  }

  async function closeCarePanel() {
    state.carePanelOpen = false;
    carePanelEl.classList.add('hidden');
    await window.petAPI.setPanelMode('none');
  }

  async function toggleCarePanel() {
    if (state.carePanelOpen) await closeCarePanel();
    else await openCarePanel();
  }

  function renderChatMessages() {
    if (!chatMessagesEl) return;
    chatMessagesEl.innerHTML = '';
    if (!state.chatHistory.length) {
      const empty = document.createElement('div');
      empty.className = 'chat-empty';
      empty.textContent = '有什么想问小橘的？工作、生活、学习都可以聊～';
      chatMessagesEl.appendChild(empty);
      return;
    }
    for (const msg of state.chatHistory) {
      const bubble = document.createElement('div');
      bubble.className = `chat-bubble ${msg.role}${msg.error ? ' error' : ''}${
        msg.pending ? ' pending' : ''
      }${msg.streaming ? ' streaming' : ''}`;
      bubble.textContent = msg.content || (msg.streaming || msg.pending ? '…' : '');
      chatMessagesEl.appendChild(bubble);
    }
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
  }

  function updateStreamingBubble(content) {
    if (!chatMessagesEl) return;
    const last = chatMessagesEl.lastElementChild;
    if (last && last.classList.contains('assistant')) {
      last.classList.remove('pending');
      last.classList.add('streaming');
      last.textContent = content || '…';
      chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
      return;
    }
    renderChatMessages();
  }

  function setChatBusy(busy) {
    state.chatBusy = !!busy;
    if (chatSendBtn) chatSendBtn.disabled = state.chatBusy;
    if (chatInput) chatInput.disabled = state.chatBusy;
  }

  function getSelectedChatProvider() {
    if (chatProviderDeepseek?.checked) return 'deepseek';
    if (chatProviderDoubao?.checked) return 'doubao';
    return 'zhipu';
  }

  function providerDisplayName(provider) {
    if (provider === 'deepseek') return 'DeepSeek';
    if (provider === 'doubao') return '豆包';
    return '智谱';
  }

  function keyInputFor(provider) {
    if (provider === 'doubao') return chatApiKeyDoubao;
    if (provider === 'deepseek') return chatApiKeyDeepseek;
    return null;
  }

  function readProviderKey(provider) {
    const el = keyInputFor(provider);
    return (el?.value || '').trim();
  }

  function writeProviderKey(provider, value) {
    const el = keyInputFor(provider);
    if (el) el.value = value || '';
  }

  function clearAllProviderKeyInputs() {
    if (chatApiKeyDoubao) chatApiKeyDoubao.value = '';
    if (chatApiKeyDeepseek) chatApiKeyDeepseek.value = '';
  }

  function syncChatProviderUi(provider) {
    const id =
      provider === 'deepseek' || provider === 'doubao' || provider === 'zhipu'
        ? provider
        : 'zhipu';
    state.chatProvider = id;
    if (chatProviderZhipu) chatProviderZhipu.checked = id === 'zhipu';
    if (chatProviderDoubao) chatProviderDoubao.checked = id === 'doubao';
    if (chatProviderDeepseek) chatProviderDeepseek.checked = id === 'deepseek';
    if (chatEndpointWrap) chatEndpointWrap.classList.toggle('hidden', id !== 'doubao');
    const hideKey = id === 'zhipu';
    chatKeyTitle?.classList.toggle('hidden', hideKey);
    chatKeyRow?.classList.toggle('hidden', hideKey);
    chatApiKeyDoubao?.classList.toggle('hidden', id !== 'doubao');
    chatApiKeyDeepseek?.classList.toggle('hidden', id !== 'deepseek');
  }

  function apiKeyFromConfig(cfg, provider) {
    if (provider === 'doubao') return cfg?.doubaoApiKey || '';
    if (provider === 'deepseek') return cfg?.deepseekApiKey || '';
    return '';
  }

  async function loadChatConfig() {
    if (!window.petAPI.getChatConfig) return;
    try {
      const cfg = await window.petAPI.getChatConfig();
      const provider = cfg?.provider || 'zhipu';
      syncChatProviderUi(provider);
      clearAllProviderKeyInputs();
      if (provider === 'doubao') {
        writeProviderKey('doubao', apiKeyFromConfig(cfg, 'doubao'));
        if (chatEndpointInput) chatEndpointInput.value = cfg?.doubaoEndpoint || '';
      } else if (provider === 'deepseek') {
        writeProviderKey('deepseek', apiKeyFromConfig(cfg, 'deepseek'));
        if (chatEndpointInput) chatEndpointInput.value = '';
      } else if (chatEndpointInput) {
        chatEndpointInput.value = '';
      }
      updateChatKeyTip(cfg);
    } catch {
      /* ignore */
    }
  }

  function updateChatKeyTip(cfg) {
    if (!chatKeyTip) return;
    if (state.chatProvider === 'zhipu') {
      chatKeyTip.textContent =
        '智谱使用内置免费 Key，无需填写。通道忙时会自动排队重试。';
    } else if (state.chatProvider === 'doubao') {
      const ready = !!(cfg?.doubaoApiKey && cfg?.doubaoEndpoint);
      chatKeyTip.textContent = ready
        ? '豆包已配置 · 请填写自己的火山方舟 Key + 接入点'
        : '豆包需自行填写 API Key 和推理接入点（ep-…），无内置 Key';
    } else {
      chatKeyTip.textContent = cfg?.deepseekApiKey
        ? 'DeepSeek 已保存你填写的 Key · API 需余额'
        : 'DeepSeek 需自行填写 API Key，无内置 Key';
    }
  }

  async function saveChatConfig() {
    const provider = getSelectedChatProvider();
    if (provider === 'zhipu') {
      const result = await window.petAPI.setChatConfig({ provider: 'zhipu' });
      syncChatProviderUi('zhipu');
      clearAllProviderKeyInputs();
      updateChatKeyTip(result);
      say('智谱已就绪，可以直接聊');
      return;
    }
    const key = readProviderKey(provider);
    const endpoint = (chatEndpointInput?.value || '').trim();
    const patch = { provider };
    if (provider === 'doubao') {
      patch.doubaoApiKey = key;
      patch.doubaoEndpoint = endpoint;
    } else {
      patch.deepseekApiKey = key;
    }
    const result = await window.petAPI.setChatConfig(patch);
    syncChatProviderUi(result?.provider || provider);
    writeProviderKey(provider, apiKeyFromConfig(result, provider));
    updateChatKeyTip(result);
    const ok =
      provider === 'doubao'
        ? !!(result?.doubaoApiKey && result?.doubaoEndpoint)
        : !!apiKeyFromConfig(result, provider);
    say(ok ? '配置保存好啦' : '已保存（请补全 Key / 接入点）');
  }

  async function onChatProviderChange() {
    const provider = getSelectedChatProvider();
    clearAllProviderKeyInputs();
    if (chatEndpointInput && provider !== 'doubao') chatEndpointInput.value = '';
    syncChatProviderUi(provider);
    await window.petAPI.setChatConfig({ provider });
    await loadChatConfig();
  }

  async function openChatPanel() {
    if (state.lookPanelOpen) await closeLookPanel();
    if (state.carePanelOpen) await closeCarePanel();
    state.chatPanelOpen = true;
    state.panelOpen = false;
    panelEl.classList.add('hidden');
    await window.petAPI.setPanelMode('chat');
    await loadChatConfig();
    renderChatMessages();
    chatPanelEl.classList.remove('hidden');
    setTimeout(() => chatInput?.focus(), 50);
  }

  async function closeChatPanel() {
    state.chatPanelOpen = false;
    chatPanelEl.classList.add('hidden');
    await window.petAPI.setPanelMode('none');
  }

  async function toggleChatPanel() {
    if (state.chatPanelOpen) await closeChatPanel();
    else await openChatPanel();
  }

  function clearChatHistory() {
    if (state.chatBusy) return;
    state.chatHistory = [];
    renderChatMessages();
    say('对话清空啦');
  }

  async function sendChatMessage() {
    if (state.chatBusy || !chatInput) return;
    const text = chatInput.value.trim();
    if (!text) return;

    const provider = getSelectedChatProvider();
    const endpoint = (chatEndpointInput?.value || '').trim();
    // Zhipu uses built-in key; other providers need user key from the input
    const apiKey = provider === 'zhipu' ? '' : readProviderKey(provider);

    if (provider !== 'zhipu' && !apiKey) {
      sayKey('chatErr');
      if (chatKeyTip) chatKeyTip.textContent = `请先填写 ${providerDisplayName(provider)} API Key`;
      keyInputFor(provider)?.focus();
      return;
    }
    if (provider === 'doubao' && !endpoint) {
      sayKey('chatErr');
      if (chatKeyTip) chatKeyTip.textContent = '请填写推理接入点 ID（ep-…）';
      chatEndpointInput?.focus();
      return;
    }

    chatInput.value = '';
    state.chatHistory.push({ role: 'user', content: text });
    const assistantMsg = {
      role: 'assistant',
      content: '',
      pending: true,
      streaming: true,
    };
    state.chatHistory.push(assistantMsg);
    renderChatMessages();
    setChatBusy(true);
    sayKey('chat');
    setAction('think');

    try {
      // Persist current fields so next open still works
      const savePatch = { provider };
      if (provider === 'doubao') {
        savePatch.doubaoApiKey = apiKey;
        savePatch.doubaoEndpoint = endpoint;
      } else if (provider === 'deepseek') {
        savePatch.deepseekApiKey = apiKey;
      }
      await window.petAPI.setChatConfig(savePatch);

      const historyForApi = state.chatHistory
        .filter((m) => !m.pending && !m.streaming && !m.error)
        .map((m) => ({ role: m.role, content: m.content }));
      // Never send a typed key for zhipu; main process uses built-in fallback
      const result = await window.petAPI.chatComplete(
        {
          provider,
          apiKey: provider === 'zhipu' ? undefined : apiKey || undefined,
          endpoint: provider === 'doubao' ? endpoint : undefined,
          messages: historyForApi,
        },
        (_delta, full, meta) => {
          if (meta?.status) {
            assistantMsg.content = meta.status;
            assistantMsg.pending = true;
            updateStreamingBubble(meta.status);
            return;
          }
          assistantMsg.content = full;
          assistantMsg.pending = false;
          updateStreamingBubble(full);
        },
      );

      assistantMsg.pending = false;
      assistantMsg.streaming = false;
      if (result?.ok) {
        assistantMsg.content = result.reply;
        state.mood = clamp(state.mood + 4);
        sayKey('chatOk');
        spawnParticles('spark', 4);
      } else {
        const err = result?.error || '请求失败';
        if (!assistantMsg.content) {
          assistantMsg.content = err;
          assistantMsg.error = true;
        } else {
          // Partial stream then error: keep text, mark lightly
          assistantMsg.content = `${assistantMsg.content}\n\n（中断：${err}）`;
          assistantMsg.error = true;
        }
        sayKey('chatErr');
      }
      renderChatMessages();
    } catch (err) {
      assistantMsg.pending = false;
      assistantMsg.streaming = false;
      if (!assistantMsg.content) {
        assistantMsg.content = err?.message || '网络异常';
        assistantMsg.error = true;
      } else {
        assistantMsg.content = `${assistantMsg.content}\n\n（中断：${err?.message || '网络异常'}）`;
        assistantMsg.error = true;
      }
      renderChatMessages();
      sayKey('chatErr');
    } finally {
      if (state.chatHistory.length > 40) {
        state.chatHistory = state.chatHistory.slice(-40);
      }
      setChatBusy(false);
      setAction('idle');
      updateBars();
      scheduleSave();
    }
  }

  async function feed() {
    if (state.dragging) return;
    state.hunger = clamp(state.hunger + 28);
    state.mood = clamp(state.mood + 8);
    setAction('eat');
    sayKey('feed');
    spawnParticles('food', 8);
    lockFor(1800);
    updateBars();
    scheduleSave();
    setTimeout(() => {
      if (state.action === 'eat') {
        setAction('happy');
        spawnParticles('heart', 5);
      }
      setTimeout(() => {
        if (!isLocked()) setAction(state.quiet ? 'sit' : 'idle');
      }, 900);
    }, 1800);
  }

  async function play() {
    if (state.dragging) return;
    state.mood = clamp(state.mood + 18);
    state.energy = clamp(state.energy - 10);
    state.hunger = clamp(state.hunger - 6);
    updateBars();
    scheduleSave();
    if (Math.random() > 0.5) dance();
    else {
      setAction('happy');
      sayKey('play');
      spawnParticles('star', 8);
      afterAnim(2200);
    }
  }

  async function sleepPet() {
    if (state.dragging) return;
    setAction('yawn');
    say('哈～欠…');
    lockFor(1200);
    setTimeout(() => {
      setAction('sleep');
      sayKey('sleep');
      lockFor(5000);
      const tick = setInterval(() => {
        state.energy = clamp(state.energy + 4);
        updateBars();
      }, 500);
      setTimeout(() => {
        clearInterval(tick);
        state.mood = clamp(state.mood + 5);
        updateBars();
        setAction('stretch');
        sayKey('wake');
        spawnParticles('spark', 5);
        afterAnim(1100);
        scheduleSave();
      }, 5000);
    }, 1200);
  }

  async function pet() {
    if (state.dragging) return;
    state.mood = clamp(state.mood + 12);
    setAction('squish');
    spawnParticles('heart', 4);
    lockFor(280);
    updateBars();
    scheduleSave();
    setTimeout(() => {
      const next = state.mood > 85 ? 'happy' : Math.random() > 0.7 ? 'shy' : 'happy';
      setAction(next);
      sayKey(next === 'shy' ? 'pet' : 'pet');
      if (next === 'happy') spawnParticles('heart', 6);
      afterAnim(next === 'shy' ? 1000 : 1400, Math.random() > 0.5 ? 'sit' : null);
    }, 280);
  }

  async function walkBurst(opts = {}) {
    if (isLocked() || (!state.autoEnabled && !opts.force)) return;

    const work = await window.petAPI.getWorkArea();
    const bounds = await window.petAPI.getBounds();
    if (!work || !bounds) return;

    const mode = opts.mode || (Math.random() > 0.72 ? 'run' : 'walk');
    const dir = opts.dir || (Math.random() > 0.5 ? 1 : -1);
    const facing = facingTowardPositiveX(dir > 0);
    const profile = {
      walk: { speed: 2.2, dist: 90, action: 'walk', energy: 2 },
      run: { speed: 3.8, dist: 150, action: 'run', energy: 4 },
      crawl: { speed: 1.35, dist: 70, action: 'crawl', energy: 1 },
      slide: { speed: 5.2, dist: 160, action: 'slide', energy: 3 },
    }[mode] || { speed: 2.2, dist: 90, action: 'walk', energy: 2 };

    const distance = profile.dist + Math.floor(Math.random() * 120);
    const speed = profile.speed + Math.random() * 1.2;
    const steps = Math.max(1, Math.floor(distance / speed));

    setAction(profile.action, facing);
    lockFor(steps * 28 + 250);
    state.energy = clamp(state.energy - profile.energy);
    state.hunger = clamp(state.hunger - 1);
    updateBars();

    let i = 0;
    const startX = bounds.x;
    const startY = bounds.y;
    const timer = setInterval(async () => {
      if (state.dragging) {
        clearInterval(timer);
        return;
      }
      i += 1;
      let nextX = startX + dir * speed * i;
      let nextY = startY;
      if (mode === 'slide') nextY = startY + Math.sin(i / 4) * 2;
      const atLeft = nextX <= work.x + 4;
      const atRight = nextX + bounds.width >= work.x + work.width - 4;
      if (atLeft || atRight || i >= steps) {
        clearInterval(timer);
        await window.petAPI.setPosition(
          Math.min(Math.max(work.x, nextX), work.x + work.width - bounds.width),
          startY,
        );
        if (atLeft || atRight) {
          playSpecial('shake', 500, null, 'sweat');
          setTimeout(() => {
            if (!state.dragging) playSpecial('surprise', 700, 'surprise', 'sweat');
          }, 520);
        } else {
          const endRoll = Math.random();
          if (state.quiet) {
            if (endRoll > 0.55) setAction('sit', facing);
            else if (endRoll > 0.25) playSpecial('stretch', 1200, null, 'spark');
            else setAction('idle', facing);
          } else if (endRoll > 0.82) {
            playSpecial('stretch', 1200, null, 'spark');
          } else if (endRoll > 0.64) {
            playSpecial('wiggle', 900, 'wiggle', 'spark');
          } else if (endRoll > 0.45) {
            setAction('sit', facing);
          } else if (endRoll > 0.28) {
            playSpecial('hopside', 600, null, null);
          } else {
            setAction('idle', facing);
          }
        }
        scheduleSave();
        return;
      }
      await window.petAPI.setPosition(nextX, nextY);
    }, 28);
  }

  function waitMs(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function clampToWork(x, y, work, w, h) {
    return {
      x: Math.min(Math.max(work.x, x), work.x + work.width - w),
      y: Math.min(Math.max(work.y, y), work.y + work.height - h),
    };
  }

  function pickRoamAction(dx, dy, horizMode, current) {
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    let next = horizMode;
    if (ay > ax * 1.35 && ay > 28) {
      next = dy < 0 ? 'climb' : 'glide';
    } else if (ax > ay * 1.15 || ax > 20) {
      next = horizMode;
    } else if (ay > 24) {
      next = dy < 0 ? 'climb' : 'glide';
    } else {
      next = current === 'climb' || current === 'glide' || current === 'bounce'
        ? current
        : horizMode;
    }
    // Hysteresis: keep current locomotion unless clearly changing
    if (current === next) return next;
    if ((current === 'walk' || current === 'run' || current === 'crawl') && next === horizMode) {
      return horizMode;
    }
    if (current === 'climb' && next === 'climb') return 'climb';
    if ((current === 'glide' || current === 'bounce') && (next === 'glide' || next === 'bounce')) {
      return current;
    }
    if ((current === 'walk' || current === 'run') && (next === 'climb' || next === 'glide')) {
      if (ay < ax * 1.6) return current;
    }
    if ((current === 'climb' || current === 'glide') && next === horizMode) {
      if (ax < ay * 1.4) return current;
    }
    return next;
  }

  async function moveToPoint(targetX, targetY, speed, horizMode = 'walk') {
    const maxFrames = 160;
    let moveAction = horizMode;
    let facingHold = state.facing;
    let facingVotes = 0;

    for (let frames = 0; frames < maxFrames; frames += 1) {
      if (state.dragging || isOverlayPanelOpen()) return false;

      const work = await window.petAPI.getWorkArea();
      const b = await window.petAPI.getBounds();
      if (!work || !b) return false;

      const cx = b.x + b.width / 2;
      const cy = b.y + b.height / 2;
      const dx = targetX - cx;
      const dy = targetY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < 28) return true;

      const desiredFacing =
        Math.abs(dx) > 18 ? facingTowardPositiveX(dx >= 0) : facingHold;
      if (desiredFacing !== facingHold) {
        facingVotes += 1;
        if (facingVotes >= 3) {
          facingHold = desiredFacing;
          facingVotes = 0;
        }
      } else {
        facingVotes = 0;
      }

      moveAction = pickRoamAction(dx, dy, horizMode, moveAction);
      setAction(moveAction, facingHold);

      // Slight arc on mostly-horizontal moves so vertical isn't stiff diagonal
      let stepX = (dx / dist) * Math.min(speed, dist);
      let stepY = (dy / dist) * Math.min(speed, dist);
      if (Math.abs(dx) > Math.abs(dy) * 1.2) {
        stepY *= 0.85;
      }

      const next = clampToWork(b.x + stepX, b.y + stepY, work, b.width, b.height);
      await window.petAPI.setPosition(next.x, next.y);
      await waitMs(30);
    }
    return true;
  }

  function randomRoamTarget(work, bounds, prefer) {
    const minX = work.x + bounds.width / 2 + 8;
    const maxX = work.x + work.width - bounds.width / 2 - 8;
    const minY = work.y + bounds.height / 2 + 8;
    const maxY = work.y + work.height - bounds.height / 2 - 8;
    const spanX = Math.max(1, maxX - minX);
    const spanY = Math.max(1, maxY - minY);
    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;

    if (prefer === 'vertical') {
      return {
        x: Math.min(maxX, Math.max(minX, cx + (Math.random() - 0.5) * 100)),
        y: minY + Math.random() * spanY,
      };
    }
    if (prefer === 'horizontal') {
      const goRight = cx < work.x + work.width / 2;
      return {
        x: goRight ? maxX - Math.random() * spanX * 0.15 : minX + Math.random() * spanX * 0.15,
        y: Math.min(maxY, Math.max(minY, cy + (Math.random() - 0.5) * spanY * 0.55)),
      };
    }
    return {
      x: minX + Math.random() * spanX,
      y: minY + Math.random() * spanY,
    };
  }

  async function roamScreen(opts = {}) {
    if (isLocked() || (!state.autoEnabled && !opts.force)) return;
    if (isOverlayPanelOpen()) return;

    const work = await window.petAPI.getWorkArea();
    const bounds = await window.petAPI.getBounds();
    if (!work || !bounds) return;

    sayKey('roam');
    spawnParticles('spark', 5);
    state.energy = clamp(state.energy - 5);
    state.hunger = clamp(state.hunger - 2);
    updateBars();

    const legs = 2 + Math.floor(Math.random() * 3);
    const horizMode = Math.random() > 0.55 ? 'run' : 'walk';
    const baseSpeed = horizMode === 'run' ? 3.4 : 2.3;
    lockFor(legs * 4800 + 800);

    for (let i = 0; i < legs; i += 1) {
      if (state.dragging || isOverlayPanelOpen()) break;
      const b = await window.petAPI.getBounds();
      if (!b) break;

      const roll = Math.random();
      const prefer = roll < 0.22 ? 'vertical' : roll < 0.78 ? 'horizontal' : 'any';
      const target = randomRoamTarget(work, b, prefer);
      const speed = baseSpeed + Math.random() * 0.7;
      await moveToPoint(target.x, target.y, speed, horizMode);

      if (i < legs - 1 && !state.dragging) {
        const pause = Math.random();
        if (state.quiet) {
          if (pause < 0.35) {
            setAction('sit', state.facing);
            await waitMs(550);
          } else if (pause < 0.6) {
            setAction('idle', state.facing);
            await waitMs(450);
          }
        } else if (pause < 0.22) {
          setAction('wave', state.facing);
          await waitMs(700);
        } else if (pause < 0.4) {
          setAction('idle', state.facing);
          await waitMs(450);
        } else if (pause < 0.52) {
          setAction('sit', state.facing);
          await waitMs(550);
        }
      }
    }

    if (!state.dragging) {
      if (state.quiet) {
        setAction('sit');
      } else {
        const end = Math.random();
        if (end > 0.72) playSpecial('stretch', 1200, null, 'spark');
        else if (end > 0.45) {
          setAction('happy');
          afterAnim(1000);
        } else if (end > 0.22) setAction('sit');
        else setAction('idle');
        if (end <= 0.72) afterAnim(900);
      }
    }
    scheduleSave();
  }

  async function hopTravel() {
    if (isLocked() || !state.autoEnabled) return;
    const work = await window.petAPI.getWorkArea();
    const bounds = await window.petAPI.getBounds();
    if (!work || !bounds) return;
    const dir = Math.random() > 0.5 ? 1 : -1;
    const facing = facingTowardPositiveX(dir > 0);
    sayKey('jump');
    spawnParticles('spark', 5);
    lockFor(1800);
    let hop = 0;
    const hops = 3 + Math.floor(Math.random() * 2);
    const step = async () => {
      if (state.dragging || hop >= hops) {
        setAction(Math.random() > 0.5 ? 'land' : 'happy', facing);
        afterAnim(700);
        return;
      }
      hop += 1;
      setAction('jump', facing);
      const b = await window.petAPI.getBounds();
      if (!b) return;
      const nx = Math.min(Math.max(work.x, b.x + dir * 46), work.x + work.width - b.width);
      await window.petAPI.setPosition(nx, b.y);
      setTimeout(step, 520);
    };
    step();
  }

  async function zoomies() {
    if (isLocked() || !state.autoEnabled) return;
    sayKey('zoom');
    spawnParticles('star', 8);
    setAction('zoom');
    lockFor(900);
    state.energy = clamp(state.energy - 6);
    state.mood = clamp(state.mood + 8);
    updateBars();
    setTimeout(async () => {
      if (state.dragging) return;
      await walkBurst({ mode: 'run', force: true });
    }, 850);
  }

  function doSequence(steps) {
    if (!steps.length || state.dragging) return;
    const [first, ...rest] = steps;
    const { action, ms, line, particle, next } = first;
    setAction(action);
    if (line) sayKey(line);
    if (particle) spawnParticles(particle, 5);
    lockFor(ms);
    setTimeout(() => {
      if (state.dragging) return;
      if (rest.length) doSequence(rest);
      else setAction(next || (state.quiet ? 'sit' : 'idle'));
    }, ms);
  }

  async function maybeWander() {
    if (isLocked() || isOverlayPanelOpen()) return;

    // Status-driven needs always take priority (not mode-gated)
    if (state.hunger < 28) {
      sayKey('beg');
      playSpecial('beg', 1600, 'beg', 'heart');
      return;
    }
    if (state.energy < 22) {
      sayKey('tired');
      await sleepPet();
      return;
    }
    if (state.mood < 30) {
      const m = Math.random();
      if (state.quiet) {
        if (m < 0.5) playSpecial('think', 1800, 'bored', null);
        else playSpecial('lay', 2000, 'bored', null);
      } else if (m < 0.4) {
        playSpecial('angry', 900, 'angry', 'sweat');
      } else if (m < 0.7) {
        playSpecial('think', 1800, 'bored', null);
      } else {
        playSpecial('lay', 2000, 'bored', null);
      }
      return;
    }

    // 自由行动 → movement only; 安静模式 → non-movement mannerisms
    const movement = [
      { w: 22, run: () => roamScreen() },
      { w: 5, run: () => walkBurst({ mode: 'walk' }) },
      { w: 4, run: () => walkBurst({ mode: 'run' }) },
      { w: 4, run: () => walkBurst({ mode: 'crawl' }) },
      { w: 3, run: () => walkBurst({ mode: 'slide' }) },
      { w: 5, run: () => hopTravel() },
      // Lively locomotion: needs free roam, suppressed by quiet
      ...(!state.quiet
        ? [
            { w: 5, run: () => chaseCursor() },
            { w: 4, run: () => zoomies() },
          ]
        : []),
    ];

    const calmManner = [
      { w: 5, run: () => playSpecial('stretch', 1200, 'stretch', 'spark') },
      { w: 4, run: () => playSpecial('clean', 1500, 'clean', 'spark') },
      { w: 4, run: () => playSpecial('think', 1800, 'think', null) },
      { w: 3, run: () => playSpecial('peek', 1400, 'peek', null) },
      { w: 3, run: () => playSpecial('nod', 1000, 'nod', null) },
      { w: 3, run: () => playSpecial('lay', 2200, 'lay', null) },
      { w: 4, run: () => {
        setAction('sit');
        lockFor(1600 + Math.random() * 1800);
      } },
      { w: 3, run: () => {
        setAction(state.quiet ? 'sit' : 'idle');
        lockFor(1400 + Math.random() * 1600);
      } },
      { w: 3, run: () => doSequence([
        { action: 'yawn', ms: 1200, line: 'sleep' },
        { action: 'sleep', ms: 2800 },
        { action: 'stretch', ms: 1000, line: 'wake', particle: 'spark', next: state.quiet ? 'sit' : 'idle' },
      ]) },
      { w: 2, run: () => doSequence([
        { action: 'think', ms: 1200, line: 'think' },
        { action: 'nod', ms: 800, line: 'nod', next: state.quiet ? 'sit' : 'idle' },
      ]) },
    ];

    const livelyManner = [
      { w: 5, run: () => playSpecial('jump', 700, 'jump', 'spark') },
      { w: 5, run: () => playSpecial('roll', 900, 'roll', 'spark') },
      { w: 5, run: () => playSpecial('flip', 800, 'flip', 'star') },
      { w: 5, run: () => playSpecial('wave', 1000, 'wave', 'spark') },
      { w: 4, run: () => playSpecial('dance', 2600, 'dance', 'music') },
      { w: 4, run: () => playSpecial('spin', 900, 'spin', 'star') },
      { w: 4, run: () => playSpecial('wiggle', 900, 'wiggle', 'spark') },
      { w: 3, run: () => playSpecial('sneeze', 900, 'sneeze', 'sweat') },
      { w: 3, run: () => playSpecial('tip', 1200, 'tip', 'sweat') },
      { w: 3, run: () => playSpecial('hopside', 600, 'jump', null) },
      { w: 3, run: () => playSpecial('bounce', 1600, null, 'spark') },
      { w: 3, run: () => playSpecial('celebrate', 1100, 'celebrate', 'star') },
      { w: 2, run: () => doSequence([
        { action: 'think', ms: 1200, line: 'think' },
        { action: 'nod', ms: 800, line: 'nod' },
        { action: 'wave', ms: 900, line: 'wave', particle: 'spark', next: 'idle' },
      ]) },
      { w: 2, run: () => doSequence([
        { action: 'squish', ms: 280 },
        { action: 'jump', ms: 650, line: 'jump', particle: 'spark' },
        { action: 'land', ms: 550, next: 'happy' },
      ]) },
    ];

    // High-energy specials: lively only (quiet suppresses)
    if (!state.quiet && state.autoEnabled && state.energy > 75 && state.mood > 60 && Math.random() < 0.12) {
      await zoomies();
      return;
    }
    if (!state.quiet && state.mood > 85 && Math.random() < 0.1) {
      playSpecial('celebrate', 1200, 'celebrate', 'star');
      return;
    }

    const behaviors = [
      ...(state.autoEnabled ? movement : []),
      ...calmManner,
      ...(!state.quiet ? livelyManner : []),
    ];
    if (!behaviors.length) return;

    const total = behaviors.reduce((s, b) => s + b.w, 0);
    let r = Math.random() * total;
    for (const b of behaviors) {
      r -= b.w;
      if (r <= 0) {
        await b.run();
        return;
      }
    }
  }

  function decayStats() {
    state.hunger = clamp(state.hunger - 0.35);
    state.mood = clamp(state.mood - (state.hunger < 35 ? 0.45 : 0.18));
    if (state.action === 'walk' || state.action === 'run' || state.action === 'crawl' || state.action === 'climb') {
      state.energy = clamp(state.energy - 0.25);
    } else if (state.action === 'slide' || state.action === 'zoom' || state.action === 'glide') {
      state.energy = clamp(state.energy - 0.4);
    } else if (state.action === 'sleep' || state.action === 'lay') {
      state.energy = clamp(state.energy + 0.5);
    } else {
      state.energy = clamp(state.energy - 0.08);
    }
    updateBars();
    scheduleSave();
  }

  async function onAction(action) {
    switch (action) {
      case 'feed':
        feed();
        break;
      case 'play':
        play();
        break;
      case 'sleep':
        sleepPet();
        break;
      case 'pet':
        pet();
        break;
      case 'toggle-panel':
        togglePanel();
        break;
      case 'toggle-care':
        toggleCarePanel();
        break;
      case 'toggle-chat':
        toggleChatPanel();
        break;
      case 'clean-junk':
        if (!state.carePanelOpen) await openCarePanel();
        hideCleanConfirm();
        runCleanJunk({ includeSafe: true, includeIds: [] });
        break;
      case 'clean-c-drive':
        openCDriveClean();
        break;
      case 'optimize-memory':
        if (!state.carePanelOpen) await openCarePanel();
        runOptimizeMemory();
        break;
      case 'change-look':
        openLookPanel();
        break;
      case 'wander':
      case 'wander-on':
        setAutoEnabled(true);
        break;
      case 'wander-off':
        setAutoEnabled(false);
        break;
      case 'autostart-on':
        if (careAutostart) careAutostart.checked = true;
        say('已设置开机自启');
        break;
      case 'autostart-off':
        if (careAutostart) careAutostart.checked = false;
        say('已取消开机自启');
        break;
      case 'autostart-fail':
        if (careAutostart) careAutostart.checked = false;
        say('设置开机自启失败，请重试');
        break;
      case 'dance':
        dance();
        break;
      case 'jump':
        playSpecial('jump', 700, 'jump', 'spark');
        break;
      case 'flip':
        playSpecial('flip', 800, 'flip', 'star');
        break;
      case 'zoom':
        if (!state.autoEnabled) setAutoEnabled(true, true);
        zoomies();
        break;
      case 'quiet-on':
        setQuiet(true);
        break;
      case 'quiet-off':
        setQuiet(false);
        break;
      case 'pomodoro-toggle':
        togglePomodoro();
        break;
      case 'tell-time':
        tellTime();
        break;
      default:
        break;
    }
  }

  petEl.addEventListener('pointerdown', async (e) => {
    if (e.button !== 0) return;
    if (isOverlayPanelOpen()) return;
    e.preventDefault();
    const bounds = await window.petAPI.getBounds();
    if (!bounds) return;

    state.dragging = true;
    state.didDrag = false;
    state.dragOffsetX = e.screenX - bounds.x;
    state.dragOffsetY = e.screenY - bounds.y;
    setAction('drag');
    spawnParticles('spark', 3);
    petEl.setPointerCapture(e.pointerId);
  });

  petEl.addEventListener('pointermove', async (e) => {
    if (!state.dragging) return;
    state.didDrag = true;
    await window.petAPI.setPosition(
      e.screenX - state.dragOffsetX,
      e.screenY - state.dragOffsetY,
    );
  });

  petEl.addEventListener('pointerup', async (e) => {
    if (!state.dragging) return;
    state.dragging = false;
    try {
      petEl.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }

    const work = await window.petAPI.getWorkArea();
    const bounds = await window.petAPI.getBounds();
    if (work && bounds) {
      const floorY = work.y + work.height - bounds.height;
      if (bounds.y < floorY - 8) {
        setAction('fall');
        const startY = bounds.y;
        const frames = 18;
        let f = 0;
        const fall = setInterval(async () => {
          f += 1;
          const t = f / frames;
          const y = startY + (floorY - startY) * (t * t);
          await window.petAPI.setPosition(bounds.x, y);
          if (f >= frames) {
            clearInterval(fall);
            setAction('land');
            spawnParticles('sweat', 4);
            say(pick(['掉下来了…', '落地成功！', '吓死我了']));
            lockFor(600);
            scheduleSave();
            setTimeout(() => {
              setAction('sit');
              afterAnim(900);
            }, 600);
          }
        }, 16);
        return;
      }
    }

    setAction('idle');
    scheduleSave();
  });

  petEl.addEventListener('click', (e) => {
    if (isOverlayPanelOpen()) return;
    if (state.didDrag) {
      state.didDrag = false;
      return;
    }
    if (e.detail > 1) return;
    handlePetClick();
  });

  lookCloseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeLookPanel();
  });

  careCloseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeCarePanel();
  });

  panelCloseBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeStatusPanel();
  });

  careAuto?.addEventListener('change', () => setAutoEnabled(careAuto.checked));
  careQuiet.addEventListener('change', () => setQuiet(careQuiet.checked));
  careClickThrough.addEventListener('change', async () => {
    await window.petAPI.setClickThrough(careClickThrough.checked);
    say(careClickThrough.checked ? '已开启穿透，托盘可关闭' : '已关闭穿透，可以点我啦');
  });
  careAutostart.addEventListener('change', async () => {
    const want = careAutostart.checked;
    let enabled = want;
    try {
      enabled = !!(await window.petAPI.setAutostart(want));
    } catch {
      enabled = false;
    }
    careAutostart.checked = enabled;
    if (want && !enabled) {
      say('设置开机自启失败，请重试');
      return;
    }
    say(enabled ? '已设置开机自启' : '已取消开机自启');
  });
  careWater.addEventListener('change', () => {
    state.remindWater = careWater.checked;
    state.lastWaterAt = Date.now();
    pushCareState();
    scheduleSave();
  });
  careEyes.addEventListener('change', () => {
    state.remindEyes = careEyes.checked;
    state.lastEyesAt = Date.now();
    pushCareState();
    scheduleSave();
  });
  careStretch.addEventListener('change', () => {
    state.remindStretch = careStretch.checked;
    state.lastStretchAt = Date.now();
    pushCareState();
    scheduleSave();
  });
  careMemo.addEventListener('input', () => {
    state.memo = careMemo.value.slice(0, 80);
    updatePanelExtra();
    scheduleSave();
  });
  careMemo.addEventListener('change', () => {
    pushCareState();
    say(state.memo.trim() ? '便签记下啦，我会提醒你' : '便签已清空');
  });
  carePomoToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePomodoro();
  });
  careCornerBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    await window.petAPI.snapCorner('bottom-right');
    say('回到角落啦');
  });

  careCleanBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    hideCleanConfirm();
    runCleanJunk({ includeSafe: true, includeIds: [] });
  });

  careCleanCBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    openCDriveClean();
  });

  cleanConfirmGo?.addEventListener('click', (e) => {
    e.stopPropagation();
    confirmAndCleanSelected();
  });

  cleanConfirmCancel?.addEventListener('click', (e) => {
    e.stopPropagation();
    hideCleanConfirm();
    say('好，先不清理这些');
  });

  careMemoryBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    runOptimizeMemory();
  });

  lookImportBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    await importLooksWithOptions({ cutout: false });
  });

  lookImportCutoutBtn?.addEventListener('click', async (e) => {
    e.stopPropagation();
    await importLooksWithOptions({ cutout: true });
  });

  lookFolderBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    await window.petAPI.openLookFolder();
  });

  lookPanelEl.addEventListener('pointerdown', (e) => e.stopPropagation());
  carePanelEl.addEventListener('pointerdown', (e) => e.stopPropagation());
  chatPanelEl?.addEventListener('pointerdown', (e) => e.stopPropagation());
  panelEl.addEventListener('pointerdown', (e) => e.stopPropagation());

  chatCloseBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeChatPanel();
  });
  chatSaveKeyBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    saveChatConfig();
  });
  chatProviderZhipu?.addEventListener('change', (e) => {
    e.stopPropagation();
    onChatProviderChange();
  });
  chatProviderDoubao?.addEventListener('change', (e) => {
    e.stopPropagation();
    onChatProviderChange();
  });
  chatProviderDeepseek?.addEventListener('change', (e) => {
    e.stopPropagation();
    onChatProviderChange();
  });
  chatClearBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    clearChatHistory();
  });
  chatSendBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    sendChatMessage();
  });
  chatInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (state.lookPanelOpen) closeLookPanel();
      if (state.carePanelOpen) closeCarePanel();
      if (state.chatPanelOpen) closeChatPanel();
      if (state.panelOpen) closeStatusPanel();
    }
  });

  window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    window.petAPI.showContextMenu();
  });

  window.petAPI.onAction(onAction);

  async function boot() {
    await restore();
    updateBars();
    setAction(state.quiet ? 'sit' : 'idle');
    say(`${timeGreeting()} · ${formatClock()}`, 3200);
    setTimeout(() => {
      if (!state.quiet) playSpecial('wave', 1000, 'wave', 'spark');
    }, 900);
    setInterval(decayStats, 8000);
    setInterval(maybeWander, 3200);
    setInterval(reactToCursor, 700);
    setInterval(checkCareReminders, 30000);
    setInterval(persist, 60000);
    setInterval(updatePanelExtra, 1000);
  }

  boot();
})();
