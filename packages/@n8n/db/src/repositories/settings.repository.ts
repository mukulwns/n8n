import { Service } from '@n8n/di';
import { DataSource, Repository, IsNull } from '@n8n/typeorm';
import { Settings } from '../entities/settings';

@Service()
export class SettingsRepository extends Repository<Settings> {
	constructor(dataSource: DataSource) {
		super(Settings, dataSource.manager);
	}

	async findByKey(key: string, tenantId?: string, withFallback = true): Promise<Settings | null> {
		let setting = await this.findOne({
			where: { key, tenantId },
		});

		if (!setting && tenantId && withFallback) {
			// fallback to global setting (tenant_id IS NULL)
			setting = await this.findOne({
				where: { key, tenantId: IsNull() },
			});
		}

		return setting;
	}

	async saveByKey(
		key: string,
		value: unknown,
		tenantId?: string,
		loadOnStartup = true,
	): Promise<Settings> {
		const existing = await this.findOne({
			where: { key, tenantId: tenantId ?? IsNull() },
		});

		if (existing) {
			existing.value = JSON.stringify(value);
			existing.loadOnStartup = loadOnStartup;
			return await this.save(existing);
		}

		return await this.save({
			key,
			tenantId,
			value: JSON.stringify(value),
			loadOnStartup,
		});
	}
}
