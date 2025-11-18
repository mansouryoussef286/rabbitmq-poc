# 🐰 RabbitMQ Proof of Concept API

This project serves as a comprehensive proof of concept for integrating a **NestJS API** with **RabbitMQ**. It demonstrates advanced message brokering patterns, including multiple exchange types, Dead Letter Exchanges (DLX), consumer resilience, and production-ready Docker deployment.

---

<details open>
<summary><h2>💡 Project Overview</h2></summary>

This application showcases a robust, scalable, and resilient approach to asynchronous communication using RabbitMQ ([**Application flow**](#app-flow)). All core message broker setup (users, exchanges, and queues) is managed declaratively via mounted configuration files (`definitions.json`), ensuring persistence and consistency across all environments upon creation.

The project is structured to easily split into separate Publisher and Consumer microservices for a future deployment, while currently consolidating the logic within a single NestJS application for simplified development and testing.

</details>

---

<details open>
<summary><h2>✨ Features</h2></summary>

* **Advanced Messaging Patterns:** Implements Fanout, Direct, and Topic exchanges with appropriate queue bindings.
* **Message Resilience:** Includes **Dead Letter Exchanges (DLX)** to automatically handle unconsumed, rejected, or expired messages, preventing data loss.
* **High Availability:** Utilizes **Quorum Queues** as the default queue type to ensure high availability and data safety through replication across multiple RabbitMQ nodes, automatically surviving node failures.
* **Consumer Optimization:** **Prefetch limits** are added to consumers to prevent heavy consumers from monopolizing resources, ensuring fair load distribution across worker services.
* **Reliable Connections:** Utilizes `amqplib` with `amqp-connection-manager` for automatic and robust connection/channel restoration after network interruptions.
* **Asynchronous Flow Control:** Producers use **await acknowledgments** to ensure messages are safely delivered to the broker before continuing the application flow.
* **Reactive Programming:** Uses **RxJS** to manage and sequence channel creation following a successful connection establishment.
* **Resource Management:** Implements **connection per consumer logic**, where connections and channels are opened and closed as needed to manage resources efficiently.
* **Declarative Configuration:** RabbitMQ users and permissions are set on startup using mounted `definitions.json` and `rabbitmq.conf` files.
* **Dockerized Environments:** Includes separate production and development configurations using multiple `docker-compose` files.

</details>

---

<details>
<summary><h2>📐 System Architecture</h2></summary>

1.  **NestJS API (Publisher/Producer):** Generates messages and sends them to the appropriate RabbitMQ **Exchange**.
2.  **RabbitMQ Broker:** Routes messages based on the exchange type and routing key to bound **Queues**.
3.  **NestJS API (Consumer):** Listens to one or more Queues.
4.  **DLX Flow:** If a message is rejected, exceeds the retry limit, or expires, it is routed to the configured Dead Letter Exchange (DLX) for later inspection and manual processing.

</details>

---
<details >
<summary><h2>📂 Project Structure</h2></summary>

The project uses a standard NestJS structure augmented with dedicated configuration files for RabbitMQ and Docker.

```

.
├── dist/                             \# Compiled JavaScript files (used in prod image)
├── etc/rabbitmq/                     \# RabbitMQ Configuration files (mounted via Docker)
│   ├── definitions.json              \# Declarative users, vhosts, exchanges, and queues
│   └── rabbitmq.conf                 \# Config file pointing to definitions.json
├── node\_modules/                     \# Dependencies
├── src/
│   ├── Rabbitmq/                     \# Dedicated RabbitMQ Module
│   │   ├── Consumers/                \# Handles listening and processing messages
│   │   ├── Publishers/               \# Handles sending messages
│   │   ├── rabbitmq.config.ts        \# Dynamic config variables for RabbitMQ connections
│   │   ├── rabbitmq.module.ts        \# Module setup and providers
│   │   ├── rabbitmq.service.ts       \# Core logic for connection management, channel creation, and messaging
│   │   ├── rabbitmq.setup.ts         \# Logic for declaring exchanges, queues, and bindings
│   │   └── ...
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts
├── test/
├── .dockerignore                     \# Files to ignore during Docker build (e.g., node\_modules, dist)
├── .env.dev                          \# Environment variables for local development
├── .env.prod                         \# Environment variables for production
├── .gitignore
├── .prettierrc
├── docker-compose.dev.yml            \# Docker Compose overrides for development
├── docker-compose.prod.yml           \# Docker Compose overrides for production
├── docker-compose.yml                \# Base/Common Docker Compose file
└── Dockerfile                        \# Multi-stage build file for both dev and prod images

````

</details>

---
<details>
<summary><h2> 🏁 Getting Started</></summary>

### Prerequisites

* Docker and Docker Compose (v2)

### Running in Development Mode


```bash
# 1. Build and start the services using the base and development compose files
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# 2. Access the API
# API: http://127.0.0.1:3005
# RabbitMQ Management UI: http://localhost:15672 (Credentials from definitions.json)
````

### Running in Production Mode

This uses the multi-stage production build target and sets resource limits.

```bash
# 1. Build and start the services using the production compose files
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

# 2. Access the API
# API: http://127.0.0.1:3333

```
</details>


-----


<details>
<summary> <h2>⚙️ Configuration</h2></summary>

  * **RabbitMQ Users:** Users with appropriate privileges for API access are defined in `./etc/rabbitmq/definitions.json`.
  * **Message Broker Setup:** All Exchanges (`fanout`, `direct`, `topic`) and Queues (including DLX bindings) are declared within the **`definitions.json`** file and loaded at RabbitMQ startup.
  * **Environment Variables:**
      * **Development:** Loaded from `.env.dev`.
      * **Production:** Loaded from `.env.prod`. **Note:** Actual production secrets should be injected via Docker/CI/CD secrets manager, overriding the values in `.env.prod` or at least ignore the file from git.

</details>

-----

<details open>
<summary> <h2>🔄 Message Flow Examples</h2></summary>

This section details how messages are routed through the RabbitMQ host based on the exchange type and the bindings defined in the system. The flow demonstrates **broadcast**, **pattern-based**, and **dead-letter** routing as per the below Diagram.
  <img style="max-height:500px;" src="/ReadmeAssets/Rabbitmq flow.png" alt="project architecture and messages flow" id="app-flow">

### 1. Fanout Exchange (`app.logs`)

* **Purpose:** Used for **broadcast logging** where every consumer interested in all log messages receives a copy.
* **Routing Mechanism:** Messages are routed to **all queues** bound to this exchange, regardless of any routing key provided by the producer. It's a "fire-and-forget" broadcast.
* **Flow Illustrated:**
    * The Producer App pushes a message to the `app.logs` Fanout Exchange.
    * This message is simultaneously duplicated and sent to all bound queues:
        * `service.monitoring` queue.
        * `service.logger` queue.
    * Each queue has its own dedicated consumer (e.g., `monitor consumer` and `service logger consumer`), ensuring multiple logging/monitoring systems receive the same event.

### 2. Topic Exchange (`app.notifications`)

* **Purpose:** Used for flexible, **pattern-based routing** for notifications, allowing consumers to subscribe to specific categories or hierarchies of events.
* **Routing Mechanism:** Messages require a **routing key** (e.g., `order.shipped`, `user.created`). Queues bind to the exchange using patterns that can include wildcards (`*` for one word, `#` for zero or more words).
* **Flow Illustrated:**
    * **Queue: `notifications.email`**
        * **Binding:** `user.*` (Matches one word after `user.`).
        * **Receives:** Messages with routing keys like `user.created` or `user.updated`.
    * **Queue: `notifications.push`**
        * **Binding:** `user.*` (Also matches one word after `user.`).
        * **Receives:** Messages with routing keys like `user.created` or `user.updated`.
        * *Note: Both email and push queues receive user-related events, enabling parallel delivery via different channels.*
    * **Queue: `order.shipped`**
        * **Binding:** `order.shipped` (Exact match).
        * **Receives:** Messages specifically related to shipped orders.

### 3. Direct Exchange (`app.dlx`) - Dead Letter Flow

* **Purpose:** This exchange acts as the **Dead Letter Exchange (DLX)** destination. It captures messages that failed processing in the primary queues.
* **Routing Mechanism:** Messages are automatically routed here from primary queues (like `notifications.email`) upon failure based on configuration embedded in the primary queue itself.
* **Flow Illustrated:**
    * A message is sent to a primary queue (e.g., `notifications.email`).
    * The corresponding consumer (`email consumer`) rejects the message (due to an error, failure to acknowledge, or message expiration/TTL).
    * The message is automatically rerouted by RabbitMQ to the configured **Dead Letter Exchange**, which in this diagram is `app.dlx`.
    * The `app.dlx` exchange routes the message to the **`dlx.queue`**.
    * The **`Dead Letter consumer`** then pulls the failed message from `dlx.queue` for inspection, manual retry, or logging, ensuring no data is lost.

</details>
---

<details>
<summary> <h2>🛡️ Resilience & Scalability
</h2></summary>

  * **Dead Letter Exchange (DLX):** Unconsumed, unacknowledged, or expired messages are routed to a dedicated DLX queue, ensuring **zero message loss**.
  * **Connection Management:** `amqp-connection-manager` automatically handles reconnections and recreates channels/consumers upon network failures.
  * **Producer Reliability:** Await/blocking acknowledgment (`channel.waitForConfirms`) is used to ensure the broker has confirmed receipt before the producer assumes success.
  * **Fair Load Distribution:** Consumer services use **prefetch limits** to ensure they only pull a manageable number of messages at a time, preventing worker overload and ensuring high availability across consumer instances.

</details>

-----

<details>
<summary> <h2>🧪 Testing</h2></summary>

  * RabbitMQ connectivity can be verified manually by accessing the Management UI on port `15672` using accounts defined in `./etc/rabbitmq/definitions.json`.

</details>

-----

<details>
<summary> <h2>🐳 Docker Setup Details</h2></summary>

  * **Configuration Files:** Uses three compose files (`.yml`, `.dev.yml`, `.prod.yml`) for clean environment separation.
  * **Multi-Stage Dockerfile:** Includes a **`development`** stage (for volume mounting/hot-reloading) and an optimized **`production`** stage (non-root user, minimal size, compiled JS execution).
  * **Persistence:** A named volume (`rabbitmq_data`) is mounted to `/var/lib/rabbitmq` to guarantee the survival of user data, vhosts, and queue definitions across container restarts/rebuilds.
  * **RabbitMQ Setup:** Uses bind mounts to load `./etc/rabbitmq/rabbitmq.conf` and `./etc/rabbitmq/definitions.json` as **read-only (`:ro`)** configuration for security.

</details>

-----

<details>
<summary> <h2>💻 Technologies Used</h2></summary>

  * **Backend:** NestJS
  * **Messaging:** RabbitMQ
  * **Messaging Library:** `amqplib`
  * **Connection Resilience:** `amqp-connection-manager`
  * **Reactive Programming:** RxJS
  * **Containerization:** Docker & Docker Compose
  * **Language:** TypeScript
  * **Package Manager:** npm

</details>

-----

<details>
<summary> <h2>➡️ Future Improvements</h2></summary>

  * **Microservice Splitting:** Separate the Publishers (API Gateway) and Consumers (Worker Services) into dedicated NestJS microservices.
  * **Deployment:** Integrate a robust CI/CD pipeline and deploy using Kubernetes.
  * **Tracing:** Implement distributed tracing (e.g., OpenTelemetry) to monitor message flow latency across services.
  * **Security:** Integrate with Docker Secrets or a dedicated secrets manager for all production credentials.

</details>

-----

<details>
<summary> <h2>🔗 Resources & References</h2></summary>

  * [NestJS Documentation](https://docs.nestjs.com/)
  * [RabbitMQ Documentation](https://www.rabbitmq.com/docs)
  * [amqp-connection-manager GitHub](https://github.com/jwalton/node-amqp-connection-manager)

</details>

-----
