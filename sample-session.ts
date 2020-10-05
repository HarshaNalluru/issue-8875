import { ServiceBusClient, ServiceBusMessage } from "@azure/service-bus";

import * as dotenv from "dotenv";
dotenv.config();

const connectionString = process.env.SERVICEBUS_CONNECTION_STRING || "";
const qNameSessions = "partitioned-queue-sessions";
async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function run() {
  const client = new ServiceBusClient(connectionString);
  const msgs: ServiceBusMessage[] = [];

  for (let i = 0; i < 3000; i++) {
    msgs.push({ body: `message ${i}`, sessionId: "random-id-0" });
  }
  await client.createSender(qNameSessions).sendMessages(msgs);
  console.log("messages sent");

  const receiver = await client.createSessionReceiver(qNameSessions, {
    receiveMode: "peekLock",
  });
  await delay(4000);
  console.log("receiver created");

  try {
    const messages = await receiver.receiveMessages(10000, {
      maxWaitTimeInMs: 1000,
    });
    console.log("Everything worked fine!", messages.length);
  } catch (err) {
    console.log(`I encountered an error:`, err);
  } finally {
    await client.close();
    console.log("I eventually was called.");
  }
}
run();
