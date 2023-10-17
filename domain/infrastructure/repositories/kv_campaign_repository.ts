import { ProjectID } from "../../model/project/project.ts";
import { Campaign, ICampaign } from "../../model/project/campaign/campaign.ts";
import { ICampaignRepository } from "../../model/project/campaign/campaign_repository.ts";

export class KVCampaignRepository implements ICampaignRepository {
  static DB_NAMESPACE = "campaign";

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

  async all(projectId: ProjectID): Promise<Campaign[]> {
    const kv = await this.cachedKvPromise;
    const results = [];
    for await (
      const item of kv.list<ICampaign>({
        prefix: [KVCampaignRepository.DB_NAMESPACE, projectId],
      })
    ) {
      results.push(Campaign.fromPlain(item.value));
    }
    return results;
  }

  async save(projectId: ProjectID, campaign: Campaign): Promise<void> {
    const kv = await this.cachedKvPromise;
    const plainData = campaign.valueOf();
    const result = await kv.set([
      KVCampaignRepository.DB_NAMESPACE,
      projectId,
      plainData.id,
    ], plainData);
    if (!result.ok) {
      throw new Error(
        "Problem during writing data to KV - data may be corrupted",
      );
    }
  }

  async get(projectId: ProjectID, campaignId: string): Promise<Campaign> {
    const kv = await this.cachedKvPromise;
    const result = await kv.get<ICampaign>([
      KVCampaignRepository.DB_NAMESPACE,
      projectId,
      campaignId,
    ]);

    if (!result || !result.value) {
      throw new Error("Campaign not found");
    }

    return Campaign.fromPlain(result.value as ICampaign);
  }
}
