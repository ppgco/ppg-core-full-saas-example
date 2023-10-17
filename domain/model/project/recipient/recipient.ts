import { ThisTypeNode } from "https://deno.land/x/ts_morph@17.0.1/ts_morph.js";
import { SubscriptionChangeEventPayload } from "../../../application/project/commands/endpoint_change_event.ts";
import { ApnsIosRecipient, ApnsSafariRecipient } from "../providers/apns.ts";
import { FcmRecipient } from "../providers/fcm.ts";
import { HmsRecipient } from "../providers/hms.ts";
import { ProviderEnum } from "../providers/provider.ts";
import { VapidRecipient } from "../providers/vapid.ts";

export type RecipientID = string;

export type RecipientProviderPayload =
  | VapidRecipient
  | HmsRecipient
  | FcmRecipient
  | ApnsIosRecipient
  | ApnsSafariRecipient;

export interface IRecipient {
  id: RecipientID;
  provider: ProviderEnum;
  payload: RecipientProviderPayload;
}

export class Recipient {
  static fromPlain(plain: IRecipient): Recipient {
    return new Recipient(
      plain.id,
      plain.provider,
      plain.payload,
    );
  }

  constructor(
    public readonly id: RecipientID,
    public readonly provider: ProviderEnum,
    public payload: RecipientProviderPayload,
  ) {
  }

  /**
   * Vapid endpoints can expire and change during lifetime
   */
  onChange(data: SubscriptionChangeEventPayload) {
    const newPayload: VapidRecipient = {
      auth: data.keys.auth,
      p256dh: data.keys.p256dh,
      endpoint: data.endpoint,
      publicKey: this.payload.publicKey!,
    };

    this.payload = newPayload;
  }

  valueOf() {
    return {
      id: this.id,
      provider: this.provider,
      payload: { ...this.payload },
    };
  }
}
