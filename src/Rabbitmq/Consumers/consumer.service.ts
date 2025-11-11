import { Injectable } from '@nestjs/common';
import { EmailConsumer } from './email.consumer';
import { PushConsumer } from './push.consumer';
import { DLXConsumer } from './dlx.consumer';
import { LogConsumer } from './log.consumer';
import { MonitorConsumer } from './Monitor.consumer';

@Injectable()
export class ConsumerService {
	listeningStatus: boolean = true;

	constructor(
		private EmailConsumer: EmailConsumer,
		private PushConsumer: PushConsumer,
		private DLXConsumer: DLXConsumer,
		private LogConsumer: LogConsumer,
		private MonitorConsumer: MonitorConsumer,
	) {}

	async ToggleListening(): Promise<string> {
		if (this.listeningStatus) {
			this.listeningStatus = false;
			await this.EmailConsumer.StopListening();
			await this.PushConsumer.StopListening();
			await this.DLXConsumer.StopListening();
			await this.LogConsumer.StopListening();
			await this.MonitorConsumer.StopListening();
			return 'Consumer Service stopped';
		} else {
			this.listeningStatus = true;
			await this.EmailConsumer.Listen();
			await this.PushConsumer.Listen();
			await this.DLXConsumer.Listen();
			await this.LogConsumer.Listen();
			await this.MonitorConsumer.Listen();
			return 'Consumer Service started Listening';
		}
	}
}
