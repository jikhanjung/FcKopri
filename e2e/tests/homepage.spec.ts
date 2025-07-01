import { test, expect } from '../fixtures/test-base';

test.describe('홈페이지 테스트', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('홈페이지가 정상적으로 로드된다', async ({ page }) => {
    await expect(page).toHaveTitle(/KOPRI CUP/);
    await expect(page.locator('h1')).toContainText('제 1회 KOPRI CUP');
  });

  test('네비게이션 메뉴가 표시된다', async ({ page }) => {
    // 네비게이션 내에서만 찾기
    const nav = page.locator('nav');
    
    // 주요 메뉴 항목 확인
    await expect(nav.getByRole('link', { name: '홈' })).toBeVisible();
    await expect(nav.getByRole('link', { name: '경기' })).toBeVisible();
    await expect(nav.getByRole('link', { name: '팀' })).toBeVisible();
    await expect(nav.getByRole('link', { name: '순위' })).toBeVisible();
    await expect(nav.getByRole('link', { name: '투표' })).toBeVisible();
  });

  test('다크모드 토글이 작동한다', async ({ page }) => {
    // 초기 상태 확인
    const html = page.locator('html');
    const initialDarkMode = await html.getAttribute('class');
    
    // 테마 토글 클릭
    await page.getByRole('button', { name: /테마|다크|라이트/ }).click();
    
    // 클래스 변경 확인
    const afterToggle = await html.getAttribute('class');
    expect(initialDarkMode).not.toBe(afterToggle);
  });

  test('투표 드롭다운 메뉴가 작동한다', async ({ page }) => {
    // 투표 메뉴에 마우스 호버 (드롭다운 활성화)
    await page.locator('[data-testid="nav-투표-dropdown"]').hover();
    
    // 네비게이션 드롭다운 내의 서브메뉴 항목만 확인
    const nav = page.locator('[data-testid="main-navigation"]');
    await expect(nav.getByRole('link', { name: '경기 결과 맞히기' })).toBeVisible();
    await expect(nav.getByRole('link', { name: '우승팀 맞히기' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'MVP 투표' })).toBeVisible();
    await expect(nav.getByRole('link', { name: '베스트6 투표' })).toBeVisible();
  });
});