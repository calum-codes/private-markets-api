import { describe, expect, it } from "vitest";
import { postInvestorsValidator } from "../../../src/api/validators/post-investors";
import { ApiValidationError } from "../../../src/services/error-service";

describe("postInvestorsValidator", () => {
  it("should throw an ApiValidationError if body is not provided", () => {
    expect(() =>
      postInvestorsValidator.validate({
        body: "",
      })
    ).toThrow(new ApiValidationError("body is required."));
  });

  describe("email", () => {
    it("should throw an ApiValidationError if it is not provided", () => {
      expect(() =>
        postInvestorsValidator.validate({
          body: JSON.stringify({
            email: undefined,
            investor_type: "Individual",
            name: "John Smith",
          }),
        })
      ).toThrow(new ApiValidationError("body.email is a required field"));
    });

    it("should throw an ApiValidationError if it is not an email", () => {
      expect(() =>
        postInvestorsValidator.validate({
          body: JSON.stringify({
            email: "notanemail$example.com",
            investor_type: "Individual",
            name: "John Smith",
          }),
        })
      ).toThrow(new ApiValidationError("body.email must be a valid email"));
    });

    it("should throw an ApiValidationError if it is an email that is too long", () => {
      expect(() =>
        postInvestorsValidator.validate({
          body: JSON.stringify({
            email: `${"a".repeat(309)}@example.com`,
            investor_type: "Individual",
            name: "John Smith",
          }),
        })
      ).toThrow(
        new ApiValidationError("body.email must be at most 320 characters")
      );
    });
  });

  describe("investor_type", () => {
    it("should throw an ApiValidationError if it is not provided", () => {
      expect(() =>
        postInvestorsValidator.validate({
          body: JSON.stringify({
            email: "a@example.com",
            investor_type: undefined,
            name: "John Smith",
          }),
        })
      ).toThrow(
        new ApiValidationError("body.investor_type is a required field")
      );
    });

    it("should throw an ApiValidationError if it is not one of the options", () => {
      expect(() =>
        postInvestorsValidator.validate({
          body: JSON.stringify({
            email: "a@example.com",
            investor_type: "Collective",
            name: "John Smith",
          }),
        })
      ).toThrow(
        new ApiValidationError(
          "body.investor_type must be one of the following values: Family Office, Individual, Institution"
        )
      );
    });
  });

  describe("name", () => {
    it("should throw an ApiValidationError if it is not provided", () => {
      expect(() =>
        postInvestorsValidator.validate({
          body: JSON.stringify({
            email: "a@example.com",
            investor_type: "Individual",
            name: undefined,
          }),
        })
      ).toThrow(new ApiValidationError("body.name is a required field"));
    });

    it("should throw an ApiValidationError if it is longer than 1000 characters", () => {
      expect(() =>
        postInvestorsValidator.validate({
          body: JSON.stringify({
            email: "a@example.com",
            investor_type: "Individual",
            name: "a".repeat(1001),
          }),
        })
      ).toThrow(
        new ApiValidationError("body.name must be at most 1000 characters")
      );
    });
  });
});
