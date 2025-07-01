const { chromium } = require('@playwright/test');

async function saveAdminAuth() {
  const browser = await chromium.launch({ headless: false }); // 브라우저 UI 표시
  const page = await browser.newPage();
  
  try {
    console.log('🔐 관리자 로그인을 위해 브라우저를 엽니다...');
    console.log('💡 수동으로 로그인 후 Enter를 눌러주세요.');
    
    // 관리자 로그인 페이지로 이동
    await page.goto('http://localhost:3000/admin/login');
    
    // 사용자 입력 대기
    await new Promise((resolve) => {
      process.stdout.write('로그인 완료 후 Enter를 누르세요...');
      process.stdin.once('data', resolve);
    });
    
    // 현재 URL 확인
    const currentUrl = page.url();
    console.log('현재 URL:', currentUrl);
    
    if (currentUrl.includes('/admin')) {
      // localStorage에 인증 상태가 저장되었는지 확인
      const adminStatus = await page.evaluate(() => localStorage.getItem('kopri-admin'));
      console.log('localStorage kopri-admin:', adminStatus);
      
      if (adminStatus === 'true') {
        // 인증 상태를 파일로 저장
        await page.context().storageState({ 
          path: 'e2e/fixtures/admin-auth.json' 
        });
        
        console.log('✅ 관리자 인증 상태가 e2e/fixtures/admin-auth.json에 저장되었습니다.');
      } else {
        console.log('❌ localStorage에 인증 상태가 저장되지 않았습니다.');
      }
    } else {
      console.log('❌ 관리자 페이지에 접속되지 않았습니다. 로그인을 확인해주세요.');
    }
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await browser.close();
  }
}

// 스크립트 실행
if (require.main === module) {
  saveAdminAuth();
}