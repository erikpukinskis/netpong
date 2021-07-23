**Netpong** is a multiplayer browser-based implementation of Pong with deterministic netcode.

### How to run

Start the backend:

```
deno run --allow-net --inspect server/start.js
```

Start the dev server:

```
cd client
npm install
npm start
```

### Run tests

```
cd server
deno test --allow-net
```
