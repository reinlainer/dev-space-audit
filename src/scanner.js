const { getAllPaths, getPathsByCategory } = require('./paths');
const { getDirectorySize, pathExists } = require('./utils');
const fs = require('fs').promises;
const path = require('path');
const glob = require('glob');

/**
 * 스캐너 모듈
 * 경로를 스캔하고 결과를 그룹핑
 */

/**
 * 단일 경로 스캔
 */
async function scanPath(pathConfig) {
  const { path: targetPath, name, category, isGlob } = pathConfig;
  
  // Glob 패턴인 경우 처리
  if (isGlob) {
    try {
      // glob 패키지 v10은 Promise를 반환
      const matches = await glob(targetPath, { absolute: true });
      if (matches.length === 0) {
        return {
          name,
          category,
          path: targetPath,
          size: 0,
          exists: false
        };
      }
      
      // 모든 매칭된 경로의 크기 합산
      let totalSize = 0;
      for (const match of matches) {
        const exists = await pathExists(match);
        if (exists) {
          totalSize += await getDirectorySize(match);
        }
      }
      
      return {
        name,
        category,
        path: targetPath,
        size: totalSize,
        exists: matches.length > 0
      };
    } catch (err) {
      return {
        name,
        category,
        path: targetPath,
        size: 0,
        exists: false,
        error: err.message
      };
    }
  }
  
  // 일반 경로인 경우
  const exists = await pathExists(targetPath);
  let size = 0;
  
  if (exists) {
    try {
      size = await getDirectorySize(targetPath);
    } catch (err) {
      return {
        name,
        category,
        path: targetPath,
        size: 0,
        exists: true,
        error: err.message
      };
    }
  }
  
  return {
    name,
    category,
    path: targetPath,
    size,
    exists
  };
}

/**
 * 모든 경로 스캔
 */
async function scanAllPaths() {
  const allPaths = getAllPaths();
  const results = [];
  
  console.log('스캔 중...\n');
  
  for (let i = 0; i < allPaths.length; i++) {
    const pathConfig = allPaths[i];
    const progressText = `[${i + 1}/${allPaths.length}] ${pathConfig.name}...`;
    // 이전 줄을 지우고 새 내용 출력 (충분한 공백으로 덮어쓰기)
    process.stdout.write(`\r${progressText}${' '.repeat(80 - progressText.length)}`);
    
    const result = await scanPath(pathConfig);
    results.push(result);
  }
  
  // 진행 표시 완전히 지우기
  process.stdout.write('\r' + ' '.repeat(80) + '\r');
  
  return results;
}

/**
 * 카테고리별로 결과 그룹핑
 */
function groupResultsByCategory(results) {
  const grouped = {};
  
  results.forEach(result => {
    const category = result.category;
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(result);
  });
  
  return grouped;
}

/**
 * 카테고리별 합계 계산
 */
function calculateCategoryTotals(groupedResults) {
  const totals = {};
  
  Object.keys(groupedResults).forEach(category => {
    const categoryResults = groupedResults[category];
    const total = categoryResults.reduce((sum, result) => sum + result.size, 0);
    totals[category] = total;
  });
  
  return totals;
}

/**
 * 전체 합계 계산
 */
function calculateTotal(results) {
  return results.reduce((sum, result) => sum + result.size, 0);
}

/**
 * Top N 가장 큰 디렉터리 찾기
 */
function getTopDirectories(results, n = 5) {
  return results
    .filter(r => r.exists && r.size > 0)
    .sort((a, b) => b.size - a.size)
    .slice(0, n);
}

module.exports = {
  scanPath,
  scanAllPaths,
  groupResultsByCategory,
  calculateCategoryTotals,
  calculateTotal,
  getTopDirectories
};
