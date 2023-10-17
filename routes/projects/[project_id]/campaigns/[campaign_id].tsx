import { RouteContext } from "$fresh/server.ts";
import CampaignDetails from "../../../../components/campaign_details.tsx";
import CampaignStatistics from "../../../../components/campaign_statistics.tsx";
import { ApplicationContainer } from "../../../../domain/application/container.ts";
import { GetCampaignCommand } from "../../../../domain/application/project/commands/get_campaign.ts";

export default async function CampaignPageDetails(
  _req: Request,
  ctx: RouteContext,
) {
  const app = ApplicationContainer.create();

  const campaign = await app.project.getCampaign(
    new GetCampaignCommand(
      ctx.params.project_id,
      ctx.params.campaign_id,
    ),
  );

  return (
    <section>
      <a href={`/projects/${ctx.params.project_id}`}>back to project</a>
      <h3>Metadata</h3>
      <CampaignDetails meta={campaign.meta}></CampaignDetails>
      <h3>Statistics</h3>
      <CampaignStatistics stats={campaign.stats}/>
    </section>
  );
}
