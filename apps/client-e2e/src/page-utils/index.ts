export async function getPageText() {
  return await page.$eval('body', (bod) => bod.innerText);
}
