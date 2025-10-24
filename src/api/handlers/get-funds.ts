import { fundService } from "../../services/fund-service";
import { fundPresenter } from "../presenters/funds";
import { errorService } from "../../services/error-service";
import { type ApiResponse, json200 } from "../lib/responses";

export const getFunds = async (): Promise<ApiResponse> => {
  try {
    const funds = await fundService.find();
    return json200(fundPresenter.presentArray(funds));
  } catch (e) {
    return errorService.present(e);
  }
};
