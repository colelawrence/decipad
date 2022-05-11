module.exports = async (browser, context) => {
  const page = await browser.newPage();
  // main commits dont have PR
  const url = process.env.LHCI_SERVER_BASE_URL === 'https://.dev.decipad.com' ? 'https://dev.decipad.com' : process.env.LHCI_SERVER_BASE_URL;
  await page.goto(url);
  await page.evaluate(() => {
    localStorage.setItem('deciPopulatePlayground', 'true');
  });

  await page.close();
};
