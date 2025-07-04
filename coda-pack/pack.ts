import * as coda from "@codahq/packs-sdk";
import { TaskSchema, ResponseSchema } from "./schemas";

export const pack = coda.newPack();

// IMPORTANT: We will replace this with your real app URL later.
const AppDomain = "app-url-will-go-here.ondigitalocean.app";

pack.setUserAuthentication({ /* ... authentication code ... */ });
pack.addNetworkDomain(AppDomain);
pack.addSyncTable({ /* ... Tasks sync table code ... */ });
pack.addSyncTable({ /* ... Responses sync table code ... */ });
pack.addFormula({ /* ... SendAppContent action code ... */ });