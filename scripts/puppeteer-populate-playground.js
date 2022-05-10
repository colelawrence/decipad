module.exports = async (browser, context) => {
  const page = await browser.newPage();
  await page.goto(process.env.LHCI_SERVER_BASE_URL);
  await page.evaluate(() => {
    localStorage.setItem('deciPopulatePlayground', 'true');
  });

  await page.close();
};
