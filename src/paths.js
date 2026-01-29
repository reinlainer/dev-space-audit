const os = require('os');
const path = require('path');

/**
 * 스캔 대상 경로 정의 모듈
 */

const homeDir = os.homedir();

/**
 * 경로를 홈 디렉터리 기준으로 확장
 */
function expandPath(relativePath) {
  return path.join(homeDir, relativePath.replace(/^~/, ''));
}

/**
 * 스캔 대상 경로 정의
 * 각 카테고리별로 경로와 표시 이름을 정의
 */
const scanPaths = {
  nodejs: [
    {
      path: expandPath('~/.npm'),
      name: 'npm Cache (~/.npm)',
      category: 'Node.js / Frontend'
    },
    {
      path: expandPath('~/Library/Caches/npm'),
      name: 'npm Cache (Library/Caches)',
      category: 'Node.js / Frontend'
    },
    {
      path: expandPath('~/Library/Caches/Yarn'),
      name: 'Yarn Cache',
      category: 'Node.js / Frontend'
    },
    {
      path: expandPath('~/.yarn'),
      name: 'Yarn Global',
      category: 'Node.js / Frontend'
    },
    {
      path: expandPath('~/Library/pnpm'),
      name: 'pnpm Cache',
      category: 'Node.js / Frontend'
    }
  ],

  xcode: [
    {
      path: expandPath('~/Library/Developer/Xcode/DerivedData'),
      name: 'DerivedData',
      category: 'Xcode'
    },
    {
      path: expandPath('~/Library/Developer/CoreSimulator/Devices'),
      name: 'iOS Simulators',
      category: 'Xcode'
    },
    {
      path: expandPath('~/Library/Developer/Xcode/Archives'),
      name: 'Archives',
      category: 'Xcode'
    }
  ],

  android: [
    {
      path: expandPath('~/.gradle'),
      name: 'Gradle Cache',
      category: 'Android Studio'
    },
    {
      path: expandPath('~/Library/Android/sdk'),
      name: 'Android SDK',
      category: 'Android Studio'
    },
    {
      path: expandPath('~/.android'),
      name: 'Android Config',
      category: 'Android Studio'
    },
    {
      path: expandPath('~/Library/Caches/Google/AndroidStudio*'),
      name: 'Android Studio Cache',
      category: 'Android Studio',
      isGlob: true
    }
  ],

  macos: [
    {
      path: expandPath('~/Library/Caches'),
      name: 'Library Caches',
      category: 'macOS Common'
    },
    {
      path: expandPath('~/Library/Developer'),
      name: 'Developer Directory',
      category: 'macOS Common'
    }
  ]
};

/**
 * 모든 스캔 경로를 평탄화하여 반환
 */
function getAllPaths() {
  const allPaths = [];
  
  Object.values(scanPaths).forEach(categoryPaths => {
    allPaths.push(...categoryPaths);
  });
  
  return allPaths;
}

/**
 * 카테고리별로 그룹화된 경로 반환
 */
function getPathsByCategory() {
  return scanPaths;
}

module.exports = {
  scanPaths,
  getAllPaths,
  getPathsByCategory,
  expandPath
};
