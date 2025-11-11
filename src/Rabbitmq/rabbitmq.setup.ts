import amqp from 'amqp-connection-manager';
import { AmqpConnectionManager, ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';
import { Options } from 'amqplib';

// Use a known type for exchange types since amqplib's Options.AssertExchange is a bit verbose
type ExchangeType = 'topic' | 'fanout' | 'direct' | 'headers';

// RabbitMQSetup handles the reliable setup of RabbitMQ components using amqp-connection-manager
export class RabbitMQSetup {
	private connectionManager: AmqpConnectionManager;
	private channel: ChannelWrapper;
	private prefetchCount: number;

	constructor(private url: string | string[]) {
		this.prefetchCount = parseInt(process.env.RABBITMQ_PREFETCH || '5', 10);
	}

	async connect() {
		this.connectionManager = amqp.connect(this.url);

		this.connectionManager.on('connect', ({ url }) => {
			console.log(`✅ Connected to RabbitMQ at ${url}`);
		});
		this.connectionManager.on('disconnect', (err) => {
			console.error('❌ Disconnected from RabbitMQ:', err.err.message);
			console.log('Attempting to reconnect...');
		});

		this.channel = this.connectionManager.createChannel({
			json: true,
			confirm: true, // Use a ConfirmChannel, equivalent to createConfirmChannel()
			setup: async (channel: ConfirmChannel) => {
				// This setup function runs every time a channel is created (initial connection and reconnections)

				// Apply prefetch logic here
				// Note: amqplib's prefetch is per-channel, so this is per-ChannelWrapper instance
				await channel.prefetch(this.prefetchCount, false);
				console.log(
					`✨ Channel setup complete (prefetch = ${this.prefetchCount})`,
				);
			},
		});

		await this.channel.waitForConnect();
		console.log(`✅ Initial RabbitMQ Channel is ready.`);
	}

	getChannelWrapper(): any {
		if (!this.channel) {
			throw new Error(
				'RabbitMQSetup is not connected. Call connect() first.',
			);
		}
		return this.channel;
	}

	// The `setup` function is the natural place for assertions.
	// We use a custom method to add the setup logic to the channel wrapper.
	// so that these function run whenever the channel is (re)created.
	async createExchange(exchangeName: string, type: ExchangeType) {
		await this.channel.addSetup(async (channel: ConfirmChannel) => {
			await channel.assertExchange(exchangeName, type, {
				durable: true,
			});
			console.log(`✅ Exchange asserted: ${exchangeName} (${type})`);
		});
	}

	async createQueue(queueName: string, options: Options.AssertQueue = {}) {
		await this.channel.addSetup(async (channel: ConfirmChannel) => {
			await channel.assertQueue(queueName, options);
			console.log(`✅ Queue asserted: ${queueName}`);
		});
	}

	async bindQueue(queueName: string, exchangeName: string, routingKey = '') {
		await this.channel.addSetup(async (channel: ConfirmChannel) => {
			await channel.bindQueue(queueName, exchangeName, routingKey);
			console.log(
				`✅ Queue ${queueName} bound to exchange ${exchangeName} with key "${routingKey}"`,
			);
		});
	}

	async close() {
		await this.channel.close();
		await this.connectionManager.close();
		console.log('🛑 RabbitMQ connection closed.');
	}
}
