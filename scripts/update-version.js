#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const versionFile = path.join(__dirname, '..', 'version.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function getCurrentVersion() {
  try {
    const data = fs.readFileSync(versionFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {
      version: '0.0.0',
      releaseDate: new Date().toISOString().split('T')[0],
      description: ''
    };
  }
}

function incrementVersion(version, type) {
  const parts = version.split('.').map(Number);
  
  switch (type) {
    case 'major':
      parts[0]++;
      parts[1] = 0;
      parts[2] = 0;
      break;
    case 'minor':
      parts[1]++;
      parts[2] = 0;
      break;
    case 'patch':
      parts[2]++;
      break;
  }
  
  return parts.join('.');
}

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  const current = getCurrentVersion();
  console.log(`\n현재 버전: ${current.version}`);
  console.log(`릴리즈 날짜: ${current.releaseDate}`);
  console.log(`설명: ${current.description}\n`);

  const updateType = await askQuestion(
    '버전 업데이트 타입을 선택하세요:\n' +
    '1) major (x.0.0)\n' +
    '2) minor (1.x.0)\n' +
    '3) patch (1.1.x)\n' +
    '4) custom (직접 입력)\n' +
    '선택 (1-4): '
  );

  let newVersion;
  
  switch (updateType) {
    case '1':
      newVersion = incrementVersion(current.version, 'major');
      break;
    case '2':
      newVersion = incrementVersion(current.version, 'minor');
      break;
    case '3':
      newVersion = incrementVersion(current.version, 'patch');
      break;
    case '4':
      newVersion = await askQuestion('새 버전 번호를 입력하세요 (예: 1.2.0): ');
      break;
    default:
      console.log('잘못된 선택입니다.');
      process.exit(1);
  }

  const description = await askQuestion('버전 설명을 입력하세요: ');
  
  const newVersionData = {
    version: newVersion,
    releaseDate: new Date().toISOString().split('T')[0],
    description: description
  };

  console.log('\n새 버전 정보:');
  console.log(JSON.stringify(newVersionData, null, 2));
  
  const confirm = await askQuestion('\n이대로 업데이트하시겠습니까? (y/n): ');
  
  if (confirm.toLowerCase() === 'y') {
    fs.writeFileSync(versionFile, JSON.stringify(newVersionData, null, 2));
    console.log('\n✅ 버전이 업데이트되었습니다!');
    console.log(`\n다음 단계:`);
    console.log(`1. git add version.json`);
    console.log(`2. git commit -m "chore: Update version to ${newVersion}"`);
    console.log(`3. git tag v${newVersion}`);
    console.log(`4. git push origin main --tags`);
  } else {
    console.log('\n취소되었습니다.');
  }
  
  rl.close();
}

main().catch(console.error);