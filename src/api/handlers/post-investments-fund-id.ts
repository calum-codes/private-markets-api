import { errorService } from "../../services/error-service";
import { type ApiResponse, json201 } from "../lib/responses";
import { postInvestmentsFundIdValidator } from "../validators/post-investments-fund-id";
import { investmentService } from "../../services/investment-service";
import { investmentPresenter } from "../presenters/investments";
import { type UnvalidatedRequest } from "../lib/requests";

export const postInvestmentsFundId = async (
  request: UnvalidatedRequest
): Promise<ApiResponse> => {
  try {
    const { body, params } = postInvestmentsFundIdValidator.validate(request);
    const investment = await investmentService.createOne({
      amountUsd: body.amount_usd,
      fundId: params.fundId,
      investmentDate: body.investment_date,
      investorId: body.investor_id,
    });
    return json201(investmentPresenter.present(investment));
  } catch (e) {
    return errorService.present(e);
  }
};
