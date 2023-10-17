import { HandlerContext, Handlers } from "$fresh/server.ts";
import { ApplicationContainer } from "../../../../../domain/application/container.ts";
import { RegisterRecipientCommand } from "../../../../../domain/application/project/commands/register_recipient.ts";
import { ProviderEnum } from "../../../../../domain/model/project/providers/provider.ts";

export const handler: Handlers = {
  async POST(req: Request, ctx: HandlerContext) {
    const app = ApplicationContainer.create();

    const body = await req.json();

    const response = await app.project.registerRecipient(
      new RegisterRecipientCommand(
        ctx.params.project_id,
        ctx.params.provider as ProviderEnum,
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
