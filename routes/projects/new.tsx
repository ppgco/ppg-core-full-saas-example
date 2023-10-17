import { Handlers } from "$fresh/server.ts";
import { ApplicationContainer } from "../../domain/application/container.ts";
import { CreateNewProjectCommand } from "../../domain/application/project/commands/create_new_project.ts";

export const handler: Handlers = {
  async GET(req, ctx) {
    return await ctx.render();
  },
  async POST(req, ctx) {
    const form = await req.formData();
    const name = form.get("name")?.toString();

    if (!name) {
      throw new Error("cannot fetch name from form data");
    }

    const app = ApplicationContainer.create();
    const project = await app.project.createNewProject(
      new CreateNewProjectCommand(
        name as string,
      ),
    );

    const headers = new Headers();
    headers.set("location", `/projects/${project.id}`);
    return new Response(null, {
      status: 303,
      headers,
    });
  },
};

export default function NewProject() {
  return (
    <>
      <a href="/">back to projects</a>
      <form method="post">
        <input type="name" name="name" value="https://sample.website.pl" />
        <button type="submit">Add new project</button>
      </form>
    </>
  );
}
