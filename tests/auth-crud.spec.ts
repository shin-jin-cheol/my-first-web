import { expect, test } from '@playwright/test';

const BASE_URL = 'https://my-first-web-ten-phi.vercel.app';
const testId = process.env.TEST_ID;
const testPassword = process.env.TEST_PASSWORD;

test.describe('auth and guest CRUD', () => {
  test.skip(!testId || !testPassword, 'TEST_ID and TEST_PASSWORD are required');

  test('logs in and creates a guest post', async ({ page }, testInfo) => {
    const title = `E2E guest post ${testInfo.project.name} ${Date.now()}`;
    const content = `Created by Playwright E2E at ${new Date().toISOString()}`;

    await page.goto(`${BASE_URL}/auth/login`);

    await page.getByLabel('아이디').fill(testId!);
    await page.getByLabel('비밀번호').fill(testPassword!);
    await page.getByRole('button', { name: /\uB85C\uADF8\uC778|Login/i }).click();

    await expect(page).not.toHaveURL(/\/auth\/login(?:\?|$)/);

    await page.goto(`${BASE_URL}/posts/new`);
    await expect(page).toHaveURL(/\/posts\/new(?:\?|$)/);

    await page.getByLabel('제목').fill(title);
    await page.getByLabel('작성자').fill('신진철');
    await page.getByLabel('내용').fill(content);
    await page.getByRole('button', { name: /게시|Publish/i }).click();

    await expect(page).toHaveURL(/\/posts(?:\/\d+)?(?:\?|$)/);
  });

  test('redirects unauthenticated users away from protected guest write route', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/guest/new`);

    await expect(page).toHaveURL(/\/auth\/login(?:\?|$)/);

    await context.close();
  });
});
