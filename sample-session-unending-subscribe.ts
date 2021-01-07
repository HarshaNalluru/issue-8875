import {
  delay,
  ProcessErrorArgs,
  ServiceBusAdministrationClient,
  ServiceBusClient,
  ServiceBusReceivedMessage,
  ServiceBusSessionReceiverOptions,
  SubscribeOptions,
} from "@azure/service-bus";

import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const connString = process.env.SERVICEBUS_CONNECTION_STRING;
  const queueName = `queue-sessions-${Math.ceil(Math.random() * 1000)}`;
  const sessionId = "session-1";
  const numberOfMessages = 10000;

  const adminClient = new ServiceBusAdministrationClient(connString);
  await adminClient.createQueue(queueName, { requiresSession: true });

  const sbClient = new ServiceBusClient(connString);
  const sender = sbClient.createSender(queueName);
  console.log("============== Send 10000 messages");
  for (let i = 0; i < numberOfMessages / 1000; i++) {
    const messages = [];
    for (let index = 0; index < 1000; index++) {
      messages.push({ body: `message-${i}-${index}`, sessionId });
    }
    await sender.sendMessages(messages);
  }
  console.log("============== Sent 10000 messages");

  const options: ServiceBusSessionReceiverOptions = {
    receiveMode: "receiveAndDelete",
  };
  const receiver = await sbClient.acceptSession(queueName, sessionId, options);
  const subscribeOptions: SubscribeOptions = {
    maxConcurrentCalls: 100,
    autoCompleteMessages: false,
  };

  let _messages = 0;
  receiver.subscribe(
    {
      processMessage: async (_: ServiceBusReceivedMessage) => {
        _messages++;
        console.log(`${_messages} received so far!`);
        if (_messages === numberOfMessages) {
          await receiver.close();
          await sbClient.close();
        }
      },
      processError: async (args: ProcessErrorArgs) => {
        console.log(args.error);
      },
    },
    subscribeOptions
  );
  await delay(30000);
  await adminClient.deleteQueue(queueName);
}

main().catch((err) => {
  console.log("Error thrown: ", err);
});
