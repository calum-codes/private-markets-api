import { faker } from "@faker-js/faker";
import { pgService } from "../../src/services/pg-service";
import { InvestorDto } from "../../src/services/investor-service";
import { sample } from "lodash";

export const generateInvestor = (
  investor?: Partial<InvestorDto>
): InvestorDto => {
  return {
    id: faker.string.uuid(),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.past(),
    email: faker.internet.email(),
    investorType: sample(["Family Office", "Individual", "Institution"]),
    name: faker.person.fullName(),
    ...investor,
  };
};

export const createInvestor = async (
  investor?: Partial<InvestorDto>
): Promise<InvestorDto> => {
  const pool = await pgService.getPool();
  const generatedInvestor = generateInvestor(investor);
  const { rows } = await pool.query(
    /* sql */ `
      INSERT INTO investor (
        id,
        created_at,
        updated_at,
        email,
        investor_type,
        investor_name
      ) VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6
      ) 
      RETURNING
        id,
        created_at as "createdAt",
        updated_at as "updatedAt",
        email as "email",
        investor_name as "name",
        investor_type as "investorType";
    `,
    [
      generatedInvestor.id,
      generatedInvestor.createdAt.toISOString(),
      generatedInvestor.updatedAt.toISOString(),
      generatedInvestor.email,
      generatedInvestor.investorType,
      generatedInvestor.name,
    ]
  );
  return rows[0] as InvestorDto;
};
