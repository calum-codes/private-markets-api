import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearDb } from "../../factories";
import { generateFund } from "../../factories/fund";
import { json201, json400 } from "../../../src/api/lib/responses";
import { fundPresenter } from "../../../src/api/presenters/funds";
import { postFunds } from "../../../src/api/handlers/post-funds";
import { fundService } from "../../../src/services/fund-service";

describe("postFunds handler", () => {
  beforeEach(async () => {
    await clearDb();
  });

  it("should return a postFunds response", async () => {
    const fund = generateFund();
    const response = await postFunds({
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

  it("should return an error response if there is an error", async () => {
    const fund = generateFund();
    const response = await postFunds({
      body: `{"nae":"${fund.name}","status":"${fund.status}","target_size_usd":${fund.targetSizeUsd},"vintage_year":${fund.vintageYear}}`,
      method: "POST",
      rawPath: "/funds",
    });
    expect(response).toEqual(
      json400({
        message: "body.name is a required field",
      })
    );
  });
});
