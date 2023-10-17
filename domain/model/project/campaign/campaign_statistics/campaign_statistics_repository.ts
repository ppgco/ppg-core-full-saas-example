import { IStoppable } from "../../../stoppable.ts";
import { ProjectID } from "../../project.ts";
import { CampaignID } from "../campaign.ts";
import { CampaignStatistics } from "./campaign_statistics.ts";

export interface ICampaignStatisticsRepository extends IStoppable {
  save(projectId: ProjectID, statistics: CampaignStatistics): Promise<void>;
  get(
    projectId: ProjectID,
    campaignId: CampaignID,
  ): Promise<CampaignStatistics>;
}
