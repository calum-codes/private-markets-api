import { describe, expect, it } from "vitest";
import { getFundsIdValidator } from "../../../src/api/validators/get-funds-id";
import { ApiValidationError } from "../../../src/services/error-service";

describe("getFundsIdValidator", () => {
  it("should throw an ApiValidationError if the path does not match /funds/{any_uuid}", () => {
    expect(() =>
      getFundsIdValidator.validate({
        rawPath: "/funds/12345",
      })
    ).toThrow(new ApiValidationError("Invalid path for /funds/{id}."));
  });
});
