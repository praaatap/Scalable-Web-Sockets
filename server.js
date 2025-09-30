// server2.js
const WebSocket = require("ws");
const Redis = require("ioredis");
const redisPublisher = new Redis();
const redisSubscriber = new Redis();
const { v4: uuidv4 } = require('uuid');
const wss = new WebSocket.Server({ port: 8082 });

const SERVER_NAME = "server2";

wss.on("connection", (ws) => {
  console.log("Client connected to " , SERVER_NAME);

  ws.on("message", (msg) => {
    const data = { text: msg.toString(), server: "server2" ,id: uuidv4() };
    redisPublisher.publish("global-chat", JSON.stringify(data));
  });
});

redisSubscriber.subscribe("global-chat");
redisSubscriber.on("message", (channel, message) => {
  const data = JSON.parse(message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(`[From ${data.server}]: ${data.text}`);
  });
});

console.log("Server 2 running on ws://localhost:8082");
