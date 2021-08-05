export async function getPageText() {
  return page.$eval('body', (bod) => bod.innerText);
}
