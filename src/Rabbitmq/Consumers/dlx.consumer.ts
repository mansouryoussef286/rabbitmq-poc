import { Injectable } from '@nestjs/common';
import { RabbitMQService } from '@App/Rabbitmq/rabbitmq.service';
import { Message } from 'amqplib';

@Injectable()
export class DLXConsumer {
	private queueName: string = 'dlx.queue';
	private channelWrapper: any;
	private consumerTag?: string;

	constructor(private rabbitMQService: RabbitMQService) {
		this.rabbitMQService.WaitForConnectionAndRun(this.Listen.bind(this));
	}

	async Listen() {
		this.channelWrapper =
			await this.rabbitMQService.createandGetChannelWrapper('DLX');

		const consumeResult = await this.channelWrapper.consume(
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
		this.consumerTag = consumeResult.consumerTag;
		console.log(
			`👂 DLX Consumer listening on '${this.queueName}' with tag ${this.consumerTag}`,
		);
	}

	public async StopListening(): Promise<void> {
		if (this.channelWrapper && this.consumerTag) {
			console.log(
				`⏳ Stopping consumer with tag: ${this.consumerTag} on queue: ${this.queueName}`,
			);
			await this.channelWrapper.cancel(this.consumerTag);
			await this.channelWrapper.close();

			this.consumerTag = undefined;
			console.log(
				`🛑 Consumer successfully stopped on queue: ${this.queueName}`,
			);
		} else {
			console.log(
				'Consumer is not currently listening or channel is unavailable.',
			);
		}
	}
}
