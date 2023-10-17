import { Campaign, ICampaign } from "./project/campaign/campaign.ts";
import { Project } from "./project/project.ts";
import { Recipient } from "./project/recipient/recipient.ts";

export interface SuccessSendResults {
  status: "success";
  messageIds: string[];
}

export interface SuccessSendResult {
  status: "success";
  messageId: string;
}

export interface FailureSendResult {
  status: "failure";
  message: string;
  errors: string[];
}

export interface ISender {
  sendToBatch(
    project: Project,
    campaign: Campaign,
    recipients: Recipient[],
  ): Promise<SuccessSendResults | FailureSendResult>;
  sendToOne(
    project: Project,
    campaign: Omit<ICampaign, "id">,
    recipient: Recipient,
  ): Promise<SuccessSendResult | FailureSendResult>;
}
