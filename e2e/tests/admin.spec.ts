import { test, expect } from '@playwright/test';

test.describe('관리자 기능 테스트', () => {
  test.use({
    storageState: 'e2e/fixtures/admin-auth.json' // 관리자 인증 상태 로드
  });

  test('관리자 전용 버튼이 표시된다', async ({ page }) => {
    await page.goto('/teams');
    
    // 관리자 전용 팀 추가 버튼 확인
    await expect(page.locator('[data-testid="add-team-button"]')).toBeVisible();
    
    await page.goto('/matches');
    
    // 관리자 전용 경기 추가 버튼 확인
    await expect(page.locator('[data-testid="add-match-button"]')).toBeVisible();
  });

  test('관리자 네비게이션이 표시된다', async ({ page }) => {
    await page.goto('/');
    
    // 관리자 전용 네비게이션 확인
    await expect(page.locator('.text-green-100, .dark\\:bg-green-800')).toContainText('관리자');
    
    // 관리자 설정 링크 확인 (대회 설정, 데이터 내보내기)
    await expect(page.locator('[title="대회 설정"]')).toBeVisible();
    await expect(page.locator('[title="데이터 내보내기"]')).toBeVisible();
  });
});