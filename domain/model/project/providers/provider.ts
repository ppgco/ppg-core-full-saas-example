import { IVapidProvider } from "./vapid.ts";

export enum ProviderEnum {
  VAPID = "vapid",
  HMS = "hms",
  FCM_V1 = "fcm_v1",
  APNS_TOKEN = "apns_token",
  APNS_CERT = "apns_cert",
}

export type ProviderPayload = IVapidProvider; // | HMSProvider | APNSTokenProvider | APNSCertificateProvider | FCMV1Provider

export interface IProvider {
  type: ProviderEnum;
  payload: ProviderPayload;
}
