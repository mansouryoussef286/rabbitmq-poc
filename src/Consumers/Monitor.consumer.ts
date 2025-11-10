import { RabbitMQService } from '@App/Rabbitmq/rabbitmq.service';
import { RabbitMQSetup } from '@App/Rabbitmq/rabbitmq.setup';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MonitorConsumer {
	private rabbit: RabbitMQSetup;

	constructor(rabbitMQService: RabbitMQService) {
		this.rabbit = rabbitMQService.rabbit;
	}

	async Listen() {
		await this.rabbit.channel.consume(
			'service.monitoring',
			(msg) => {
				if (msg) {
					const content = JSON.parse(msg.content.toString());
					console.log('[Consumer] Monitor:', content);
					this.rabbit.channel.ack(msg); // acknowledge message
				}
			},
			{ noAck: false },
		);
	}
}
