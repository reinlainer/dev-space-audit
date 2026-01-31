const os = require('os');
const path = require('path');
const fs = require('fs').promises;
const { glob } = require('glob');
const { pathExists, removeRecursive } = require('./utils');

/**
 * 삭제 모듈
 * paths.js에 정의된 경로만 삭제하며, 홈 디렉터리 밖은 절대 삭제하지 않음.
 */

const homeDir = path.resolve(os.homedir());

/**
 * 경로가 홈 디렉터리 이하인지 검증 (안전 검사)
 * @param {string} targetPath - 검사할 절대 경로
 * @throws {Error} 홈 밖 경로인 경우
 */
function assertPathUnderHome(targetPath) {
  const resolved = path.resolve(targetPath);
  const homeResolved = path.resolve(homeDir);
  const isUnderHome =
    resolved === homeResolved || resolved.startsWith(homeResolved + path.sep);
  if (!isUnderHome) {
    throw new Error(
      `Cannot delete: path is outside home directory. (${resolved})`
    );
  }
}

/**
 * 단일 pathConfig에 해당하는 실제 삭제 대상 경로 목록 반환
 * (glob이면 매칭 경로들, 아니면 [path] 한 개)
 * @param {Object} pathConfig - paths.js 형태의 항목
 * @returns {Promise<string[]>} 삭제할 절대 경로 배열
 */
async function getPathsToDelete(pathConfig) {
  const { path: targetPath, isGlob } = pathConfig;

  if (isGlob) {
    const matches = await glob(targetPath, { absolute: true });
    return matches.filter((p) => path.resolve(p).startsWith(homeDir + path.sep) || path.resolve(p) === homeDir);
  }

  const resolved = path.resolve(targetPath);
  if (resolved !== homeDir && !resolved.startsWith(homeDir + path.sep)) {
    return [];
  }
  return [resolved];
}

/**
 * 단일 pathConfig에 해당하는 경로(들) 삭제
 * @param {Object} pathConfig - paths.js 형태의 항목
 * @param {{ dryRun?: boolean }} options - dryRun: true면 실제 삭제 없이 대상만 반환
 * @returns {Promise<{ deleted: string[], errors: { path: string, message: string }[] }>}
 */
async function deletePathConfig(pathConfig, options = {}) {
  const { dryRun = false } = options;
  const deleted = [];
  const errors = [];

  const candidates = await getPathsToDelete(pathConfig);

  for (const fullPath of candidates) {
    try {
      assertPathUnderHome(fullPath);
      const exists = await pathExists(fullPath);
      if (!exists) continue;

      if (dryRun) {
        deleted.push(fullPath);
        continue;
      }

      let removed = false;
      if (typeof fs.rm === 'function') {
        try {
          await fs.rm(fullPath, { recursive: true, force: true });
          removed = true;
        } catch (_) {}
      }
      if (!removed) {
        await removeRecursive(fullPath);
      }
      deleted.push(fullPath);
    } catch (err) {
      errors.push({ path: fullPath, message: err.message });
    }
  }

  return { deleted, errors };
}

/**
 * 여러 pathConfig에 대해 삭제 수행
 * @param {Object[]} pathConfigs - paths.js 형태의 항목 배열
 * @param {{ dryRun?: boolean }} options
 * @returns {Promise<{ deleted: string[], errors: { path: string, message: string }[] }>}
 */
async function deletePathConfigs(pathConfigs, options = {}) {
  const allDeleted = [];
  const allErrors = [];

  for (const config of pathConfigs) {
    const { deleted, errors } = await deletePathConfig(config, options);
    allDeleted.push(...deleted);
    allErrors.push(...errors);
  }

  return { deleted: allDeleted, errors: allErrors };
}

module.exports = {
  assertPathUnderHome,
  getPathsToDelete,
  deletePathConfig,
  deletePathConfigs
};
