import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Post } from "../../models/post";
import { User } from "../../models/user";
describe("list posts", () => {
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

  it("normal list posts", async () => {
    // signup
    const email = "test@test.com";
    const email2 = "test2@test.com";
    const cookie = await global.signup(email);
    const cookie2 = await global.signup(email2);
    const user1s = await User.find({ email });
    expect(user1s.length).toEqual(1);
    const user1 = user1s[0];
    const user2s = await User.find({ email: email2 });
    expect(user2s.length).toEqual(1);
    const user2 = user2s[0];
    // create posts
    const title1 = "testTitle1";
    const content1 = "testContent1";
    const title2 = "testTitle2";
    const content2 = "testContent2";
    const title3 = "testTitle3";
    const content3 = "testContent3";
    const post1 = await Post.build({
      title: title1,
      content: content1,
      user: user1,
    });
    const post2 = await Post.build({
      title: title2,
      content: content2,
      user: user2,
    });
    const post3 = await Post.build({
      title: title3,
      content: content3,
      user: user1,
    });
    await post1.save();
    await post2.save();
    await post3.save();
    const res = await request(app)
      .get("/api/posts")
      .set("Cookie", cookie)
      .expect(200);
    // check response
    expect(res.body.length).toEqual(2);
    expect(res.body[0].title).toEqual(title1);
    expect(res.body[0].content).toEqual(content1);
    expect(res.body[1].title).toEqual(title3);
    expect(res.body[1].content).toEqual(content3);
    expect(res.body[0].user).toEqual(user1._id.toString());
    expect(res.body[1].user).toEqual(user1._id.toString());
  });

  it("user not exists", async () => {
    // signup
    const email = "test@test.com";
    const email2 = "test2@test.com";
    const cookie = await global.signup(email);
    const cookie2 = await global.signup(email2);
    const user1s = await User.find({ email });
    expect(user1s.length).toEqual(1);
    const user1 = user1s[0];
    const user2s = await User.find({ email: email2 });
    expect(user2s.length).toEqual(1);
    const user2 = user2s[0];
    // delete user
    await user1.delete();
    // create posts
    const title1 = "testTitle1";
    const content1 = "testContent1";
    const title2 = "testTitle2";
    const content2 = "testContent2";
    const title3 = "testTitle3";
    const content3 = "testContent3";
    const post1 = await Post.build({
      title: title1,
      content: content1,
      user: user1,
    });
    const post2 = await Post.build({
      title: title2,
      content: content2,
      user: user2,
    });
    const post3 = await Post.build({
      title: title3,
      content: content3,
      user: user1,
    });
    await post1.save();
    await post2.save();
    await post3.save();
    const res = await request(app)
      .get("/api/posts")
      .set("Cookie", cookie)
      .expect(401);
    // check response
    expect(res.body.errors.length).toEqual(1);
    expect(res.body.errors[0].message).toEqual("Not authorized.");
  });
});
