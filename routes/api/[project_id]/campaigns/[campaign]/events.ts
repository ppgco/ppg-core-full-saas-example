import { HandlerContext, Handlers } from "$fresh/server.ts";
import { ApplicationContainer } from "../../../../../domain/application/container.ts";
import { RegisterExternalEvents } from "../../../../../domain/application/project/commands/register_external_events.ts";

export const handler: Handlers = {
  async POST(req: Request, ctx: HandlerContext) {
    const app = ApplicationContainer.create();

    const body = await req.json();

    const response = await app.project.registerStatisticsEvent(
      new RegisterExternalEvents(
        ctx.params.project_id,
        ctx.params.campaign,
        body,
      ),
    );

    return new Response(
      JSON.stringify(response),
      {
        headers: {
          "content-type": "application/json",
        },
      },
    );
  },
};
