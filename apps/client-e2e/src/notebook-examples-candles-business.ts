import { fetchTable } from './page-utils/ManyTables';
import { setUp } from './page-utils/Pad';
import { createWorkspace } from './utils/create-workspace';
import { importNotebook } from './utils/import-notebook';
import startingACandleBusiness from './__fixtures__/starting-a-candle-business';

describe('important notebook examples', () => {
  let workspaceId: string;

  beforeAll(async () => {
    await setUp({
      createAndNavigateToNewPad: false,
    });
  });

  beforeAll(async () => {
    // create workspace
    workspaceId = await createWorkspace();
  });

  it('loads and computes the "starting a candle business notebook"', async () => {
    const notebookId = await importNotebook(
      workspaceId,
      JSON.stringify(startingACandleBusiness)
    );

    await page.goto(`/n/${notebookId}`);

    await page.waitForSelector('[contenteditable] h1');

    await page.waitForTimeout(1000);

    expect(await fetchTable('[id="ddTJXSKZzWh56A8NMCZmM"]'))
      .toMatchInlineSnapshot(`
      ".------------------------------------------------.
      |                    Revenue                     |
      |------------------------------------------------|
      | Year |    Units    |    Price     | NetRevenue |
      |------|-------------|--------------|------------|
      | 2022 | 1,000 units | $25 per unit | $25K       |
      | 2023 | 1,400 units | $25 per unit | $35K       |
      | 2024 | 1,960 units | $25 per unit | $49K       |
      | 2025 | 2,744 units | $25 per unit | $68.6K     |
      | 2026 | 3,841 units | $25 per unit | ≈$96.03K   |
      | 2027 | 5,378 units | $25 per unit | ≈$134.45K  |
      '------------------------------------------------'"
    `);

    expect(await fetchTable('[id="HFm_s7Zp8559ZZsUzDnbH"]'))
      .toMatchInlineSnapshot(`
      ".---------------------------------------------.
      |                    COGS                     |
      |---------------------------------------------|
      | Year |  UnitCost   |    Units    |   COGS   |
      |------|-------------|-------------|----------|
      | 2022 | $5 per unit | 1,000 units | $5,000   |
      | 2023 | $5 per unit | 1,400 units | $7,000   |
      | 2024 | $5 per unit | 1,960 units | $9,800   |
      | 2025 | $5 per unit | 2,744 units | ≈$13.72K |
      | 2026 | $5 per unit | 3,841 units | ≈$19.21K |
      | 2027 | $5 per unit | 5,378 units | ≈$26.89K |
      '---------------------------------------------'"
    `);

    expect(await fetchTable('[id="hOM1pr8pzdFI19V4lubQD"]'))
      .toMatchInlineSnapshot(`
      ".--------------------------------------------.
      |                GrossMargin                 |
      |--------------------------------------------|
      | Year | NetRevenue |   COGS   | GrossProfit |
      |------|------------|----------|-------------|
      | 2022 | $25K       | $5,000   | $20K        |
      | 2023 | $35K       | $7,000   | $28K        |
      | 2024 | $49K       | $9,800   | $39.2K      |
      | 2025 | $68.6K     | ≈$13.72K | ≈$54.88K    |
      | 2026 | ≈$96.03K   | ≈$19.21K | ≈$76.82K    |
      | 2027 | ≈$134.45K  | ≈$26.89K | ≈$107.56K   |
      '--------------------------------------------'"
    `);

    expect(await fetchTable('[id="NOnNrYjbMXL7-mNf0_HYD"]'))
      .toMatchInlineSnapshot(`
      ".--------------------------------------------------------------------.
      |                                OPEX                                |
      |--------------------------------------------------------------------|
      | Year |  LaborItem  |    Units    |  Labor   | Marketing |  Total   |
      |------|-------------|-------------|----------|-----------|----------|
      | 2022 | $5 per unit | 1,000 units | $5,000   | $5,000    | $10K     |
      | 2023 | $6 per unit | 1,400 units | $8,400   | $7,000    | $15.4K   |
      | 2024 | $6 per unit | 1,960 units | ≈$11.76K | $9,800    | ≈$21.56K |
      | 2025 | $6 per unit | 2,744 units | ≈$16.46K | ≈$13.72K  | ≈$30.18K |
      | 2026 | $6 per unit | 3,841 units | ≈$23.05K | ≈$19.21K  | ≈$42.25K |
      | 2027 | $6 per unit | 5,378 units | ≈$32.27K | ≈$26.89K  | ≈$59.16K |
      '--------------------------------------------------------------------'"
    `);

    expect(await fetchTable('[id="-farwyIZskJw6c8lgrotZ"]'))
      .toMatchInlineSnapshot(`
      ".--------------------------------------------------------------.
      |                             EBIT                             |
      |--------------------------------------------------------------|
      | Year | NetRevenue | GrossProfit |   OPEX   | OperatingIncome |
      |------|------------|-------------|----------|-----------------|
      | 2022 | $25K       | $20K        | $10K     | $10K            |
      | 2023 | $35K       | $28K        | $15.4K   | $12.6K          |
      | 2024 | $49K       | $39.2K      | ≈$21.56K | ≈$17.64K        |
      | 2025 | $68.6K     | ≈$54.88K    | ≈$30.18K | ≈$24.7K         |
      | 2026 | ≈$96.03K   | ≈$76.82K    | ≈$42.25K | ≈$34.57K        |
      | 2027 | ≈$134.45K  | ≈$107.56K   | ≈$59.16K | ≈$48.4K         |
      '--------------------------------------------------------------'"
    `);

    expect(await fetchTable('[id="Kqjhk4bqXwF7Y4lKcLZIH"]'))
      .toMatchInlineSnapshot(`
      ".----------------------------.
      |            Tax             |
      |----------------------------|
      | Year |   EBIT   |  Taxes   |
      |------|----------|----------|
      | 2022 | $10K     | $2,000   |
      | 2023 | $12.6K   | $2,520   |
      | 2024 | ≈$17.64K | $3,528   |
      | 2025 | ≈$24.7K  | $4,939.2 |
      | 2026 | ≈$34.57K | $6,913.8 |
      | 2027 | ≈$48.4K  | $9,680.4 |
      '----------------------------'"
    `);

    expect(await fetchTable('[id="dx3xX7M8CauTJALImf5vt"]'))
      .toMatchInlineSnapshot(`
      ".------------------------------------------------------------.
      |                         NetIncome                          |
      |------------------------------------------------------------|
      | Year | NetRevenue | OperatingIncome |  Taxes   | NetIncome |
      |------|------------|-----------------|----------|-----------|
      | 2022 | $25K       | $10K            | $2,000   | $8,000    |
      | 2023 | $35K       | $12.6K          | $2,520   | ≈$10.08K  |
      | 2024 | $49K       | ≈$17.64K        | $3,528   | ≈$14.11K  |
      | 2025 | $68.6K     | ≈$24.7K         | $4,939.2 | ≈$19.76K  |
      | 2026 | ≈$96.03K   | ≈$34.57K        | $6,913.8 | ≈$27.66K  |
      | 2027 | ≈$134.45K  | ≈$48.4K         | $9,680.4 | ≈$38.72K  |
      '------------------------------------------------------------'"
    `);
  });
});
