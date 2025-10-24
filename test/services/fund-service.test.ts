import { describe, expect, it, vi, beforeEach } from "vitest";
import { withMockDateEach } from "../utils";
import { createFund, generateFund } from "../factories/fund";
import { fundService } from "../../src/services/fund-service";
import { UUID_REGEX } from "../../src/api/validators";
import { pgService } from "../../src/services/pg-service";
import {
  DatabaseQueryError,
  NotFoundError,
} from "../../src/services/error-service";
import { clearDb } from "../factories";
import { faker } from "@faker-js/faker";

describe("fundService", () => {
  const date = new Date();
  withMockDateEach(date);
  beforeEach(async () => {
    await clearDb();
    vi.restoreAllMocks();
  });

  describe("createOne", () => {
    it("should create a fund, setting the timestamps and the ID correctly", async () => {
      const fund = generateFund();
      const createdFund = await fundService.createOne({
        name: fund.name,
        status: fund.status,
        targetSizeUsd: fund.targetSizeUsd,
        vintageYear: fund.vintageYear,
      });
      expect(createdFund).toEqual({
        id: expect.stringMatching(UUID_REGEX),
        createdAt: date,
        updatedAt: date,
        name: fund.name,
        status: fund.status,
        targetSizeUsd: fund.targetSizeUsd,
        vintageYear: fund.vintageYear,
      });
    });

    it("should throw an error if there is a problem with the DB", async () => {
      vi.spyOn(pgService, "getPool").mockImplementation(async () => {
        throw new Error("Database Error");
      });
      const fund = generateFund();
      await expect(
        fundService.createOne({
          name: fund.name,
          status: fund.status,
          targetSizeUsd: fund.targetSizeUsd,
          vintageYear: fund.vintageYear,
        })
      ).rejects.toThrow(
        new DatabaseQueryError(
          "Unable to query in fundService.createOne: Database Error"
        )
      );
      vi.restoreAllMocks();
    });
  });

  describe("exists", () => {
    it("should return true if a resource exists", async () => {
      const fund = await createFund();
      expect(await fundService.exists(fund.id)).toBeTruthy();
    });

    it("should return false if a resource does not exist", async () => {
      const fundId = faker.string.uuid();
      expect(await fundService.exists(fundId)).toBeFalsy();
    });

    it("should rethrow an error if the existence cannot be determined", async () => {
      vi.spyOn(pgService, "getPool").mockImplementation(async () => {
        throw new Error("Database Error");
      });
      const fundId = faker.string.uuid();
      await expect(fundService.exists(fundId)).rejects.toThrow(
        new DatabaseQueryError(
          "Unable to query in fundService.findOne: Database Error"
        )
      );
      vi.restoreAllMocks();
    });
  });

  describe("find", () => {
    it("should find all funds, ordered by their fund_name", async () => {
      const [fund1, fund2] = await Promise.all([
        await createFund(),
        await createFund(),
      ]);
      const returnedFunds = await fundService.find();
      expect(returnedFunds).toEqual(
        [fund1, fund2]
          .sort((a, b) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            if (a.createdAt < b.createdAt) return -1;
            if (a.createdAt > b.createdAt) return 1;
            return 0;
          })
          .map((fund) => {
            return {
              id: expect.stringMatching(UUID_REGEX),
              createdAt: fund.createdAt,
              updatedAt: fund.updatedAt,
              name: fund.name,
              status: fund.status,
              targetSizeUsd: fund.targetSizeUsd,
              vintageYear: fund.vintageYear,
            };
          })
      );
    });

    it("should throw an error if there is a problem with the DB", async () => {
      await Promise.all([await createFund(), await createFund()]);
      vi.spyOn(pgService, "getPool").mockImplementation(async () => {
        throw new Error("Database Error");
      });
      await expect(fundService.find()).rejects.toThrow(
        new DatabaseQueryError(
          "Unable to query in fundService.find: Database Error"
        )
      );
      vi.restoreAllMocks();
    });
  });

  describe("findOne", () => {
    it("should find a fund matching the ID", async () => {
      const fund = await createFund();
      const returnedFund = await fundService.findOne(fund.id);
      expect(returnedFund).toEqual({
        id: fund.id,
        createdAt: fund.createdAt,
        updatedAt: fund.updatedAt,
        name: fund.name,
        status: fund.status,
        targetSizeUsd: fund.targetSizeUsd,
        vintageYear: fund.vintageYear,
      });
    });

    it("should throw an error if there is a problem with the DB", async () => {
      const fund = await createFund();
      vi.spyOn(pgService, "getPool").mockImplementation(async () => {
        throw new Error("Database Error");
      });
      await expect(fundService.findOne(fund.id)).rejects.toThrow(
        new DatabaseQueryError(
          "Unable to query in fundService.findOne: Database Error"
        )
      );
      vi.restoreAllMocks();
    });
  });

  describe("updateOne", () => {
    it("should update a fund, setting the timestamps and the ID correctly", async () => {
      const fund = await createFund();
      const updatedFundCharacteristics = generateFund();
      const updatedFund = await fundService.updateOne({
        id: fund.id,
        name: updatedFundCharacteristics.name,
        status: updatedFundCharacteristics.status,
        targetSizeUsd: updatedFundCharacteristics.targetSizeUsd,
        vintageYear: updatedFundCharacteristics.vintageYear,
      });
      expect(updatedFund).toEqual({
        id: fund.id,
        createdAt: fund.createdAt,
        updatedAt: date,
        name: updatedFundCharacteristics.name,
        status: updatedFundCharacteristics.status,
        targetSizeUsd: updatedFundCharacteristics.targetSizeUsd,
        vintageYear: updatedFundCharacteristics.vintageYear,
      });
    });

    it("should throw a not found error if the target fund cannot be found", async () => {
      await createFund();
      const updatedFundCharacteristics = generateFund();
      await expect(
        fundService.updateOne({
          id: updatedFundCharacteristics.id,
          name: updatedFundCharacteristics.name,
          status: updatedFundCharacteristics.status,
          targetSizeUsd: updatedFundCharacteristics.targetSizeUsd,
          vintageYear: updatedFundCharacteristics.vintageYear,
        })
      ).rejects.toThrow(
        new NotFoundError(
          `Fund with ID ${updatedFundCharacteristics.id} not found.`
        )
      );
    });

    it("should throw an error if there is a problem with the DB", async () => {
      const fund = await createFund();
      vi.spyOn(pgService, "getPool").mockImplementation(async () => {
        throw new Error("Database Error");
      });
      const updatedFundCharacteristics = generateFund();
      await expect(
        fundService.updateOne({
          id: fund.id,
          name: updatedFundCharacteristics.name,
          status: updatedFundCharacteristics.status,
          targetSizeUsd: updatedFundCharacteristics.targetSizeUsd,
          vintageYear: updatedFundCharacteristics.vintageYear,
        })
      ).rejects.toThrow(
        new DatabaseQueryError(
          "Unable to query in fundService.updateOne: Unable to query in fundService.findOne: Database Error"
        )
      );
      vi.restoreAllMocks();
    });
  });
});
