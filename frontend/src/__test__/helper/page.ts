import puppeteer from "puppeteer";
import jwt from "jsonwebtoken";
class CustomPage {
  page: puppeteer.Page;
  // ts assumes return type is the same type with target, so we have to manually solve the referencing error
  static async build(): Promise<
    CustomPage & puppeteer.Page & puppeteer.Browser
  > {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({
      width: 1280,
      height: 2000, // sometimes when content are too long, page.click will not work because it can't see the element
      deviceScaleFactor: 1,
    });
    await page.goto("http://localhost:4000");
    const customPage = new CustomPage(page);
    const hasKey = <T extends object>(obj: T, k: keyof any): k is keyof T =>
      k in obj;
    const handler: ProxyHandler<CustomPage> = {
      get: function (target, property: PropertyKey) {
        if (hasKey(target, property)) {
          return target[property];
        } else if (hasKey(browser, property)) {
          return browser[property];
        } else if (hasKey(page, property)) {
          return page[property];
        }
      },
    };

    // @ts-ignore
    return new Proxy(customPage, handler);
  }
  constructor(page: puppeteer.Page) {
    this.page = page;
  }

  // login logic
  async login() {
    const jwtString = jwt.sign(
      { id: "60a5f8592f6a854220f0808e", email: "my-test@test.com" },
      process.env.JWT_SECRET!
    );
    const sessionData = { jwt: jwtString };
    const base64String = Buffer.from(JSON.stringify(sessionData)).toString(
      "base64"
    );
    await this.page.setCookie({ name: "express:sess", value: base64String });
    // wait for ui change

    // use waitForFunction
    // await page.waitForFunction(
    //   () => !!document.querySelector('a.nav-link[href="#/post/list"]')
    // );
    // use waitForSelector
    await this.page.waitForSelector('a.nav-link[href="#/post/list"]', {
      timeout: 1000,
    });
    console.log("page logged in.");
    // await wait(1);
  }
}

export default CustomPage;
