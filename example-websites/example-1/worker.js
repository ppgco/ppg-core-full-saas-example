import { Worker } from "https://cdn.jsdelivr.net/npm/@pushpushgo/core-sdk-js@latest/dist/browser/worker/index.js"

new Worker(self, {
  endpoint: "https://api-core.pushpushgo.com/v1",
  onSubscriptionChange: {
      endpoint: "https://saas-example-full.loca.lt/api/56797927-936b-491e-b707-68bfdc20f70b/recipient/events",
      headers: {
          from_worker: "true"
      }
  },
  onExternalData: (data) => {}
})