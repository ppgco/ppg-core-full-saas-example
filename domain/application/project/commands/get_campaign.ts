import {
  CampaignID,
  ICampaign,
} from "../../../model/project/campaign/campaign.ts";
import { ICampaignStatistics } from "../../../model/project/campaign/campaign_statistics/campaign_statistics.ts";
import { ProjectID } from "../../../model/project/project.ts";
import { CampaignSummaryDTO } from "./get_project.ts";

export class GetCampaignCommand {
  constructor(
    public readonly projectId: ProjectID,
    public readonly campaignId: CampaignID,
  ) {
  }
}

export class GetCampaignResponse implements CampaignSummaryDTO {
  constructor(
    public readonly campaignId: CampaignID,
    public readonly meta: ICampaign,
    public readonly stats: ICampaignStatistics,
  ) {
  }
}
