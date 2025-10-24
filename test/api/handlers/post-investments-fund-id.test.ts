import { beforeEach, describe, expect, it } from "vitest";
import { clearDb } from "../../factories";
import { json201, json400 } from "../../../src/api/lib/responses";
import { generateInvestment } from "../../factories/investment";
import { investmentPresenter } from "../../../src/api/presenters/investments";
import { createInvestor } from "../../factories/investor";
import { createFund } from "../../factories/fund";
import { postInvestmentsFundId } from "../../../src/api/handlers/post-investments-fund-id";
import { investmentService } from "../../../src/services/investment-service";

describe("postInvestmentsFundId handler", () => {
  beforeEach(async () => {
    await clearDb();
  });

  it("should return a postInvestmentsFundId response", async () => {
    const [investor, fund] = await Promise.all([
      createInvestor(),
      createFund(),
    ]);
    const investment = generateInvestment();
    const response = await postInvestmentsFundId({
      body: `{"investor_id":"${
        investor.id
      }","amount_usd":${investment.amountUsd.toFixed(2)},"investment_date":"${
        investment.investmentDate
      }"}`,
      method: "POST",
      rawPath: `/funds/${fund.id}/investments`,
    });
    const investmentOnDb = (await investmentService.findByFundId(fund.id))[0];
    expect(response).toMatchObject(
      json201(
        investmentPresenter.present({
          ...investment,
          investorId: investor.id,
          fundId: fund.id,
          id: investmentOnDb.id,
          createdAt: investmentOnDb.createdAt,
          updatedAt: investmentOnDb.updatedAt,
        })
      )
    );
  });

  it("should return an error response if there is an error", async () => {
    const [investor, fund] = await Promise.all([
      createInvestor(),
      createFund(),
    ]);
    const investment = generateInvestment();
    const response = await postInvestmentsFundId({
      body: `{"investor_id":"${
        investor.id
      }","amout_usd":${investment.amountUsd.toFixed(2)},"investment_date":"${
        investment.investmentDate
      }"}`,
      method: "POST",
      rawPath: `/funds/${fund.id}/investments`,
    });
    expect(response).toMatchObject(
      json400({ message: "body.amount_usd is a required field" })
    );
  });
});
