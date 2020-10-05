import { ServiceBusClient, ServiceBusMessage } from "@azure/service-bus";
const connectionString =
  "Endpoint=sb://harshan-servicebus.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=olo6gItgNltpOpzkwIFdq92MuLoFhT4MX+nMpFLK3i8=";
const qName = "partitioned-queue";
async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function run() {
  const client = new ServiceBusClient(connectionString);
  const msgs: ServiceBusMessage[] = [];

  for (let i = 0; i < 3000; i++) {
    // msgs.push({ body: `message ${i}` });
    msgs.push({ body: `message ${i}`, sessionId: "random-id" });
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
