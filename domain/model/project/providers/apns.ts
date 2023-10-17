import { BaseRecipient } from "./common.ts";

type ApnsWebsitePushId = string;
type ApnsAppBundleId = string;
type MobileOrWebToken = string;

export interface ApnsIosRecipient extends BaseRecipient {
  token: MobileOrWebToken;
  appBundleId: ApnsAppBundleId;
}

export interface ApnsSafariRecipient extends BaseRecipient {
  token: MobileOrWebToken;
  websitePushId: ApnsWebsitePushId;
}
