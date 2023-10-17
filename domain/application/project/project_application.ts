import { ICampaignStatisticsRepository } from "../../model/project/campaign/campaign_statistics/campaign_statistics_repository.ts";
import { ICampaignRepository } from "../../model/project/campaign/campaign_repository.ts";
import { ProjectAggregate } from "../../model/project/project_aggregate.ts";
import {
  CreateNewProjectCommand,
  CreateNewProjectResponse,
} from "./commands/create_new_project.ts";
import { IProjectRepository } from "../../model/project/project_repository.ts";
import { IProjectStatisticsRepository } from "../../model/project/project_statistics/project_statistics_repository.ts";
import { IRecipientRepository } from "../../model/project/recipient/recipient_repository.ts";
import { Project, ProjectID } from "../../model/project/project.ts";
import { uuid } from "../../utils/uuid.ts";
import { ISender } from "../../model/sender.ts";
import { RegisterExternalEvents } from "./commands/register_external_events.ts";
import {
  GetProjectDetails,
  GetProjectsCommand,
  GetProjectsResponse,
} from "./commands/get_projects.ts";
import {
  CampaignSummaryDTO,
  GetProjectCommand,
  GetProjectResponse,
} from "./commands/get_project.ts";
import {
  UnregisterRecipientCommand,
  UnregisterRecipientResponse,
} from "./commands/unregister_recipient.ts";
import {
  RegisterRecipientCommand,
  RegisterRecipientResponse,
} from "./commands/register_recipient.ts";
import { Recipient } from "../../model/project/recipient/recipient.ts";
import {
  GetIntegrationScriptsCommand,
  GetIntegrationScriptsResponse,
} from "./commands/get_integration_scripts.ts";
import { IConfig } from "../config.ts";
import { ProviderEnum } from "../../model/project/providers/provider.ts";
import {
  SendCampaignCommand,
  SendCampaignResponse,
} from "./commands/send_campaign.ts";
import { Campaign } from "../../model/project/campaign/campaign.ts";
import { SendTransactionalCommand } from "./commands/send_transactional.ts";
import { SendTransactionalResponse } from "./commands/send_transactional.ts";
import {
  GetCampaignCommand,
  GetCampaignResponse,
} from "./commands/get_campaign.ts";
import {
  ChangeVapidEndpointWorkerEventCommand,
  ChangeVapidEndpointWorkerEventResponse,
} from "./commands/endpoint_change_event.ts";

export class ProjectApplication {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly campaignRepository: ICampaignRepository,
    private readonly recipientRepository: IRecipientRepository,
    private readonly campaignStatisticsRepository:
      ICampaignStatisticsRepository,
    private readonly projectStatisticsRepository: IProjectStatisticsRepository,
    private readonly sender: ISender,
    private readonly config: IConfig,
  ) {
  }

  /**
   * Generates integration scripts for "project" dynamically - can be static served
   * Just content of JS that will be served to client website
   */
  async getIntegrationScripts(
    command: GetIntegrationScriptsCommand,
  ): Promise<GetIntegrationScriptsResponse> {
    const projectAggregate = this.getProjectAggregate(command.projectId);
    const details = await projectAggregate.details();
    const vapidProvider = details.providers.find((item) =>
      item.type === ProviderEnum.VAPID
    );

    if (!vapidProvider) {
      throw new Error("Cannot generate scripts, provider is not set");
    }

    const apiHost = this.config.getApiEndpoint();

    /**
     * On this endpoint we will "register subscribers" in concrete projects
     */
    const registerEndpoint =
      `${apiHost}/api/${details.id}/providers/vapid/register`;
    const unregisterEndpoint =
      `${apiHost}/api/${details.id}/providers/vapid/unregister`;

    const vapidPublicKey = vapidProvider.payload.publicKey;

    /**
     * This is our entry point to our clients (projects), each of them should have
     * separate js code, generated dynamically with project id or sth
     */
    const integrationScriptUrl =
      `${apiHost}/api/scripts/${details.id}/integration`;

    /**
     * On this endpoint will be send events that are associated with subscribers (only for vapid)
     * Events like:
     *  - subscriptionchange
     */
    const callbackEndpoint = `${apiHost}/api/${details.id}/recipient/events`;

    const integrationScript = `
import { PpgCoreClient } from "https://cdn.jsdelivr.net/npm/@pushpushgo/core-sdk-js@latest/dist/browser/client/index.js";

window.addEventListener('load', async () => {
  const state = document.querySelector("#state");
  const stateLog = document.querySelector("#state-log");
  const subscriptionView = document.querySelector("#subscription");
  const subscribe = document.querySelector("#subscribe");
  const unsubscribe = document.querySelector("#unsubscribe");

  const ppgClient = PpgCoreClient
    .builder()
    .setVapidSupport({
      scope: '/',
      swPath: '/worker.js',
      userVisibleOnly: true,
      applicationServerKey: '${vapidPublicKey}'
    })
    .build();

  function setSubscription(subscription) {   
    subscriptionView.innerText = JSON.stringify(subscription, null, 2);
  }  

  function setState(message) {
    state.innerText = message;
    const li = document.createElement("li"); li.appendChild(document.createTextNode("[" + new Date().toLocaleTimeString() + "]:" + message));
    stateLog.appendChild(li);
  }

  async function initializeButtons() {
    if (await ppgClient.isSubscribed()) { 
      unsubscribe.removeAttribute("disabled");
      subscribe.setAttribute("disabled", "disabled");
    } else {
      subscribe.removeAttribute("disabled");
      unsubscribe.setAttribute("disabled", "disabled");
    }
    setState('button initialized due to current state - ready to click')
  }

  async function onSubscribe() {
    setState('try to subscribe...')
    const subscription = await ppgClient.subscribe();
    setSubscription(subscription);
    await initializeButtons();
    setState('subscribed');
    await fetch("${registerEndpoint}", {
      method: "POST",
      headers: {"content-type": "application/json"},
      body: JSON.stringify(subscription)
    })
    .then((data) => data.json())
    .then((jsonData) => setState('subscribed - sent to server, recipient: ' + jsonData.recipientId))
    .catch((err) => setState('subscribed - failed to sent' + err.message));
  }

  async function onUnsubscribe() {
    setState('try to unsubscribe...');  
    const current = await ppgClient.getSubscription();
    console.log(current.endpoint)
    await ppgClient.unsubscribe();
    setState('unsubscribed');
    await initializeButtons()
    setSubscription(null);
    await fetch("${unregisterEndpoint}", {
      method: "POST",
      headers: {"content-type": "application/json"},
      body: JSON.stringify({
        identity: current.endpoint
      })
    })
    .then(() => setState('unsubscribed - sent to server'))
    .catch((err) => setState('unsubscribed - failed to sent' + err.message));
  }

  setSubscription(await ppgClient.getSubscription());
  setState("Integration scripts loaded");
  await initializeButtons();
  subscribe.addEventListener('click', onSubscribe);
  unsubscribe.addEventListener('click', onUnsubscribe);
});
    `;

    const workerScript = `
import { Worker } from "https://cdn.jsdelivr.net/npm/@pushpushgo/core-sdk-js@latest/dist/browser/worker/index.js"

new Worker(self, {
  endpoint: "https://api-core.pushpushgo.com/v1",
  onSubscriptionChange: {
      endpoint: "${callbackEndpoint}",
      headers: {
          from_worker: "true"
      }
  },
  onExternalData: (data) => {}
})
    `;

    /**
     * This code must works with "integration script logic"
     * For this example it's complete "website" :)
     */
    const integrationCode = `
<!-- Start website integration of our Saas Example - put this into head section -->
<script src="${integrationScriptUrl}" type="module"></script>
<!-- End website integration of our Saas Example -->
    `;

    /**
     * Only will works with bundled scripts, for demo reason we provide full code
     */
    // const workerCode =
    //   `importScripts("${apiHost}/api/scripts/${details.id}/worker")`;

    return new GetIntegrationScriptsResponse(
      integrationScript,
      workerScript,
      integrationCode,
      workerScript, // workerCode,
    );
  }

  /**
   * Fetch all project data (simplified - not real world implementation of DTO)
   * Normally will be separated to many endpoints due to "huge" DTO
   */
  async getProject(command: GetProjectCommand): Promise<GetProjectResponse> {
    const projectAggregate = this.getProjectAggregate(command.id);
    const details = await projectAggregate.details();
    const campaigns = await projectAggregate.campaigns();
    const statistics = await projectAggregate.statistics();
    const recipients = await projectAggregate.recipients();

    const campaignsData: CampaignSummaryDTO[] = [];

    for (const campaign of campaigns) {
      campaignsData.push({
        meta: await campaign.details(),
        stats: (await campaign.statistics()).valueOf(),
      });
    }

    const projectData = statistics.map((item) => item.valueOf());

    const dto = new GetProjectResponse(
      details.id,
      details.name,
      campaignsData,
      projectData,
      recipients.length,
      recipients,
    );

    return dto;
  }

  /**
   * Single campaign data with statistics
   */
  async getCampaign(command: GetCampaignCommand): Promise<GetCampaignResponse> {
    const projectAggregate = this.getProjectAggregate(command.projectId);
    const campaign = await projectAggregate.campaign(command.campaignId);

    return new GetCampaignResponse(
      campaign.campaignId,
      await campaign.details(),
      (await campaign.statistics()).valueOf(),
    );
  }

  async changeRegistration(
    command: ChangeVapidEndpointWorkerEventCommand,
  ): Promise<ChangeVapidEndpointWorkerEventResponse> {
    const oldRecipient = await this.recipientRepository.getByTokenOrEndpoint(
      command.projectId,
      ProviderEnum.VAPID,
      command.body.oldSubscription.endpoint,
    );
    oldRecipient.onChange(command.body.newSubscription);
    await this.recipientRepository.save(command.projectId, oldRecipient);

    return new ChangeVapidEndpointWorkerEventResponse();
  }

  /**
   * Creates a new project and returns uuid of this project
   */
  async createNewProject(
    command: CreateNewProjectCommand,
  ): Promise<CreateNewProjectResponse> {
    const project = new Project(
      uuid(),
      command.name,
      [],
    );
    await project.configureVapidProvider();
    await this.projectRepository.save(project);
    return new CreateNewProjectResponse(project.id);
  }

  /**
   * Append recipient to database
   */
  async registerRecipient(
    command: RegisterRecipientCommand,
  ): Promise<RegisterRecipientResponse> {
    const aggregate = this.getProjectAggregate(command.projectId);

    const recipient = new Recipient(
      uuid(),
      command.type,
      command.payload,
    );

    await aggregate.register(recipient);
    return new RegisterRecipientResponse(recipient.id);
  }

  /**
   * Removes recipient from database
   */
  async unregisterRecipient(
    command: UnregisterRecipientCommand,
  ): Promise<UnregisterRecipientResponse> {
    const recipient = await this.recipientRepository.getByTokenOrEndpoint(
      command.projectId,
      command.type,
      command.identity,
    );

    await this.recipientRepository.delete(command.projectId, recipient.id);
    return new UnregisterRecipientResponse(recipient.id);
  }

  /**
   * CORE Webhooks processing for event handling
   */
  async registerStatisticsEvent(command: RegisterExternalEvents) {
    const aggregate = this.getProjectAggregate(command.projectId);
    await aggregate.registerStatisticsEvent(command.campaignId, command.event);
  }

  /**
   * List all projects available on instance
   */
  async getProjects(_: GetProjectsCommand): Promise<GetProjectsResponse> {
    const projects = await this.projectRepository.all();
    return new GetProjectsResponse(
      projects.map((item) => new GetProjectDetails(item.id, item.name)),
    );
  }

  /**
   * Send campaign to all recipients - mass campaign case
   */
  async sendCampaign(
    command: SendCampaignCommand,
  ): Promise<SendCampaignResponse> {
    const aggregate = this.getProjectAggregate(command.projectId);
    const campaignId = uuid();

    await aggregate.sendCampaign(
      Campaign.fromPlain({ ...command, id: campaignId }),
    );

    return new SendCampaignResponse(
      campaignId,
    );
  }

  /**
   * Send transactional to concrete recipient
   */
  async sendMessage(
    command: SendTransactionalCommand,
  ): Promise<SendTransactionalResponse> {
    const aggregate = this.getProjectAggregate(command.projectId);
    const recipient = await this.recipientRepository.get(
      command.projectId,
      command.recipientId,
    );

    const response = await aggregate.sendTransactional(command, recipient);

    if (response.status === "failure") {
      console.error(response);
      throw new Error("Cannot send transactional message - error");
    }

    return new SendTransactionalResponse(
      response.messageId,
      recipient.id,
    );
  }

  /**
   * Builder for aggregate by id with di some services / interfaces
   */
  public getProjectAggregate(projectId: ProjectID): ProjectAggregate {
    return new ProjectAggregate(
      projectId,
      this.projectRepository,
      this.projectStatisticsRepository,
      this.campaignRepository,
      this.campaignStatisticsRepository,
      this.recipientRepository,
      this.sender,
    );
  }

  /**
   * Propagate stop signal
   */
  public async stop() {
    await Promise.all([
      this.projectRepository.stop(),
      this.projectStatisticsRepository.stop(),
      this.campaignRepository.stop(),
      this.campaignStatisticsRepository.stop(),
      this.recipientRepository.stop(),
    ]);
  }
}
