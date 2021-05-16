import mongoose from "mongoose";
// import { redisClient } from "../redis/redis-client";
import { UserDoc } from "./user";
interface PostAttrs {
  title: string;
  content: string;
  user: UserDoc;
}
interface PostModel extends mongoose.Model<PostDoc> {
  build(attrs: PostAttrs): PostDoc;
}
interface PostDoc extends mongoose.Document {
  title: string;
  content: string;
  user: UserDoc;
}

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        // manipulate ret to change json result
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
    timestamps: true,
  }
);

// postSchema.pre("find", async function (done) {
//   const exists  = await redisClient.get(JSON.stringify(this.getOptions()))
//   if(exists){
//     this.set
//   }
// });

postSchema.statics.build = (attrs: PostAttrs) => {
  return new Post(attrs);
};

const Post = mongoose.model<PostDoc, PostModel>("Post", postSchema);
export { Post };
