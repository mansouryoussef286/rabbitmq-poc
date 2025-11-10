import { RabbitMQService } from '@App/Rabbitmq/rabbitmq.service';
import { RabbitMQSetup } from '@App/Rabbitmq/rabbitmq.setup';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationService {
	private rabbit: RabbitMQSetup;

	constructor(rabbitMQService: RabbitMQService) {
		this.rabbit = rabbitMQService.rabbit;
	}

	async sendUserSignupNotification(userEmail: string) {
		await this.rabbit.channel.publish(
			'app.notifications', // exchange
			'user.signup', // routing key
			Buffer.from(JSON.stringify({ email: userEmail })),
			{ persistent: true }, // <── THIS makes the message survive restarts
		);
	}

	async sendOrderShippedNotification(orderId: string, userEmail: string) {
		await this.rabbit.channel.publish(
			'app.notifications', // exchange
			'order.shipped', // routing key
			Buffer.from(JSON.stringify({ orderId, email: userEmail })),
			{ persistent: true },
		);
	}

	async sendSystemLog(message: string) {
		await this.rabbit.channel.publish(
			'app.logs', // exchange
			'order.shipped', // routing key
			Buffer.from(JSON.stringify({ message })),
			{ persistent: true },
		);
	}
}
