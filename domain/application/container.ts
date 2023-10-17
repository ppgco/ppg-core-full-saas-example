/// <reference lib="deno.unstable" />

import { KVCampaignRepository } from "../infrastructure/repositories/kv_campaign_repository.ts";
import { KVCampaignStatisticsRepository } from "../infrastructure/repositories/kv_campaign_statistics_repository.ts";
import { KVProjectRepository } from "../infrastructure/repositories/kv_project_repository.ts";
import { KVProjectStatisticsRepository } from "../infrastructure/repositories/kv_project_statistics_repository.ts";
import { KVRecipientRepository } from "../infrastructure/repositories/kv_recipient_repository.ts";
import { CoreSender } from "../infrastructure/sender/core_sender.ts";
import { DummySender } from "../infrastructure/sender/dummy_sender.ts";
import { ApplicationConfig, DummyConfig } from "./config.ts";
import { ProjectApplication } from "./project/project_application.ts";

export class ApplicationContainer {
  static instance: ApplicationContainer;

  static create() {
    const persistence = true;
    const config = new ApplicationConfig();

    this.instance = new ApplicationContainer(
      new ProjectApplication(
        new KVProjectRepository(persistence),
        new KVCampaignRepository(persistence),
        new KVRecipientRepository(persistence),
        new KVCampaignStatisticsRepository(persistence),
        new KVProjectStatisticsRepository(persistence),
        new CoreSender(config),
        config,
      ),
    );

    return this.instance;
  }

  static createTest() {
    const persistence = false;
    const config = new DummyConfig();
    this.instance = new ApplicationContainer(
      new ProjectApplication(
        new KVProjectRepository(persistence),
        new KVCampaignRepository(persistence),
        new KVRecipientRepository(persistence),
        new KVCampaignStatisticsRepository(persistence),
        new KVProjectStatisticsRepository(persistence),
        new DummySender(),
        config,
      ),
    );

    return this.instance;
  }

  constructor(
    public readonly project: ProjectApplication,
  ) {
  }

  stop() {
    return this.project.stop();
  }
}
