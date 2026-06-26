export const PRODUCTS = [
  { _id: '1', name: 'Wireless Keyboard', sku: 'WK-001', price: 79.99, quantity: 42 },
  { _id: '2', name: 'USB Hub', sku: 'UH-002', price: 29.99, quantity: 5 },
  { _id: '3', name: 'Monitor Stand', sku: 'MS-003', price: 49.99, quantity: 0 },
];

const API = 'http://localhost:3000/api/products';

export async function mockGetAll(page, products = PRODUCTS) {
  await page.route(`${API}/`, route =>
    route.fulfill({ json: { data: products } })
  );
}

export async function mockGetById(page, product) {
  await page.route(`${API}/${product._id}`, route =>
    route.fulfill({ json: { data: product } })
  );
}

export async function mockCreate(page, created) {
  await page.route(`${API}/`, route => {
    if (route.request().method() === 'POST')
      return route.fulfill({ status: 201, json: { data: created } });
    return route.fallback();
  });
}

export async function mockUpdate(page, id) {
  await page.route(`${API}/${id}`, route => {
    if (route.request().method() === 'PUT')
      return route.fulfill({ json: { data: {} } });
    return route.fallback();
  });
}

export async function mockDelete(page, id) {
  await page.route(`${API}/${id}`, route => {
    if (route.request().method() === 'DELETE')
      return route.fulfill({ status: 200, json: {} });
    return route.fallback();
  });
}
