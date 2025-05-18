const redis = require("redis");

const redisUrl =
  process.env.REDIS_URL || "redis://127.0.0.1:6379";

const isUpstash = redisUrl.includes("upstash.io");

const client = redis.createClient({
  url: redisUrl,
  ...(isUpstash && {
    socket: { tls: true }, 
  }),
});

client
  .connect()
  .then(() => console.log("Redis client connected"))
  .catch((err) => console.error("Redis Failed to Connect", err));

module.exports = {
  get: async (key) => client.get(key),
  set: async (key, value, ttl) =>
    await client.set(key, value, { EX: ttl }),
};
