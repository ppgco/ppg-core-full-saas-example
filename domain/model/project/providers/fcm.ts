import { BaseRecipient } from "./common.ts";

type MobileToken = string;
type FcmProjectId = string;

export interface FcmRecipient extends BaseRecipient {
  token: MobileToken;
  project: FcmProjectId;
}
