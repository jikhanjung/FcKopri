import { test, expect } from '@playwright/test';

test('앱이 정상적으로 시작된다', async ({ page }) => {
  // 홈페이지 접속
  await page.goto('/');
  
  // 페이지가 로드되었는지 확인
  await expect(page).toHaveTitle(/KOPRI CUP/);
  
  // 메인 콘텐츠가 있는지 확인
  await expect(page.locator('h1')).toContainText('제 1회 KOPRI CUP');
  
  // 네비게이션이 있는지 확인
  await expect(page.locator('nav')).toBeVisible();
});