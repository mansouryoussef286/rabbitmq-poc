import { Injectable } from '@nestjs/common';
import { RabbitMQSetup } from './rabbitmq.setup';

@Injectable()
export class RabbitMQService {
	rabbit!: RabbitMQSetup;

	constructor() {
		this.bootstrap();
	}

	async bootstrap() {
		this.rabbit = new RabbitMQSetup(process.env.RABBITMQ_URL || '');
		await this.rabbit.connect();

		// 1 Create Exchanges
		await this.rabbit.createExchange('app.notifications', 'topic');
		await this.rabbit.createExchange('app.logs', 'fanout');
		await this.rabbit.createExchange('app.dlx', 'direct');

		// 2️ Create Queues
		await this.rabbit.createQueue('notifications.email', {
			durable: true,
			arguments: {
				'x-queue-type': 'quorum',
				'x-dead-letter-exchange': 'app.dlx',
				'x-dead-letter-routing-key': 'dlx.events',
				'x-message-ttl': 10000, // 10 seconds TTL
			},
		});

		await this.rabbit.createQueue('notifications.push', {
			durable: true,
			arguments: {
				'x-queue-type': 'quorum',
				'x-dead-letter-exchange': 'app.dlx',
				'x-dead-letter-routing-key': 'dlx.events',
				'x-message-ttl': 10000,
			},
		});

		await this.rabbit.createQueue('service.logger', { durable: true });
		await this.rabbit.createQueue('service.monitoring', { durable: true });
		await this.rabbit.createQueue('dlx.queue', { durable: true });

		// 3️ Bind Queues to Exchanges
		await this.rabbit.bindQueue(
			'notifications.email',
			'app.notifications',
			'user.*',
		);
		await this.rabbit.bindQueue(
			'notifications.email',
			'app.notifications',
			'order.shipped',
		);
		await this.rabbit.bindQueue(
			'notifications.push',
			'app.notifications',
			'user.*',
		);
		await this.rabbit.bindQueue('service.logger', 'app.logs');
		await this.rabbit.bindQueue('service.monitoring', 'app.logs');
		await this.rabbit.bindQueue('dlx.queue', 'app.dlx', 'dlx.events');

		this.rabbit.completeConnection();
		console.log('🎉 RabbitMQ setup complete');
	}

	private ConnectionCompleted$() {
		return this.rabbit.ConnectionCompleted$;
	}

	getPublishChannelWrapper(): any {
		return this.rabbit.getPublishChannelWrapper();
	}

	async createandGetChannelWrapper(
		consumerName: string,
		prefetchCount?: number,
	): Promise<any> {
		return this.rabbit.createandGetChannelWrapper(
			consumerName,
			prefetchCount,
		);
	}

	WaitForConnectionAndRun(callback: () => void) {
		this.ConnectionCompleted$().subscribe((connected: boolean) => {
			if (connected) callback();
		});
	}
}
