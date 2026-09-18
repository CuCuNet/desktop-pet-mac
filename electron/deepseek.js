/**
 * @deprecated Use electron/llm.js — kept as a thin wrapper for older requires.
 */
const llm = require('./llm');

module.exports = {
  chatComplete: (opts) => llm.chatComplete({ ...opts, provider: 'deepseek' }),
  DEFAULT_MODEL: 'deepseek-v4-flash',
  API_URL: 'https://api.deepseek.com/chat/completions',
};
