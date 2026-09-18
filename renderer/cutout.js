/**
 * Local person/subject cutout via U²-NetP (ONNX WASM).
 * Expects global `ort` from vendor/ort/ort.wasm.min.js.
 */
(() => {
  const SIZE = 320;
  const MEAN = [0.485, 0.456, 0.406];
  const STD = [0.229, 0.224, 0.225];

  let sessionPromise = null;
  let ortReady = false;

  function configureOrt() {
    if (!window.ort) throw new Error('ONNX Runtime 未加载');
    if (ortReady) return;
    const base = new URL('vendor/ort/', window.location.href);
    window.ort.env.wasm.numThreads = 1;
    window.ort.env.wasm.proxy = false;
    window.ort.env.wasm.wasmPaths = {
      mjs: new URL('ort-wasm-simd-threaded.mjs', base).href,
      wasm: new URL('ort-wasm-simd-threaded.wasm', base).href,
    };
    ortReady = true;
  }

  async function ensureSession(modelBytes) {
    configureOrt();
    if (!sessionPromise) {
      const buf =
        modelBytes instanceof ArrayBuffer
          ? new Uint8Array(modelBytes)
          : modelBytes instanceof Uint8Array
            ? modelBytes
            : new Uint8Array(modelBytes);
      sessionPromise = window.ort.InferenceSession.create(buf, {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all',
      });
    }
    return sessionPromise;
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = src;
    });
  }

  function imageToTensor(img) {
    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, SIZE, SIZE);
    const { data } = ctx.getImageData(0, 0, SIZE, SIZE);
    const float = new Float32Array(1 * 3 * SIZE * SIZE);
    const plane = SIZE * SIZE;
    for (let i = 0; i < plane; i += 1) {
      const o = i * 4;
      float[i] = (data[o] / 255 - MEAN[0]) / STD[0];
      float[plane + i] = (data[o + 1] / 255 - MEAN[1]) / STD[1];
      float[plane * 2 + i] = (data[o + 2] / 255 - MEAN[2]) / STD[2];
    }
    return new window.ort.Tensor('float32', float, [1, 3, SIZE, SIZE]);
  }

  function normalizeMask(raw) {
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < raw.length; i += 1) {
      const v = raw[i];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    const span = max - min || 1;
    const out = new Float32Array(raw.length);
    for (let i = 0; i < raw.length; i += 1) {
      // soft contrast so edges are cleaner for pet sprites
      let x = (raw[i] - min) / span;
      x = Math.max(0, Math.min(1, (x - 0.08) / 0.84));
      out[i] = x * x * (3 - 2 * x);
    }
    return out;
  }

  function composePngBlob(img, mask320) {
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    const src = document.createElement('canvas');
    src.width = w;
    src.height = h;
    const sctx = src.getContext('2d', { willReadFrequently: true });
    sctx.drawImage(img, 0, 0);

    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = SIZE;
    maskCanvas.height = SIZE;
    const mctx = maskCanvas.getContext('2d', { willReadFrequently: true });
    const mid = mctx.createImageData(SIZE, SIZE);
    for (let i = 0; i < SIZE * SIZE; i += 1) {
      const a = Math.round(mask320[i] * 255);
      const o = i * 4;
      mid.data[o] = 255;
      mid.data[o + 1] = 255;
      mid.data[o + 2] = 255;
      mid.data[o + 3] = a;
    }
    mctx.putImageData(mid, 0, 0);

    const maskFull = document.createElement('canvas');
    maskFull.width = w;
    maskFull.height = h;
    const mf = maskFull.getContext('2d', { willReadFrequently: true });
    mf.imageSmoothingEnabled = true;
    mf.drawImage(maskCanvas, 0, 0, w, h);
    const maskData = mf.getImageData(0, 0, w, h).data;
    const rgba = sctx.getImageData(0, 0, w, h);
    for (let i = 0; i < w * h; i += 1) {
      rgba.data[i * 4 + 3] = maskData[i * 4 + 3];
    }
    sctx.putImageData(rgba, 0, 0);

    return new Promise((resolve, reject) => {
      src.toBlob(
        (blob) => {
          if (!blob) reject(new Error('导出 PNG 失败'));
          else resolve(blob);
        },
        'image/png',
      );
    });
  }

  /**
   * @param {string} imageSrc data URL or same-origin URL
   * @param {ArrayBuffer|Uint8Array} modelBytes
   * @returns {Promise<ArrayBuffer>} PNG bytes with alpha
   */
  async function removeBackground(imageSrc, modelBytes) {
    const session = await ensureSession(modelBytes);
    const img = await loadImage(imageSrc);
    const input = imageToTensor(img);
    const inputName = session.inputNames[0];
    const outputName = session.outputNames[0];
    const result = await session.run({ [inputName]: input });
    const out = result[outputName];
    const mask = normalizeMask(out.data);
    const blob = await composePngBlob(img, mask);
    return blob.arrayBuffer();
  }

  function resetSession() {
    sessionPromise = null;
  }

  window.petCutout = {
    removeBackground,
    resetSession,
    STILL_EXT: ['.png', '.jpg', '.jpeg', '.webp', '.bmp'],
  };
})();
