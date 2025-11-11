import { Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { NotificationService } from '@App/Rabbitmq/Publishers/notification.service';
import { EmailConsumer } from '@App/Rabbitmq/Consumers/email.consumer';
import { PushConsumer } from '@App/Rabbitmq/Consumers/push.consumer';
import { LogConsumer } from '@App/Rabbitmq/Consumers/log.consumer';
import { MonitorConsumer } from '@App/Rabbitmq/Consumers/Monitor.consumer';
import { DLXConsumer } from '@App/Rabbitmq/Consumers/dlx.consumer';
import { ConsumerService } from '@App/Rabbitmq/Consumers/consumer.service';

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
