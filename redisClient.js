const redis = require("redis");
const client = redis.createClient({
  url: 'redis://127.0.0.1:6379'
});
client
  .connect()
  .then(console.log("Redis client connected"))
  .catch((err) => console.log("Redis Failed to Connect", err));

module.exports = {
  get: async (key) => client.get(key),
  set: async (key, value, ttl) =>
    await client.set(key, value, { EX: ttl }),
};
