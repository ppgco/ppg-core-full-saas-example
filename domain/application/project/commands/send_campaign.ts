import {
  CampaignID,
  ICampaign,
} from "../../../model/project/campaign/campaign.ts";
import { ProjectID } from "../../../model/project/project.ts";

export class SendCampaignCommand {
  static create(projectId: ProjectID, plain: ICampaign): SendCampaignCommand {
    return new SendCampaignCommand(
      projectId,
      plain.title,
      plain.content,
    );
  }

  constructor(
    public readonly projectId: ProjectID,
    public readonly title: string,
    public readonly content: string,
  ) {
  }
}

export class SendCampaignResponse {
  constructor(
    public readonly campaignId: CampaignID,
  ) {
  }
}
