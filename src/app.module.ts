import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQModule } from './Rabbitmq/rabbitmq.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		RabbitMQModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
