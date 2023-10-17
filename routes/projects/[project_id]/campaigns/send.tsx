import { Handlers, PageProps } from "$fresh/server.ts";
import { ApplicationContainer } from "../../../../domain/application/container.ts";
import { SendCampaignCommand } from "../../../../domain/application/project/commands/send_campaign.ts";

export const handler: Handlers = {
  async GET(req, ctx) {
    return await ctx.render();
  },
  async POST(req, ctx) {
    const form = await req.formData();
    const title = form.get("title")?.toString();
    const content = form.get("content")?.toString();

    if (!title) {
      throw new Error("cannot fetch title from form data");
    }

    if (!content) {
      throw new Error("cannot fetch content from form data");
    }

    const app = ApplicationContainer.create();

    const campaign = await app.project.sendCampaign(
      new SendCampaignCommand(
        ctx.params.project_id,
        title,
        content,
      ),
    );

    const headers = new Headers();

    headers.set(
      "location",
      `/projects/${ctx.params.project_id}/campaigns/${campaign.campaignId}`,
    );
    return new Response(null, {
      status: 303,
      headers,
    });
  },
};

export default function SendCampaign(props: PageProps) {
  return (
    <>
      <a href={`/projects/${props.params.project_id}`}>back to project</a>
      <form method="post">
        <input type="title" name="title" value="Sample title" />
        <input type="content" name="content" value="Sample content" />
        <button type="submit">Send!</button>
      </form>
    </>
  );
}
