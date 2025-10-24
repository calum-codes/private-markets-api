import { describe, expect, it, vi } from "vitest";
import { logService } from "../../src/services/log-service";
import {
  ApiValidationError,
  DatabaseQueryError,
  errorService,
  NotFoundError,
} from "../../src/services/error-service";

describe("errorService", () => {
  describe("present", () => {
    it("should return a 400 response and not log an error for an ApiValidationError", () => {
      const consoleErrorSpy = vi.spyOn(logService, "error");
      expect(
        errorService.present(new ApiValidationError("My Custom Message"))
      ).toEqual({
        body: '{"message":"My Custom Message"}',
        headers: { "Content-Type": "application/json" },
        statusCode: 400,
      });
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      vi.clearAllMocks();
    });

    it("should return a 404 response and not log an error for a NotFoundError", () => {
      const consoleErrorSpy = vi.spyOn(logService, "error");
      expect(
        errorService.present(new NotFoundError("My Custom Message"))
      ).toEqual({
        body: '{"message":"My Custom Message"}',
        headers: { "Content-Type": "application/json" },
        statusCode: 404,
      });
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      vi.clearAllMocks();
    });

    it("should return a 500 response and log an error for a DatabaseQueryError, hiding the error", () => {
      const consoleErrorSpy = vi.spyOn(logService, "error");
      expect(
        errorService.present(new DatabaseQueryError("My Custom Message"))
      ).toEqual({
        body: '{"message":"Internal Server Error"}',
        headers: { "Content-Type": "application/json" },
        statusCode: 500,
      });
      expect(consoleErrorSpy).toHaveBeenCalledExactlyOnceWith(
        "My Custom Message"
      );
      vi.clearAllMocks();
    });

    it("should return a 500 response and log an error for any other error, hiding the error", () => {
      const consoleErrorSpy = vi.spyOn(logService, "error");
      expect(errorService.present(new Error("My Custom Message"))).toEqual({
        body: '{"message":"Internal Server Error"}',
        headers: { "Content-Type": "application/json" },
        statusCode: 500,
      });
      expect(consoleErrorSpy).toHaveBeenCalledExactlyOnceWith(
        "Unknown Error: Error: My Custom Message"
      );
      vi.clearAllMocks();
    });
  });

  describe("message", () => {
    it("should return the message if e is an instanceof Error", () => {
      expect(errorService.message(new Error("My Custom Error"))).toEqual(
        "My Custom Error"
      );
    });

    it("should stringify whatever e is, if e isn't an instanceof Error (hopefully never happens)", () => {
      expect(errorService.message(new Array("My Custom Error"))).toEqual(
        '["My Custom Error"]'
      );
    });
  });
});
