import { HandlerContext, Handlers } from "$fresh/server.ts";
import { ApplicationContainer } from "../../../../domain/application/container.ts";
import { GetIntegrationScriptsCommand } from "../../../../domain/application/project/commands/get_integration_scripts.ts";

export const handler: Handlers = {
  async GET(_req: Request, ctx: HandlerContext) {
    const app = ApplicationContainer.create();

    const scripts = await app.project.getIntegrationScripts(
      new GetIntegrationScriptsCommand(ctx.params.project_id),
    );

    return new Response(scripts.projectScript, {
      headers: {
        "content-type": "application/javascript",
      },
    });
  },
};
