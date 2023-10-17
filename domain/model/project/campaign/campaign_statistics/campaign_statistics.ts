import { ProviderEnum } from "../../providers/provider.ts";
import { CampaignID } from "../campaign.ts";

export type CampaignStatisticsKey = string;

export type ICampaignStatistics = {
  id: CampaignID;
  data: Record<CampaignStatisticsKey, number>;
};

export class CampaignStatistics {
  static fromPlain(plain: ICampaignStatistics): CampaignStatistics {
    const state = new Map();

    for (const key in plain.data) {
      const val = plain.data[key];
      state.set(key, val);
    }

    return new CampaignStatistics(plain.id, state);
  }

  constructor(
    private readonly id: CampaignID,
    private readonly state: Map<CampaignStatisticsKey, number>,
  ) {
  }

  incrementSent(provider: ProviderEnum) {
    this.incrementByKey(`${provider}_sent`);
  }

  incrementDelivered(provider: ProviderEnum) {
    this.incrementByKey(`${provider}_delivered`);
  }

  incrementClicked(provider: ProviderEnum, action: number) {
    switch (action) {
      case 1:
        this.incrementByKey(`${provider}_click_1`);
        break;
      case 2:
        this.incrementByKey(`${provider}_click_2`);
        break;
      default:
        this.incrementByKey(`${provider}_click`);
        break;
    }
  }

  incrementClosed(provider: ProviderEnum) {
    this.incrementByKey(`${provider}_closed`);
  }

  incrementRejected(provider: ProviderEnum) {
    this.incrementByKey(`${provider}_rejected`);
  }

  incrementFailed(provider: ProviderEnum) {
    this.incrementByKey(`${provider}_failed`);
  }

  private incrementByKey(key: CampaignStatisticsKey): void {
    if (!this.state.has(key)) {
      this.state.set(key, 0);
    }

    this.state.set(key, this.state.get(key)! + 1);
  }

  private serializeState(): Record<CampaignStatisticsKey, number> {
    const results: Record<CampaignStatisticsKey, number> = {};

    for (const [key, val] of this.state.entries()) {
      results[key] = val;
    }

    return results;
  }

  valueOf(): ICampaignStatistics {
    return {
      id: this.id,
      data: this.serializeState(),
    };
  }
}
