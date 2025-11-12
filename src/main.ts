import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as compression from 'compression';
import { AppModule } from '@App/app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		rawBody: true,
	});
	app.setGlobalPrefix('api');

	// Handle unhandled promise rejections globally
	process.on('unhandledRejection', (reason, promise) => {
		console.error('Unhandled Rejection at:', promise, 'reason:', reason);
	});

	// const configService = app.get(ConfigService);
	// const config = configService.get<Config>('Config');

	//#region Swagger
	const swaggerConfig = new DocumentBuilder()
		.setTitle('Rabbitmq API')
		.setDescription('The Rabbitmq API documentation')
		.setVersion('1.0')
		.addBearerAuth()
		.build();

	const document: any = SwaggerModule.createDocument(app, swaggerConfig);
	SwaggerModule.setup('swagger', app, document);
	//#endregion

	// CORS
	app.enableCors({
		origin: '*',
	});

	await app.listen(process.env.PORT || 3005, '0.0.0.0').then(async () => {
		const url = await app.getUrl();
		console.log(`ENV= ${process.env.NODE_ENV}`);
		console.log(`Server  running on ${url}`);
		console.log(`Swagger running on ${url}/swagger`);
	});
}
bootstrap();
