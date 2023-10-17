import { HandlerContext, Handlers } from "$fresh/server.ts";
import { ApplicationContainer } from "../../../../domain/application/container.ts";
import {
  ChangeVapidEndpointWorkerEventCommand,
  WorkerChangeEvent,
} from "../../../../domain/application/project/commands/endpoint_change_event.ts";

export const handler: Handlers = {
  async POST(req: Request, ctx: HandlerContext) {
    const app = ApplicationContainer.create();
    const body: WorkerChangeEvent = await req.json();

    const response = await app.project.changeRegistration(
      new ChangeVapidEndpointWorkerEventCommand(
        ctx.params.project_id,
        body.payload,
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
