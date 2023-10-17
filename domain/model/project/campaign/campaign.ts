export type CampaignID = string;

export interface ICampaign {
  id: CampaignID;
  title: string;
  content: string;
  icon: string;
}

export class Campaign {
  static fromPlain(plain: ICampaign): Campaign {
    return new Campaign(
      plain.id,
      plain.title,
      plain.content,
      plain.icon,
    );
  }

  constructor(
    public readonly id: CampaignID,
    public title: string,
    public content: string,
    public icon: string,
  ) {
  }

  valueOf() {
    return this;
  }
}
