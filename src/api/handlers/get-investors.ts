import { errorService } from "../../services/error-service";
import { type ApiResponse, json200 } from "../lib/responses";
import { investorService } from "../../services/investor-service";
import { investorPresenter } from "../presenters/investors";

export const getInvestors = async (): Promise<ApiResponse> => {
  try {
    const investors = await investorService.find();
    return json200(investorPresenter.presentArray(investors));
  } catch (e) {
    return errorService.present(e);
  }
};
