// server1.js
const WebSocket = require("ws");
const Redis = require("ioredis");
const redisPublisher = new Redis();
const redisSubscriber = new Redis();
const wss = new WebSocket.Server({ port: 8081 });
const { v4: uuidv4 } = require('uuid');

wss.on("connection", (ws) => {
  console.log("Client connected to Server 1");
  const url = new URL.parse(ws.upgradeReq.url, true);
  ws.on("message", (msg) => {
    const data = { text: msg.toString(), server: "server1" , id: uuidv4() };
    redisPublisher.publish("global-chat", JSON.stringify(data));
  });
});

redisSubscriber.subscribe("global-chat");
redisSubscriber.on("message", (channel, message) => {
  const data = JSON.parse(message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && data.id != client.id) client.send(`[From ${data.server}]: ${data.text}`);
  });
});

console.log("Server 1 running on ws://localhost:8081");
