const http = require("http");
const fs = require("fs");
const { log } = require("console");
const url = require("url");
const path = require("path");
const querystring = require("querystring");
const {getShortCode} =require('./base62');
const redis=require('./redisClient')
const PORT = 3000;

const BASE_URL = "http://cat.ly";
const EXPIRE_SECONDS = 60 * 60 * 24 * 7;

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;
  if (pathname === "/" && method === "GET") {
    const filePath = path.join(__dirname, "public", "index.html");
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end("Internal Server Error");
      } else {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      }
    });
    return;
  }
  if (pathname === "/shorten" && method === "POST") {
    console.log(parsedUrl);
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", async () => {
      // JSON.parse will give error even when doing JSON.parse(JSON.stringify(data)) because it is not JSON, it is {URL encoded} so use qyerystring.parse(data) to get an object
      const URL = querystring.parse(data).longurl;
      if (!URL || !URL.startsWith("http")) {
        const invalidPath = path.join(
          __dirname,
          "public",
          "component",
          "invalid.html"
        );
        fs.readFile(invalidPath, (err, fileData) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Internal Server Error");
          } else {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(fileData);
          }
        });
        return;
      }
      const key = getShortCode(URL);
      const exists = await redis.get(key);
      if (exists) {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(`Short URL: ${BASE_URL}${key}`);
      } else {
        await redis.set(key, URL, EXPIRE_SECONDS);
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(`Short URL: ${BASE_URL}${key}`);
      }
    });
    return;
  }
  if (pathname === "/redirect" && method === "GET") {
    const URL = parsedUrl.query.shorturl;
    if (!URL || !URL.startsWith(BASE_URL)) {
      const invalidPath = path.join(
        __dirname,
        "public",
        "component",
        "invalid.html"
      );
      fs.readFile(invalidPath, (err, fileData) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error");
        } else {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(fileData);
        }
      });
      return;
    }
    const key = URL.replace(BASE_URL, "");
    const mainURL = await redis.get(key);
    if (mainURL) {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.write(`URL: ${mainURL}`);
      res.end();
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Short URL not found or expired");
    }
    return;
  }
  if (method === "GET" && pathname.length > 1) {
    const key = pathname.slice(1);
    const mainURL = await redis.get(key);
    if (mainURL) {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.write(`URL: ${mainURL}`);
      res.end();
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Short URL not found or expired");
    }
  }
  res.writeHead(404);
  res.end("Page Not Found");
  return;
});

server.listen(PORT, () => {
  log(`Server running at: ${PORT}`);
});
