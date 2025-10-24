import { beforeEach, describe, expect, it, vi } from "vitest";
import { DatabaseQueryError } from "../../src/services/error-service";
import { createInvestor, generateInvestor } from "../factories/investor";
import { investorService } from "../../src/services/investor-service";
import { UUID_REGEX } from "../../src/api/validators";
import { withMockDateEach } from "../utils";
import { clearDb } from "../factories";
import { pgService } from "../../src/services/pg-service";
import { faker } from "@faker-js/faker";

describe("investorService", () => {
  const date = new Date();
  withMockDateEach(date);
  beforeEach(async () => {
    await clearDb();
    vi.restoreAllMocks();
  });

  describe("createOne", () => {
    it("should create an investor, setting the timestamps and the ID correctly", async () => {
      const investor = generateInvestor();
      const createdInvestor = await investorService.createOne({
        email: investor.email,
        investorType: investor.investorType,
        name: investor.name,
      });
      expect(createdInvestor).toEqual({
        id: expect.stringMatching(UUID_REGEX),
        createdAt: date,
        updatedAt: date,
        email: investor.email,
        investorType: investor.investorType,
        name: investor.name,
      });
    });

    it("should throw an error if there is a problem with the DB", async () => {
      vi.spyOn(pgService, "getPool").mockImplementation(async () => {
        throw new Error("Database Error");
      });
      const investor = generateInvestor();
      await expect(
        investorService.createOne({
          email: investor.email,
          investorType: investor.investorType,
          name: investor.name,
        })
      ).rejects.toThrow(
        new DatabaseQueryError(
          "Unable to query in investorService.createOne: Database Error"
        )
      );
      vi.restoreAllMocks();
    });
  });

  describe("exists", () => {
    it("should return true if a resource exists", async () => {
      const investor = await createInvestor();
      expect(await investorService.exists(investor.id)).toBeTruthy();
    });

    it("should return false if a resource does not exist", async () => {
      const investorId = faker.string.uuid();
      expect(await investorService.exists(investorId)).toBeFalsy();
    });

    it("should rethrow an error if the existence cannot be determined", async () => {
      vi.spyOn(pgService, "getPool").mockImplementation(async () => {
        throw new Error("Database Error");
      });
      const investorId = faker.string.uuid();
      await expect(investorService.exists(investorId)).rejects.toThrow(
        new DatabaseQueryError(
          "Unable to query in investorService.findOne: Database Error"
        )
      );
      vi.restoreAllMocks();
    });
  });

  describe("find", () => {
    it("should find all investors, ordered by their investor_name", async () => {
      const [investor1, investor2] = await Promise.all([
        await createInvestor(),
        await createInvestor(),
      ]);
      const returnedInvestors = await investorService.find();
      expect(returnedInvestors).toEqual(
        [investor1, investor2]
          .sort((a, b) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            if (a.createdAt < b.createdAt) return -1;
            if (a.createdAt > b.createdAt) return 1;
            return 0;
          })
          .map((investor) => {
            return {
              id: investor.id,
              createdAt: investor.createdAt,
              updatedAt: investor.updatedAt,
              email: investor.email,
              investorType: investor.investorType,
              name: investor.name,
            };
          })
      );
    });

    it("should throw an error if there is a problem with the DB", async () => {
      await Promise.all([await createInvestor(), await createInvestor()]);
      vi.spyOn(pgService, "getPool").mockImplementation(async () => {
        throw new Error("Database Error");
      });
      await expect(investorService.find()).rejects.toThrow(
        new DatabaseQueryError(
          "Unable to query in investorService.find: Database Error"
        )
      );
      vi.restoreAllMocks();
    });
  });

  describe("findOne", () => {
    it("should find an investor matching the ID", async () => {
      const investor = await createInvestor();
      const returnedInvestor = await investorService.findOne(investor.id);
      expect(returnedInvestor).toEqual({
        id: investor.id,
        createdAt: investor.createdAt,
        updatedAt: investor.updatedAt,
        email: investor.email,
        investorType: investor.investorType,
        name: investor.name,
      });
    });

    it("should throw an error if there is a problem with the DB", async () => {
      const investor = await createInvestor();
      vi.spyOn(pgService, "getPool").mockImplementation(async () => {
        throw new Error("Database Error");
      });
      await expect(investorService.findOne(investor.id)).rejects.toThrow(
        new DatabaseQueryError(
          "Unable to query in investorService.findOne: Database Error"
        )
      );
      vi.restoreAllMocks();
    });
  });
});
