import { ProjectID, ProjectName } from "../../../model/project/project.ts";

export class CreateNewProjectCommand {
  constructor(public readonly name: ProjectName) {
  }
}

export class CreateNewProjectResponse {
  constructor(public readonly id: ProjectID) {
  }
}
