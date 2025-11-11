import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { NotificationService } from './Rabbitmq/Publishers/notification.service';
import { ConsumerService } from './Rabbitmq/Consumers/consumer.service';

@Controller()
export class AppController {
	constructor(
		private readonly appService: AppService,
		private readonly notificationService: NotificationService,
		private readonly consumerService: ConsumerService,
	) {}

	// @Get()
	// getHello(): string {
	// 	return this.appService.getHello();
	// }

	// send email publish
	@Get('user-signup')
	async getEmail(): Promise<string> {
		await this.notificationService.sendUserSignupNotification(
			'yousef@email.com',
		);
		return 'Email notification sent';
	}

	// send order shipped publish
	@Get('order')
	async getOrder(): Promise<string> {
		await this.notificationService.sendOrderShippedNotification(
			'ORDER123',
			'yousef@email.com',
		);
		return 'Order shipped notification sent';
	}

	// send system log publish
	@Get('log')
	async getLog(): Promise<string> {
		await this.notificationService.sendSystemLog(
			'System is running smoothly.',
		);
		return 'System log sent';
	}

	@Get('toggle-listening')
	async toggleListening(): Promise<string> {
		return await this.consumerService.ToggleListening();
	}
}
