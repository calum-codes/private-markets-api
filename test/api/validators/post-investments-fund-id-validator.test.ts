import { describe, expect, it } from "vitest";
import { postInvestmentsFundIdValidator } from "../../../src/api/validators/post-investments-fund-id";
import { ApiValidationError } from "../../../src/services/error-service";
import { faker } from "@faker-js/faker";
import Decimal from "decimal.js";

describe("postInvestmentsFundIdValidator", () => {
  it("should throw an ApiValidationError if body is not provided", () => {
    expect(() =>
      postInvestmentsFundIdValidator.validate({
        body: "",
        rawPath: "/",
      })
    ).toThrow(new ApiValidationError("body is required."));
  });

  describe("amount_usd", () => {
    it("should throw an ApiValidationError if it is not provided", () => {
      expect(() =>
        postInvestmentsFundIdValidator.validate({
          body: JSON.stringify({
            amount_usd: undefined,
            investment_date: "2025-10-22",
            investor_id: faker.string.uuid(),
          }),
          rawPath: "/",
        })
      ).toThrow(new ApiValidationError("body.amount_usd is a required field"));
    });

    it("should throw an ApiValidationError if it is not strictly a number", () => {
      expect(() =>
        postInvestmentsFundIdValidator.validate({
          body: JSON.stringify({
            amount_usd: "1",
            investment_date: "2025-10-22",
            investor_id: faker.string.uuid(),
          }),
          rawPath: "/",
        })
      ).toThrow(
        new ApiValidationError(
          'body.amount_usd must be a `number` type, but the final value was: `"1"`.'
        )
      );
    });
  });

  describe("investment_date", () => {
    it("should throw an ApiValidationError if it is not provided", () => {
      expect(() =>
        postInvestmentsFundIdValidator.validate({
          body: JSON.stringify({
            amount_usd: 1,
            investment_date: undefined,
            investor_id: faker.string.uuid(),
          }),
          rawPath: "/",
        })
      ).toThrow(
        new ApiValidationError("body.investment_date is a required field")
      );
    });

    it("should throw an ApiValidationError if it does not match the date regular expression", () => {
      expect(() =>
        postInvestmentsFundIdValidator.validate({
          body: JSON.stringify({
            amount_usd: 1,
            investment_date: "25-10-22",
            investor_id: faker.string.uuid(),
          }),
          rawPath: "/",
        })
      ).toThrow(
        new ApiValidationError(
          "body.investment_date must be in YYYY-MM-DD format"
        )
      );
    });
  });

  describe("investor_id", () => {
    it("should throw an ApiValidationError if it is not provided", () => {
      expect(() =>
        postInvestmentsFundIdValidator.validate({
          body: JSON.stringify({
            amount_usd: 1,
            investment_date: "2025-10-22",
            investor_id: undefined,
          }),
          rawPath: "/",
        })
      ).toThrow(new ApiValidationError("body.investor_id is a required field"));
    });

    it("should throw an ApiValidationError if it is not a UUID", () => {
      expect(() =>
        postInvestmentsFundIdValidator.validate({
          body: JSON.stringify({
            amount_usd: 1,
            investment_date: "2025-10-22",
            investor_id: "abc",
          }),
          rawPath: "/",
        })
      ).toThrow(
        new ApiValidationError("body.investor_id must be a valid UUID")
      );
    });
  });

  it("should throw an ApiValidationError if amount_usd, when parsed, is greater than the maximum allowed decimal", () => {
    expect(() =>
      postInvestmentsFundIdValidator.validate({
        body: JSON.stringify({
          amount_usd: "1000000000000000000.00",
          investment_date: "2025-10-22",
          investor_id: faker.string.uuid(),
        }).replace('"1000000000000000000.00"', "1000000000000000000.00"),
        rawPath: "/",
      })
    ).toThrow(
      new ApiValidationError(
        "body.amount_usd must be less than $999,999,999,999,999,999.99"
      )
    );
  });

  it("should throw an ApiValidationError if amount_usd, when parsed, is less than the minimum allowed decimal", () => {
    expect(() =>
      postInvestmentsFundIdValidator.validate({
        body: JSON.stringify({
          amount_usd: "-0.01",
          investment_date: "2025-10-22",
          investor_id: faker.string.uuid(),
        }).replace('"-0.01"', "-0.01"),
        rawPath: "/",
      })
    ).toThrow(
      new ApiValidationError("body.amount_usd must be more than $0.00")
    );
  });

  it("should throw an error if the rawPath does not meet the regular expression", () => {
    expect(() =>
      postInvestmentsFundIdValidator.validate({
        body: JSON.stringify({
          amount_usd: 1,
          investment_date: "2025-10-22",
          investor_id: faker.string.uuid(),
        }),
        rawPath: "/funds/abc/investments",
      })
    ).toThrow(
      new ApiValidationError("Invalid path for /funds/{fund_id}/investments.")
    );
  });

  it("should return a valid input", () => {
    const fakeUuid = faker.string.uuid();
    const anotherFakeUuid = faker.string.uuid();
    expect(
      postInvestmentsFundIdValidator.validate({
        body: JSON.stringify({
          amount_usd: 1,
          investment_date: "2025-10-22",
          investor_id: fakeUuid,
        }),
        rawPath: `/funds/${anotherFakeUuid}/investments`,
      })
    ).toEqual({
      body: {
        amount_usd: new Decimal("1.00"),
        investment_date: "2025-10-22",
        investor_id: fakeUuid,
      },
      params: {
        fundId: anotherFakeUuid,
      },
    });
  });
});
