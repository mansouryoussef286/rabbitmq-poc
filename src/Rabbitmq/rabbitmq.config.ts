import { RmqOptions, Transport } from '@nestjs/microservices';

// rabbitMQConfig is for runtime message handling using client and nestjs/microservicesver
export const rabbitMQConfig: RmqOptions = {
	transport: Transport.RMQ,
	options: {
		urls: [process.env.RABBITMQ_URL || ''],
		// no default queue here
		queueOptions: {
			durable: true,
		},
	},
};
