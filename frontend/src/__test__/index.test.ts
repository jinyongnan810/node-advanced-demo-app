import puppeteer from "puppeteer";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const wait = async (sec: number) => {
  return new Promise<void>((res) => {
    setTimeout(() => {
      res();
    }, sec * 1000);
  });
};

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
describe("before log in", () => {
  let browser: puppeteer.Browser, page: puppeteer.Page;
  beforeEach(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.goto("http://localhost:4000");
  });
  afterEach(async () => {
    await browser!.close();
  });
  it("default page content before login", async () => {
    const navs = await page.evaluate(() =>
      Array.from(
        document.getElementsByClassName("nav-link"),
        (el) => el.textContent
      )
    );
    // wait for ui change
    await wait(1);
    const cardTitle = await page.evaluate(() => {
      const el = document.querySelector(".card-title");
      return el?.innerHTML;
    });
    expect(navs.length).toEqual(2);
    expect(navs[0]).toEqual("Sign Up");
    expect(navs[1]).toEqual("Log In");
    expect(cardTitle).toEqual("Log In");
  });
});

describe("after log in", () => {
  let browser: puppeteer.Browser, page: puppeteer.Page;
  beforeEach(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.goto("http://localhost:4000");
    const jwtString = jwt.sign(
      { id: "60a5f8592f6a854220f0808e", email: "my-test@test.com" },
      process.env.JWT_SECRET!
    );
    const sessionData = { jwt: jwtString };
    const base64String = Buffer.from(JSON.stringify(sessionData)).toString(
      "base64"
    );
    // console.log(base64String);
    await page.setCookie({ name: "express:sess", value: base64String });
    // await page.reload();
  });
  afterEach(async () => {
    await browser!.close();
  });
  it("page content after login", async () => {
    await wait(1);
    const navs = await page.evaluate(() =>
      Array.from(
        document.getElementsByClassName("nav-link"),
        (el) => el.textContent
      )
    );
    // wait for ui change

    expect(navs.length).toEqual(3);
    expect(navs[0]).toEqual("my-test@test.com's Dashboard");
    expect(navs[1]).toEqual("Posts");
    expect(navs[2]).toEqual("Sign Out");
  });
});
