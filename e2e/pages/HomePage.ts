import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly navBar: Locator;
  readonly matchesLink: Locator;
  readonly standingsLink: Locator;
  readonly votingDropdown: Locator;
  readonly themeToggle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navBar = page.locator('nav');
    this.matchesLink = page.locator('nav').getByRole('link', { name: '경기' });
    this.standingsLink = page.locator('nav').getByRole('link', { name: '순위' });
    this.votingDropdown = page.locator('nav').getByRole('link', { name: '투표' });
    this.themeToggle = page.getByRole('button', { name: /다크.*모드|테마/ });
  }

  async goto() {
    await this.page.goto('/');
  }

  async navigateToMatches() {
    await this.matchesLink.click();
  }

  async openVotingMenu() {
    await this.votingDropdown.click();
  }

  async toggleTheme() {
    await this.themeToggle.click();
  }
}