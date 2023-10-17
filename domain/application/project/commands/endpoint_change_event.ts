import { ProjectID } from "../../../model/project/project.ts";

export interface WorkerChangeEvent {
  type: "change";
  payload: WorkerChangeEventPayload;
}

export interface SubscriptionChangeEventPayload {
  endpoint: string;
  expirationTime: number;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface WorkerChangeEventPayload {
  oldSubscription: SubscriptionChangeEventPayload;
  newSubscription: SubscriptionChangeEventPayload;
}

export class ChangeVapidEndpointWorkerEventCommand {
  constructor(
    public readonly projectId: ProjectID,
    public readonly body: WorkerChangeEventPayload,
  ) {
  }
}

export class ChangeVapidEndpointWorkerEventResponse {
  constructor(
    public readonly success = true,
  ) {
  }
}
