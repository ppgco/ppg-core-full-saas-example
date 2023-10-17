import { ProjectID } from "../../../model/project/project.ts";
import { ProviderEnum } from "../../../model/project/providers/provider.ts";
import { RecipientID } from "../../../model/project/recipient/recipient.ts";

type TokenOrEndpoint = string;

export class UnregisterRecipientCommand {
  constructor(
    public readonly projectId: ProjectID,
    public readonly type: ProviderEnum,
    public readonly identity: TokenOrEndpoint,
  ) {
  }
}

export class UnregisterRecipientResponse {
  constructor(
    public readonly recipientId: RecipientID,
    public readonly status: "success" | "failure" = "success",
  ) {
  }
}
