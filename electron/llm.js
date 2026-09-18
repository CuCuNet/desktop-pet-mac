/**
 * OpenAI-compatible chat providers for the desktop pet.
 * - zhipu: 智谱 GLM-4.7-Flash（完全免费，只需 API Key）
 * - doubao: 火山方舟（新用户通常有免费 tokens）
 * - deepseek: DeepSeek API（需余额）
 */

const MAX_HISTORY = 20;
const ZHIPU_MAX_HISTORY = 10;
const REQUEST_TIMEOUT_MS = 90_000;
const ZHIPU_MIN_GAP_MS = 2800;
const ZHIPU_MAX_RETRIES = 4;
const ZHIPU_BASE_BACKOFF_MS = 2000;

/** Built-in free-tier key so AI 咨询 works without manual setup. */
const DEFAULT_ZHIPU_API_KEY =
  '8843abacec2d46ef98a6fd8c76dcd3e2.VS2lPjBlUaAeB42R';

const SYSTEM_PROMPT =
  '你是桌面宠物「小橘」，一只温柔、俏皮、略带撒娇的橘猫助手。' +
  '用简短中文回答用户咨询，语气亲切自然，偶尔带一点猫猫口癖（如「喵」「～」），但不要每句都用。' +
  '回答要实用、好懂；不确定时诚实说明。不要输出 markdown 标题或代码围栏，除非用户明确要求。';

const PROVIDERS = {
  zhipu: {
    id: 'zhipu',
    name: '智谱',
    apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    defaultModel: 'glm-4.7-flash',
    // Free tier often shares account-level RPM; try a lighter free alias if primary is busy
    fallbackModels: ['glm-4-flash'],
    needsEndpoint: false,
    free: true,
    tip: '完全免费 · 注册 bigmodel.cn 创建 Key 即可，无需充值',
    keyPlaceholder: '在 bigmodel.cn 创建 API Key',
  },
  doubao: {
    id: 'doubao',
    name: '豆包',
    apiUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    // model must be user's Endpoint ID (ep-...)
    needsEndpoint: true,
    tip: '新用户实名后通常有免费额度；需 API Key + 接入点 ID（ep-…）',
    keyPlaceholder: '在火山方舟控制台创建 API Key',
    endpointPlaceholder: 'ep-… 推理接入点 ID',
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    apiUrl: 'https://api.deepseek.com/chat/completions',
    defaultModel: 'deepseek-v4-flash',
    needsEndpoint: false,
    tip: 'API 需平台余额（网页聊天免费）· 模型 deepseek-v4-flash',
    keyPlaceholder: 'sk-… 在 platform.deepseek.com 获取',
  },
};

/** Serialize free-tier calls (concurrency often = 1). */
let zhipuQueue = Promise.resolve();
let zhipuLastEndAt = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeProvider(id) {
  if (id === 'deepseek' || id === 'doubao' || id === 'zhipu') return id;
  return 'zhipu';
}

function providerKeyField(providerId) {
  const id = normalizeProvider(providerId);
  if (id === 'doubao') return 'doubaoApiKey';
  if (id === 'deepseek') return 'deepseekApiKey';
  return 'zhipuApiKey';
}

function normalizeMessages(messages, maxHistory = MAX_HISTORY) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, 4000) }))
    .slice(-maxHistory);
}

function extractReply(message) {
  if (!message || typeof message !== 'object') return '';
  const content = typeof message.content === 'string' ? message.content.trim() : '';
  if (content) return content;
  const reasoning =
    typeof message.reasoning_content === 'string' ? message.reasoning_content.trim() : '';
  return reasoning;
}

function extractDeltaText(delta) {
  if (!delta || typeof delta !== 'object') return '';
  if (typeof delta.content === 'string') return delta.content;
  return '';
}

function isRateLimitError(status, data) {
  const raw = String(data?.error?.message || data?.message || data?.error || '').trim();
  return (
    status === 429 ||
    /rate limit|too many|限流|频率|并发|congest|overloaded|busy/i.test(raw)
  );
}

function parseRetryAfterMs(res, data) {
  const header = res?.headers?.get?.('retry-after');
  if (header) {
    const sec = Number(header);
    if (Number.isFinite(sec) && sec > 0) return Math.min(30_000, sec * 1000);
  }
  const raw = String(data?.error?.message || data?.message || '').trim();
  const m = raw.match(/(\d+)\s*(秒|s|sec)/i);
  if (m) {
    const sec = Number(m[1]);
    if (Number.isFinite(sec) && sec > 0) return Math.min(30_000, sec * 1000);
  }
  return 0;
}

function friendlyApiError(providerId, status, data) {
  const raw = String(data?.error?.message || data?.message || data?.error || '').trim();
  const lower = raw.toLowerCase();
  const provider = PROVIDERS[normalizeProvider(providerId)];

  if (status === 401 || /invalid.*key|authentication|unauthorized|api key|鉴权|密钥/i.test(raw)) {
    return `API Key 无效，请到${provider.name}控制台重新创建`;
  }
  if (
    status === 402 ||
    /insufficient balance|余额不足|QuotaExceeded|exceeded.*quota|免费额度|欠费/i.test(raw) ||
    lower.includes('balance')
  ) {
    if (providerId === 'deepseek') {
      return '账户余额不足：请到 platform.deepseek.com 充值后再试（网页聊天免费，API 需余额）';
    }
    if (providerId === 'zhipu') {
      return '智谱免费模型异常：请确认选用 glm-4.7-flash，或到 bigmodel.cn 查看配额';
    }
    return '额度不足或已用完：请到火山方舟查看免费额度 / 开通计费后再试';
  }
  if (isRateLimitError(status, data)) {
    if (providerId === 'zhipu') {
      return '智谱免费通道正忙（免费档并发很低）。已自动重试仍失败：请稍等 1～2 分钟，或到 bigmodel.cn 创建自己的 API Key 更稳';
    }
    return '请求太频繁，请稍后再试';
  }
  if (status === 404 || /model|endpoint|not found|不存在/i.test(raw)) {
    return provider.needsEndpoint
      ? '接入点无效：请确认已创建推理接入点，并填写正确的 ep-… ID'
      : `模型不可用：${raw || '请检查模型名'}`;
  }
  if (raw) return typeof raw === 'string' ? raw : JSON.stringify(raw);
  return `请求失败（HTTP ${status}）`;
}

function buildBody(providerId, { messages, model, endpoint, stream }) {
  const historyLimit = providerId === 'zhipu' ? ZHIPU_MAX_HISTORY : MAX_HISTORY;
  const history = normalizeMessages(messages, historyLimit);
  const provider = PROVIDERS[normalizeProvider(providerId)];
  const resolvedModel =
    provider.needsEndpoint
      ? String(endpoint || model || '').trim()
      : String(model || provider.defaultModel || '').trim();

  const body = {
    model: resolvedModel,
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history],
    stream: !!stream,
    temperature: 0.7,
    max_tokens: providerId === 'zhipu' ? 768 : 1024,
  };

  // Flash models default to thinking; disable for snappier pet chat
  if (providerId === 'deepseek' || providerId === 'zhipu') {
    body.thinking = { type: 'disabled' };
  }

  return { body, history, resolvedModel };
}

function prepareRequest(opts = {}) {
  const providerId = normalizeProvider(opts.provider || 'zhipu');
  const meta = PROVIDERS[providerId];
  const key = String(opts.apiKey || '').trim();

  if (!key) {
    return { ok: false, error: `请先填写 ${meta.name} API Key` };
  }

  const { body, history, resolvedModel } = buildBody(providerId, {
    messages: opts.messages,
    model: opts.model,
    endpoint: opts.endpoint,
    stream: opts.stream,
  });

  if (!history.length || history[history.length - 1].role !== 'user') {
    return { ok: false, error: '请输入要咨询的内容' };
  }
  if (!resolvedModel) {
    return {
      ok: false,
      error: meta.needsEndpoint
        ? '请填写豆包推理接入点 ID（控制台创建后以 ep- 开头）'
        : '缺少模型名',
    };
  }

  return { ok: true, providerId, meta, key, body, resolvedModel };
}

async function readErrorPayload(res) {
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  return data;
}

/**
 * Parse OpenAI-style SSE stream and invoke onDelta for each content piece.
 */
async function consumeSseStream(res, { onDelta, signal } = {}) {
  const reader = res.body?.getReader?.();
  if (!reader) {
    throw new Error('当前环境不支持流式读取');
  }

  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let reply = '';
  let model = '';

  const handleDataLine = (dataStr) => {
    const payload = dataStr.trim();
    if (!payload || payload === '[DONE]') return false;
    let json;
    try {
      json = JSON.parse(payload);
    } catch {
      return true;
    }
    if (json?.model) model = json.model;
    const delta = json?.choices?.[0]?.delta;
    const piece = extractDeltaText(delta);
    if (piece) {
      reply += piece;
      if (typeof onDelta === 'function') onDelta(piece, reply);
    }
    return true;
  };

  try {
    while (true) {
      if (signal?.aborted) {
        const err = new Error('Aborted');
        err.name = 'AbortError';
        throw err;
      }

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n');
      buffer = parts.pop() || '';

      for (const rawLine of parts) {
        const line = rawLine.replace(/\r$/, '');
        if (!line || line.startsWith(':')) continue;
        if (line.startsWith('data:')) {
          const cont = handleDataLine(line.slice(5).trimStart());
          if (cont === false) return { reply, model };
        }
      }
    }

    if (buffer.trim()) {
      const line = buffer.replace(/\r$/, '');
      if (line.startsWith('data:')) {
        handleDataLine(line.slice(5).trimStart());
      }
    }

    return { reply, model };
  } finally {
    try {
      reader.releaseLock?.();
    } catch {
      /* ignore */
    }
    try {
      await res.body?.cancel?.();
    } catch {
      /* ignore */
    }
  }
}

function withZhipuGate(fn) {
  const run = async () => {
    const gap = Math.max(0, ZHIPU_MIN_GAP_MS - (Date.now() - zhipuLastEndAt));
    if (gap > 0) await sleep(gap);
    try {
      return await fn();
    } finally {
      zhipuLastEndAt = Date.now();
    }
  };
  const next = zhipuQueue.then(run, run);
  zhipuQueue = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

function zhipuModelCandidates(preferred) {
  const primary = String(preferred || PROVIDERS.zhipu.defaultModel).trim();
  const list = [primary, ...(PROVIDERS.zhipu.fallbackModels || [])];
  return [...new Set(list.filter(Boolean))];
}

async function chatStreamOnce({
  providerId,
  meta,
  key,
  body,
  resolvedModel,
  onDelta,
  signal,
}) {
  const res = await fetch(meta.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const data = await readErrorPayload(res);
    return {
      ok: false,
      error: friendlyApiError(providerId, res.status, data),
      status: res.status,
      data,
      retryAfterMs: parseRetryAfterMs(res, data),
      rateLimited: isRateLimitError(res.status, data),
    };
  }

  const { reply, model: streamModel } = await consumeSseStream(res, {
    onDelta,
    signal,
  });

  const text = String(reply || '').trim();
  if (!text) {
    return { ok: false, error: '模型没有返回有效内容' };
  }

  return {
    ok: true,
    reply: text,
    provider: providerId,
    model: streamModel || resolvedModel,
    usage: null,
  };
}

async function chatStream({
  provider = 'zhipu',
  apiKey,
  messages,
  model,
  endpoint,
  onDelta,
  onStatus,
} = {}) {
  const prepared = prepareRequest({
    provider,
    apiKey,
    messages,
    model,
    endpoint,
    stream: true,
  });
  if (!prepared.ok) return prepared;

  const { providerId, meta, key, body, resolvedModel } = prepared;

  const run = async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const notify = (msg) => {
      if (typeof onStatus === 'function') onStatus(msg);
    };

    try {
      if (providerId !== 'zhipu') {
        return await chatStreamOnce({
          providerId,
          meta,
          key,
          body,
          resolvedModel,
          onDelta,
          signal: controller.signal,
        });
      }

      const models = zhipuModelCandidates(body.model || resolvedModel);
      let lastFail = null;

      for (let mi = 0; mi < models.length; mi += 1) {
        const currentModel = models[mi];
        const attemptBody = { ...body, model: currentModel };

        for (let attempt = 0; attempt <= ZHIPU_MAX_RETRIES; attempt += 1) {
          if (attempt > 0 || mi > 0) {
            // Fresh stream UI when switching attempt/model
          }

          const result = await chatStreamOnce({
            providerId,
            meta,
            key,
            body: attemptBody,
            resolvedModel: currentModel,
            onDelta,
            signal: controller.signal,
          });

          if (result.ok) return result;

          lastFail = result;
          if (!result.rateLimited || attempt >= ZHIPU_MAX_RETRIES) {
            break;
          }

          const backoff =
            result.retryAfterMs ||
            Math.min(20_000, ZHIPU_BASE_BACKOFF_MS * 2 ** (attempt + (mi > 0 ? 1 : 0)));
          const waitSec = Math.ceil(backoff / 1000);
          notify(
            `智谱正忙，${waitSec} 秒后自动重试（${attempt + 1}/${ZHIPU_MAX_RETRIES}）…`,
          );
          await sleep(backoff);
        }

        // After exhausting retries on this model, try fallback model once path
        if (mi < models.length - 1 && lastFail?.rateLimited) {
          notify(`切换备用免费模型 ${models[mi + 1]} 再试…`);
          await sleep(1200);
        }
      }

      return (
        lastFail || {
          ok: false,
          error: '智谱请求失败，请稍后再试',
        }
      );
    } catch (err) {
      if (err?.name === 'AbortError') {
        return { ok: false, error: '请求超时，请稍后再试' };
      }
      return { ok: false, error: err?.message || '网络异常，请检查网络后重试' };
    } finally {
      clearTimeout(timer);
    }
  };

  if (providerId === 'zhipu') {
    return withZhipuGate(run);
  }
  return run();
}

async function chatComplete(opts = {}) {
  // Prefer streaming path even for non-UI callers; collect full reply.
  return chatStream({ ...opts, onDelta: undefined });
}

module.exports = {
  chatComplete,
  chatStream,
  PROVIDERS,
  normalizeProvider,
  providerKeyField,
  DEFAULT_ZHIPU_API_KEY,
  SYSTEM_PROMPT,
};
