import request from "supertest";
describe("index", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  afterAll(() => {
    jest.clearAllMocks();
    // jest.resetModules();
  });
  it("production mode", async () => {
    // change mode to production
    process.env.NODE_ENV = "production";
    // start server
    const server = require("../index").server;
    // rest test
    const restRes = await request(server)
      .get("/api/users/currentuser")
      .expect(200);
    expect(restRes.body.currentUser).toBeNull();
    // wait
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
    // close server
    server.close();
    // recover mode
    process.env.NODE_ENV = "test";
  });
});
