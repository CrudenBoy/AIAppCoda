import * as coda from "@codahq/packs-sdk";
import { TaskSchema, ResponseSchema } from "./schemas";

export const pack = coda.newPack();

// IMPORTANT: We will replace this with your real app URL later.
const AppDomain = "monkfish-app-pcc2z.ondigitalocean.app";

pack.setUserAuthentication({
  type: coda.AuthenticationType.HeaderBearerToken,
  instructionsUrl: `https://<your-app-url>/settings/api`,
  getConnectionName: async function (context) {
    const response = await context.fetcher.fetch({
      method: "GET",
      url: `https://${AppDomain}/api/me`,
    });
    return response.body.email;
  },
});

pack.addNetworkDomain(AppDomain);

pack.addSyncTable({
  name: "Tasks",
  schema: TaskSchema,
  identityName: "Task",
  formula: {
    name: "SyncTasks",
    description: "Pulls tasks from the web app.",
    parameters: [],
    execute: async function ([], context) {
      const docId = context.document.id;
      const url = coda.withQueryParams(`https://${AppDomain}/api/tasks`, { docId });
      const response = await context.fetcher.fetch({ method: "GET", url: url, cacheTtlSecs: 0 });
      return { result: response.body.tasks };
    },
  },
});

pack.addSyncTable({
  name: "Responses",
  schema: ResponseSchema,
  identityName: "Response",
  formula: {
    name: "SyncResponses",
    description: "Pulls responses from the web app.",
    parameters: [],
    execute: async function ([], context) {
      const docId = context.document.id;
      const url = coda.withQueryParams(`https://${AppDomain}/api/responses`, { docId });
      const response = await context.fetcher.fetch({ method: "GET", url: url, cacheTtlSecs: 0 });
      return { result: response.body.responses };
    },
  },
});

pack.addFormula({
  name: "SendAppContent",
  description: "Pushes all rows from the db_App_Content table to the web app.",
  parameters: [
    coda.makeParameter({
      type: coda.ValueType.String,
      name: "contentPayload",
      description: "A JSON string of the content to send.",
    }),
  ],
  resultType: coda.ValueType.String,
  isAction: true,
  execute: async function ([contentPayload], context) {
    let payload;
    try {
      payload = JSON.parse(contentPayload);
    } catch (e) {
      throw new coda.UserVisibleError("Invalid JSON payload. Please check the button formula.");
    }
    const response = await context.fetcher.fetch({
      method: "POST",
      // THIS IS THE LINE WE HAVE FIXED
      url: `https://${AppDomain}/api/app_content`,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return `Successfully pushed content. Status: ${response.status}`;
  },
});