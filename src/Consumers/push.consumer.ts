import { RabbitMQService } from '@App/Rabbitmq/rabbitmq.service';
import { RabbitMQSetup } from '@App/Rabbitmq/rabbitmq.setup';
import { Injectable } from '@nestjs/common';
import { Message } from 'amqplib';

@Injectable()
export class PushConsumer {
	private rabbit: RabbitMQSetup;
	private channelWrapper: any;

	constructor(rabbitMQService: RabbitMQService) {
		this.rabbit = rabbitMQService.rabbit;
	}

	async Listen() {
		this.channelWrapper = this.rabbit.getChannelWrapper();

		await this.channelWrapper.consume(
			'notifications.push',
			async (msg: Message | null) => {
				if (msg) {
					try {
						const content = JSON.parse(msg.content.toString());
						console.log('[Consumer] Push notification:', content);
						this.channelWrapper.ack(msg);
					} catch (error) {
						console.error(
							'❌ Error processing Push message:',
							error,
						);
						this.channelWrapper.nack(msg, false, false);
					}
				}
			},
			{ noAck: false },
		);
		console.log("✅ Push Consumer listening on 'notifications.push'");
	}
}
