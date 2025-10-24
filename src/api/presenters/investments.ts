import { type InvestmentDto } from "../../services/investment-service";

export const investmentPresenter = {
  presentArray(investments: InvestmentDto[]): string {
    let response = "[";
    investments.forEach((investment) => {
      response += this.present(investment);
    });
    response += "]";
    return response;
  },

  present(investment: InvestmentDto): string {
    return `{"id":"${investment.id}","investor_id":"${
      investment.investorId
    }","fund_id":"${
      investment.fundId
    }","amount_usd":${investment.amountUsd.toFixed(2)},"investment_date":"${
      investment.investmentDate
    }"}`;
  },
};
