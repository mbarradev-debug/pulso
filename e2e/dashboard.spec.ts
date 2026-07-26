import { expect, test } from '@playwright/test';
import { mockMindicadorApi } from './mocks';

test.beforeEach(async ({ page }) => {
  // Toda la API de mindicador.cl queda mockeada a nivel de Playwright: estos
  // tests nunca dependen de que el servicio externo este disponible.
  await mockMindicadorApi(page);
});

test('carga el dashboard y muestra al menos un indicador con valor visible', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Indicadores Chile' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ver historico de uf' })).toBeVisible();
  await expect(page.getByText('$40.000')).toBeVisible();
});

test('marcar un indicador como favorito lo mueve al inicio y persiste tras recargar', async ({
  page,
}) => {
  await page.goto('/');

  const cards = page.getByRole('button', { name: /^Ver historico de /i });
  const dolarCard = page.getByRole('button', { name: 'Ver historico de dolar', exact: true });

  // "dolar" no es el primer indicador por defecto.
  await expect(cards.first()).not.toHaveAccessibleName('Ver historico de dolar');

  await dolarCard.getByRole('button', { name: 'Marcar como favorito' }).click();

  await expect(cards.first()).toHaveAccessibleName('Ver historico de dolar');

  await page.reload();

  await expect(cards.first()).toHaveAccessibleName('Ver historico de dolar');
});

test('el conversor calcula el resultado esperado al ingresar un monto', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Conversor' }).click();

  const montoInput = page.getByLabel('Monto en CLP');
  await montoInput.fill('50000');

  // UF mockeada en 40.000: 50.000 / 40.000 = 1,25
  await expect(page.getByText('Equivalente en UF')).toBeVisible();
  await expect(page.getByText('1,25')).toBeVisible();
});
