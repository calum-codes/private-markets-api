import { describe, expect, it } from "vitest";
import { ApiValidationError } from "../../../src/services/error-service";
import { postFundsValidator } from "../../../src/api/validators/post-funds";
import Decimal from "decimal.js";

describe("postFundsValidator", () => {
  it("should throw an ApiValidationError the body is falsy", () => {
    expect(() =>
      postFundsValidator.validate({
        body: "",
      })
    ).toThrow(new ApiValidationError("body is required."));
  });

  describe("name", () => {
    it("should throw an ApiValidationError if name is not provided", () => {
      expect(() =>
        postFundsValidator.validate({
          body: JSON.stringify({
            name: undefined,
            status: "Closed",
            target_size_usd: 1,
            vintage_year: 1,
          }),
        })
      ).toThrow(new ApiValidationError("body.name is a required field"));
    });

    it("should throw an ApiValidationError if name is longer than 1000 characters", () => {
      expect(() =>
        postFundsValidator.validate({
          body: JSON.stringify({
            name: "a".repeat(1001),
            status: "Closed",
            target_size_usd: 1,
            vintage_year: 1,
          }),
        })
      ).toThrow(
        new ApiValidationError("body.name must be at most 1000 characters")
      );
    });
  });

  describe("status", () => {
    it("should throw an ApiValidationError if status is not provided", () => {
      expect(() =>
        postFundsValidator.validate({
          body: JSON.stringify({
            name: "Fund Name",
            status: undefined,
            target_size_usd: 1,
            vintage_year: 1,
          }),
        })
      ).toThrow(new ApiValidationError("body.status is a required field"));
    });

    it("should throw an ApiValidationError if status is not one of Closed, Fundraising, Investing", () => {
      expect(() =>
        postFundsValidator.validate({
          body: JSON.stringify({
            name: "Fund Name",
            status: "Not one of those things",
            target_size_usd: 1,
            vintage_year: 1,
          }),
        })
      ).toThrow(
        new ApiValidationError(
          "body.status must be one of the following values: Closed, Fundraising, Investing"
        )
      );
    });
  });

  describe("target_size_usd", () => {
    it("should throw an ApiValidationError if target_size_usd is not provided", () => {
      expect(() =>
        postFundsValidator.validate({
          body: JSON.stringify({
            name: "Fund Name",
            status: "Closed",
            target_size_usd: undefined,
            vintage_year: 1,
          }),
        })
      ).toThrow(
        new ApiValidationError("body.target_size_usd is a required field")
      );
    });

    it("should throw an ApiValidationError if target_size_usd is not strictly a number", () => {
      expect(() =>
        postFundsValidator.validate({
          body: JSON.stringify({
            name: "Fund Name",
            status: "Not one of those things",
            target_size_usd: "123",
            vintage_year: 1,
          }),
        })
      ).toThrow(
        new ApiValidationError(
          'body.target_size_usd must be a `number` type, but the final value was: `"123"`.'
        )
      );
    });
  });

  describe("vintage_year", () => {
    it("should throw an ApiValidationError if vintage_year is not provided", () => {
      expect(() =>
        postFundsValidator.validate({
          body: JSON.stringify({
            name: "Fund Name",
            status: "Closed",
            target_size_usd: 1,
            vintage_year: undefined,
          }),
        })
      ).toThrow(
        new ApiValidationError("body.vintage_year is a required field")
      );
    });

    it("should throw an ApiValidationError if vintage_year cannot be cast to a number", () => {
      expect(() =>
        postFundsValidator.validate({
          body: JSON.stringify({
            name: "Fund Name",
            status: "Closed",
            target_size_usd: 1,
            vintage_year: "abc",
          }),
        })
      ).toThrow(
        new ApiValidationError(
          'body.vintage_year must be a `number` type, but the final value was: `NaN` (cast from the value `"abc"`).'
        )
      );
    });

    it("should throw an ApiValidationError if vintage_year is not an integer", () => {
      expect(() =>
        postFundsValidator.validate({
          body: JSON.stringify({
            name: "Fund Name",
            status: "Closed",
            target_size_usd: 1,
            vintage_year: 2015.2,
          }),
        })
      ).toThrow(new ApiValidationError("body.vintage_year must be an integer"));
    });

    it("should throw an ApiValidationError if vintage_year is more than 9999", () => {
      expect(() =>
        postFundsValidator.validate({
          body: JSON.stringify({
            name: "Fund Name",
            status: "Closed",
            target_size_usd: 1,
            vintage_year: 10000,
          }),
        })
      ).toThrow(
        new ApiValidationError(
          "body.vintage_year must be less than or equal to 9999"
        )
      );
    });

    it("should throw an ApiValidationError if vintage_year is less than 1", () => {
      expect(() =>
        postFundsValidator.validate({
          body: JSON.stringify({
            name: "Fund Name",
            status: "Closed",
            target_size_usd: 1,
            vintage_year: 0,
          }),
        })
      ).toThrow(
        new ApiValidationError(
          "body.vintage_year must be greater than or equal to 1"
        )
      );
    });
  });

  it("should throw an ApiValidationError if target_size_usd, when parsed, is greater than the maximum allowed decimal", () => {
    expect(() =>
      postFundsValidator.validate({
        body: JSON.stringify({
          name: "Fund Name",
          status: "Closed",
          target_size_usd: "1000000000000000000.00",
          vintage_year: 1,
        }).replace('"1000000000000000000.00"', "1000000000000000000.00"),
      })
    ).toThrow(
      new ApiValidationError(
        "body.target_size_usd must be less than $999,999,999,999,999,999.99"
      )
    );
  });

  it("should throw an ApiValidationError if target_size_usd, when parsed, is less than the minimum allowed decimal", () => {
    expect(() =>
      postFundsValidator.validate({
        body: JSON.stringify({
          name: "Fund Name",
          status: "Closed",
          target_size_usd: "-0.01",
          vintage_year: 1,
        }).replace('"-0.01"', "-0.01"),
      })
    ).toThrow(
      new ApiValidationError("body.target_size_usd must be more than $0.00")
    );
  });

  it("should return a valid input", () => {
    expect(
      postFundsValidator.validate({
        body: JSON.stringify({
          name: "Fund Name",
          status: "Closed",
          target_size_usd: 1.0,
          vintage_year: 1,
        }),
      })
    ).toEqual({
      body: {
        name: "Fund Name",
        status: "Closed",
        target_size_usd: new Decimal("1.00"),
        vintage_year: 1,
      },
    });
  });
});
