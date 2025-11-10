import { RabbitMQService } from '@App/Rabbitmq/rabbitmq.service';
import { RabbitMQSetup } from '@App/Rabbitmq/rabbitmq.setup';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LogConsumer {
	private rabbit: RabbitMQSetup;

	constructor(rabbitMQService: RabbitMQService) {
		this.rabbit = rabbitMQService.rabbit;
	}

	async Listen() {
		await this.rabbit.channel.consume(
			'service.logger',
			(msg) => {
				if (msg) {
					const content = JSON.parse(msg.content.toString());
					console.log('[Consumer] Logs:', content);
					this.rabbit.channel.ack(msg); // acknowledge message
				}
			},
			{ noAck: false },
		);
	}
}
