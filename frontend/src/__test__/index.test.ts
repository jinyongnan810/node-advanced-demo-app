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
describe("header", () => {
  let browser: puppeteer.Browser, page: puppeteer.Page;
  beforeEach(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.goto("http://localhost:4000");
  });
  afterEach(async () => {
    await browser!.close();
  });
  it("header before login", async () => {
    const navs = await page.evaluate(() =>
      Array.from(
        document.getElementsByClassName("nav-link"),
        (el) => el.textContent
      )
    );
    expect(navs[0]).toEqual("Sign Up");
    expect(navs[1]).toEqual("Log In");
  });
});
