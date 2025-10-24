import { beforeEach, describe, expect, it } from "vitest";
import { createFund, generateFund } from "../../factories/fund";
import { handler } from "../../../src/api/handlers";
import { fundPresenter } from "../../../src/api/presenters/funds";
import {
  json200,
  json201,
  json404,
  json405,
} from "../../../src/api/lib/responses";
import { clearDb } from "../../factories";
import { fundService } from "../../../src/services/fund-service";
import {
  createRandomInvestmentWithFundAndInvestor,
  generateInvestment,
} from "../../factories/investment";
import { investmentPresenter } from "../../../src/api/presenters/investments";
import { createInvestor, generateInvestor } from "../../factories/investor";
import { investmentService } from "../../../src/services/investment-service";
import { investorPresenter } from "../../../src/api/presenters/investors";
import { investorService } from "../../../src/services/investor-service";

describe("handler root", () => {
  beforeEach(async () => {
    await clearDb();
  });

  describe("basic routing tests", () => {
    it("should return a getFunds response if the method is GET /funds", async () => {
      const fund = await createFund();
      expect(
        await handler({
          method: "GET",
          rawPath: "/funds",
        })
      ).toEqual(json200(fundPresenter.presentArray([fund])));
    });

    it("should return a postFunds response if the method is POST /funds", async () => {
      const fund = generateFund();
      const response = await handler({
        body: `{"name":"${fund.name}","status":"${fund.status}","target_size_usd":${fund.targetSizeUsd},"vintage_year":${fund.vintageYear}}`,
        method: "POST",
        rawPath: "/funds",
      });
      const fundOnDb = (await fundService.find())[0];
      expect(response).toMatchObject(
        json201(
          fundPresenter.present({
            ...fund,
            id: fundOnDb.id,
            createdAt: fundOnDb.createdAt,
            updatedAt: fundOnDb.updatedAt,
          })
        )
      );
    });

    it("should return a putFunds response if the method is PUT /funds", async () => {
      const fund = await createFund();
      const response = await handler({
        body: `{"id":"${fund.id}","name":"${fund.name}","status":"${fund.status}","target_size_usd":${fund.targetSizeUsd},"vintage_year":${fund.vintageYear}}`,
        method: "PUT",
        rawPath: "/funds",
      });
      const fundOnDb = (await fundService.find())[0];
      expect(response).toMatchObject(
        json200(
          fundPresenter.present({
            ...fund,
            updatedAt: fundOnDb.updatedAt,
          })
        )
      );
    });

    it("should return a getFundsId response if the method is GET /funds/{fund_id}", async () => {
      const fund = await createFund();
      const response = await handler({
        method: "GET",
        rawPath: `/funds/${fund.id}`,
      });
      expect(response).toMatchObject(json200(fundPresenter.present(fund)));
    });

    it("should return a getInvestmentsFundId response if the method is GET /funds/{fund_id}/investments", async () => {
      const investment = await createRandomInvestmentWithFundAndInvestor();
      const response = await handler({
        method: "GET",
        rawPath: `/funds/${investment.fundId}/investments`,
      });
      expect(response).toMatchObject(
        json200(investmentPresenter.presentArray([investment]))
      );
    });

    it("should return a postInvestmentsFundId response if the method is POST /funds/{fund_id}/investments", async () => {
      const [investor, fund] = await Promise.all([
        createInvestor(),
        createFund(),
      ]);
      const investment = generateInvestment();
      const response = await handler({
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

    it("should return a getInvestors response if the method is GET /investors", async () => {
      const investor = await createInvestor();
      const response = await handler({
        method: "GET",
        rawPath: `/investors`,
      });
      expect(response).toMatchObject(
        json200(investorPresenter.presentArray([investor]))
      );
    });

    it("should return a postInvestors response if the method is POST /investors", async () => {
      const investor = generateInvestor();
      const response = await handler({
        body: JSON.stringify({
          email: investor.email,
          investor_type: investor.investorType,
          name: investor.name,
        }),
        method: "POST",
        rawPath: `/investors`,
      });
      const investorOnDb = (await investorService.find())[0];
      expect(response).toMatchObject(
        json201(
          investorPresenter.present({
            ...investor,
            createdAt: investorOnDb.createdAt,
            updatedAt: investorOnDb.updatedAt,
            id: investorOnDb.id,
          })
        )
      );
    });
  });

  it("should still return a response if the path is not normalized", async () => {
    const investor = generateInvestor();
    const response = await handler({
      body: JSON.stringify({
        email: investor.email,
        investor_type: investor.investorType,
        name: investor.name,
      }),
      method: "POST",
      rawPath: `/investors//////`,
    });
    const investorOnDb = (await investorService.find())[0];
    expect(response).toMatchObject(
      json201(
        investorPresenter.present({
          ...investor,
          createdAt: investorOnDb.createdAt,
          updatedAt: investorOnDb.updatedAt,
          id: investorOnDb.id,
        })
      )
    );
  });

  it("should return a 405 error if a method is not supported on a valid path", async () => {
    const response = await handler({
      method: "DELETE",
      rawPath: `/investors`,
    });
    expect(response).toEqual(
      json405({
        message: "DELETE Not Allowed",
      })
    );
  });

  it("should return a 404 error if a path is not valid", async () => {
    const response = await handler({
      method: "DELETE",
      rawPath: `/inventors`,
    });
    expect(response).toEqual(
      json404({
        message: "DELETE /inventors Not Found",
      })
    );
  });
});
