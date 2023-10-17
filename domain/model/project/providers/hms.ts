import { BaseRecipient } from "./common.ts";

type MobileToken = string;
type HmsAppId = string;

export interface HmsRecipient extends BaseRecipient {
  token: MobileToken;
  project: HmsAppId;
}
