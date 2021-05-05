import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Post } from "../../models/post";
import { User } from "../../models/user";
describe("get single post", () => {
  let mongo: any;

  beforeAll(async (done) => {
    // set env
    process.env.JWT_KEY = "secret";
    mongo = new MongoMemoryServer();
    const mongoUri = await mongo.getUri();
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    done();
  });

  beforeEach(async (done) => {
    // get all collections
    const collections = await mongoose.connection.db.collections();
    // loop and delete all
    for (let collection of collections) {
      await collection.deleteMany({});
    }
    done();
  });

  afterAll(async (done) => {
    await mongo.stop();
    await mongoose.connection.close();
    done();
  });
  beforeEach(async () => {});

  it("normal get post", async () => {
    // signup
    const email = "test@test.com";
    const cookie = await global.signup(email);
    const users = await User.find({ email });
    expect(users.length).toEqual(1);
    const user = users[0];
    // create post
    const title = "testTitle";
    const content = "testContent";
    const resTemp = await request(app)
      .post("/api/posts")
      .set("Cookie", cookie)
      .send({
        title,
        content,
      })
      .expect(201);
    const res = await request(app)
      .get(`/api/posts/${resTemp.body.id}`)
      .set("Cookie", cookie)
      .expect(200);
    // check response
    expect(res.body.title).toEqual(title);
    expect(res.body.content).toEqual(content);
    expect(res.body.user).toEqual(user._id.toString());
  });
  it("post id format error", async () => {
    // signup
    const email = "test@test.com";
    const cookie = await global.signup(email);
    const users = await User.find({ email });
    expect(users.length).toEqual(1);
    const user = users[0];
    // create post
    const title = "testTitle";
    const content = "testContent";
    const resTemp = await request(app)
      .post("/api/posts")
      .set("Cookie", cookie)
      .send({
        title,
        content,
      })
      .expect(201);
    const res = await request(app)
      .get(`/api/posts/123`)
      .set("Cookie", cookie)
      .expect(400);
    // check response
    expect(res.body.errors.length).toEqual(1);
    expect(res.body.errors[0].message).toEqual("Id format error!");
  });
  it("post not exist", async () => {
    // signup
    const email = "test@test.com";
    const cookie = await global.signup(email);
    const users = await User.find({ email });
    expect(users.length).toEqual(1);
    const user = users[0];
    // create post
    const title = "testTitle";
    const content = "testContent";
    const resTemp = await request(app)
      .post("/api/posts")
      .set("Cookie", cookie)
      .send({
        title,
        content,
      })
      .expect(201);
    const res = await request(app)
      .get(`/api/posts/${mongoose.Types.ObjectId().toHexString()}`)
      .set("Cookie", cookie)
      .expect(400);
    // check response
    expect(res.body.errors.length).toEqual(1);
    expect(res.body.errors[0].message).toEqual("Post not found!");
  });
  it("not authorized", async () => {
    // signup
    const email = "test@test.com";
    const cookie = await global.signup(email);
    const cookie2 = await global.signup("test2@test.com");
    const users = await User.find({ email });
    expect(users.length).toEqual(1);
    const user = users[0];
    // create post
    const title = "testTitle";
    const content = "testContent";
    const titleChanged = "testTitleChanged";
    const contentChanged = "testContentChanged";
    const resTemp = await request(app)
      .post("/api/posts")
      .set("Cookie", cookie)
      .send({
        title,
        content,
      })
      .expect(201);
    const res = await request(app)
      .get(`/api/posts/${resTemp.body.id}`)
      .set("Cookie", cookie2)
      .send({})
      .expect(401);
    // check response
    expect(res.body.errors.length).toEqual(1);
    expect(res.body.errors[0].message).toEqual("Not authorized.");
  });
  it("user not authorized", async () => {
    // signup
    const email = "test@test.com";
    const cookie = await global.signup(email);
    const users = await User.find({ email });
    expect(users.length).toEqual(1);
    const user = users[0];
    // create post
    const title = "testTitle";
    const content = "testContent";
    const resTemp = await request(app)
      .post("/api/posts")
      .set("Cookie", cookie)
      .send({
        title,
        content,
      })
      .expect(201);
    const res = await request(app)
      .get(`/api/posts/${resTemp.body.id}`)
      // .set("Cookie", cookie)
      .expect(401);
    // check response
    expect(res.body.errors.length).toEqual(1);
    expect(res.body.errors[0].message).toEqual("Not authorized.");
  });
});
