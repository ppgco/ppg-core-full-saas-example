import {
  CampaignStatistics,
  ICampaignStatistics,
} from "../../model/project/campaign/campaign_statistics/campaign_statistics.ts";
import { ICampaignStatisticsRepository } from "../../model/project/campaign/campaign_statistics/campaign_statistics_repository.ts";
import { ProjectID } from "../../model/project/project.ts";

export class KVCampaignStatisticsRepository
  implements ICampaignStatisticsRepository {
  static DB_NAMESPACE = "campaign_statistics";

  public cachedKvPromise: Promise<Deno.Kv>;

  constructor(persistence: boolean) {
    this.cachedKvPromise = Deno.openKv(
      persistence
        ? `data/${this.constructor.name}`
        : `/tmp/${this.constructor.name}_${Math.random()}`,
    );
  }

  async stop(): Promise<void> {
    const kv = await this.cachedKvPromise;
    return kv.close();
  }

  async save(
    projectId: ProjectID,
    statistics: CampaignStatistics,
  ): Promise<void> {
    const kv = await this.cachedKvPromise;
    const plainData = statistics.valueOf();
    const result = await kv.set([
      KVCampaignStatisticsRepository.DB_NAMESPACE,
      projectId,
      plainData.id,
    ], plainData);
    if (!result.ok) {
      throw new Error(
        "Problem during writing data to KV - data may be corrupted",
      );
    }
  }

  async get(
    projectId: ProjectID,
    campaignId: string,
  ): Promise<CampaignStatistics> {
    const kv = await this.cachedKvPromise;
    const result = await kv.get<ICampaignStatistics>([
      KVCampaignStatisticsRepository.DB_NAMESPACE,
      projectId,
      campaignId,
    ]);
    if (!result || !result.value) {
      return new CampaignStatistics(
        campaignId,
        new Map(),
      );
    }

    return CampaignStatistics.fromPlain(result.value as ICampaignStatistics);
  }
}
