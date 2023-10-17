import { IStoppable } from "../../stoppable.ts";
import { ProjectID } from "../project.ts";
import { Campaign, CampaignID } from "./campaign.ts";

export interface ICampaignRepository extends IStoppable {
  save(projectId: ProjectID, campaign: Campaign): Promise<void>;
  all(projectId: ProjectID): Promise<Campaign[]>;
  get(projectId: ProjectID, campaignId: CampaignID): Promise<Campaign>;
}
