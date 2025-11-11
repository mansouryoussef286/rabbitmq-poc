import { Injectable } from '@nestjs/common';
import { RabbitMQService } from '@App/Rabbitmq/rabbitmq.service';
import { Message } from 'amqplib';

@Injectable()
export class EmailConsumer {
	private queueName: string = 'notifications.email';
	private channelWrapper: any;
	private consumerTag?: string;

	constructor(private rabbitMQService: RabbitMQService) {
		this.rabbitMQService.WaitForConnectionAndRun(this.Listen.bind(this));
	}

	async Listen() {
		this.channelWrapper =
			await this.rabbitMQService.createandGetChannelWrapper('Email');

		const consumeResult = await this.channelWrapper.consume(
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
		this.consumerTag = consumeResult.consumerTag;
		console.log(
			`👂 Email Consumer listening on '${this.queueName}' with tag ${this.consumerTag}`,
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
