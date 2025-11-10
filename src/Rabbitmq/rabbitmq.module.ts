import { Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { NotificationService } from '@App/Publishers/notification.service';
import { EmailConsumer } from '@App/Consumers/email.consumer';
import { PushConsumer } from '@App/Consumers/push.consumer';
import { LogConsumer } from '@App/Consumers/log.consumer';
import { MonitorConsumer } from '@App/Consumers/Monitor.consumer';
import { DLXConsumer } from '@App/Consumers/dlx.consumer';
import { ConsumerService } from '@App/Consumers/consumer.service';

@Module({
	imports: [],
	controllers: [],
	providers: [
		RabbitMQService,
		NotificationService,
		EmailConsumer,
		PushConsumer,
		LogConsumer,
		MonitorConsumer,
		DLXConsumer,
		ConsumerService,
	],
	exports: [NotificationService, ConsumerService],
})
export class RabbitMQModule {}
