import {
  type InvestorDto,
  type InvestorType,
} from "../../services/investor-service";

type PresentableInvestor = {
  id: string;
  name: string;
  investor_type: InvestorType;
  email: string;
  created_at: string;
};

export const investorPresenter = {
  presentArray(investors: InvestorDto[]): Array<PresentableInvestor> {
    return investors.map((investor) => {
      return this.present(investor);
    });
  },

  present(investor: InvestorDto): PresentableInvestor {
    return {
      id: investor.id,
      name: investor.name,
      investor_type: investor.investorType,
      email: investor.email,
      created_at: investor.createdAt.toISOString().split(".")[0] + "Z",
    };
  },
};
