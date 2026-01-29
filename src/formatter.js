const { formatBytes } = require('./utils');

/**
 * 출력 포맷터 모듈
 * 스캔 결과를 예시 형식대로 포맷팅
 */

/**
 * 카테고리별 결과 포맷팅
 */
function formatCategory(categoryName, results, total) {
  let output = `\n[${categoryName}]\n`;
  
  // 전체 라인 고정 너비: "- " (2) + 이름 (38) + 공백 + 용량 (15) = 총 약 60자
  const totalLineWidth = 60;
  const sizeWidth = 15;
  
  results.forEach(result => {
    if (result.exists && result.size > 0) {
      const sizeStr = formatBytes(result.size);
      const paddedSize = sizeStr.padStart(sizeWidth);
      const nameWithPrefix = `- ${result.name}`;
      const paddingNeeded = totalLineWidth - nameWithPrefix.length - sizeWidth;
      const padding = paddingNeeded > 0 ? ' '.repeat(paddingNeeded) : ' ';
      output += `${nameWithPrefix}${padding}${paddedSize}\n`;
    }
  });
  
  const totalStr = formatBytes(total);
  const paddedTotal = totalStr.padStart(sizeWidth);
  const subtotalText = 'Subtotal:';
  const subtotalPadding = totalLineWidth - subtotalText.length - sizeWidth;
  const subtotalSpaces = subtotalPadding > 0 ? ' '.repeat(subtotalPadding) : ' ';
  output += `${subtotalText}${subtotalSpaces}${paddedTotal}\n`;
  
  return output;
}

/**
 * 전체 결과 포맷팅
 */
function formatResults(groupedResults, categoryTotals, grandTotal, topDirectories) {
  let output = '=== Dev Storage Inspector (macOS) ===\n';
  
  // 카테고리별 출력
  Object.keys(groupedResults).forEach(category => {
    const results = groupedResults[category];
    const total = categoryTotals[category];
    
    // 존재하는 경로가 있는 카테고리만 출력
    const hasResults = results.some(r => r.exists && r.size > 0);
    if (hasResults && total > 0) {
      output += formatCategory(category, results, total);
    }
  });
  
  // 구분선
  output += '\n' + '-'.repeat(40) + '\n';
  
  // 전체 합계
  const totalStr = formatBytes(grandTotal);
  const totalLineWidth = 60;
  const sizeWidth = 15;
  const paddedTotal = totalStr.padStart(sizeWidth);
  const totalLabel = 'Total Developer-related Storage:';
  const totalPadding = totalLineWidth - totalLabel.length - sizeWidth;
  const totalSpaces = totalPadding > 0 ? ' '.repeat(totalPadding) : ' ';
  output += `${totalLabel}${totalSpaces}${paddedTotal}\n`;
  
  // Top 5
  if (topDirectories.length > 0) {
    output += '\nTop 5 Largest Directories:\n';
    topDirectories.forEach((dir, index) => {
      const sizeStr = formatBytes(dir.size);
      const paddedSize = sizeStr.padStart(sizeWidth);
      const itemPrefix = `${index + 1}. `;
      const itemText = `${itemPrefix}${dir.name}`;
      const itemPadding = totalLineWidth - itemText.length - sizeWidth;
      const itemSpaces = itemPadding > 0 ? ' '.repeat(itemPadding) : ' ';
      output += `${itemText}${itemSpaces}${paddedSize}\n`;
    });
  }
  
  return output;
}

/**
 * 간단한 요약 출력 (존재하지 않는 경로 제외)
 */
function formatSummary(results) {
  const existingResults = results.filter(r => r.exists && r.size > 0);
  
  if (existingResults.length === 0) {
    return '스캔된 개발 도구 관련 저장소가 없습니다.\n';
  }
  
  let output = '\n=== 요약 ===\n\n';
  
  existingResults.forEach(result => {
    const sizeStr = formatBytes(result.size);
    output += `${result.name}: ${sizeStr}\n`;
  });
  
  const total = existingResults.reduce((sum, r) => sum + r.size, 0);
  output += `\n총합: ${formatBytes(total)}\n`;
  
  return output;
}

module.exports = {
  formatCategory,
  formatResults,
  formatSummary
};
