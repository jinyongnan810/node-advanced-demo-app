import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Post } from "../../models/post";
import { User } from "../../models/user";
describe("create post", () => {
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

  it("normal create post", async () => {
    // signup
    const email = "test@test.com";
    const cookie = await global.signup(email);
    const users = await User.find({ email });
    expect(users.length).toEqual(1);
    const user = users[0];
    // create post
    const title = "testTitle";
    const content = "testContent";
    const res = await request(app)
      .post("/api/posts")
      .set("Cookie", cookie)
      .send({
        title,
        content,
      })
      .expect(201);
    // check response
    expect(res.body.title).toEqual(title);
    expect(res.body.content).toEqual(content);
    expect(res.body.user).toEqual(user._id.toString());
    // check db
    const posts = await Post.find({ title });
    expect(posts.length).toEqual(1);
    const post = posts[0];
    expect(post.title).toEqual(title);
    expect(post.content).toEqual(content);
    expect(post.user).toEqual(user._id);
  });

  it("user not exist", async () => {
    // signup
    const email = "test@test.com";
    const cookie = await global.signup(email);
    const users = await User.find({ email });
    expect(users.length).toEqual(1);
    const user = users[0];
    // delete user
    await user.delete();

    // create post
    const title = "testTitle";
    const content = "testContent";
    const res = await request(app)
      .post("/api/posts")
      .set("Cookie", cookie)
      .send({
        title,
        content,
      })
      .expect(401);
    // check response
    expect(res.body.errors.length).toEqual(1);
    expect(res.body.errors[0].message).toEqual("Not authorized.");
    // check db
    const posts = await Post.find({ title });
    expect(posts.length).toEqual(0);
  });
});
