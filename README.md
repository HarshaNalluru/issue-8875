### Setup

1. Install node
2. Clone the repo
3. Run `npm install` to get the dependencies
4. Create a `.env` file and enter connection string
   ```
   SERVICEBUS_CONNECTION_STRING=<fill-in-your-connection-string>
   ```
5. Install typescript and ts-node
   ```bash
   npm install -g typescript
   npm install -g ts-node
   ```

### Running the sample

1. Create queues in your namespace with and without sessions with the names `partitioned-queue-sessions` and `partitioned-queue`.(These queue names are populated in the samples)
2. `ts-node sample-session.ts` should run the sample (with maxMessageCount=10000 and maxWaitTime=1000)
3. `ts-node sample-non-sessions.ts` should run the sample without sessions

### Enabling rhea logs

1. `set DEBUG=rhea*` in the command-line
2. Console output and the debug logs go into the `out.log` file.
   ```bash
   ts-node sample-session.ts >out.log 2>&1
   ```

### Cases to try out to observe the difference/anomalous behaviour

1. `ts-node sample-session.ts >out-1.log 2>&1` (with maxMessageCount=10000 and maxWaitTime=1000)
   - 2047 messages are received and drain hangs
2. `ts-node sample-session.ts >out-2.log 2>&1` (with maxMessageCount=1000 and maxWaitTime=1000)
   - drain shouldn't happen since all the messages are received within 1000ms
3. `ts-node sample-session.ts >out-3.log 2>&1` (with maxMessageCount=1000 and maxWaitTime=100)
   - drain succeeds
4. `ts-node sample-non-sessions.ts >out-4.log 2>&1` (with maxMessageCount=10000 and maxWaitTime=1000)
   - drain succeeds for the non-sessions case
