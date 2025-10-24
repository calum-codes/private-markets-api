import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearDb } from "../../factories";
import { json201, json400 } from "../../../src/api/lib/responses";
import { generateInvestor } from "../../factories/investor";
import { investorPresenter } from "../../../src/api/presenters/investors";
import { postInvestors } from "../../../src/api/handlers/post-investors";
import { investorService } from "../../../src/services/investor-service";

describe("postInvestors handler", () => {
  beforeEach(async () => {
    await clearDb();
  });

  it("should return a postInvestors response", async () => {
    const investor = generateInvestor();
    const response = await postInvestors({
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

  it("should return an error response if there is an error", async () => {
    const investor = generateInvestor();
    const response = await postInvestors({
      body: JSON.stringify({
        emal: investor.email,
        investor_type: investor.investorType,
        name: investor.name,
      }),
      method: "POST",
      rawPath: `/investors`,
    });
    expect(response).toMatchObject(
      json400({ message: "body.email is a required field" })
    );
  });
});
