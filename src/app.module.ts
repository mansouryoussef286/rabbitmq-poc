import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQModule } from './Rabbitmq/rabbitmq.module';

//for docker deployment
const getEnvPath = (nodeEnv?: string): string => {
	return nodeEnv === 'production' ? '.env.prod' : '.env.dev';
};
const envFilePath = getEnvPath(process.env.NODE_ENV);

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: envFilePath,
			isGlobal: true,
		}),
		RabbitMQModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
