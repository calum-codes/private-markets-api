import { type FundDto } from "../../services/fund-service";

export const fundPresenter = {
  presentArray(funds: FundDto[]): string {
    let response = "[";
    funds.forEach((fund) => {
      response += this.present(fund);
    });
    response += "]";
    return response;
  },

  present(fund: FundDto): string {
    return `{"id":"${fund.id}","name":"${fund.name}","vintage_year":${
      fund.vintageYear
    },"target_size_usd":${fund.targetSizeUsd.toFixed(2)},"status":"${
      fund.status
    }","created_at":"${fund.createdAt.toISOString().split(".")[0] + "Z"}"}`;
  },
};
