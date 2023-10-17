import { PpgCoreClient } from "https://cdn.jsdelivr.net/npm/@pushpushgo/core-sdk-js@latest/dist/server/client/index.js";
import { Bucket } from "https://cdn.jsdelivr.net/npm/@pushpushgo/core-sdk-js@latest/dist/server/client/bucket.js";
import { Context } from "https://cdn.jsdelivr.net/npm/@pushpushgo/core-sdk-js@latest/dist/server/client/context.js";
import { Campaign, ICampaign } from "../../model/project/campaign/campaign.ts";
import { Recipient } from "../../model/project/recipient/recipient.ts";
import {
  FailureSendResult,
  ISender,
  SuccessSendResult,
  SuccessSendResults,
} from "../../model/sender.ts";
import { Project } from "../../model/project/project.ts";
import { IConfig } from "../../application/config.ts";
import { ProviderEnum } from "../../model/project/providers/provider.ts";

// TODO: FIX Library to export d.ts files properly...
type ProviderPayload = {
  type: ProviderEnum;
  payload: Record<string, string>;
};

type WebhookConfig = {
  url: string;
  headers: Record<string, string>;
};

type CoreSuccessResult = {
  results: Array<
    { messageId: string }
  >;
};

type CoreFailureResult = {
  errors: Array<string>;
};

/**
 * Integration part with CORE by PushPushGo
 * This part of code send notifications via CORE provider
 */
export class CoreSender implements ISender {
  private readonly client: PpgCoreClient;
  private readonly cache: Map<string, { bucket: Bucket; context: Context }> =
    new Map();

  constructor(private readonly config: IConfig) {
    this.client = new PpgCoreClient({
      endpoint: config.getPpgCoreApiEndpoint(),
      apiKey: config.getPpgCoreApiToken(),
    });

    console.log("PPG Core configuration: ", {
      endpoint: config.getPpgCoreApiEndpoint(),
      apiKey: config.getPpgCoreApiToken(),
    });
  }

  private async resolveBucketAndContextWithCache(
    project: Project,
    campaign: Campaign,
  ) {
    // Cache key
    const key = `${project.id}_${campaign.id}`;

    let data = this.cache.get(key);

    if (!data) {
      const providers: ProviderPayload[] = project
        .providers as unknown as ProviderPayload[];
      const webhookConfig: WebhookConfig = {
        // This url will be "called" when some events occur
        url:
          `${this.config.getApiEndpoint()}/api/${project.id}/campaigns/${campaign.id}/events`,
        headers: {
          "content-type": "application/json",
          // Sample authorization headers maybe
        },
      };

      const bucket = await this.client.createBucket(providers, webhookConfig);

      const context = await bucket.createContext({
        channelName: "default",
        title: campaign.title,
        body: campaign.content,
        // subtitle: "My subtitle for ios or legacy safari",
        behaviour: "https://example.com",
        // behaviourIos: "app://com.example.ios/deep/link", // optional if not pass get from "behaviour"
        // behaviourAndroid: "app://com.example.android/deep/link", // optional if not pass get from "behaviour"
        // behaviourHuawei: "app://com.example.huawei/deep/link", // optional if not pass get from "behaviour"

        // smallIcon: "https://placehold.co/64",
        icon: "https://placehold.co/256",
        // image: "https://placehold.co/768x512",

        // One of
        // expiresAt: "YYYY-MM-DDT00:00:00.000Z",
        ttl: 3600, // seconds
        // badgeMobile: 1, // set badge number on app icon
        // externalData: "{\"sample\": true}",
        // actions: [
        // {
        //     behaviour: "https://example.com/action1",
        //     behaviourIos: "app://com.example.ios/deep/link/action1", // optional if not pass get from "behaviour"
        //     behaviourAndroid: "app://com.example.android/deep/link/action1", // optional if not pass get from "behaviour"
        //     behaviourHuawei: "app://com.example.huawei/deep/link/action1", // optional if not pass get from "behaviour"
        //     behaviourWebPush: "https://example.com/action1", // optional if not pass get from "behaviour"

        //     title: "My action",
        //     icon: "https://placehold.co/64",
        //     action: "action_1"
        // }
        // ]
      });

      data = { bucket, context };
      this.cache.set(key, data);
    }

    return data;
  }

  async sendToBatch(
    project: Project,
    campaign: Campaign,
    recipients: Recipient[],
  ): Promise<SuccessSendResults | FailureSendResult> {
    const instance = await this.resolveBucketAndContextWithCache(
      project,
      campaign,
    );

    const wrapedRecipients = recipients
      // Filter bad values during development, should be validated before save
      .filter((recipient) =>
        recipient.provider && Object.keys(recipient.payload).length > 0
      )
      .map((recipient) =>
        instance.bucket.createReceiver({
          ...recipient.payload,
          foreignId: recipient.id,
        })
      );

    if (!wrapedRecipients.length) {
      throw new Error("No recipients - break send process");
    }

    const results: CoreSuccessResult & CoreFailureResult = await instance
      .context.sendMessages(
        wrapedRecipients,
      );

    if (results?.errors) {
      return {
        status: "failure",
        errors: results.errors,
        message: "error durign sending campaign to batch",
      };
    }

    return {
      messageIds: results.results.map((item) => item.messageId),
      status: "success",
    };
  }

  sendToOne(
    project: Project,
    campaign: ICampaign,
    recipient: Recipient,
  ): Promise<SuccessSendResult | FailureSendResult> {
    throw new Error("Not implemented");
  }
}
