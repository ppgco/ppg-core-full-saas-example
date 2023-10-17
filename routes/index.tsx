import { GetProjectsCommand } from "../domain/application/project/commands/get_projects.ts";
import { ApplicationContainer } from "../domain/application/container.ts";

export default async function Projects() {
  const app = ApplicationContainer.create();

  const { projects } = await app.project.getProjects(
    new GetProjectsCommand(),
  );

  if (!projects.length) {
    return (
      <p>
        There is no project to list -{" "}
        <a href="/projects/new">create new project</a>
      </p>
    );
  }

  return (
    <section>
      <table>
        <thead>
          <tr>
            <th>
              Project ID
            </th>
            <th>
              Project Name
            </th>
            <th>
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr>
              <td>{project.id}</td>
              <td>{project.name}</td>
              <td>
                <a href={`/projects/${project.id}`}>
                  <button>
                    Go
                  </button>
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <a href="/projects/new">create new project</a>
    </section>
  );
}
