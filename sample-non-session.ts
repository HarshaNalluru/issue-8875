import {
  ServiceBusAdministrationClient,
  ServiceBusClient,
  ServiceBusMessage,
} from "@azure/service-bus";

import * as dotenv from "dotenv";
dotenv.config();

const connectionString = process.env.SERVICEBUS_CONNECTION_STRING || "";
const qName = `queue-${Math.floor(Math.random() * 10000)}`;
async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function run() {
  const adminClient = new ServiceBusAdministrationClient(connectionString);
  // await adminClient.createQueue(qName, { enablePartitioning: true });
  await adminClient.createQueue(qName, { enablePartitioning: false });

  const client = new ServiceBusClient(connectionString);
  const msgs: ServiceBusMessage[] = [];

  for (let i = 0; i < 3000; i++) {
    msgs.push({ body: `message ${i}` });
  }
  await client.createSender(qName).sendMessages(msgs);
  console.log("messages sent");

  const receiver = client.createReceiver(qName, {
    receiveMode: "peekLock",
  });
  await delay(4000);

  console.log("receiver created");

  try {
    const messages = await receiver.receiveMessages(10000, {
      maxWaitTimeInMs: 1000 * 10,
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
