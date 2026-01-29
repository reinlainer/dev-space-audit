#!/usr/bin/env node

/**
 * dev-space-audit CLI 진입점
 */

const scanner = require('./scanner');
const formatter = require('./formatter');

/**
 * 메인 실행 함수
 */
async function main() {
  try {
    // 모든 경로 스캔
    const results = await scanner.scanAllPaths();
    
    // 카테고리별 그룹핑
    const groupedResults = scanner.groupResultsByCategory(results);
    
    // 카테고리별 합계 계산
    const categoryTotals = scanner.calculateCategoryTotals(groupedResults);
    
    // 전체 합계 계산
    const grandTotal = scanner.calculateTotal(results);
    
    // Top 5 디렉터리
    const topDirectories = scanner.getTopDirectories(results, 5);
    
    // 결과 포맷팅 및 출력
    const output = formatter.formatResults(
      groupedResults,
      categoryTotals,
      grandTotal,
      topDirectories
    );
    
    console.log(output);
    
  } catch (error) {
    console.error('오류가 발생했습니다:', error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// 직접 실행된 경우에만 main 함수 실행
if (require.main === module) {
  main();
}

module.exports = { main };
