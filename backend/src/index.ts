import { createServer } from "http";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
const mongod = new MongoMemoryServer();

import dotenv from "dotenv";
dotenv.config();
import { app } from "./app";

console.log("Backend starting...");
if (!process.env.JWT_KEY) {
  throw new Error("JWT_KEY not set.");
}

mongod.getUri().then((uri) => {
  mongoose
    .connect(
      // `mongodb+srv://jinyongnan:${process.env.MONGO_PWD}@cluster0.xk5om.gcp.mongodb.net/xxx?retryWrites=true&w=majority`,
      uri,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
      }
    )
    .then(() => {
      console.log("DB connected.");
    })
    .catch((error) => {
      console.error(error.message);
    });
});
const server = createServer(app);

const port = process.env.PORT || 5000;
server.listen(port, async () => {
  console.log(`Backend listening on port ${port}.`);
});
export { server };
