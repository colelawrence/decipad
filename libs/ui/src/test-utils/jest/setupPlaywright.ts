beforeEach(async () => {
  page.setDefaultTimeout(1_000);
});

afterEach(async () => {
  await jestPlaywright.resetPage();
});

export {};
