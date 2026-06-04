import { expect, test } from '@playwright/test'

test('shows bootstrap screen', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: '組合員情報・配布金管理 Web アプリ' }),
  ).toBeVisible()
})