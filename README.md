# Overview

It is a URL shorther application were I have used `base62` + `sha256` hashing to generate a unique short URL. Redis is used to map the short url to given url. And a 7 day expiration is added for each entry in redis. The key-value is mapped in 1:1 fashion such that we will get same reuslt even if we use the shortner link multiple times.


## Installation

Install redis `https://github.com/tporadowski/redis/releases`

After installing it should be in `C:\Program Files\Redis` for Windows.

Now you have to check that the port `6379` is not running other application. To check whether an application is running at port `6379` run this command in terminal.
`netstat -aon | findstr :6379`

If some application is running at this port you will see `TCP` conncetion, the host address `127.0.0.1:6379` and `PID`. Now you have to kill this using command `taskkill /PID yourPID /F`.

After that in terminal run this command to start the redis: `"C:\Program Files\Redis\redis-server.exe"`


Clone the repository, move inside the repo, install the depenedicies using `npm install`

After that start the application using `node server.js` in your ide.

The port is set to `3000` you can chnage it or terminate other running process.