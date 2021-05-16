import mongoose from "mongoose";
import { redisClient } from "../redis/redis-client";
const exec = mongoose.Query.prototype.exec;
mongoose.Query.prototype.exec = async function () {
  //   console.log("-----------------------------------------------");
  const query = this.getQuery();
  const collectionName = (this as any).mongooseCollection.name;
  const key = JSON.stringify(
    Object.assign({}, query, { collection: collectionName })
  );
  //   console.log(key);
  const exist = await redisClient.get(key);
  if (exist !== null) {
    // console.log(`get from cache:${key},data:${exist}`);
    return JSON.parse(exist);
  }

  const newFetched = await exec.apply(this);
  //   console.log(`newFetched:${JSON.stringify(newFetched)}`);
  await redisClient.set(key, JSON.stringify(newFetched), "EX", 3);
  return newFetched;
};
