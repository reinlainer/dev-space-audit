const fs = require('fs').promises;
const path = require('path');

/**
 * 유틸리티 함수 모듈
 */

/**
 * 바이트를 읽기 쉬운 형식으로 변환 (GB, MB, KB)
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 디렉터리 크기를 재귀적으로 계산
 * 심볼릭 링크는 제외
 */
async function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  try {
    const stat = await fs.stat(dirPath);
    
    // 심볼릭 링크인 경우 제외
    if (stat.isSymbolicLink()) {
      return 0;
    }
    
    // 파일인 경우 크기 반환
    if (stat.isFile()) {
      return stat.size;
    }
    
    // 디렉터리인 경우 재귀적으로 계산
    if (stat.isDirectory()) {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        try {
          if (entry.isDirectory()) {
            totalSize += await getDirectorySize(fullPath);
          } else if (entry.isFile()) {
            const fileStat = await fs.stat(fullPath);
            totalSize += fileStat.size;
          }
        } catch (err) {
          // 권한 오류 등은 무시하고 계속 진행
          if (err.code !== 'EACCES' && err.code !== 'EPERM') {
            // console.warn(`Warning: Cannot access ${fullPath}: ${err.message}`);
          }
        }
      }
    }
  } catch (err) {
    // 디렉터리가 존재하지 않거나 접근할 수 없는 경우
    if (err.code === 'ENOENT' || err.code === 'EACCES' || err.code === 'EPERM') {
      return 0;
    }
    throw err;
  }
  
  return totalSize;
}

/**
 * 경로가 존재하는지 확인
 */
async function pathExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * 디렉터리인지 확인
 */
async function isDirectory(path) {
  try {
    const stat = await fs.stat(path);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

/**
 * 디렉터리를 재귀적으로 삭제 (Node 14.14 미만 호환용)
 * @param {string} dirPath - 삭제할 디렉터리 경로
 */
async function removeRecursive(dirPath) {
  const stat = await fs.stat(dirPath);
  if (stat.isFile()) {
    await fs.unlink(dirPath);
    return;
  }
  if (stat.isSymbolicLink()) {
    await fs.unlink(dirPath);
    return;
  }
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    await removeRecursive(fullPath);
  }
  await fs.rmdir(dirPath);
}

module.exports = {
  formatBytes,
  getDirectorySize,
  pathExists,
  isDirectory,
  removeRecursive
};
