# rabbitmq-poc

A small NestJS proof-of-concept showing how to use RabbitMQ with:

- amqp-connection-manager + amqplib (confirm channels)
- Topic/fanout/direct exchanges, queue bindings
- Message TTL and Dead-Letter Exchange (DLX) pattern

## Contents

- `src/Publishers` — services that publish messages (notification examples)
- `src/Consumers` — consumers for email, push, logs, monitoring, DLX
- `src/Rabbitmq` — connector + setup utilities (connection, channel wrapper, exchanges/queues)
- `docker-compose.yml` — optional RabbitMQ for local development
- `Dockerfile` — (if present) example Dockerfile for containerizing the app

## Features

- Confirmed publishing (persistent messages + publisher confirms)
- Per-queue TTL with DLX routing (x-message-ttl, x-dead-letter-exchange)
- Raw-channel consumers registered with `channelWrapper.addSetup(...)` so `channel.ack()` / `channel.nack()` are executed on the underlying amqplib channel (works across reconnects)
- Consumer `consumerTag` capture and `close()` helper to cancel consumers cleanly
- Example bindings: `app.notifications` (topic), `app.logs` (fanout), `app.dlx` (direct)

## Quickstart (local)

Prerequisites:

- Node.js (recommended 18+)
- npm or yarn
- RabbitMQ (locally or remote). The project includes `docker-compose.yml` that can launch RabbitMQ + the management UI.

Start RabbitMQ locally with Docker Compose (optional):

```bash
docker compose up -d
# open http://localhost:15672 (guest/guest) to see exchanges/queues
```

Install and run the app:

```bash
npm install
npm run start:dev
```

Environment variables

- `RABBITMQ_URL` — connection URL (e.g. `amqp://guest:guest@localhost:5672`). If not set, the code reads an empty string; configure appropriately for your environment.
- `RABBITMQ_PREFETCH` — per-channel prefetch (defaults to `5`)

## How the pieces work

- The `RabbitMQSetup` class wraps `amqp-connection-manager` and creates a confirmed `ChannelWrapper`. It asserts exchanges/queues and binds them in `RabbitMQService.bootstrap()`.
- Publishers call `channelWrapper.publish(...)` — the wrapper handles JSON serialization and confirm handling.
- Consumers use `channelWrapper.addSetup(async (channel) => { channel.consume(...) })` so handlers call `channel.ack(msg)` or `channel.nack(msg, false, false)` directly on the `amqplib` channel. This ensures acks are executed on the real channel and survive reconnects.

## Example: Why a message may appear in DLX after being acked

If a message is published to an exchange with multiple queues bound (for example `notifications.email` and `notifications.push` bound to the same routing key), RabbitMQ places one copy into each bound queue. A consumer ack only removes the message copy from the queue it consumed from — other copies remain in their queues. If those other queues have a message TTL configured (e.g. `x-message-ttl`) and a DLX, the copies will dead-letter after the TTL expires and appear on the DLX. This is expected behavior and not a failure of `ack`.

If you want a message to be processed only once, route to a single queue (or use competing consumers) instead of binding multiple queues for the same processing step.

## Consumers in this project

- `EmailConsumer` — listens on `notifications.email` and acks/nacks messages.
- `PushConsumer` — listens on `notifications.push`.
- `LogConsumer` — listens on `service.logger`.
- `MonitorConsumer` — listens on `service.monitoring`.
- `DLXConsumer` — listens on `dlx.queue` and logs dead-lettered messages. It also shows how to inspect `x-death` headers if you need to trace origin queues.

All consumers follow the same pattern: they register a raw `channel.consume(...)` inside `channelWrapper.addSetup(...)`, capture the returned `consumerTag`, and expose a `close()` method that cancels the consumer via `channelWrapper.cancel(consumerTag)`.

## Inspecting dead-letter info

When a message is dead-lettered, RabbitMQ adds an `x-death` header to `msg.properties.headers`. The `x-death` array includes objects with fields such as `queue`, `reason` (e.g. `expired`), and `count`. The `DLXConsumer` can log `msg.properties.headers['x-death']` to identify which queue dead-lettered the message and why.

## Running tests

This repository uses Jest for tests (if present). Run:

```bash
npm test
```

## Docker

This project includes `docker-compose.yml` that can run a RabbitMQ server with the management plugin. Use the compose file for local testing:

```bash
docker compose up -d
```

If you want to containerize the app, build the image and run it linked to RabbitMQ. (See `Dockerfile` if present.)

## Troubleshooting

- Messages reappear or are sent to DLX:
    - Check whether the message was published to multiple queues (multiple bindings). Ack only clears the copy from the queue it was delivered from.
    - Check `x-death` headers on DLX messages to find the originating queue and reason.
- Acks not having effect or consumers re-delivering on reconnect:
    - Ensure your consumer calls `channel.ack(msg)` on the raw amqplib `channel` (inside `addSetup`) rather than accidentally calling ack on the wrapper in some patterns.
    - Use `{ noAck: false }` when consuming so RabbitMQ expects manual ack.
- Consumer doesn't receive messages after reconnect:
    - Confirm the consumer is registered in the `addSetup` callback so it is re-established on reconnect.

## Contributing

Contributions are welcome. Small suggestions:

- Keep consumer patterns consistent — prefer `channelWrapper.addSetup` with raw `channel.ack()`/`channel.nack()`.
- Add tests for publishers (happy path + failure) and consumers (processing and nack->DLX behavior).

## License

This project is provided as-is. See `LICENSE` at the repository root.
