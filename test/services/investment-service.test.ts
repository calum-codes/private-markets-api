import { beforeEach, describe, expect, it, vi } from "vitest";
import { withMockDateEach } from "../utils";
import { clearDb } from "../factories";
import { createFund } from "../factories/fund";
import { createInvestor } from "../factories/investor";
import { createInvestment, generateInvestment } from "../factories/investment";
import { investmentService } from "../../src/services/investment-service";
import { UUID_REGEX } from "../../src/api/validators";
import { pgService } from "../../src/services/pg-service";
import {
  DatabaseQueryError,
  NotFoundError,
} from "../../src/services/error-service";
import { faker } from "@faker-js/faker";

describe("investmentService", () => {
  const date = new Date();
  withMockDateEach(date);
  beforeEach(async () => {
    await clearDb();
    vi.restoreAllMocks();
  });

  describe("createOne", () => {
    it("should create an investment, setting the timestamps and the ID correctly", async () => {
      const [fund, investor] = await Promise.all([
        createFund(),
        createInvestor(),
      ]);
      const investment = generateInvestment();
      const createdInvesment = await investmentService.createOne({
        amountUsd: investment.amountUsd,
        fundId: fund.id,
        investmentDate: investment.investmentDate,
        investorId: investor.id,
      });
      expect(createdInvesment).toEqual({
        id: expect.stringMatching(UUID_REGEX),
        createdAt: date,
        updatedAt: date,
        amountUsd: investment.amountUsd,
        fundId: fund.id,
        investmentDate: investment.investmentDate,
        investorId: investor.id,
      });
    });

    it("should throw an error if no fund is found", async () => {
      const [_, investor] = await Promise.all([createFund(), createInvestor()]);
      const fakeId = faker.string.uuid();
      const investment = generateInvestment();
      await expect(
        investmentService.createOne({
          amountUsd: investment.amountUsd,
          fundId: fakeId,
          investmentDate: investment.investmentDate,
          investorId: investor.id,
        })
      ).rejects.toThrow(
        new NotFoundError(
          `Unable to invest, fund with ID ${fakeId} does not exist.`
        )
      );
    });

    it("should throw an error if no investor is found", async () => {
      const [fund, _] = await Promise.all([createFund(), createInvestor()]);
      const fakeId = faker.string.uuid();
      const investment = generateInvestment();
      await expect(
        investmentService.createOne({
          amountUsd: investment.amountUsd,
          fundId: fund.id,
          investmentDate: investment.investmentDate,
          investorId: fakeId,
        })
      ).rejects.toThrow(
        new NotFoundError(
          `Unable to invest, investor with ID ${fakeId} does not exist.`
        )
      );
    });

    it("should create an investment, setting the timestamps and the ID correctly", async () => {
      const [fund, investor] = await Promise.all([
        createFund(),
        createInvestor(),
      ]);
      const investment = generateInvestment();
      const createdInvesment = await investmentService.createOne({
        amountUsd: investment.amountUsd,
        fundId: fund.id,
        investmentDate: investment.investmentDate,
        investorId: investor.id,
      });
      expect(createdInvesment).toEqual({
        id: expect.stringMatching(UUID_REGEX),
        createdAt: date,
        updatedAt: date,
        amountUsd: investment.amountUsd,
        fundId: fund.id,
        investmentDate: investment.investmentDate,
        investorId: investor.id,
      });
    });

    it("should throw an error if there is a problem with the DB", async () => {
      const [fund, investor] = await Promise.all([
        createFund(),
        createInvestor(),
      ]);
      vi.spyOn(pgService, "getPool").mockImplementation(async () => {
        throw new Error("Database Error");
      });
      const investment = generateInvestment();
      await expect(
        investmentService.createOne({
          amountUsd: investment.amountUsd,
          fundId: fund.id,
          investmentDate: investment.investmentDate,
          investorId: investor.id,
        })
      ).rejects.toThrow(
        new DatabaseQueryError(
          "Unable to query in investmentService.createOne: Unable to query in fundService.findOne: Database Error"
        )
      );
      vi.restoreAllMocks();
    });
  });

  describe("findByFundId", () => {
    it("should find all investments with the given fund ID, ordered by investment_date", async () => {
      const fund = await createFund();
      const investor = await createInvestor();
      const [investment1, investment2] = await Promise.all([
        createInvestment({ fundId: fund.id, investorId: investor.id }),
        createInvestment({ fundId: fund.id, investorId: investor.id }),
      ]);
      const returnedInvestments = await investmentService.findByFundId(fund.id);
      expect(returnedInvestments).toEqual(
        [investment1, investment2]
          .sort((a, b) => {
            const dateA = new Date(a.investmentDate);
            const dateB = new Date(b.investmentDate);
            if (dateA < dateB) return -1;
            if (dateA > dateB) return 1;
            const createdA = new Date(a.createdAt);
            const createdB = new Date(b.createdAt);
            if (createdA < createdB) return -1;
            if (createdA > createdB) return 1;
            return 0;
          })
          .map((investment) => {
            return {
              id: investment.id,
              createdAt: investment.createdAt,
              updatedAt: investment.updatedAt,
              amountUsd: investment.amountUsd,
              fundId: investment.fundId,
              investmentDate: investment.investmentDate,
              investorId: investment.investorId,
            };
          })
      );
    });

    it("should throw an error if the fund cannot be found", async () => {
      const fakeId = faker.string.uuid();
      const fund = await createFund();
      const investor = await createInvestor();
      await Promise.all([
        createInvestment({ fundId: fund.id, investorId: investor.id }),
        createInvestment({ fundId: fund.id, investorId: investor.id }),
      ]);
      await expect(investmentService.findByFundId(fakeId)).rejects.toThrow(
        new NotFoundError(`Fund with ID ${fakeId} not found.`)
      );
    });

    it("should throw an error if there is a problem with the DB", async () => {
      const fund = await createFund();
      const investor = await createInvestor();
      await Promise.all([
        createInvestment({ fundId: fund.id, investorId: investor.id }),
        createInvestment({ fundId: fund.id, investorId: investor.id }),
      ]);
      vi.spyOn(pgService, "getPool").mockImplementation(async () => {
        throw new Error("Database Error");
      });
      await expect(investmentService.findByFundId(fund.id)).rejects.toThrow(
        new DatabaseQueryError(
          "Unable to query in investmentService.findByFundId: Unable to query in fundService.findOne: Database Error"
        )
      );
      vi.restoreAllMocks();
    });
  });
});
