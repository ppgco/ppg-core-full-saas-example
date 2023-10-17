export interface BaseRecipient {
  project?: string; // HMS / FCM
  publicKey?: string; // VAPID
  appBundleId?: string; // APNS
  websitePushId?: string; // APNS
}
