import { errorService } from "../../services/error-service";
import { type ApiResponse, json200 } from "../lib/responses";
import { getInvestmentsFundIdValidator } from "../validators/get-investments-fund-id";
import { investmentService } from "../../services/investment-service";
import { investmentPresenter } from "../presenters/investments";
import { type UnvalidatedRequest } from "../lib/requests";

export const getInvestmentsFundId = async (
  request: UnvalidatedRequest
): Promise<ApiResponse> => {
  try {
    const { params } = getInvestmentsFundIdValidator.validate(request);
    const investments = await investmentService.findByFundId(params.fundId);
    return json200(investmentPresenter.presentArray(investments));
  } catch (e) {
    return errorService.present(e);
  }
};
