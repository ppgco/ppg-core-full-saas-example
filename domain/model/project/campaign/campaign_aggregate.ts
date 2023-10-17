import { ProjectID } from "../project.ts";
import { Campaign, CampaignID } from "./campaign.ts";
import { ICampaignRepository } from "./campaign_repository.ts";
import { CampaignStatistics } from "./campaign_statistics/campaign_statistics.ts";
import { ICampaignStatisticsRepository } from "./campaign_statistics/campaign_statistics_repository.ts";

export class CampaignAggregate {
  constructor(
    public readonly projectId: ProjectID,
    public readonly campaignId: CampaignID,
    private campaignRepository: ICampaignRepository,
    private statisticsRepository: ICampaignStatisticsRepository,
  ) {
  }

  details(): Promise<Campaign> {
    return this.campaignRepository.get(this.projectId, this.campaignId);
  }

  statistics(): Promise<CampaignStatistics> {
    return this.statisticsRepository.get(this.projectId, this.campaignId);
  }
}
