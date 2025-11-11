import { RabbitMQService } from '@App/Rabbitmq/rabbitmq.service';
import { RabbitMQSetup } from '@App/Rabbitmq/rabbitmq.setup';
import { Injectable } from '@nestjs/common';
import { Message } from 'amqplib';

@Injectable()
export class LogConsumer {
	private rabbit: RabbitMQSetup;
	private channelWrapper: any;

	constructor(rabbitMQService: RabbitMQService) {
		this.rabbit = rabbitMQService.rabbit;
	}

	async Listen() {
		this.channelWrapper = this.rabbit.getChannelWrapper();

		await this.channelWrapper.consume(
			'service.logger',
			async (msg: Message | null) => {
				if (msg) {
					try {
						const content = JSON.parse(msg.content.toString());
						console.log('[Consumer] Logs:', content);
						this.channelWrapper.ack(msg);
					} catch (error) {
						console.error(
							'❌ Error processing Log message:',
							error,
						);
						this.channelWrapper.nack(msg, false, false);
					}
				}
			},
			{ noAck: false },
		);
		console.log("✅ Log Consumer listening on 'service.logger'");
	}
}
