import amqp from 'amqplib';

// RabbitMQSetup handles the low-level setup of RabbitMQ components that can't be done using rabbitmq.config
export class RabbitMQSetup {
	connection: amqp.Connection;
	channel: amqp.Channel;

	constructor(private url: string) {}

	async connect() {
		this.connection = await amqp.connect(this.url);
		this.channel = await this.connection.createChannel();
		console.log('✅ Connected to RabbitMQ');
	}

	async createExchange(
		exchangeName: string,
		type: 'topic' | 'fanout' | 'direct',
	) {
		await this.channel.assertExchange(exchangeName, type, {
			durable: true,
		});
		console.log(`✅ Exchange created: ${exchangeName} (${type})`);
	}

	async createQueue(queueName: string, options: any = {}) {
		await this.channel.assertQueue(queueName, options);
		console.log(`✅ Queue created: ${queueName}`);
	}

	async bindQueue(queueName: string, exchangeName: string, routingKey = '') {
		await this.channel.bindQueue(queueName, exchangeName, routingKey);
		console.log(
			`✅ Queue ${queueName} bound to exchange ${exchangeName} with key "${routingKey}"`,
		);
	}

	async close() {
		await this.channel.close();
		await this.connection.close();
	}
}
