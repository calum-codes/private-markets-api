import { object, string } from "yup";
import { ApiValidationError, errorService } from "../../services/error-service";
import { type InvestorType } from "../../services/investor-service";

type PostInvestorsValidatedInput = {
  body: {
    email: string;
    investor_type: InvestorType;
    name: string;
  };
};

const postInvestorsBodySchema = object({
  email: string().email().max(320).required(),
  investor_type: string()
    .oneOf(["Family Office", "Individual", "Institution"])
    .required(),
  name: string().max(1000).required(),
});

const postInvestorsSchema = object({
  body: postInvestorsBodySchema.required(),
});

export const postInvestorsValidator = {
  validate(input: { body?: string | undefined }): PostInvestorsValidatedInput {
    try {
      if (!input.body) {
        throw new ApiValidationError("body is required.");
      }
      const validated = postInvestorsSchema.validateSync({
        body: JSON.parse(input.body),
      });

      return {
        body: {
          name: validated.body.name,
          investor_type: validated.body.investor_type,
          email: validated.body.email,
        },
      };
    } catch (e) {
      throw new ApiValidationError(errorService.message(e));
    }
  },
};
