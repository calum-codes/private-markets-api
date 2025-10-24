import { number, object, string } from "yup";
import { ApiValidationError, errorService } from "../../services/error-service";
import Decimal from "decimal.js";
import { type FundStatus } from "../../services/fund-service";

type PostFundsValidatedInput = {
  body: {
    name: string;
    status: FundStatus;
    target_size_usd: Decimal;
    vintage_year: number;
  };
};

const postFundsBodySchema = object({
  name: string().max(1000).required(),
  status: string().oneOf(["Closed", "Fundraising", "Investing"]).required(),
  target_size_usd: number().strict().required(), // Unsafe deserialization: check, but don't use the value https://en.wikipedia.org/wiki/IEEE_754
  vintage_year: number().integer().min(1).max(9999).required(),
});

const postFundsSchema = object({
  body: postFundsBodySchema.required(),
});

export const postFundsValidator = {
  validate(input: { body?: string | undefined }): PostFundsValidatedInput {
    try {
      if (!input.body) {
        throw new ApiValidationError("body is required.");
      }
      const validated = postFundsSchema.validateSync({
        body: JSON.parse(input.body),
      });
      const rawTargetSizeUsd = input.body.match(
        /"target_size_usd"\s*:\s*(.*?)(,|\})/
      )?.[1] as string;
      const decimalTargetSizeUsd = new Decimal(rawTargetSizeUsd);
      const maximumTargetSizeUsd = new Decimal("999999999999999999.99");
      const minimumTargetSizeUsd = new Decimal("0.00");
      if (decimalTargetSizeUsd.greaterThan(maximumTargetSizeUsd)) {
        throw new ApiValidationError(
          "body.target_size_usd must be less than $999,999,999,999,999,999.99"
        );
      }
      if (decimalTargetSizeUsd.lessThan(minimumTargetSizeUsd)) {
        throw new ApiValidationError(
          "body.target_size_usd must be more than $0.00"
        );
      }

      return {
        body: {
          name: validated.body.name,
          status: validated.body.status,
          target_size_usd: decimalTargetSizeUsd,
          vintage_year: validated.body.vintage_year,
        },
      };
    } catch (e) {
      throw new ApiValidationError(errorService.message(e));
    }
  },
};
