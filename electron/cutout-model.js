const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const { app } = require('electron');

const MODEL_NAME = 'u2netp.onnx';
const MODEL_URL = 'https://unpkg.com/@rmbg/model-u2netp@0.0.1/u2netp.onnx';
const MODEL_MIN_BYTES = 3_000_000;

let downloadPromise = null;

function modelsDir() {
  return path.join(app.getPath('userData'), 'models');
}

function modelPath() {
  return path.join(modelsDir(), MODEL_NAME);
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const tmp = `${dest}.part`;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const file = fs.createWriteStream(tmp);
    const getter = url.startsWith('https:') ? https : http;

    const req = getter.get(url, { headers: { 'User-Agent': 'desktop-pet' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        try {
          fs.unlinkSync(tmp);
        } catch {
          /* ignore */
        }
        downloadFile(res.headers.location, dest).then(resolve, reject);
        return;
      }
      if (res.statusCode !== 200) {
        file.close();
        try {
          fs.unlinkSync(tmp);
        } catch {
          /* ignore */
        }
        reject(new Error(`下载抠图模型失败 (HTTP ${res.statusCode})`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          try {
            fs.renameSync(tmp, dest);
            resolve(dest);
          } catch (err) {
            reject(err);
          }
        });
      });
    });

    req.on('error', (err) => {
      file.close();
      try {
        fs.unlinkSync(tmp);
      } catch {
        /* ignore */
      }
      reject(err);
    });
  });
}

function isModelReady(file = modelPath()) {
  try {
    return fs.existsSync(file) && fs.statSync(file).size >= MODEL_MIN_BYTES;
  } catch {
    return false;
  }
}

/**
 * Ensure U²-NetP weights exist locally (download once ~4.5MB).
 * @returns {Promise<string>} absolute path
 */
async function ensureCutoutModel() {
  const dest = modelPath();
  if (isModelReady(dest)) return dest;
  if (!downloadPromise) {
    downloadPromise = downloadFile(MODEL_URL, dest)
      .then((p) => {
        if (!isModelReady(p)) {
          try {
            fs.unlinkSync(p);
          } catch {
            /* ignore */
          }
          throw new Error('抠图模型文件不完整，请检查网络后重试');
        }
        return p;
      })
      .finally(() => {
        downloadPromise = null;
      });
  }
  return downloadPromise;
}

async function readCutoutModel() {
  const file = await ensureCutoutModel();
  return fs.readFileSync(file);
}

module.exports = {
  ensureCutoutModel,
  readCutoutModel,
  modelPath,
  isModelReady,
  MODEL_URL,
};
