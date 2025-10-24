import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearDb } from "../../factories";
import { createFund } from "../../factories/fund";
import { getFunds } from "../../../src/api/handlers/get-funds";
import { json200, json500 } from "../../../src/api/lib/responses";
import { fundPresenter } from "../../../src/api/presenters/funds";
import { pgService } from "../../../src/services/pg-service";

describe("getFunds handler", () => {
  beforeEach(async () => {
    await clearDb();
  });

  it("should return a getFunds response", async () => {
    const fund = await createFund();
    expect(await getFunds()).toEqual(
      json200(fundPresenter.presentArray([fund]))
    );
  });

  it("should return an error response if there is an error", async () => {
    vi.spyOn(pgService, "getPool").mockImplementation(() => {
      throw new Error("Some error");
    });
    expect(await getFunds()).toEqual(
      json500({
        message: "Internal Server Error",
      })
    );
    vi.clearAllMocks();
  });
});
