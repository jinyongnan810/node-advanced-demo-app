import mongoose from "mongoose";
import { redisClient } from "../redis/redis-client";
const exec = mongoose.Query.prototype.exec;
(mongoose.Query.prototype as any).cache = function () {
  (this as any).useCache = true;
  return this;
};
mongoose.Query.prototype.exec = async function () {
  if (!(this as any).useCache) {
    return exec.apply(this);
  }
  //   console.log("-----------------------------------------------");
  const query = this.getQuery();
  const collectionName = (this as any).mongooseCollection.name;
  const key = JSON.stringify(
    Object.assign({}, query, { collection: collectionName })
  );
  //   console.log(key);
  const exist = await redisClient.get(key);
  if (exist !== null) {
    console.log(`get from cache:${key},data:${exist}`);
    const parsed = JSON.parse(exist);
    let ret;
    if (Array.isArray(parsed)) {
      ret = parsed.map((p) => new (this as any).model({ ...p, _id: p.id }));
    } else {
      parsed._id = parsed.id;
      ret = new (this as any).model(parsed);
    }

    // console.log(`this.model:${ret}`);
    // console.log(`exist:${exist}`);
    return ret;
  }

  const newFetched = await exec.apply(this);
  //   console.log(`newFetched:${JSON.stringify(newFetched)}`);
  await redisClient.set(key, JSON.stringify(newFetched), "EX", 3);
  return newFetched;
};
