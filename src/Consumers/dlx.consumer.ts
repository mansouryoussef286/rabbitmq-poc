import { Injectable } from '@nestjs/common';
import { RabbitMQService } from '@App/Rabbitmq/rabbitmq.service';
import { RabbitMQSetup } from '@App/Rabbitmq/rabbitmq.setup';
import { Message } from 'amqplib';

@Injectable()
export class DLXConsumer {
	private rabbit: RabbitMQSetup;
	private queueName: string = 'dlx.queue';
	private channelWrapper: any;

	constructor(rabbitMQService: RabbitMQService) {
		this.rabbit = rabbitMQService.rabbit;
	}

	async Listen() {
		this.channelWrapper = this.rabbit.getChannelWrapper();

		// Register the DLX consumer on the raw channel so ack/nack calls are executed properly.
		// await channelWrapper.addSetup(async (channel: any) => {
		await this.channelWrapper.consume(
			this.queueName,
			async (msg: Message | null) => {
				if (msg) {
					try {
						const content = JSON.parse(msg.content.toString());
						console.log('[Consumer] DLX event:', content);
						this.channelWrapper.ack(msg);
					} catch (error) {
						console.error(
							'❌ Error processing DLX message:',
							error,
						);
						this.channelWrapper.nack(msg, false, false);
					}
				}
			},
			{
				noAck: false,
			},
		);
		// });
		console.log(`✅ DLX Consumer listening on '${this.queueName}'`);
	}
}
