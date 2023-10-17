import { assert } from "$std/_util/asserts.ts";
import { ProviderEnum } from "../../model/project/providers/provider.ts";
import { VapidRecipient } from "../../model/project/providers/vapid.ts";
import { day } from "../../utils/day.ts";
import { ApplicationContainer } from "../container.ts";
import { CreateNewProjectCommand } from "./commands/create_new_project.ts";
import { GetIntegrationScriptsCommand } from "./commands/get_integration_scripts.ts";
import { GetProjectCommand } from "./commands/get_project.ts";
import { GetProjectsCommand } from "./commands/get_projects.ts";
import { RegisterExternalEvents } from "./commands/register_external_events.ts";
import { RegisterRecipientCommand } from "./commands/register_recipient.ts";
import { SendCampaignCommand } from "./commands/send_campaign.ts";
import { SendTransactionalCommand } from "./commands/send_transactional.ts";
import { UnregisterRecipientCommand } from "./commands/unregister_recipient.ts";

Deno.test("ProjectApplication Test", async function () {
  const app = ApplicationContainer.createTest();

  const createProjectResponse = await app.project.createNewProject(
    new CreateNewProjectCommand("dummy project"),
  );

  const scripts = await app.project.getIntegrationScripts(
    new GetIntegrationScriptsCommand(
      createProjectResponse.id,
    ),
  );

  assert(scripts.integrationCode.length);
  assert(scripts.integrationCode.indexOf(createProjectResponse.id) > -1);

  assert(scripts.projectScript.length);
  assert(scripts.projectScript.indexOf(createProjectResponse.id) > -1);

  assert(scripts.workerScript.length);

  const recipient = await app.project.registerRecipient(
    new RegisterRecipientCommand(
      createProjectResponse.id,
      ProviderEnum.VAPID,
      {
        publicKey: "sample_vapid_public_key_of_project",
        auth: "sampleauth",
        endpoint: "https://sample.endpoint/dummy",
        p256dh: "sample",
      } as VapidRecipient,
    ),
  );

  assert(recipient.recipientId);

  const recipient2 = await app.project.registerRecipient(
    new RegisterRecipientCommand(
      createProjectResponse.id,
      ProviderEnum.VAPID,
      {
        publicKey: "sample_vapid_public_key_of_project",
        auth: "sampleauth",
        endpoint: "https://sample.endpoint/dummy2",
        p256dh: "sample",
      } as VapidRecipient,
    ),
  );

  assert(recipient2.recipientId);

  const unregisteredRecipient2Response = await app.project.unregisterRecipient(
    new UnregisterRecipientCommand(
      createProjectResponse.id,
      ProviderEnum.VAPID,
      "https://sample.endpoint/dummy2",
    ),
  );

  assert(unregisteredRecipient2Response.recipientId === recipient2.recipientId);
  assert(unregisteredRecipient2Response.status === "success");

  const msgData = await app.project.sendMessage(
    new SendTransactionalCommand(
      createProjectResponse.id,
      recipient.recipientId,
      "sample title",
      "sample content",
    ),
  );

  assert(msgData.messageId);
  assert(msgData.recipientId);

  const campaignData = await app.project.sendCampaign(
    new SendCampaignCommand(
      createProjectResponse.id,
      "sample title",
      "sample content",
    ),
  );

  assert(campaignData.campaignId);

  await app.project.registerStatisticsEvent(
    new RegisterExternalEvents(
      createProjectResponse.id,
      campaignData.campaignId,
      {
        messages: [
          {
            foreignId: recipient.recipientId,
            messageId: msgData.messageId,
            result: {
              kind: "sent",
            },
            ts: Date.now(),
          },
          {
            foreignId: recipient.recipientId,
            messageId: msgData.messageId,
            result: {
              kind: "delivered",
            },
            ts: Date.now(),
          },
          {
            foreignId: recipient.recipientId,
            messageId: msgData.messageId,
            result: {
              kind: "clicked",
              action: 0,
            },
            ts: Date.now(),
          },
        ],
      },
    ),
  );

  const projectsData = await app.project.getProjects(
    new GetProjectsCommand(),
  );

  assert(projectsData.projects.length === 1);

  const projectDetailsDto = await app.project.getProject(
    new GetProjectCommand(
      createProjectResponse.id,
    ),
  );

  assert(
    JSON.stringify(projectDetailsDto),
    JSON.stringify({
      id: createProjectResponse.id,
      name: "dummy project",
      campaigns: [
        {
          meta: {
            id: campaignData.campaignId,
            title: "sample title",
            content: "sample content",
          },
          stats: {
            id: campaignData.campaignId,
            data: { vapid_sent: 1, vapid_delivered: 1, vapid_click: 1 },
          },
        },
      ],
      activity: [
        {
          id: createProjectResponse.id,
          day: day(),
          data: { vapid_registered: 2 },
        },
      ],
      active: 1,
      recipients: [
        {
          id: recipient.recipientId,
          provider: "vapid",
          payload: {
            publicKey: "sample_vapid_public_key_of_project",
            auth: "sampleauth",
            endpoint: "https://sample.endpoint/dummy",
            p256dh: "sample",
          },
        },
      ],
    }),
  );

  await app.stop();
});
