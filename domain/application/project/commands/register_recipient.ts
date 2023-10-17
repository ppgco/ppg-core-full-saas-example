import { ProjectID } from "../../../model/project/project.ts";
import { ProviderEnum } from "../../../model/project/providers/provider.ts";
import {
  RecipientID,
  RecipientProviderPayload,
} from "../../../model/project/recipient/recipient.ts";

export class RegisterRecipientCommand {
  constructor(
    public readonly projectId: ProjectID,
    public readonly type: ProviderEnum,
    public readonly payload: RecipientProviderPayload,
  ) {
  }
}

export class RegisterRecipientResponse {
  constructor(
    public readonly recipientId: RecipientID,
  ) {
  }
}
