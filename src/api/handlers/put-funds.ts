import { fundService } from "../../services/fund-service";
import { fundPresenter } from "../presenters/funds";
import { errorService } from "../../services/error-service";
import { putFundsValidator } from "../validators/put-funds";
import { type ApiResponse, json200 } from "../lib/responses";
import { type UnvalidatedRequest } from "../lib/requests";

export const putFunds = async (
  request: UnvalidatedRequest
): Promise<ApiResponse> => {
  try {
    const { body } = putFundsValidator.validate(request);
    const fund = await fundService.updateOne({
      id: body.id,
      name: body.name,
      status: body.status,
      targetSizeUsd: body.target_size_usd,
      vintageYear: body.vintage_year,
    });
    return json200(fundPresenter.present(fund));
  } catch (e) {
    return errorService.present(e);
  }
};
