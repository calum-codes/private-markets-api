import { fundService } from "../../services/fund-service";
import { fundPresenter } from "../presenters/funds";
import { postFundsValidator } from "../validators/post-funds";
import { errorService } from "../../services/error-service";
import { type ApiResponse, json201 } from "../lib/responses";
import { type UnvalidatedRequest } from "../lib/requests";

export const postFunds = async (
  request: UnvalidatedRequest
): Promise<ApiResponse> => {
  try {
    const { body } = postFundsValidator.validate(request);
    const fund = await fundService.createOne({
      name: body.name,
      status: body.status,
      targetSizeUsd: body.target_size_usd,
      vintageYear: body.vintage_year,
    });
    return json201(fundPresenter.present(fund));
  } catch (e) {
    return errorService.present(e);
  }
};
