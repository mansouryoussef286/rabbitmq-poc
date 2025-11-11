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
		const channelWrapper = this.rabbit.getPublishChannelWrapper();
		const messagePayload = {
			email: userEmail,
			timestamp: new Date().toISOString(),
		};

		try {
			await channelWrapper.publish(
				'app.notifications', // exchange
				'user.signup', // routing key
				messagePayload, // <--- Pass object directly (amqp-connection-manager handles JSON.stringify + Buffer)
				{ persistent: true },
			);

			console.log('✅ USER SIGN-UP Message confirmed by RabbitMQ');
		} catch (err) {
			console.error('❌ Message failed or confirmation timed out:', err);
			throw err; // Re-throw to handle it in the calling function
		}
	}

	async sendOrderShippedNotification(orderId: string, userEmail: string) {
		const channelWrapper = this.rabbit.getPublishChannelWrapper();
		const messagePayload = {
			orderId,
			email: userEmail,
			timestamp: new Date().toISOString(),
		};

		try {
			await channelWrapper.publish(
				'app.notifications', // exchange
				'order.shipped', // routing key
				messagePayload, // <--- Pass object directly (amqp-connection-manager handles JSON.stringify + Buffer)
				{ persistent: true },
			);
			console.log('✅ ORDER SHIPPED Message confirmed by RabbitMQ');
		} catch (err) {
			console.error('❌ Message failed or confirmation timed out:', err);
			throw err;
		}
	}

	async sendSystemLog(message: string) {
		const channelWrapper = this.rabbit.getPublishChannelWrapper();
		const messagePayload = {
			message,
			timestamp: new Date().toISOString(),
		};

		try {
			await channelWrapper.publish(
				'app.logs', // exchange
				'system.log', // routing key
				messagePayload, // <--- Pass object directly (amqp-connection-manager handles JSON.stringify + Buffer)
				{ persistent: true },
			);
			console.log('✅ SYSTEM LOG Message confirmed by RabbitMQ');
		} catch (err) {
			console.error('❌ Message failed or confirmation timed out:', err);
			throw err;
		}
	}
}
