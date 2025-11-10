import { Injectable } from '@nestjs/common';
import { EmailConsumer } from './email.consumer';
import { PushConsumer } from './push.consumer';
import { DLXConsumer } from './dlx.consumer';
import { LogConsumer } from './log.consumer';
import { MonitorConsumer } from './Monitor.consumer';

@Injectable()
export class ConsumerService {
	constructor(
		private EmailConsumer: EmailConsumer,
		private PushConsumer: PushConsumer,
		private DLXConsumer: DLXConsumer,
		private LogConsumer: LogConsumer,
		private MonitorConsumer: MonitorConsumer,
	) {}

	async StartListening(): Promise<string> {
		await this.EmailConsumer.Listen();
		this.PushConsumer.Listen();
		this.DLXConsumer.Listen();
		this.LogConsumer.Listen();
		this.MonitorConsumer.Listen();
		return 'Consumer Service is running';
	}
}
