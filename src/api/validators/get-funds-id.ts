import { UUID_REGEX } from ".";
import { ApiValidationError } from "../../services/error-service";

type GetFundsIdValidatedInput = {
  params: {
    id: string;
  };
};

export const getFundsIdValidator = {
  validate(input: { rawPath: string }): GetFundsIdValidatedInput {
    const match = input.rawPath.match(/^\/funds\/([0-9a-f-]{36})$/);
    if (!match || !UUID_REGEX.test(match[1])) {
      throw new ApiValidationError("Invalid path for /funds/{id}.");
    }
    const id = match[1];

    return {
      params: {
        id,
      },
    };
  },
};
