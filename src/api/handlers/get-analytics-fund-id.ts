import { type UnvalidatedRequest } from "../lib/requests";
import { type ApiResponse, json200 } from "../lib/responses";
import { NotFoundError } from "../../services/error-service";
import { pgService } from "../../services/pg-service";

/**
 * TODO: FINISH THIS FUNCTION LATER
 */
function allocateManagementFees(
    totalFeeAmount: number,
    investments: Array<{ investor_id: string; investor_name: string; amount: number }>
): Array<{ investor_id: string; investor_name: string; fee: number; percentage: number }> {
    return [];
}

export const getAnalyticsFundId = async (
    request: UnvalidatedRequest
): Promise<ApiResponse> => {
    const pathParts = request.rawPath.split('/');
    const fundId = pathParts[2];

    // Fetch fund data
    const pool = await pgService.getPool();
    const fundQuery = /* sql */ `
      SELECT
        id,
        fund_name as "name",
        target_size_usd as "targetSizeUsd"
      FROM fund
      WHERE id = $1;
    `;
    const fundResult = await pool.query(fundQuery, [fundId]);
    if (fundResult.rows.length === 0) {
        throw new NotFoundError(`Fund with ID ${fundId} not found.`);
    }
    const fund = fundResult.rows[0];

    // Fetch investments for this fund
    const investmentsQuery = /* sql */ `
      SELECT
        id,
        investor_id as "investorId",
        amount_usd as "amountUsd"
      FROM investment
      WHERE fund_id = $1;
    `;
    const investmentsResult = await pool.query(investmentsQuery, [fundId]);
    const investments = investmentsResult.rows;

    // Fetch investor details for each investment
    const investorsData = [];
    for (const investment of investments) {
        const investorQuery = /* sql */ `
        SELECT
          id,
          investor_name as "name",
          investor_type as "investorType"
        FROM investor
        WHERE id = $1;
      `;
        const investorResult = await pool.query(investorQuery, [investment.investorId]);
        const investor = investorResult.rows[0];
        investorsData.push({
            investmentId: investment.id,
            investorId: investor.id,
            investorName: investor.name,
            investorType: investor.investorType,
            amount: parseFloat(investment.amountUsd)
        });
    }

    // Calculate total raised
    let totalRaised = 0;
    for (let i = 0; i < investorsData.length; i++) {
        totalRaised = totalRaised + investorsData[i].amount;
    }

    // Calculate utilization percentage
    const targetSize = parseFloat(fund.targetSizeUsd);
    const utilizationPct = (totalRaised / targetSize) * 100;

    // Calculate average investment
    const avgInvestment = totalRaised / investments.length;

    // Group by investor type
    const byType = {};
    investorsData.forEach(inv => {
        const type = inv.investorType;
        if (!byType[type]) {
            byType[type] = { count: 0, total: 0 };
        }
        byType[type].count++;
        byType[type].total += inv.amount;
    });

    // Format by investor type with percentages
    const byInvestorType = {};
    for (const type in byType) {
        const percentage = (byType[type].total / totalRaised) * 100;
        byInvestorType[type] = {
            count: byType[type].count,
            total: byType[type].total,
            percentage: Math.round(percentage * 100) / 100
        };
    }

    // Calculate top investors
    const investorTotals = investorsData.reduce((acc, inv) => {
        if (!acc[inv.investorId]) {
            acc[inv.investorId] = {
                investor_id: inv.investorId,
                investor_name: inv.investorName,
                total_invested: 0
            };
        }
        acc[inv.investorId].total_invested += inv.amount;
        return acc;
    }, {});

    const topInvestorsArray = Object.values(investorTotals);
    const sorted = topInvestorsArray.sort((a: any, b: any) => b.total_invested - a.total_invested);
    const top5 = sorted.slice(0, 5);

    let rank = 1;
    const topInvestors = [];
    for (let i = 0; i < top5.length; i++) {
        const inv: any = top5[i];
        const percentage = (inv.total_invested / totalRaised) * 100;
        topInvestors.push({
            investor_id: inv.investor_id,
            investor_name: inv.investor_name,
            total_invested: inv.total_invested,
            percentage: Math.round(percentage * 100) / 100,
            rank: rank
        });
        rank = rank + 1;
    }

    // Calculate management fee (2% of target size)
    const managementFeeRate = 0.02;
    const totalManagementFee = targetSize * managementFeeRate;

    const feeAllocations = allocateManagementFees(
        totalManagementFee,
        investorsData.map(inv => ({
            investor_id: inv.investorId,
            investor_name: inv.investorName,
            amount: inv.amount
        }))
    );

    // Format response
    const response = {
        fund_id: fundId,
        total_raised: totalRaised,
        target_size: targetSize,
        utilization_pct: Math.round(utilizationPct * 100) / 100,
        investor_count: investorsData.length,
        average_investment: Math.round(avgInvestment * 100) / 100,
        top_investors: topInvestors,
        by_investor_type: byInvestorType,
        fee_distribution: {
            total_management_fee: totalManagementFee,
            by_investor: feeAllocations
        }
    };

    return json200(response);
};

