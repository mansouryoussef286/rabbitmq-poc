import { RabbitMQService } from '@App/Rabbitmq/rabbitmq.service';
import { RabbitMQSetup } from '@App/Rabbitmq/rabbitmq.setup';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailConsumer {
	private rabbit: RabbitMQSetup;

	constructor(rabbitMQService: RabbitMQService) {
		this.rabbit = rabbitMQService.rabbit;
	}

	async Listen() {
		await this.rabbit.channel.consume(
			'notifications.email',
			(msg) => {
				if (msg) {
					const content = JSON.parse(msg.content.toString());
					console.log('[Consumer] Email notification:', content);
					this.rabbit.channel.ack(msg); // acknowledge message
				}
			},
			{ noAck: false },
		);
	}
}
