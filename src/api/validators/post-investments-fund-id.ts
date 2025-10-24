import { number, object, string } from "yup";
import { DATE_REGEX, UUID_REGEX } from ".";
import { ApiValidationError, errorService } from "../../services/error-service";
import Decimal from "decimal.js";

type PostInvestmentsFundIdValidatedInput = {
  body: {
    amount_usd: Decimal;
    investment_date: string;
    investor_id: string;
  };
  params: {
    fundId: string;
  };
};

const postInvestmentsFundIdBodySchema = object({
  amount_usd: number().strict().required(), // Unsafe deserialization: check, but don't use the value https://en.wikipedia.org/wiki/IEEE_754
  investment_date: string()
    .matches(DATE_REGEX, "body.investment_date must be in YYYY-MM-DD format")
    .required(),
  investor_id: string().uuid().required(),
});

const postInvestmentsFundIdSchema = object({
  body: postInvestmentsFundIdBodySchema.required(),
});

export const postInvestmentsFundIdValidator = {
  validate(input: {
    body?: string | undefined;
    rawPath: string;
  }): PostInvestmentsFundIdValidatedInput {
    try {
      if (!input.body) {
        throw new ApiValidationError("body is required.");
      }
      const validated = postInvestmentsFundIdSchema.validateSync({
        body: JSON.parse(input.body),
      });
      const rawTargetSizeUsd = input.body.match(
        /"amount_usd"\s*:\s*(.*?)(,|\})/
      )?.[1] as string;
      const decimalAmountUsd = new Decimal(rawTargetSizeUsd);
      const maximumAmountUsd = new Decimal("999999999999999999.99");
      const minimumAmountUsd = new Decimal("0.00");
      if (decimalAmountUsd.greaterThan(maximumAmountUsd)) {
        throw new ApiValidationError(
          "body.amount_usd must be less than $999,999,999,999,999,999.99"
        );
      }
      if (decimalAmountUsd.lessThan(minimumAmountUsd)) {
        throw new ApiValidationError("body.amount_usd must be more than $0.00");
      }
      const match = input.rawPath.match(
        /^\/funds\/([0-9a-f-]{36})\/investments$/
      );
      if (!match || !UUID_REGEX.test(match[1])) {
        throw new ApiValidationError(
          "Invalid path for /funds/{fund_id}/investments."
        );
      }
      const fundId = match[1];

      return {
        body: {
          investor_id: validated.body.investor_id,
          amount_usd: decimalAmountUsd,
          investment_date: validated.body.investment_date,
        },
        params: {
          fundId,
        },
      };
    } catch (e) {
      throw new ApiValidationError(errorService.message(e));
    }
  },
};
