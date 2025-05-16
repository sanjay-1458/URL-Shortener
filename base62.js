const crypto = require("crypto");
const charset =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
function encode(num) {
  let str = "";
  while (num > 0) {
    str = charset[num % 62] + str;
    num = Math.floor(num / 62);
  }
  return str.padStart(6, "0");
}

function getShortCode(url) {
  const hash = crypto.createHash("sha256").update(url).digest("hex");
  const intHash = parseInt(hash.slice(0, 10), 16);
  return encode(intHash);
}

module.exports = { getShortCode };
