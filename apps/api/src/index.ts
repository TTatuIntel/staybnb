import { createServer } from "node:http";
import { createApp } from "./app";
import { env } from "./lib/env";
import { prisma } from "./lib/prisma";
import { initSocket } from "./socket";

const app = createApp();
const server = createServer(app);
initSocket(server);

server.listen(env.PORT, () => {
  console.log(`staybnb api  ->  http://localhost:${env.PORT}  (env: ${env.NODE_ENV})`);
});

async function shutdown() {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
