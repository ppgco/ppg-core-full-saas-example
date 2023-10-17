import { MessageEventBulk } from "../../../model/external/message_event_bulk.ts";
import { CampaignID } from "../../../model/project/campaign/campaign.ts";
import { ProjectID } from "../../../model/project/project.ts";

export class RegisterExternalEvents {
  static create(
    projectId: ProjectID,
    campaignId: CampaignID,
    event: MessageEventBulk,
  ): RegisterExternalEvents {
    return new RegisterExternalEvents(
      projectId,
      campaignId,
      event,
    );
  }

  constructor(
    public readonly projectId: ProjectID,
    public readonly campaignId: CampaignID,
    public readonly event: MessageEventBulk,
  ) {
  }
}
