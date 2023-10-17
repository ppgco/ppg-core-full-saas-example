import { assert } from "$std/_util/asserts.ts";
import { ApplicationContainer } from "../../application/container.ts";
import { CreateNewProjectCommand } from "../../application/project/commands/create_new_project.ts";
import { ProviderEnum } from "./providers/provider.ts";
import { Recipient } from "./recipient/recipient.ts";
import { uuid } from "../../utils/uuid.ts";
import { Campaign } from "./campaign/campaign.ts";

Deno.test("ProjectAggregate Test", async function () {
  const app = ApplicationContainer.createTest();

  const createProjectResponse = await app.project.createNewProject(
    new CreateNewProjectCommand("dummy project"),
  );

  const aggregate = app.project.getProjectAggregate(createProjectResponse.id);

  const project = await aggregate.details();

  assert(project.id.length === 36);
  assert(project.name === "dummy project");
  assert(project.providers.length === 1);
  assert(project.providers[0].type === ProviderEnum.VAPID);
  assert(project.providers[0].payload.privateKey.length === 43);
  assert(project.providers[0].payload.publicKey.length === 87);

  const recipient = Recipient.fromPlain({
    id: uuid(),
    provider: ProviderEnum.VAPID,
    payload: {
      p256dh: "publickey",
      auth: "authkey",
      endpoint: "https://web.push.apple.com/dummy",
      publicKey: "xxx",
    },
  });

  const recipient2 = Recipient.fromPlain({
    id: uuid(),
    provider: ProviderEnum.VAPID,
    payload: {
      p256dh: "publickey",
      auth: "authkey",
      endpoint: "https://web.push.apple.com/dummy2",
      publicKey: "xxx",
    },
  });

  await aggregate.register(recipient);
  await aggregate.register(recipient2);

  const recipients = await aggregate.recipients();
  assert(recipients.length === 2);

  await aggregate.unregister(recipient2.id);

  const [currentDay] = await aggregate.statistics();

  assert(
    JSON.stringify(currentDay.valueOf().data) === JSON.stringify({
      vapid_registered: 2,
      vapid_unregistered: 1,
    }),
  );

  const activeRecipients = await aggregate.recipients();
  assert(activeRecipients.length === 1);

  const campaign = new Campaign(
    uuid(),
    "Hi!",
    "Hello world",
  );

  await aggregate.sendCampaign(campaign);

  const campaigns = await aggregate.campaigns();
  assert(campaigns.length === 1);

  const campaignAggregate = await aggregate.campaign(campaign.id);
  const campaignDetails = await campaignAggregate.details();

  assert(campaignDetails.title === "Hi!");

  await aggregate.registerStatisticsEvent(campaign.id, {
    messages: [
      {
        foreignId: recipient.id,
        messageId: "abc",
        result: {
          kind: "sent",
        },
        ts: Date.now(),
      },
      {
        foreignId: recipient.id,
        messageId: "abc",
        result: {
          kind: "delivered",
        },
        ts: Date.now(),
      },
    ],
  });

  await aggregate.registerStatisticsEvent(campaign.id, {
    messages: [
      {
        foreignId: recipient.id,
        messageId: "abc",
        result: {
          kind: "clicked",
          action: 0,
        },
        ts: Date.now(),
      },
    ],
  });

  const statistics = await campaignAggregate.statistics();
  assert(
    JSON.stringify(statistics.valueOf().data) ===
      JSON.stringify({ vapid_sent: 1, vapid_delivered: 1, vapid_click: 1 }),
  );

  await app.stop();
});
