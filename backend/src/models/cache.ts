import mongoose from "mongoose";
import { redisClient } from "../redis/redis-client";
const exec = mongoose.Query.prototype.exec;
(mongoose.Query.prototype as any).cache = function (
  { key }: { key: string } = { key: "default" }
) {
  (this as any).useCache = true;
  (this as any).hashKey = key;
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
  const hashKey = (this as any).hashKey;
  //   console.log(key);
  let exist = null;
  try {
    exist = await redisClient.hget(hashKey, key);
  } catch (error) {
    console.log("no redis available");
  }
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
  try {
    await redisClient.hset(hashKey, key, JSON.stringify(newFetched)); //, "EX", 3);// redis ttl not appliable for hset
  } catch (error) {}
  return newFetched;
};
const clearCache = (hashKey: string = "default") => {
  redisClient.del(hashKey);
};
export { clearCache };
