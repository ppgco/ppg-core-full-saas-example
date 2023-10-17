import { Campaign, ICampaign } from "../../model/project/campaign/campaign.ts";
import { Project } from "../../model/project/project.ts";
import { Recipient } from "../../model/project/recipient/recipient.ts";
import {
  FailureSendResult,
  ISender,
  SuccessSendResult,
  SuccessSendResults,
} from "../../model/sender.ts";

export class DummySender implements ISender {
  sendToBatch(
    _project: Project,
    _campaign: Campaign,
    _recipients: Recipient[],
  ): Promise<SuccessSendResults | FailureSendResult> {
    return Promise.resolve({
      status: "success",
      messageIds: ["a", "b"],
    });
  }

  sendToOne(
    _project: Project,
    _campaign: ICampaign,
    _recipient: Recipient,
  ): Promise<SuccessSendResult | FailureSendResult> {
    return Promise.resolve({
      status: "success",
      messageId: "abc",
    });
  }
}
