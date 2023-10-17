import { day } from "../../utils/day.ts";
import { Campaign, CampaignID, ICampaign } from "./campaign/campaign.ts";
import { CampaignAggregate } from "./campaign/campaign_aggregate.ts";
import { ICampaignRepository } from "./campaign/campaign_repository.ts";
import { ICampaignStatisticsRepository } from "./campaign/campaign_statistics/campaign_statistics_repository.ts";
import { Project, ProjectID } from "./project.ts";
import { IProjectRepository } from "./project_repository.ts";
import { ProjectStatistics } from "./project_statistics/project_statistics.ts";
import { IProjectStatisticsRepository } from "./project_statistics/project_statistics_repository.ts";
import { Recipient, RecipientID } from "./recipient/recipient.ts";
import { IRecipientRepository } from "./recipient/recipient_repository.ts";
import { ISender } from "../sender.ts";
import { MessageEventBulk } from "../external/message_event_bulk.ts";

export class ProjectAggregate {
  constructor(
    private readonly projectId: ProjectID,
    private readonly projectRepository: IProjectRepository,
    private readonly projectStatisticsRepository: IProjectStatisticsRepository,
    private readonly campaignRepository: ICampaignRepository,
    private readonly campaignStatisticsRepository:
      ICampaignStatisticsRepository,
    private readonly recipientRepository: IRecipientRepository,
    private readonly sender: ISender,
  ) {
  }

  /**
   * Resolve project concrete model
   */
  details(): Promise<Project> {
    return this.projectRepository.get(this.projectId);
  }

  async statistics(): Promise<ProjectStatistics[]> {
    const stats = await this.projectStatisticsRepository.get(this.projectId);
    return stats;
  }

  async campaign(campaignId: CampaignID): Promise<CampaignAggregate> {
    const campaign = await this.campaignRepository.get(
      this.projectId,
      campaignId,
    );
    return new CampaignAggregate(
      this.projectId,
      campaign.id,
      this.campaignRepository,
      this.campaignStatisticsRepository,
    );
  }

  async campaigns(): Promise<CampaignAggregate[]> {
    const campaigns = await this.campaignRepository.all(this.projectId);
    return campaigns.map((item) =>
      new CampaignAggregate(
        this.projectId,
        item.id,
        this.campaignRepository,
        this.campaignStatisticsRepository,
      )
    );
  }

  async recipients(): Promise<Recipient[]> {
    const recipients = await this.recipientRepository.all(this.projectId);
    return recipients;
  }

  async register(recipient: Recipient): Promise<void> {
    const projectStats = await this.projectStatisticsRepository.getForDay(
      this.projectId,
      day(),
    );
    await this.recipientRepository.save(this.projectId, recipient);
    projectStats.incrementRegistered(recipient.provider);
    await this.projectStatisticsRepository.save(this.projectId, projectStats);
  }

  async unregister(recipientId: RecipientID) {
    const projectStats = await this.projectStatisticsRepository.getForDay(
      this.projectId,
      day(),
    );
    const recipient = await this.recipientRepository.get(
      this.projectId,
      recipientId,
    );
    await this.recipientRepository.delete(this.projectId, recipient.id);
    projectStats.incrementUnregistered(recipient.provider);
    await this.projectStatisticsRepository.save(this.projectId, projectStats);
  }

  async sendTransactional(
    campaign: Omit<ICampaign, "id">,
    recipient: Recipient,
  ) {
    return this.sender.sendToOne(await this.details(), campaign, recipient);
  }

  async sendCampaign(campaign: Campaign) {
    await this.campaignRepository.save(this.projectId, campaign);
    const recipients = await this.recipientRepository.all(this.projectId);

    let currentBatch: Recipient[] = [];

    while (recipients.length) {
      const next = recipients.pop();

      if (!next) {
        break;
      }

      currentBatch.push(next);

      // Batch size
      if (currentBatch.length % 1000 === 0) {
        await this.sender.sendToBatch(
          await this.details(),
          campaign,
          currentBatch,
        );
        currentBatch = [];
      }
    }

    // Rest of sending group
    await this.sender.sendToBatch(await this.details(), campaign, currentBatch);
  }

  async registerStatisticsEvent(
    campaignId: CampaignID,
    event: MessageEventBulk,
  ) {
    for (const single of event.messages) {
      try {
        const recipient = await this.recipientRepository.get(
          this.projectId,
          single.foreignId,
        );

        const stats = await this.campaignStatisticsRepository.get(
          this.projectId,
          campaignId,
        );

        switch (single.result.kind) {
          case "sent":
            stats.incrementSent(recipient.provider);
            break;
          case "delivered":
            stats.incrementDelivered(recipient.provider);
            break;
          case "clicked":
            stats.incrementClicked(
              recipient.provider,
              single.result.action || 0,
            );
            break;
          case "closed":
            stats.incrementClosed(recipient.provider);
            break;
          default:
            console.error(
              "Cannot parse single statistics event - logic not implemented",
              single,
            );
        }

        await this.campaignStatisticsRepository.save(this.projectId, stats);
      } catch (error) {
        console.error("Unable to register event due to error", error, single);
      }
    }
  }
}
