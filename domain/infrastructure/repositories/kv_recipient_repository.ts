import {
  IRecipient,
  Recipient,
} from "../../model/project/recipient/recipient.ts";
import {
  IRecipientRepository,
  TokenOrEndpoint,
} from "../../model/project/recipient/recipient_repository.ts";
import { ProjectID } from "../../model/project/project.ts";
import { ProviderEnum } from "../../model/project/providers/provider.ts";
import { VapidRecipient } from "../../model/project/providers/vapid.ts";
import { HmsRecipient } from "../../model/project/providers/hms.ts";
import { FcmRecipient } from "../../model/project/providers/fcm.ts";
import {
  ApnsIosRecipient,
  ApnsSafariRecipient,
} from "../../model/project/providers/apns.ts";

export class KVRecipientRepository implements IRecipientRepository {
  static DB_NAMESPACE = "recipient";

  public cachedKvPromise: Promise<Deno.Kv>;

  constructor(persistence: boolean) {
    this.cachedKvPromise = Deno.openKv(
      persistence
        ? `data/${this.constructor.name}`
        : `/tmp/${this.constructor.name}_${Math.random()}`,
    );
  }

  async stop(): Promise<void> {
    const kv = await this.cachedKvPromise;
    return kv.close();
  }

  async delete(projectId: ProjectID, recipientId: string): Promise<void> {
    const kv = await this.cachedKvPromise;
    await kv.delete([
      KVRecipientRepository.DB_NAMESPACE,
      projectId,
      recipientId,
    ]);
  }

  async all(projectId: ProjectID): Promise<Recipient[]> {
    const kv = await this.cachedKvPromise;
    const results = [];
    for await (
      const item of kv.list<IRecipient>({
        prefix: [KVRecipientRepository.DB_NAMESPACE, projectId],
      })
    ) {
      results.push(Recipient.fromPlain(item.value));
    }
    return results;
  }

  async save(projectId: ProjectID, recipient: Recipient): Promise<void> {
    const kv = await this.cachedKvPromise;
    const plainData = recipient.valueOf();
    const result = await kv.set([
      KVRecipientRepository.DB_NAMESPACE,
      projectId,
      plainData.id,
    ], plainData);
    if (!result.ok) {
      throw new Error(
        "Problem during writing data to KV - data may be corrupted",
      );
    }
  }

  async get(projectId: ProjectID, recipientId: string): Promise<Recipient> {
    const kv = await this.cachedKvPromise;
    const result = await kv.get<IRecipient>([
      KVRecipientRepository.DB_NAMESPACE,
      projectId,
      recipientId,
    ]);

    if (!result || !result.value) {
      throw new Error("Recipient not found");
    }

    return Recipient.fromPlain(result.value as IRecipient);
  }

  /**
   * In real world example, we should use index on db, and get by second "index" field to receive concrete recipient
   * by token or by endpoint or use any type of KV for that.
   */
  async getByTokenOrEndpoint(
    projectId: ProjectID,
    type: ProviderEnum,
    identity: TokenOrEndpoint,
  ): Promise<Recipient> {
    const allRecipients = await this.all(projectId);

    const myRecipient = allRecipients.find((recipient) => {
      if (recipient.provider === type) {
        switch (type) {
          case ProviderEnum.VAPID:
            return (recipient.payload as VapidRecipient).endpoint === identity;
          case ProviderEnum.HMS:
            return (recipient.payload as HmsRecipient).token === identity;
          case ProviderEnum.FCM_V1:
            return (recipient.payload as FcmRecipient).token === identity;
          case ProviderEnum.APNS_TOKEN:
          case ProviderEnum.APNS_CERT:
            return (recipient.payload as ApnsIosRecipient | ApnsSafariRecipient)
              .token === identity;
        }
      }
    });

    if (!myRecipient) {
      throw new Error("Recipient identity not found");
    }

    return myRecipient;
  }
}
