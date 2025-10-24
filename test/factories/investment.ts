import { faker } from "@faker-js/faker";
import Decimal from "decimal.js";
import { pgService } from "../../src/services/pg-service";
import { InvestmentDto } from "../../src/services/investment-service";
import { createFund } from "./fund";
import { createInvestor } from "./investor";

export const generateInvestment = (
  investment?: Partial<InvestmentDto>
): InvestmentDto => {
  const fakeInvestmentDate = faker.date.anytime();
  return {
    id: faker.string.uuid(),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.past(),
    amountUsd: new Decimal(
      `${faker.number.int()}.${String(
        faker.number.int({ max: 99, min: 0 })
      ).padStart(2, "0")}`
    ),
    fundId: faker.string.uuid(),
    investmentDate: `${fakeInvestmentDate
      .getFullYear()
      .toString()
      .padStart(4, "0")}-${(fakeInvestmentDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${fakeInvestmentDate
      .getDate()
      .toString()
      .padStart(2, "0")}`,
    investorId: faker.string.uuid(),
    ...investment,
  };
};

export const createInvestment = async (
  investment?: Partial<InvestmentDto>
): Promise<InvestmentDto> => {
  const pool = await pgService.getPool();
  const generatedInvestment = generateInvestment(investment);
  const { rows } = await pool.query(
    /* sql */ `
      INSERT INTO investment (
        id,
        created_at,
        updated_at,
        amount_usd,
        fund_id,
        investment_date,
        investor_id
      ) VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7
      ) 
      RETURNING
        id,
        created_at as "createdAt",
        updated_at as "updatedAt",
        amount_usd as "amountUsd",
        fund_id as "fundId",
        investment_date as "investmentDate",
        investor_id as "investorId";
    `,
    [
      generatedInvestment.id,
      generatedInvestment.createdAt.toISOString(),
      generatedInvestment.updatedAt.toISOString(),
      generatedInvestment.amountUsd.toString(),
      generatedInvestment.fundId,
      generatedInvestment.investmentDate,
      generatedInvestment.investorId,
    ]
  );
  return {
    ...rows[0],
    amountUsd: new Decimal(rows[0].amountUsd),
    investmentDate: rows[0].investmentDate.toISOString().slice(0, 10),
  } as InvestmentDto;
};

export const createRandomInvestmentWithFundAndInvestor =
  async (): Promise<InvestmentDto> => {
    const [fund, investor] = await Promise.all([
      createFund(),
      createInvestor(),
    ]);
    return createInvestment({
      investorId: investor.id,
      fundId: fund.id,
    });
  };
