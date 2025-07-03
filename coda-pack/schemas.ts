import * as coda from "@codahq/packs-sdk";

export const TaskSchema = coda.makeObjectSchema({
  properties: {
    taskId: { type: coda.ValueType.String, required: true },
    title: { type: coda.ValueType.String },
    description: { type: coda.ValueType.String },
    status: { type: coda.ValueType.String },
    createdAt: { type: coda.ValueType.String, codaType: coda.ValueHintType.DateTime },
  },
  displayProperty: "title",
  idProperty: "taskId",
});

export const ResponseSchema = coda.makeObjectSchema({
  properties: {
    responseId: { type: coda.ValueType.String, required: true },
    content: { type: coda.ValueType.String },
    submittedAt: { type: coda.ValueType.String, codaType: coda.ValueHintType.DateTime },
    taskId: { type: coda.ValueType.String },
  },
  displayProperty: "content",
  idProperty: "responseId",
});