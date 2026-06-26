import { expect, test } from '@playwright/test';
import { mockCreate, mockGetAll, mockGetById, mockUpdate, PRODUCTS } from './helpers.js';

test.describe('Create Product', () => {
  test('renders blank form with correct heading', async ({ page }) => {
    await page.goto('/products/new');

    await expect(page.getByRole('heading', { name: 'New Product' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Product' })).toBeVisible();
  });

  test('breadcrumb links back to products list', async ({ page }) => {
    await mockGetAll(page);
    await page.goto('/products/new');

    await page.getByRole('link', { name: 'Products' }).click();

    await expect(page).toHaveURL('/products');
  });

  test('shows validation errors when submitting empty form', async ({ page }) => {
    await page.goto('/products/new');

    await page.getByRole('button', { name: 'Create Product' }).click();

    await expect(page.getByText('Name is required.')).toBeVisible();
    await expect(page.getByText('SKU is required.')).toBeVisible();
    await expect(page.getByText('Price is required.')).toBeVisible();
    await expect(page.getByText('Quantity is required.')).toBeVisible();
  });

  test('shows validation error for price of zero', async ({ page }) => {
    await page.goto('/products/new');

    await page.getByLabel('Price').fill('0');
    await page.getByLabel('Price').blur();

    await expect(page.getByText('Price must be greater than 0.')).toBeVisible();
  });

  test('shows validation error for negative quantity', async ({ page }) => {
    await page.goto('/products/new');

    await page.getByLabel('Quantity').fill('-1');
    await page.getByLabel('Quantity').blur();

    await expect(page.getByText('Quantity must be 0 or more.')).toBeVisible();
  });

  test('clears field error when value becomes valid', async ({ page }) => {
    await page.goto('/products/new');

    await page.getByRole('button', { name: 'Create Product' }).click();
    await expect(page.getByText('Name is required.')).toBeVisible();

    await page.getByLabel('Product name').fill('My Product');

    await expect(page.getByText('Name is required.')).not.toBeVisible();
  });

  test('creates product and redirects to list with success toast', async ({ page }) => {
    const newProduct = { _id: '99', name: 'Desk Lamp', sku: 'DL-099', price: 34.99, quantity: 10 };
    await mockCreate(page, newProduct);
    await mockGetAll(page, [...PRODUCTS, newProduct]);
    await page.goto('/products/new');

    await page.getByLabel('Product name').fill('Desk Lamp');
    await page.getByLabel('SKU').fill('DL-099');
    await page.getByLabel('Price').fill('34.99');
    await page.getByLabel('Quantity').fill('10');
    await page.getByRole('button', { name: 'Create Product' }).click();

    await expect(page).toHaveURL('/products');
    await expect(page.getByText('"Desk Lamp" created successfully.')).toBeVisible();
  });

  test('cancel button returns to list without saving', async ({ page }) => {
    await mockGetAll(page);
    await page.goto('/products/new');

    await page.getByLabel('Product name').fill('Draft Product');
    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page).toHaveURL('/products');
  });

  test('shows error toast when create API fails', async ({ page }) => {
    await page.route('http://localhost:3000/api/products/', route => {
      if (route.request().method() === 'POST')
        return route.fulfill({ status: 500, json: { message: 'Internal server error' } });
      return route.fallback();
    });
    await page.goto('/products/new');

    await page.getByLabel('Product name').fill('Bad Product');
    await page.getByLabel('SKU').fill('BP-001');
    await page.getByLabel('Price').fill('9.99');
    await page.getByLabel('Quantity').fill('1');
    await page.getByRole('button', { name: 'Create Product' }).click();

    await expect(page.getByText('Internal server error')).toBeVisible();
    await expect(page).toHaveURL('/products/new');
  });

  test('accepts decimal prices', async ({ page }) => {
    const created = { _id: '50', name: 'Widget', sku: 'W-050', price: 1.99, quantity: 1 };
    await mockCreate(page, created);
    await mockGetAll(page, [created]);
    await page.goto('/products/new');

    await page.getByLabel('Product name').fill('Widget');
    await page.getByLabel('SKU').fill('W-050');
    await page.getByLabel('Price').fill('1.99');
    await page.getByLabel('Quantity').fill('1');
    await page.getByRole('button', { name: 'Create Product' }).click();

    await expect(page).toHaveURL('/products');
  });
});

test.describe('Edit Product', () => {
  test('pre-populates form with existing product data', async ({ page }) => {
    const product = PRODUCTS[0];
    await mockGetById(page, product);
    await page.goto(`/products/${product._id}/edit`);

    await expect(page.getByLabel('Product name')).toHaveValue(product.name);
    await expect(page.getByLabel('SKU')).toHaveValue(product.sku);
    await expect(page.getByLabel('Price')).toHaveValue(String(product.price));
    await expect(page.getByLabel('Quantity')).toHaveValue(String(product.quantity));
  });

  test('shows Edit Product heading and Save Changes button', async ({ page }) => {
    const product = PRODUCTS[0];
    await mockGetById(page, product);
    await page.goto(`/products/${product._id}/edit`);

    await expect(page.getByRole('heading', { name: 'Edit Product' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save Changes' })).toBeVisible();
  });

  test('updates product and redirects to list with success toast', async ({ page }) => {
    const product = PRODUCTS[0];
    await mockGetById(page, product);
    await mockUpdate(page, product._id);
    await mockGetAll(page);
    await page.goto(`/products/${product._id}/edit`);

    await page.getByLabel('Product name').fill('Wireless Keyboard Pro');
    await page.getByRole('button', { name: 'Save Changes' }).click();

    await expect(page).toHaveURL('/products');
    await expect(page.getByText('"Wireless Keyboard Pro" updated successfully.')).toBeVisible();
  });

  test('shows error toast when update API fails', async ({ page }) => {
    const product = PRODUCTS[0];
    await mockGetById(page, product);
    await page.route(`http://localhost:3000/api/products/${product._id}`, route => {
      if (route.request().method() === 'PUT')
        return route.fulfill({ status: 422, json: { message: 'SKU already exists.' } });
      return route.fallback();
    });
    await page.goto(`/products/${product._id}/edit`);

    await page.getByRole('button', { name: 'Save Changes' }).click();

    await expect(page.getByText('SKU already exists.')).toBeVisible();
    await expect(page).toHaveURL(`/products/${product._id}/edit`);
  });

  test('shows error banner when product cannot be loaded', async ({ page }) => {
    await page.route('http://localhost:3000/api/products/999', route =>
      route.fulfill({ status: 404, json: {} })
    );
    await page.goto('/products/999/edit');

    await expect(page.getByText('Failed to load product. Please go back and try again.')).toBeVisible();
  });

  test('still validates before submitting on edit', async ({ page }) => {
    const product = PRODUCTS[0];
    await mockGetById(page, product);
    await page.goto(`/products/${product._id}/edit`);

    await page.getByLabel('Product name').fill('');
    await page.getByRole('button', { name: 'Save Changes' }).click();

    await expect(page.getByText('Name is required.')).toBeVisible();
    await expect(page).toHaveURL(`/products/${product._id}/edit`);
  });
});
