import { Injectable } from '@nestjs/common';
import { RabbitMQService } from './Rabbitmq/rabbitmq.service';

@Injectable()
export class AppService {
	constructor() {}
	getHello(): string {
		console.log('hello');

		return 'Hello World!';
	}
}
