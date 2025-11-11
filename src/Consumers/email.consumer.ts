import { Injectable } from '@nestjs/common';
import { RabbitMQService } from '@App/Rabbitmq/rabbitmq.service';
import { RabbitMQSetup } from '@App/Rabbitmq/rabbitmq.setup';
import { Message } from 'amqplib';
// do the same as dlx file

@Injectable()
export class EmailConsumer {
	private rabbit: RabbitMQSetup;
	private queueName: string = 'notifications.email';
	private channelWrapper: any;
	constructor(rabbitMQService: RabbitMQService) {
		this.rabbit = rabbitMQService.rabbit;
	}

	async Listen() {
		this.channelWrapper = this.rabbit.getChannelWrapper();

		await this.channelWrapper.consume(
			this.queueName,
			async (msg: Message | null) => {
				if (msg) {
					try {
						const content = JSON.parse(msg.content.toString());
						console.log('[Consumer] Email event:', content);
						// add await for 3 seconds to simulate email sending
						await new Promise((resolve) =>
							setTimeout(resolve, 3000),
						);
						this.channelWrapper.ack(msg);
					} catch (error) {
						console.error(
							'❌ Error processing Email message:',
							error,
						);
						// nack without requeue (send to DLX)
						this.channelWrapper.nack(msg, false, false);
					}
				}
			},
			{
				noAck: false,
			},
		);
		console.log(`✅ Email Consumer listening on '${this.queueName}'`);
	}
}
