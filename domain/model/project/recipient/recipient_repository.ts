import { IStoppable } from "../../stoppable.ts";
import { ProjectID } from "../project.ts";
import { ProviderEnum } from "../providers/provider.ts";
import { Recipient, RecipientID } from "./recipient.ts";

export type TokenOrEndpoint = string;

export interface IRecipientRepository extends IStoppable {
  all(projectId: ProjectID): Promise<Recipient[]>;
  save(projectId: ProjectID, recipient: Recipient): Promise<void>;
  delete(projectId: ProjectID, recipientId: RecipientID): Promise<void>;
  get(projectId: ProjectID, recipientId: RecipientID): Promise<Recipient>;
  getByTokenOrEndpoint(
    projectId: ProjectID,
    type: ProviderEnum,
    identity: TokenOrEndpoint,
  ): Promise<Recipient>;
}
