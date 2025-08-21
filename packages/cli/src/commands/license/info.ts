// import { Command } from '@n8n/decorators';
// import { Container } from '@n8n/di';

// import { License } from '@/license';

// import { BaseCommand } from '../base-command';

// @Command({
// 	name: 'license:info',
// 	description: 'Print license information',
// })
// export class LicenseInfoCommand extends BaseCommand {
// 	async run() {
// 		const license = Container.get(License);
// 		await license.init({ isCli: true });

// 		this.logger.info('Printing license information:\n' + license.getInfo());
// 	}

// 	async catch(error: Error) {
// 		this.logger.error('\nGOT ERROR');
// 		this.logger.info('====================================');
// 		this.logger.error(error.message);
// 	}
// }
// packages/cli/src/commands/license/info.ts
import { Command } from '@n8n/decorators';
import { Container } from '@n8n/di';
import { License } from '@/license';
import { BaseCommand } from '../base-command';

@Command({
	name: 'license:info',
	description: 'Display license information',
})
export class LicenseInfo extends BaseCommand {
	async run() {
		this.logger.info('Fetching license information.');
		const license = Container.get(License);
		await license.init();
		const info = await license.getInfo();
		this.logger.info('License info:', { info });
	}

	async catch(error: Error) {
		this.logger.error('Error. See log messages for details.');
		this.logger.error('\nGOT ERROR');
		this.logger.info('====================================');
		this.logger.error(error.message);
		this.logger.error(error.stack!);
	}
}
