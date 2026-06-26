import { expect, test } from '@playwright/test';
import { mockDelete, mockGetAll, PRODUCTS } from './helpers.js';

test.describe('Product List', () => {
  test('shows empty state when no products exist', async ({ page }) => {
    await mockGetAll(page, []);
    await page.goto('/products');

    await expect(page.getByText('No products yet')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Create Product' })).toBeVisible();
  });

  test('renders product rows from the API', async ({ page }) => {
    await mockGetAll(page);
    await page.goto('/products');

    await expect(page.getByRole('cell', { name: 'Wireless Keyboard', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'USB Hub', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Monitor Stand', exact: true })).toBeVisible();
  });

  test('shows summary stat cards with correct counts', async ({ page }) => {
    await mockGetAll(page);
    await page.goto('/products');

    const valueSpans = page.locator('span.text-2xl');
    await expect(valueSpans.first()).toHaveText('3');
    await expect(valueSpans.last()).toHaveText('47');
  });

  test('filters products by name search', async ({ page }) => {
    await mockGetAll(page);
    await page.goto('/products');

    await page.getByPlaceholder('Search by name or SKU…').fill('keyboard');

    await expect(page.getByRole('cell', { name: 'Wireless Keyboard', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'USB Hub', exact: true })).not.toBeVisible();
    await expect(page.getByRole('cell', { name: 'Monitor Stand', exact: true })).not.toBeVisible();
  });

  test('filters products by SKU search', async ({ page }) => {
    await mockGetAll(page);
    await page.goto('/products');

    await page.getByPlaceholder('Search by name or SKU…').fill('UH-002');

    await expect(page.getByRole('cell', { name: 'USB Hub', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Wireless Keyboard', exact: true })).not.toBeVisible();
  });

  test('shows empty search state when no results match', async ({ page }) => {
    await mockGetAll(page);
    await page.goto('/products');

    await page.getByPlaceholder('Search by name or SKU…').fill('nonexistent');

    await expect(page.getByText('No products found')).toBeVisible();
    await expect(page.getByText('Try a different search term or clear the filter.')).toBeVisible();
  });

  test('sorts products ascending and descending by name', async ({ page }) => {
    await mockGetAll(page);
    await page.goto('/products');

    const rows = () => page.locator('tbody tr');

    // Click Name header once → ascending (Monitor Stand, USB Hub, Wireless Keyboard)
    await page.getByRole('columnheader', { name: /name/i }).click();
    await expect(rows().first()).toContainText('Monitor Stand');
    await expect(rows().last()).toContainText('Wireless Keyboard');

    // Click again → descending
    await page.getByRole('columnheader', { name: /name/i }).click();
    await expect(rows().first()).toContainText('Wireless Keyboard');
    await expect(rows().last()).toContainText('Monitor Stand');
  });

  test('sorts products by price', async ({ page }) => {
    await mockGetAll(page);
    await page.goto('/products');

    await page.getByRole('columnheader', { name: /price/i }).click();

    const rows = page.locator('tbody tr');
    await expect(rows.first()).toContainText('USB Hub');   // $29.99
    await expect(rows.last()).toContainText('Wireless Keyboard'); // $79.99
  });

  test('footer shows product count', async ({ page }) => {
    await mockGetAll(page);
    await page.goto('/products');

    await expect(page.getByText('3 products')).toBeVisible();
  });

  test('footer shows filtered count when searching', async ({ page }) => {
    await mockGetAll(page);
    await page.goto('/products');

    await page.getByPlaceholder('Search by name or SKU…').fill('hub');

    await expect(page.getByText(/1 of 3 products/)).toBeVisible();
  });

  test('New Product button navigates to create form', async ({ page }) => {
    await mockGetAll(page);
    await page.goto('/products');

    await page.getByRole('link', { name: 'New Product' }).click();

    await expect(page).toHaveURL('/products/new');
    await expect(page.getByRole('heading', { name: 'New Product' })).toBeVisible();
  });

  test('edit button navigates to edit form for that product', async ({ page }) => {
    await mockGetAll(page);
    await page.goto('/products');

    await page.getByRole('button', { name: `Edit ${PRODUCTS[0].name}` }).click();

    await expect(page).toHaveURL(`/products/${PRODUCTS[0]._id}/edit`);
  });

  test('delete opens confirmation modal', async ({ page }) => {
    await mockGetAll(page);
    await page.goto('/products');

    await page.getByRole('button', { name: `Delete ${PRODUCTS[1].name}` }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(`Are you sure you want to delete "${PRODUCTS[1].name}"?`)).toBeVisible();
  });

  test('cancel on delete modal leaves product in list', async ({ page }) => {
    await mockGetAll(page);
    await page.goto('/products');

    await page.getByRole('button', { name: `Delete ${PRODUCTS[1].name}` }).click();
    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByRole('cell', { name: PRODUCTS[1].name, exact: true })).toBeVisible();
  });

  test('confirms delete removes product from list', async ({ page }) => {
    await mockGetAll(page);
    await mockDelete(page, PRODUCTS[1]._id);
    await page.goto('/products');

    await page.getByRole('button', { name: `Delete ${PRODUCTS[1].name}` }).click();
    await page.getByRole('button', { name: 'Delete' }).last().click();

    await expect(page.getByRole('cell', { name: PRODUCTS[1].name })).not.toBeVisible();
    await expect(page.getByText(`"${PRODUCTS[1].name}" deleted successfully.`)).toBeVisible();
  });

  test('shows error toast when delete API fails', async ({ page }) => {
    await mockGetAll(page);
    await page.route(`http://localhost:3000/api/products/${PRODUCTS[0]._id}`, route => {
      if (route.request().method() === 'DELETE')
        return route.fulfill({ status: 500, json: { message: 'Server error' } });
      return route.fallback();
    });
    await page.goto('/products');

    await page.getByRole('button', { name: `Delete ${PRODUCTS[0].name}` }).click();
    await page.getByRole('button', { name: 'Delete' }).last().click();

    await expect(page.getByText('Failed to delete product.')).toBeVisible();
    await expect(page.getByRole('cell', { name: PRODUCTS[0].name, exact: true })).toBeVisible();
  });

  test('shows error toast when list API fails', async ({ page }) => {
    await page.route('http://localhost:3000/api/products/', route =>
      route.fulfill({ status: 500, json: {} })
    );
    await page.goto('/products');

    await expect(page.getByText('Failed to load products.')).toBeVisible();
  });
});
