import { RouteContext } from "$fresh/server.ts";
import Campaigns from "../../../components/campaigns.tsx";
import IntegrationCodes from "../../../components/codes.tsx";
import ProjectStatistics from "../../../components/project_statistics.tsx";
import Recipients from "../../../components/recipients.tsx";
import { ApplicationContainer } from "../../../domain/application/container.ts";
import { GetIntegrationScriptsCommand } from "../../../domain/application/project/commands/get_integration_scripts.ts";
import { GetProjectCommand } from "../../../domain/application/project/commands/get_project.ts";

export default async function ProjectDetails(_req: Request, ctx: RouteContext) {
  const app = ApplicationContainer.create();

  const project = await app.project.getProject(
    new GetProjectCommand(ctx.params.project_id),
  );

  const codes = await app.project.getIntegrationScripts(
    new GetIntegrationScriptsCommand(ctx.params.project_id),
  );

  // TODO fix this, add to DTO w/w
  const temporaryDataForCheck = await app.project.getProjectAggregate(
    ctx.params.project_id,
  );
  const temporaryDataForCheckDetails = await temporaryDataForCheck.details();
  return (
    <section>
      <a href="/">back to projects</a>
      <h3>Details</h3>
      <p>{project.name} ({project.id})</p>
      <h3>Statistics</h3>
      <p>Active subscribers: {project.active}</p>
      <ProjectStatistics data={project.activity} />
      <h3>Campaigns</h3>
      <Campaigns projectId={project.id} campaigns={project.campaigns} />
      <a href={`/projects/${ctx.params.project_id}/campaigns/send`}>
        <button>New Campaign</button>
      </a>
      <h3>Recipients</h3>
      <Recipients recipients={project.recipients} />
      <h3>Integration details</h3>
      <IntegrationCodes codes={codes} />
      <h3>Providers</h3>
      <pre>{JSON.stringify(temporaryDataForCheckDetails.providers, null, 2)}</pre>
    </section>
  );
}
