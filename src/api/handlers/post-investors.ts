import { errorService } from "../../services/error-service";
import { type ApiResponse, json201 } from "../lib/responses";
import { postInvestorsValidator } from "../validators/post-investors";
import { investorService } from "../../services/investor-service";
import { investorPresenter } from "../presenters/investors";
import { type UnvalidatedRequest } from "../lib/requests";

export const postInvestors = async (
  request: UnvalidatedRequest
): Promise<ApiResponse> => {
  try {
    const { body } = postInvestorsValidator.validate(request);
    const investor = await investorService.createOne({
      email: body.email,
      investorType: body.investor_type,
      name: body.name,
    });
    return json201(investorPresenter.present(investor));
  } catch (e) {
    return errorService.present(e);
  }
};
