import { beforeEach, describe, expect, it } from "vitest";
import { clearDb } from "../../factories";
import { json200, json404 } from "../../../src/api/lib/responses";
import { faker } from "@faker-js/faker";
import { createRandomInvestmentWithFundAndInvestor } from "../../factories/investment";
import { getInvestmentsFundId } from "../../../src/api/handlers/get-investments-fund-id";
import { investmentPresenter } from "../../../src/api/presenters/investments";

describe("getInvestmentsFundId handler", () => {
  beforeEach(async () => {
    await clearDb();
  });

  it("should return a getInvestmentsFundId response", async () => {
    const investment = await createRandomInvestmentWithFundAndInvestor();
    const response = await getInvestmentsFundId({
      method: "GET",
      rawPath: `/funds/${investment.fundId}/investments`,
    });
    expect(response).toMatchObject(
      json200(investmentPresenter.presentArray([investment]))
    );
  });

  it("should return an error response if there is an error", async () => {
    await createRandomInvestmentWithFundAndInvestor();
    const fakeId = faker.string.uuid();
    const response = await getInvestmentsFundId({
      method: "GET",
      rawPath: `/funds/${fakeId}/investments`,
    });
    expect(response).toMatchObject(
      json404({
        message: `Fund with ID ${fakeId} not found.`,
      })
    );
  });
});
