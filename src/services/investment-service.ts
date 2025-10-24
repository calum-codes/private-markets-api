import { pgService } from "./pg-service";
import {
  DatabaseQueryError,
  errorService,
  NotFoundError,
} from "./error-service";
import Decimal from "decimal.js";
import { fundService } from "./fund-service";
import { investorService } from "./investor-service";

export type InvestmentDto = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  amountUsd: Decimal;
  fundId: string;
  investmentDate: string;
  investorId: string;
};

export const investmentService = {
  async createOne(investment: {
    amountUsd: Decimal;
    fundId: string;
    investmentDate: string;
    investorId: string;
  }): Promise<InvestmentDto> {
    const query = /* sql */ `
      INSERT INTO investment (
        created_at,
        updated_at,
        amount_usd,
        fund_id,
        investment_date,
        investor_id
      ) VALUES (
        $1,
        $1,
        $2,
        $3,
        $4,
        $5
      ) 
      RETURNING
        id,
        created_at as "createdAt",
        updated_at as "updatedAt",
        amount_usd as "amountUsd",
        fund_id as "fundId",
        investment_date as "investmentDate",
        investor_id as "investorId";
    `;
    try {
      if (!(await fundService.exists(investment.fundId))) {
        throw new NotFoundError(
          `Unable to invest, fund with ID ${investment.fundId} does not exist.`
        );
      }
      if (!(await investorService.exists(investment.investorId))) {
        throw new NotFoundError(
          `Unable to invest, investor with ID ${investment.investorId} does not exist.`
        );
      }
      const pool = await pgService.getPool();
      const { rows } = await pool.query(query, [
        new Date().toISOString(),
        investment.amountUsd.toString(),
        investment.fundId,
        investment.investmentDate,
        investment.investorId,
      ]);
      return this.mapToDto(rows[0]) as unknown as InvestmentDto;
    } catch (e) {
      if (e instanceof NotFoundError) throw e;
      throw new DatabaseQueryError(
        `Unable to query in investmentService.createOne: ${errorService.message(
          e
        )}`
      );
    }
  },

  async findByFundId(fundId: string): Promise<Array<InvestmentDto>> {
    const query = /* sql */ `
      SELECT
        id,
        created_at as "createdAt",
        updated_at as "updatedAt",
        amount_usd as "amountUsd",
        fund_id as "fundId",
        investment_date as "investmentDate",
        investor_id as "investorId"
      FROM investment
      WHERE fund_id = $1
      ORDER BY investment_date ASC, created_at ASC;
    `;
    try {
      if (!(await fundService.exists(fundId))) {
        throw new NotFoundError(`Fund with ID ${fundId} not found.`);
      }
      const pool = await pgService.getPool();
      const { rows } = await pool.query(query, [fundId]);
      return rows.map((row) =>
        this.mapToDto(row)
      ) as unknown as Array<InvestmentDto>;
    } catch (e) {
      if (e instanceof NotFoundError) throw e;
      throw new DatabaseQueryError(
        `Unable to query in investmentService.findByFundId: ${errorService.message(
          e
        )}`
      );
    }
  },

  mapToDto(pgInvestment: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    amountUsd: string;
    fundId: string;
    investmentDate: Date;
    investorId: string;
  }) {
    return {
      id: pgInvestment.id,
      createdAt: pgInvestment.createdAt,
      updatedAt: pgInvestment.updatedAt,
      amountUsd: new Decimal(pgInvestment.amountUsd),
      fundId: pgInvestment.fundId,
      investmentDate: pgInvestment.investmentDate.toISOString().slice(0, 10),
      investorId: pgInvestment.investorId,
    };
  },
};
