import { generateVAPIDKeys } from "../../../utils/vapid.ts";
import { BaseRecipient } from "./common.ts";

export interface IVapidProvider {
  publicKey: string;
  privateKey: string;
}

type VapidPublicKey = string;
type VapidP256Dh = string;
type VapidAuth = string;
type VapidEndpoint = string;

export interface VapidRecipient extends BaseRecipient {
  publicKey: VapidPublicKey;
  p256dh: VapidP256Dh;
  auth: VapidAuth;
  endpoint: VapidEndpoint;
}

export class VapidProvider implements IVapidProvider {
  static async create(): Promise<VapidProvider> {
    const { privateKey, publicKey } = await generateVAPIDKeys();
    return new VapidProvider(
      publicKey,
      privateKey,
    );
  }

  constructor(
    public publicKey: string,
    public privateKey: string,
  ) {
  }

  valueOf(): IVapidProvider {
    return this;
  }
}
