import { UUID_REGEX } from ".";
import { ApiValidationError } from "../../services/error-service";

type GetInvestmentsFundIdValidatedInput = {
  params: {
    fundId: string;
  };
};

export const getInvestmentsFundIdValidator = {
  validate(input: { rawPath: string }): GetInvestmentsFundIdValidatedInput {
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
      params: {
        fundId,
      },
    };
  },
};
