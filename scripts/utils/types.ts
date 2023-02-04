export type JsonValue = string | number | boolean | JsonObject | Array<JsonValue>;

export type JsonObject = { [x: string]: JsonValue };
