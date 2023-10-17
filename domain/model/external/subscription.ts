export interface IEndpointSubscription {
  type: string;
  foreignId: string;
  p256dh: string;
  auth: string;
  endpoint: string;
  publicKey: string;
}

export interface ITokenSubscription {
  type: string;
  foreignId: string;
  token: string;
}

export type SubscriptionData = IEndpointSubscription | ITokenSubscription;
