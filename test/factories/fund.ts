import { FundDto } from "../../src/services/fund-service";
import { faker } from "@faker-js/faker";
import Decimal from "decimal.js";
import { sample } from "lodash";
import { pgService } from "../../src/services/pg-service";

export const generateFund = (fund?: Partial<FundDto>): FundDto => {
  return {
    id: faker.string.uuid(),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.past(),
    name: faker.company.name(),
    status: sample(["Closed", "Fundraising", "Investing"]),
    targetSizeUsd: new Decimal(
      `${faker.number.int()}.${String(
        faker.number.int({ max: 99, min: 0 })
      ).padStart(2, "0")}`
    ),
    vintageYear: faker.date.anytime().getFullYear(),
    ...fund,
  };
};

export const createFund = async (fund?: Partial<FundDto>): Promise<FundDto> => {
  const pool = await pgService.getPool();
  const generatedFund = generateFund(fund);
  const { rows } = await pool.query(
    /* sql */ `
      INSERT INTO fund (
        id,
        created_at,
        updated_at,
        fund_name,
        fund_status,
        target_size_usd,
        vintage_year
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
        fund_name as "name",
        fund_status as "status",
        target_size_usd as "targetSizeUsd",
        vintage_year as "vintageYear";
    `,
    [
      generatedFund.id,
      generatedFund.createdAt.toISOString(),
      generatedFund.updatedAt.toISOString(),
      generatedFund.name,
      generatedFund.status,
      generatedFund.targetSizeUsd.toString(),
      generatedFund.vintageYear,
    ]
  );
  return {
    ...rows[0],
    targetSizeUsd: new Decimal(rows[0].targetSizeUsd),
  } as FundDto;
};
