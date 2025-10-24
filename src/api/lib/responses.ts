export type ApiResponse = {
  body: string;
  headers: Record<string, string> & { "Content-Type": string };
  statusCode: number;
};

const json = (
  statusCode: number,
  defaultMessage: string,
  body?: Record<string, unknown> | Array<unknown> | string
) => {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body:
      typeof body === "string"
        ? body
        : JSON.stringify(body ?? { message: defaultMessage }),
  };
};

export const json200 = (
  body?: Record<string, unknown> | Array<unknown> | string
): ApiResponse => {
  return json(200, "OK", body);
};

export const json201 = (
  body?: Record<string, unknown> | Array<unknown> | string
): ApiResponse => {
  return json(201, "Created", body);
};

export const json400 = (
  body?: Record<string, unknown> | Array<unknown> | string
): ApiResponse => {
  return json(400, "Bad Request", body);
};

export const json404 = (
  body?: Record<string, unknown> | Array<unknown> | string
): ApiResponse => {
  return json(404, "Not Found", body);
};

export const json405 = (
  body?: Record<string, unknown> | Array<unknown> | string
): ApiResponse => {
  return json(405, "Method Not Allowed", body);
};

export const json500 = (
  body?: Record<string, unknown> | Array<unknown> | string
): ApiResponse => {
  return json(500, "Internal Server Error", body);
};
