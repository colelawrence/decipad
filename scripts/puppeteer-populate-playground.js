module.exports = async function (browser, context) {
  const page = await browser.newPage();
  const url = process.env.LHCI_SERVER_BASE_URL;
  await page.goto(url);
  await page.evaluate(() => {
    localStorage.setItem('deciPopulatePlayground', 'true');
  });

  await page.close();
};
