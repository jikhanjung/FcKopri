// 간단한 인증 상태 생성 (개발용)
const fs = require('fs');
const path = require('path');

const authState = {
  "cookies": [],
  "origins": [
    {
      "origin": "http://localhost:3000",
      "localStorage": [
        {
          "name": "kopri-admin",
          "value": "true"
        }
      ]
    }
  ]
};

// 디렉토리 생성
const fixturesDir = path.join(__dirname, '..', 'fixtures');
if (!fs.existsSync(fixturesDir)) {
  fs.mkdirSync(fixturesDir, { recursive: true });
}

// 인증 상태 파일 생성
const authPath = path.join(fixturesDir, 'admin-auth.json');
fs.writeFileSync(authPath, JSON.stringify(authState, null, 2));

console.log('✅ 임시 관리자 인증 상태가 생성되었습니다:', authPath);
console.log('💡 실제 앱에서 관리자 로그인을 한 번 해주세요.');
console.log('🔄 그 후 npm run test:auth 로 실제 인증 상태를 저장하세요.');