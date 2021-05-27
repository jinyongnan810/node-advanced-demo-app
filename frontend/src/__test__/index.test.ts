import puppeteer from "puppeteer";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import CustomPage from "./helper/page";
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
    await page.waitForTimeout(1000);
    expect(page.url()).toEqual("http://localhost:4000/#/login");
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
  it("user cannot make ajax request to server before log in", async () => {
    const res = await page.evaluate(() => {
      return fetch("http://localhost:5000/api/posts", {
        method: "GET",
      }).then((res) => res.json());
    });
    expect(res).toEqual({ errors: [{ message: "Not authorized." }] });
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
    // wait for ui change

    // use waitForFunction
    // await page.waitForFunction(
    //   () => !!document.querySelector('a.nav-link[href="#/post/list"]')
    // );
    // use waitForSelector
    await page.waitForSelector('a.nav-link[href="#/post/list"]');

    // await wait(1);
    const navs = await page.evaluate(() =>
      Array.from(
        document.getElementsByClassName("nav-link"),
        (el) => el.textContent
      )
    );

    expect(navs.length).toEqual(3);
    expect(navs[0]).toEqual("my-test@test.com's Dashboard");
    expect(navs[1]).toEqual("Posts");
    expect(navs[2]).toEqual("Sign Out");
  });
});

describe("after log in(using proxy)", () => {
  let page: CustomPage & puppeteer.Page & puppeteer.Browser;
  beforeEach(async () => {
    page = await CustomPage.build();
    await page.login();
    // await page.reload();
  });
  afterEach(async () => {
    await page.close();
  });
  it("page content after login", async () => {
    const navs = await page.evaluate(() =>
      Array.from(
        document.getElementsByClassName("nav-link"),
        (el) => el.textContent
      )
    );
    const content = await page.evaluate(() => {
      return document.querySelector("h1")?.innerHTML;
    });

    expect(navs.length).toEqual(3);
    expect(navs[0]).toEqual("my-test@test.com's Dashboard");
    expect(navs[1]).toEqual("Posts");
    expect(navs[2]).toEqual("Sign Out");
    expect(content).toEqual("Dashboard");
  });

  it("post add test", async () => {
    console.log("click header posts tab");
    await page.click('.nav-link[href="#/post/list"]');
    await page.waitForSelector(".list-group");
    expect(page.url()).toEqual("http://localhost:4000/#/post/list");
    console.log("click add post button");
    await page.click('.btn[href="#/post/create"]');
    await page.waitForSelector("form");
    expect(page.url()).toEqual("http://localhost:4000/#/post/create");
    console.log("set post content");
    const titleValue = `title${Math.random() * 1000000}`;
    const contentValue = `content${Math.random() * 1000000}`;
    await page.type("#title", titleValue);
    await page.type("#content", contentValue);
    console.log("click submit");
    await page.click('button[type="submit"]');
    await page.waitForSelector(".list-group-item");
    expect(page.url()).toEqual("http://localhost:4000/#/post/list");
    console.log("check post added");
    const posts = await page.evaluate(() => {
      return Array.from(
        document.getElementsByClassName("list-group-item"),
        (el) => {
          return {
            title: el.getElementsByClassName("fw-bold")[0]?.innerHTML,
            //@ts-ignore
            content: el.getElementsByClassName("ms-2")[0]?.innerText,
          };
        }
      );
    });
    console.log(posts);

    expect(posts.length).toBeGreaterThanOrEqual(1);
    expect(posts.find((p) => p.title === titleValue)).toBeTruthy();
  });
});
