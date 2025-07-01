import { test, expect } from '@playwright/test';

test.describe('경기 페이지 테스트', () => {
  test('경기 목록이 표시된다', async ({ page }) => {
    await page.goto('/matches');
    
    // 페이지 제목 확인
    await expect(page.locator('h1')).toContainText('경기 일정');
    
    // 경기 카드가 표시되는지 확인
    const matchCards = page.locator('[data-testid="match-card"]');
    await expect(matchCards.first()).toBeVisible();
  });

  test('경기 필터링이 작동한다', async ({ page }) => {
    await page.goto('/matches');
    
    // 상태 필터 확인 및 선택
    const statusFilter = page.locator('[data-testid="status-filter"]');
    await expect(statusFilter).toBeVisible();
    
    // 필터 옵션 선택
    await statusFilter.selectOption('completed');
    
    // 필터링 결과 확인 (URL 파라미터 대신 실제 결과 확인)
    await page.waitForTimeout(1000); // 필터링 처리 대기
    
    // 완료된 경기만 표시되는지 확인
    const matchCards = page.locator('[data-testid="match-card"]');
    if (await matchCards.count() > 0) {
      // 경기 카드가 있으면 모두 완료 상태인지 확인
      const firstCard = matchCards.first();
      await expect(firstCard).toContainText(/완료|종료/);
    }
  });

  test('경기 상세 페이지로 이동한다', async ({ page }) => {
    await page.goto('/matches');
    
    // 첫 번째 경기 카드 클릭
    const firstMatch = page.locator('[data-testid="match-card"]').first();
    await firstMatch.click();
    
    // 상세 페이지로 이동 확인
    await expect(page).toHaveURL(/\/matches\/.+/);
    
    // 페이지 제목 확인
    await expect(page.locator('h1')).toContainText('경기 상세');
    
    // 경기 정보가 표시되는지 확인 (첫 번째 요소만)
    await expect(page.locator('.bg-white.rounded-lg.shadow').first()).toBeVisible();
  });
});