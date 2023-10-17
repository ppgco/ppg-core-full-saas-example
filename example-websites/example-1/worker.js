import { Worker } from "https://cdn.jsdelivr.net/npm/@pushpushgo/core-sdk-js@latest/dist/browser/worker/index.js";

new Worker(self, {
  endpoint: "https://api-core.pushpushgo.com/v1",
  onSubscriptionChange: {
    endpoint:
      "https://saas-example-full.loca.lt/api/49303c41-9766-4e33-87ce-08e0627ad600/recipient/events",
    headers: {
      from_worker: "true",
    },
  },
  onExternalData: (_data) => {
  },
});
