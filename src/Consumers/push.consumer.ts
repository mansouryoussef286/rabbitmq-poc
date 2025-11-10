import { RabbitMQService } from '@App/Rabbitmq/rabbitmq.service';
import { RabbitMQSetup } from '@App/Rabbitmq/rabbitmq.setup';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PushConsumer {
	private rabbit: RabbitMQSetup;

	constructor(rabbitMQService: RabbitMQService) {
		this.rabbit = rabbitMQService.rabbit;
	}

	async Listen() {
		await this.rabbit.channel.consume(
			'notifications.push',
			(msg) => {
				if (msg) {
					const content = JSON.parse(msg.content.toString());
					console.log('[Consumer] Push notification:', content);
					this.rabbit.channel.ack(msg); // acknowledge message
				}
			},
			{ noAck: false },
		);
	}
}
