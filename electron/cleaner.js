const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);

const SKIP_NAMES = new Set([
  'System Volume Information',
  '$Recycle.Bin',
  'WindowsApps',
]);

function humanSize(bytes) {
  let n = Math.max(0, Number(bytes) || 0);
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  for (const unit of units) {
    if (n < 1024 || unit === units[units.length - 1]) {
      return `${n.toFixed(unit === 'B' ? 0 : 1)} ${unit}`;
    }
    n /= 1024;
  }
  return `${n.toFixed(1)} TB`;
}

function uniquePaths(list) {
  const seen = new Set();
  const out = [];
  for (const p of list) {
    if (!p) continue;
    let key = p;
    try {
      key = fs.realpathSync.native ? fs.realpathSync.native(p) : fs.realpathSync(p);
    } catch {
      /* keep */
    }
    const norm = String(key).toLowerCase();
    if (seen.has(norm)) continue;
    seen.add(norm);
    out.push(p);
  }
  return out;
}

function safeStatSize(filePath) {
  try {
    return fs.statSync(filePath).size || 0;
  } catch {
    return 0;
  }
}

function pathExists(p) {
  try {
    return !!p && fs.existsSync(p);
  } catch {
    return false;
  }
}

function estimateDirBytes(dirPath, limitFiles = 6000) {
  let bytes = 0;
  let files = 0;
  if (!pathExists(dirPath)) return { bytes, files, truncated: false };

  const stack = [dirPath];
  while (stack.length && files < limitFiles) {
    const cur = stack.pop();
    let entries = [];
    try {
      entries = fs.readdirSync(cur, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const ent of entries) {
      if (SKIP_NAMES.has(ent.name)) continue;
      const full = path.join(cur, ent.name);
      try {
        if (ent.isDirectory()) stack.push(full);
        else if (ent.isFile() || ent.isSymbolicLink()) {
          bytes += safeStatSize(full);
          files += 1;
          if (files >= limitFiles) {
            return { bytes, files, truncated: true };
          }
        }
      } catch {
        /* ignore */
      }
    }
  }
  return { bytes, files, truncated: false };
}

function removePathDeep(target, stats) {
  try {
    if (!fs.existsSync(target)) return;
    const st = fs.lstatSync(target);
    if (st.isDirectory()) {
      let children = [];
      try {
        children = fs.readdirSync(target);
      } catch {
        stats.errors += 1;
        return;
      }
      for (const name of children) {
        if (SKIP_NAMES.has(name)) continue;
        removePathDeep(path.join(target, name), stats);
      }
      try {
        fs.rmdirSync(target);
      } catch {
        /* locked / non-empty */
      }
      return;
    }
    const size = st.size || 0;
    fs.unlinkSync(target);
    stats.files += 1;
    stats.bytes += size;
  } catch {
    stats.errors += 1;
  }
}

function cleanDirectoryChildren(dirPath, label) {
  const item = { label, files: 0, bytes: 0, errors: 0 };
  if (!pathExists(dirPath)) return item;
  let children = [];
  try {
    children = fs.readdirSync(dirPath);
  } catch {
    item.errors += 1;
    return item;
  }
  for (const name of children) {
    if (SKIP_NAMES.has(name)) continue;
    removePathDeep(path.join(dirPath, name), item);
  }
  return item;
}

function cleanExactPath(targetPath, label, { keepRoot = false } = {}) {
  const item = { label, files: 0, bytes: 0, errors: 0 };
  if (!pathExists(targetPath)) return item;
  try {
    const st = fs.lstatSync(targetPath);
    if (st.isDirectory() && keepRoot) {
      return cleanDirectoryChildren(targetPath, label);
    }
    removePathDeep(targetPath, item);
  } catch {
    item.errors += 1;
  }
  return item;
}

async function runPowerShell(command, timeout = 45000) {
  try {
    const { stdout, stderr } = await execFileAsync(
      'powershell.exe',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', command],
      { timeout, windowsHide: true, encoding: 'utf8' },
    );
    return { ok: true, out: `${stdout || ''}${stderr || ''}`.trim() };
  } catch (err) {
    return { ok: false, out: String(err?.stderr || err?.message || err) };
  }
}

function getMemoryStats() {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;
  return {
    total,
    free,
    used,
    usedRatio: total ? used / total : 0,
    totalText: humanSize(total),
    freeText: humanSize(free),
    usedText: humanSize(used),
    usedPercent: Math.round((used / total) * 100),
  };
}

function getUserTempDirs() {
  return uniquePaths([
    process.env.TEMP,
    process.env.TMP,
    os.tmpdir(),
    process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Temp') : null,
  ].filter(Boolean));
}

function buildCDriveTargets() {
  const win = process.env.SystemRoot || 'C:\\Windows';
  const local = process.env.LOCALAPPDATA || '';
  const userProfile = process.env.USERPROFILE || '';
  const drive = 'C:';

  const safe = [
    ...getUserTempDirs().map((dir, i) => ({
      id: `user-temp-${i}`,
      label: `用户临时文件`,
      path: dir,
      detail: dir,
      reason: '程序运行留下的临时文件，通常可安全删除',
      risk: 'safe',
      keepRoot: true,
      kind: 'dir-children',
    })),
    {
      id: 'win-temp',
      label: 'C 盘系统 Temp',
      path: path.join(win, 'Temp'),
      detail: path.join(win, 'Temp'),
      reason: 'Windows 临时目录（部分文件可能正被占用会跳过）',
      risk: 'safe',
      keepRoot: true,
      kind: 'dir-children',
    },
    {
      id: 'thumbcache',
      label: '缩略图缓存',
      path: local ? path.join(local, 'Microsoft', 'Windows', 'Explorer') : '',
      detail: 'thumbcache_*.db / iconcache_*.db',
      reason: '资源管理器缩略图缓存，删了会自动重建',
      risk: 'safe',
      kind: 'thumbcache',
    },
    {
      id: 'recent',
      label: '最近使用记录',
      path: userProfile ? path.join(userProfile, 'AppData', 'Roaming', 'Microsoft', 'Windows', 'Recent') : '',
      detail: 'Recent 快捷方式',
      reason: '仅清理快捷方式记录，不删原文件',
      risk: 'safe',
      keepRoot: true,
      kind: 'dir-children',
    },
    {
      id: 'recycle',
      label: '回收站',
      path: `${drive}\\$Recycle.Bin`,
      detail: '所有磁盘回收站',
      reason: '清空回收站中的已删文件',
      risk: 'safe',
      kind: 'recycle',
    },
  ];

  const uncertain = [
    {
      id: 'prefetch',
      label: 'Prefetch 预读文件',
      path: path.join(win, 'Prefetch'),
      detail: path.join(win, 'Prefetch'),
      reason: '可能暂时影响开机/软件启动加速，一般可重建',
      risk: 'medium',
      keepRoot: true,
      kind: 'dir-children',
      needsAdmin: true,
    },
    {
      id: 'wu-download',
      label: 'Windows Update 下载缓存',
      path: path.join(win, 'SoftwareDistribution', 'Download'),
      detail: path.join(win, 'SoftwareDistribution', 'Download'),
      reason: '已下载的更新包，清理后更新可能需重新下载',
      risk: 'medium',
      keepRoot: true,
      kind: 'dir-children',
      needsAdmin: true,
    },
    {
      id: 'delivery-opt',
      label: '传递优化缓存',
      path: path.join(win, 'ServiceProfiles', 'NetworkService', 'AppData', 'Local', 'Microsoft', 'Windows', 'DeliveryOptimization', 'Cache'),
      detail: 'DeliveryOptimization\\Cache',
      reason: '系统更新传递缓存，不确定是否还要复用',
      risk: 'medium',
      keepRoot: true,
      kind: 'dir-children',
      needsAdmin: true,
    },
    {
      id: 'minidump',
      label: '蓝屏转储文件',
      path: path.join(win, 'Minidump'),
      detail: path.join(win, 'Minidump'),
      reason: '用于排查蓝屏，若你不需要可删',
      risk: 'medium',
      keepRoot: true,
      kind: 'dir-children',
      needsAdmin: true,
    },
    {
      id: 'memory-dmp',
      label: '完整内存转储 MEMORY.DMP',
      path: path.join(win, 'MEMORY.DMP'),
      detail: path.join(win, 'MEMORY.DMP'),
      reason: '体积可能很大，删除后无法再分析该次崩溃',
      risk: 'medium',
      kind: 'file',
      needsAdmin: true,
    },
    {
      id: 'edge-cache',
      label: 'Edge 浏览器缓存',
      path: local ? path.join(local, 'Microsoft', 'Edge', 'User Data', 'Default', 'Cache') : '',
      detail: 'Edge Cache',
      reason: '会清网页缓存，需重新加载部分网站资源',
      risk: 'medium',
      keepRoot: true,
      kind: 'dir-children',
    },
    {
      id: 'chrome-cache',
      label: 'Chrome 浏览器缓存',
      path: local ? path.join(local, 'Google', 'Chrome', 'User Data', 'Default', 'Cache') : '',
      detail: 'Chrome Cache',
      reason: '会清网页缓存，需重新加载部分网站资源',
      risk: 'medium',
      keepRoot: true,
      kind: 'dir-children',
    },
    {
      id: 'windows-old',
      label: '旧系统 Windows.old',
      path: path.join(drive, 'Windows.old'),
      detail: path.join(drive, 'Windows.old'),
      reason: '升级残留，删除后通常无法回退到旧系统（高风险）',
      risk: 'high',
      kind: 'dir-remove',
      needsAdmin: true,
    },
    {
      id: 'windows-bt',
      label: '升级残留 $WINDOWS.~BT',
      path: path.join(drive, '$WINDOWS.~BT'),
      detail: path.join(drive, '$WINDOWS.~BT'),
      reason: 'Windows 升级临时目录，不确定是否还在升级流程中（高风险）',
      risk: 'high',
      kind: 'dir-remove',
      needsAdmin: true,
    },
    {
      id: 'windows-ws',
      label: '升级残留 $WINDOWS.~WS',
      path: path.join(drive, '$WINDOWS.~WS'),
      detail: path.join(drive, '$WINDOWS.~WS'),
      reason: 'Windows 升级相关残留，不确定是否仍需要（高风险）',
      risk: 'high',
      kind: 'dir-remove',
      needsAdmin: true,
    },
  ];

  return { safe, uncertain };
}

function summarizeTarget(target) {
  if (!target.path || !pathExists(target.path)) {
    return {
      ...target,
      exists: false,
      bytes: 0,
      files: 0,
      bytesText: '0 B',
      truncated: false,
    };
  }

  if (target.kind === 'file') {
    const bytes = safeStatSize(target.path);
    return {
      ...target,
      exists: true,
      bytes,
      files: bytes > 0 ? 1 : 0,
      bytesText: humanSize(bytes),
      truncated: false,
    };
  }

  if (target.kind === 'thumbcache') {
    let bytes = 0;
    let files = 0;
    try {
      for (const name of fs.readdirSync(target.path)) {
        if (!/^thumbcache_.*\.db$/i.test(name) && !/^iconcache_.*\.db$/i.test(name)) continue;
        bytes += safeStatSize(path.join(target.path, name));
        files += 1;
      }
    } catch {
      /* ignore */
    }
    return {
      ...target,
      exists: files > 0,
      bytes,
      files,
      bytesText: humanSize(bytes),
      truncated: false,
    };
  }

  if (target.kind === 'recycle') {
    return {
      ...target,
      exists: true,
      bytes: 0,
      files: 0,
      bytesText: '待清空',
      truncated: false,
    };
  }

  const est = estimateDirBytes(target.path);
  return {
    ...target,
    exists: est.files > 0 || est.bytes > 0 || pathExists(target.path),
    bytes: est.bytes,
    files: est.files,
    bytesText: humanSize(est.bytes) + (est.truncated ? '+' : ''),
    truncated: est.truncated,
  };
}

async function scanCDrive() {
  const { safe, uncertain } = buildCDriveTargets();
  const safeItems = safe
    .map(summarizeTarget)
    .filter((t) => t.kind === 'recycle' || t.exists);
  const uncertainItems = uncertain
    .map(summarizeTarget)
    .filter((t) => t.exists && (t.bytes > 0 || t.files > 0 || t.kind === 'dir-remove'));

  const safeBytes = safeItems.reduce((s, t) => s + (t.bytes || 0), 0);
  const uncertainBytes = uncertainItems.reduce((s, t) => s + (t.bytes || 0), 0);

  return {
    memory: getMemoryStats(),
    safe: safeItems,
    uncertain: uncertainItems,
    safeBytes,
    uncertainBytes,
    safeBytesText: humanSize(safeBytes),
    uncertainBytesText: humanSize(uncertainBytes),
    totalBytesText: humanSize(safeBytes + uncertainBytes),
  };
}

async function getCleanPreview() {
  const scan = await scanCDrive();
  return {
    memory: scan.memory,
    junk: {
      tempBytes: scan.safeBytes,
      tempFiles: scan.safe.reduce((s, t) => s + (t.files || 0), 0),
      thumbBytes: 0,
      thumbFiles: 0,
      approxBytes: scan.safeBytes + scan.uncertainBytes,
      approxText: scan.totalBytesText,
      tempText: scan.safeBytesText,
      thumbText: scan.uncertainBytesText,
      safeBytesText: scan.safeBytesText,
      uncertainBytesText: scan.uncertainBytesText,
      uncertainCount: scan.uncertain.length,
    },
    scan,
  };
}

function cleanOneTarget(target) {
  if (!target) {
    return { label: '未知', files: 0, bytes: 0, errors: 1 };
  }
  if (target.kind === 'recycle') {
    return null; // handled async
  }
  if (target.kind === 'thumbcache') {
    const item = { label: target.label, files: 0, bytes: 0, errors: 0 };
    if (!pathExists(target.path)) return item;
    try {
      for (const name of fs.readdirSync(target.path)) {
        if (!/^thumbcache_.*\.db$/i.test(name) && !/^iconcache_.*\.db$/i.test(name)) continue;
        removePathDeep(path.join(target.path, name), item);
      }
    } catch {
      item.errors += 1;
    }
    return item;
  }
  if (target.kind === 'file') {
    return cleanExactPath(target.path, target.label, { keepRoot: false });
  }
  if (target.kind === 'dir-remove') {
    return cleanExactPath(target.path, target.label, { keepRoot: false });
  }
  return cleanExactPath(target.path, target.label, { keepRoot: true });
}

async function cleanJunk(options = {}) {
  const includeIds = Array.isArray(options.includeIds) ? options.includeIds : [];
  const includeSafe = options.includeSafe !== false;
  const startedAt = Date.now();
  const scan = await scanCDrive();
  const selected = [];

  if (includeSafe) selected.push(...scan.safe);
  for (const item of scan.uncertain) {
    if (includeIds.includes(item.id)) selected.push(item);
  }

  const results = [];
  let recycled = false;

  for (const target of selected) {
    if (target.kind === 'recycle') {
      recycled = true;
      continue;
    }
    results.push(cleanOneTarget(target));
  }

  if (recycled) {
    const recycle = { label: '回收站', files: 0, bytes: 0, errors: 0 };
    const bin = await runPowerShell(
      'Clear-RecycleBin -Force -ErrorAction SilentlyContinue; if (-not $?) { exit 0 }',
    );
    if (bin.ok) recycle.files = 1;
    else recycle.errors += 1;
    results.push(recycle);
  }

  const bytes = results.reduce((s, r) => s + (r?.bytes || 0), 0);
  const files = results.reduce((s, r) => s + (r?.files || 0), 0);
  const errors = results.reduce((s, r) => s + (r?.errors || 0), 0);

  return {
    ok: true,
    files,
    bytes,
    bytesText: humanSize(bytes),
    errors,
    elapsedMs: Date.now() - startedAt,
    results: results.filter(Boolean),
    selectedCount: selected.length,
    memory: getMemoryStats(),
  };
}

async function optimizeMemory() {
  const before = getMemoryStats();
  const startedAt = Date.now();

  if (global.gc) {
    try {
      global.gc();
    } catch {
      /* ignore */
    }
  }

  const ps = `
$ErrorActionPreference = 'SilentlyContinue'
Add-Type -TypeDefinition @"
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
public static class WsTrim {
  [DllImport("psapi.dll")] public static extern bool EmptyWorkingSet(IntPtr h);
}
"@
$trimmed = 0
Get-Process -ErrorAction SilentlyContinue | ForEach-Object {
  try {
    if ($_.Id -eq $PID) { return }
    if (-not $_.Handle) { return }
    if ([WsTrim]::EmptyWorkingSet($_.Handle)) { $trimmed++ }
  } catch {}
}
Write-Output $trimmed
`;

  const trim = await runPowerShell(ps, 60000);
  await runPowerShell(
    'Start-Process -FilePath "$env:SystemRoot\\System32\\rundll32.exe" -ArgumentList "advapi32.dll,ProcessIdleTasks" -WindowStyle Hidden -ErrorAction SilentlyContinue',
    20000,
  );

  await new Promise((r) => setTimeout(r, 800));
  const after = getMemoryStats();
  const freed = Math.max(0, after.free - before.free);

  return {
    ok: true,
    before,
    after,
    freed,
    freedText: humanSize(freed),
    trimmedHint: trim.ok ? trim.out : '',
    elapsedMs: Date.now() - startedAt,
  };
}

module.exports = {
  humanSize,
  getMemoryStats,
  getCleanPreview,
  scanCDrive,
  cleanJunk,
  optimizeMemory,
};
