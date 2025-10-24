import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearDb } from "../../factories";
import { createFund } from "../../factories/fund";
import { json200, json400, json404 } from "../../../src/api/lib/responses";
import { fundPresenter } from "../../../src/api/presenters/funds";
import { getFundsId } from "../../../src/api/handlers/get-funds-id";
import { faker } from "@faker-js/faker";

describe("getFundsId handler", () => {
  beforeEach(async () => {
    await clearDb();
  });

  it("should return a getFundsId response", async () => {
    const fund = await createFund();
    const response = await getFundsId({
      method: "GET",
      rawPath: `/funds/${fund.id}`,
    });
    expect(response).toMatchObject(json200(fundPresenter.present(fund)));
  });

  it("should return an error response if there is an error", async () => {
    await createFund();
    const fakeId = faker.string.uuid();
    const response = await getFundsId({
      method: "GET",
      rawPath: `/funds/${fakeId}`,
    });
    expect(response).toMatchObject(
      json404({
        message: `Fund with ID ${fakeId} not found.`,
      })
    );
  });
});
