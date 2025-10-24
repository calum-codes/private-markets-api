import { beforeEach, describe, expect, it } from "vitest";
import { clearDb } from "../../factories";
import { createFund } from "../../factories/fund";
import { json200, json400 } from "../../../src/api/lib/responses";
import { fundPresenter } from "../../../src/api/presenters/funds";
import { fundService } from "../../../src/services/fund-service";
import { putFunds } from "../../../src/api/handlers/put-funds";

describe("putFunds handler", () => {
  beforeEach(async () => {
    await clearDb();
  });

  it("should return a putFunds response", async () => {
    const fund = await createFund();
    const response = await putFunds({
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

  it("should return an error response if there is an error", async () => {
    const fund = await createFund();
    const response = await putFunds({
      body: `{"i":"${fund.id}","name":"${fund.name}","status":"${fund.status}","target_size_usd":${fund.targetSizeUsd},"vintage_year":${fund.vintageYear}}`,
      method: "PUT",
      rawPath: "/funds",
    });
    expect(response).toMatchObject(
      json400({
        message: "body.id is a required field",
      })
    );
  });
});
