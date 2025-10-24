import {
  type ApiResponse,
  json400,
  json404,
  json500,
} from "../api/lib/responses";
import { logService } from "./log-service";

export class ApiValidationError extends Error {}

export class DatabaseQueryError extends Error {}

export class NotFoundError extends Error {}

export const errorService = {
  present(e: unknown): ApiResponse {
    if (e instanceof ApiValidationError) {
      return json400({ message: e.message });
    }
    if (e instanceof NotFoundError) {
      return json404({ message: e.message });
    }
    if (e instanceof DatabaseQueryError) {
      logService.error(e.message);
      return json500();
    }
    logService.error(`Unknown Error: ${e}`);
    return json500();
  },

  message(e: unknown) {
    const message = e instanceof Error ? e.message : JSON.stringify(e);
    return message;
  },
};
