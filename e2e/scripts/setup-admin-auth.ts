import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('🔐 관리자 인증 설정 중...');
    
    // 관리자 로그인 페이지로 이동
    await page.goto('http://localhost:3000/admin/login');
    
    // 비밀번호 입력 (환경변수에서 가져오기)
    const adminPassword = process.env.ADMIN_PASSWORD || 'your_admin_password';
    await page.fill('input[type="password"]', adminPassword);
    
    // 로그인 버튼 클릭
    await page.click('button[type="submit"]');
    
    // 로그인 성공 확인 (관리자 페이지로 리다이렉트)
    await page.waitForURL(/\/admin/, { timeout: 10000 });
    
    // localStorage에 인증 상태가 저장되었는지 확인
    const adminStatus = await page.evaluate(() => localStorage.getItem('kopri-admin'));
    if (adminStatus !== 'true') {
      throw new Error('인증 상태가 올바르게 저장되지 않았습니다.');
    }
    
    // 인증 상태를 파일로 저장
    await page.context().storageState({ 
      path: 'e2e/fixtures/admin-auth.json' 
    });
    
    console.log('✅ 관리자 인증 상태가 저장되었습니다.');
    
  } catch (error) {
    console.error('❌ 관리자 인증 설정 실패:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;