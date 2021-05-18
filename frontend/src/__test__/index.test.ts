import puppeteer from "puppeteer";
describe("demo", () => {
  it("test header", async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("http://localhost:4000");
    const brandName = await page.$eval(".navbar-brand", (el) => el.innerHTML);
    expect(brandName).toEqual("Node Advanced");
    await browser.close();
  });
});
