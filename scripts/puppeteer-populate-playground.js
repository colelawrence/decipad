const puppeteer = require('puppeteer');

const BASE_URL = process.env.LHCI_SERVER_BASE_URL;

module.export = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(BASE_URL);
  await page.evaluate(() => {
    localStorage.setItem('deciPopulatePlayground', 'true');
  });

  await browser.close();
};
