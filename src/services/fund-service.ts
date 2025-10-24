import { Decimal } from "decimal.js";
import { pgService } from "./pg-service";
import {
  DatabaseQueryError,
  errorService,
  NotFoundError,
} from "./error-service";

export type FundStatus = "Closed" | "Fundraising" | "Investing";

export type FundDto = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  status: FundStatus;
  targetSizeUsd: Decimal;
  vintageYear: number;
};

export const fundService = {
  async createOne(fund: {
    name: string;
    status: FundStatus;
    targetSizeUsd: Decimal;
    vintageYear: number;
  }): Promise<FundDto> {
    const query = /* sql */ `
      INSERT INTO fund (
        created_at,
        updated_at,
        fund_name,
        fund_status,
        target_size_usd,
        vintage_year
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
        fund_name as "name",
        fund_status as "status",
        target_size_usd as "targetSizeUsd",
        vintage_year as "vintageYear";
    `;
    try {
      const pool = await pgService.getPool();
      const { rows } = await pool.query(query, [
        new Date().toISOString(),
        fund.name,
        fund.status,
        fund.targetSizeUsd.toString(),
        fund.vintageYear,
      ]);
      return this.mapToDto(rows[0]) as unknown as FundDto;
    } catch (e) {
      throw new DatabaseQueryError(
        `Unable to query in fundService.createOne: ${errorService.message(e)}`
      );
    }
  },

  async exists(id: string): Promise<boolean> {
    try {
      await this.findOne(id);
    } catch (e) {
      if (e instanceof NotFoundError) {
        return false;
      }
      throw e;
    }
    return true;
  },

  async find(): Promise<Array<FundDto>> {
    const query = /* sql */ `
      SELECT
        id,
        created_at as "createdAt",
        updated_at as "updatedAt",
        fund_name as "name",
        fund_status as "status",
        target_size_usd as "targetSizeUsd",
        vintage_year as "vintageYear"
      FROM fund
      ORDER BY fund_name ASC, created_at ASC;
    `;
    try {
      const pool = await pgService.getPool();
      const { rows } = await pool.query(query);
      return rows.map((row) => this.mapToDto(row)) as unknown as Array<FundDto>;
    } catch (e) {
      throw new DatabaseQueryError(
        `Unable to query in fundService.find: ${errorService.message(e)}`
      );
    }
  },

  async findOne(id: string): Promise<FundDto> {
    const query = /* sql */ `
      SELECT
        id,
        created_at as "createdAt",
        updated_at as "updatedAt",
        fund_name as "name",
        fund_status as "status",
        target_size_usd as "targetSizeUsd",
        vintage_year as "vintageYear"
      FROM fund
      WHERE id = $1;
    `;
    try {
      const pool = await pgService.getPool();
      const { rows } = await pool.query(query, [id]);
      if (!rows.length)
        throw new NotFoundError(`Fund with ID ${id} not found.`);
      return this.mapToDto(rows[0]) as unknown as FundDto;
    } catch (e) {
      if (e instanceof NotFoundError) throw e;
      throw new DatabaseQueryError(
        `Unable to query in fundService.findOne: ${errorService.message(e)}`
      );
    }
  },

  mapToDto(pgFund: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    status: string;
    targetSizeUsd: string;
    vintageYear: number;
  }) {
    return {
      id: pgFund.id,
      createdAt: pgFund.createdAt,
      updatedAt: pgFund.updatedAt,
      name: pgFund.name,
      status: pgFund.status,
      targetSizeUsd: new Decimal(pgFund.targetSizeUsd),
      vintageYear: pgFund.vintageYear,
    };
  },

  async updateOne(fund: {
    id: string;
    name: string;
    status: FundStatus;
    targetSizeUsd: Decimal;
    vintageYear: number;
  }): Promise<FundDto> {
    const query = /* sql */ `
      UPDATE fund
      SET
        updated_at = $2,
        fund_name = $3,
        fund_status = $4,
        target_size_usd = $5,
        vintage_year = $6
      WHERE
        id = $1
      RETURNING
        id,
        created_at as "createdAt",
        updated_at as "updatedAt",
        fund_name as "name",
        fund_status as "status",
        target_size_usd as "targetSizeUsd",
        vintage_year as "vintageYear";
    `;
    try {
      if (!(await this.exists(fund.id))) {
        throw new NotFoundError(`Fund with ID ${fund.id} not found.`);
      }
      const pool = await pgService.getPool();
      const { rows } = await pool.query(query, [
        fund.id,
        new Date().toISOString(),
        fund.name,
        fund.status,
        fund.targetSizeUsd.toString(),
        fund.vintageYear,
      ]);
      return this.mapToDto(rows[0]) as unknown as FundDto;
    } catch (e) {
      if (e instanceof NotFoundError) throw e;
      throw new DatabaseQueryError(
        `Unable to query in fundService.updateOne: ${errorService.message(e)}`
      );
    }
  },
};
