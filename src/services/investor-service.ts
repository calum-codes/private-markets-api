import { pgService } from "./pg-service";
import {
  DatabaseQueryError,
  errorService,
  NotFoundError,
} from "./error-service";

export type InvestorType = "Family Office" | "Individual" | "Institution";

export type InvestorDto = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  investorType: InvestorType;
  name: string;
};

export const investorService = {
  async createOne(investor: {
    email: string;
    investorType: InvestorType;
    name: string;
  }): Promise<InvestorDto> {
    const query = /* sql */ `
      INSERT INTO investor (
        created_at,
        updated_at,
        email,
        investor_name,
        investor_type
      ) VALUES (
        $1,
        $1,
        $2,
        $3,
        $4
      ) 
      RETURNING
        id,
        created_at as "createdAt",
        updated_at as "updatedAt",
        email as "email",
        investor_name as "name",
        investor_type as "investorType";
    `;
    try {
      const pool = await pgService.getPool();
      const { rows } = await pool.query(query, [
        new Date().toISOString(),
        investor.email,
        investor.name,
        investor.investorType,
      ]);
      return rows[0] as unknown as InvestorDto;
    } catch (e) {
      throw new DatabaseQueryError(
        `Unable to query in investorService.createOne: ${errorService.message(
          e
        )}`
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

  async find(): Promise<Array<InvestorDto>> {
    const query = /* sql */ `
      SELECT
        id,
        created_at as "createdAt",
        updated_at as "updatedAt",
        email as "email",
        investor_name as "name",
        investor_type as "investorType"
      FROM investor
      ORDER BY investor_name ASC, created_at ASC;
    `;
    try {
      const pool = await pgService.getPool();
      const { rows } = await pool.query(query);
      return rows as unknown as Array<InvestorDto>;
    } catch (e) {
      throw new DatabaseQueryError(
        `Unable to query in investorService.find: ${errorService.message(e)}`
      );
    }
  },

  async findOne(id: string): Promise<InvestorDto> {
    const query = /* sql */ `
      SELECT
        id,
        created_at as "createdAt",
        updated_at as "updatedAt",
        email as "email",
        investor_name as "name",
        investor_type as "investorType"
      FROM investor
      WHERE id = $1;
    `;
    try {
      const pool = await pgService.getPool();
      const { rows } = await pool.query(query, [id]);
      if (!rows.length)
        throw new NotFoundError(
          "Investor not found in investorService.findOne"
        );
      return rows[0] as unknown as InvestorDto;
    } catch (e) {
      if (e instanceof NotFoundError) throw e;
      throw new DatabaseQueryError(
        `Unable to query in investorService.findOne: ${errorService.message(e)}`
      );
    }
  },
};
