import { MessageID } from "../../../model/external/message_id.ts";
import { ICampaign } from "../../../model/project/campaign/campaign.ts";
import { ProjectID } from "../../../model/project/project.ts";
import { RecipientID } from "../../../model/project/recipient/recipient.ts";

export class SendTransactionalCommand {
  static create(
    projectId: ProjectID,
    recipient: RecipientID,
    plain: ICampaign,
  ): SendTransactionalCommand {
    return new SendTransactionalCommand(
      projectId,
      recipient,
      plain.title,
      plain.content,
    );
  }

  constructor(
    public readonly projectId: ProjectID,
    public readonly recipientId: RecipientID,
    public readonly title: string,
    public readonly content: string,
  ) {
  }
}

export class SendTransactionalResponse {
  constructor(
    public readonly messageId: MessageID,
    public readonly recipientId: RecipientID,
  ) {
  }
}
