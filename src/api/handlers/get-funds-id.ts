import { fundService } from "../../services/fund-service";
import { fundPresenter } from "../presenters/funds";
import { errorService } from "../../services/error-service";
import { getFundsIdValidator } from "../validators/get-funds-id";
import { type ApiResponse, json200 } from "../lib/responses";
import { type UnvalidatedRequest } from "../lib/requests";

export const getFundsId = async (
  request: UnvalidatedRequest
): Promise<ApiResponse> => {
  try {
    const { params } = getFundsIdValidator.validate(request);
    const fund = await fundService.findOne(params.id);
    return json200(fundPresenter.present(fund));
  } catch (e) {
    return errorService.present(e);
  }
};
