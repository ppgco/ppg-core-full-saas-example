import { ICampaign } from "../../../model/project/campaign/campaign.ts";
import { ICampaignStatistics } from "../../../model/project/campaign/campaign_statistics/campaign_statistics.ts";
import { ProjectID, ProjectName } from "../../../model/project/project.ts";
import { IProjectStatistics } from "../../../model/project/project_statistics/project_statistics.ts";
import { IRecipient } from "../../../model/project/recipient/recipient.ts";

export class GetProjectCommand {
  constructor(public readonly id: ProjectID) {
  }
}

export interface CampaignSummaryDTO {
  meta: ICampaign;
  stats: ICampaignStatistics;
}

type ActiveRecipientsNumber = number;

export class GetProjectResponse {
  constructor(
    public readonly id: ProjectID,
    public readonly name: ProjectName,
    public readonly campaigns: CampaignSummaryDTO[],
    public readonly activity: IProjectStatistics[],
    public readonly active: ActiveRecipientsNumber,
    public readonly recipients: IRecipient[],
  ) {
  }
}
