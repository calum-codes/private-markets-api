import { describe, expect, it } from "vitest";
import { ApiValidationError } from "../../../src/services/error-service";
import { getInvestmentsFundIdValidator } from "../../../src/api/validators/get-investments-fund-id";

describe("getInvestmentsFundIdValidator", () => {
  it("should throw an ApiValidationError if the path does not match /funds/{any_uuid}", () => {
    expect(() =>
      getInvestmentsFundIdValidator.validate({
        rawPath: "/funds/12345/investments",
      })
    ).toThrow(
      new ApiValidationError("Invalid path for /funds/{fund_id}/investments.")
    );
  });
});
