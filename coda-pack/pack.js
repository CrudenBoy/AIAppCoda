// 1) Import & unwrap the Packs SDK exactly once
const _coda = require("@codahq/packs-sdk");
const coda = _coda.default ?? _coda;

// 2) Import your schemas exactly once
const { TaskSchema, ResponseSchema } = require("./schemas");

// 3) Define your Pack exactly once
exports.pack = coda.newPack();
const pack = exports.pack;

// 4) Declare your host once and reuse it everywhere
const API_DOMAIN = "monkfish-app-pcc2z.ondigitalocean.app";

// Whitelist that domain so context.fetcher.fetch() will work
pack.addNetworkDomain(API_DOMAIN);

// Alias for backwards-compatibility with existing URL code
const AppDomain = API_DOMAIN;


pack.setUserAuthentication({
  type: coda.AuthenticationType.HeaderBearerToken,
  // Point at your real settings page (or docs) on your app
  instructionsUrl: `https://${AppDomain}/settings/api`,
  // Tell Coda which host to send the bearer token to
  networkDomain: AppDomain,
  getConnectionName: async function (context) {
    const response = await context.fetcher.fetch({
      method: "GET",
      url: `https://${AppDomain}/api/me`,
    });
    return response.body.email;
  },
});


pack.addFormula({
  name: "CurrentDocumentId",
  description: "Returns the ID of the current Coda document.",
  parameters: [],
  resultType: coda.ValueType.String,
  execute: async function(_args, context) {
    return context.document?.id || context.documentId;
  },
});

pack.addSyncTable({
  name: "tasks",
  identityName: "Task",
  schema: TaskSchema,
  connectionRequirement: coda.ConnectionRequirement.Required,
  formula: {
    name: "SyncTasks",
    description: "Pulls tasks from the web app.",
    parameters: [
      coda.makeParameter({
        type: coda.ParameterType.String,
        name: "docId",
        description: "The Coda document ID to sync. This is typically set automatically.",
        suggestedValue: "=AIAppCodaSync.CurrentDocumentId()",
      }),
    ],
    // Full-sync
    execute: async function([docId], context) {
      const url = coda.withQueryParams(`https://${AppDomain}/api/tasks`, { docId });
      console.log("Requesting URL:", url);
      const response = await context.fetcher.fetch({ method: "GET", url, cacheTtlSecs: 0 });
      console.log("Raw initial response body:", JSON.stringify(response.body, null, 2));
      return {
        result: response.body.tasks,
      };
    },
    // Incremental-sync (just re-calls execute)

    // 2) Incremental-refresh:
  },
});


pack.addSyncTable({
  name: "responses",
  identityName: "Response",
  schema: ResponseSchema,
  connectionRequirement: coda.ConnectionRequirement.Required,
  formula: {
    name: "SyncResponses",
    description: "Pulls responses from the web app.",
    parameters: [
      coda.makeParameter({
        type: coda.ParameterType.String,
        name: "docId",
        description: "The Coda document ID to sync. This is typically set automatically.",
        suggestedValue: "=AIAppCodaSync.CurrentDocumentId()",
      }),
    ],
    execute: async function([docId], context) {
      const url = coda.withQueryParams(`https://${AppDomain}/api/responses`, { docId });
      const response = await context.fetcher.fetch({ method: "GET", url, cacheTtlSecs: 0 });
      console.log("Raw initial response body:", JSON.stringify(response.body, null, 2));
      return {
        result: response.body.responses,
      };
    },

  },
});


pack.addFormula({
  name: "SendAppContent",
  description: "Pushes all rows from the db_App_Content table to the web app.",
  parameters: [
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "contentPayload",
      description: "A JSON string of the content to send.",
    }),
  ],
  resultType: coda.ValueType.String,
  isAction: true,
  execute: async function ([contentPayload], context) {
    let payload;
    if (typeof contentPayload !== 'string') {
      throw new coda.UserVisibleError("Invalid payload. Expected a string.");
    }
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