import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearDb } from "../../factories";
import { json200, json500 } from "../../../src/api/lib/responses";
import { createInvestor } from "../../factories/investor";
import { getInvestors } from "../../../src/api/handlers/get-investors";
import { investorPresenter } from "../../../src/api/presenters/investors";
import { pgService } from "../../../src/services/pg-service";

describe("getInvestors handler", () => {
  beforeEach(async () => {
    await clearDb();
  });

  it("should return a getInvestors response", async () => {
    const investor = await createInvestor();
    const response = await getInvestors();
    expect(response).toMatchObject(
      json200(investorPresenter.presentArray([investor]))
    );
  });

  it("should return an error response if there is an error", async () => {
    await createInvestor();
    vi.spyOn(pgService, "getPool").mockImplementation(() => {
      throw new Error("Unforeseen error");
    });
    const response = await getInvestors();
    expect(response).toMatchObject(
      json500({
        message: "Internal Server Error",
      })
    );
    vi.clearAllMocks();
  });
});
