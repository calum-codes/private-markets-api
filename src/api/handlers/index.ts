import { type UnvalidatedRequest } from "../lib/requests";
import { type ApiResponse, json404, json405 } from "../lib/responses";
import { getFunds } from "./get-funds";
import { getFundsId } from "./get-funds-id";
import { getInvestmentsFundId } from "./get-investments-fund-id";
import { getInvestors } from "./get-investors";
import { postFunds } from "./post-funds";
import { postInvestmentsFundId } from "./post-investments-fund-id";
import { postInvestors } from "./post-investors";
import { putFunds } from "./put-funds";

type Route = {
  pattern: RegExp;
  handlers: Partial<
    Record<string, (request: UnvalidatedRequest) => Promise<ApiResponse>>
  >;
};

const normalizePath = (path: string) => path.replace(/\/+$/, "");

const routes: Route[] = [
  {
    pattern: /^\/funds$/,
    handlers: {
      GET: getFunds,
      POST: postFunds,
      PUT: putFunds,
    },
  },
  {
    pattern: /^\/funds\/[^/]+$/,
    handlers: {
      GET: getFundsId,
    },
  },
  {
    pattern: /^\/funds\/[^/]+\/investments$/,
    handlers: {
      GET: getInvestmentsFundId,
      POST: postInvestmentsFundId,
    },
  },
  {
    pattern: /^\/investors$/,
    handlers: {
      GET: getInvestors,
      POST: postInvestors,
    },
  },
];

export const handler = async (
  request: UnvalidatedRequest
): Promise<ApiResponse> => {
  const method = request.method;
  const path = normalizePath(request.rawPath);

  for (const route of routes) {
    if (route.pattern.test(path)) {
      const handlerForMethod = route.handlers[method];

      if (handlerForMethod) {
        return handlerForMethod(request);
      } else {
        return json405({
          message: `${method} Not Allowed`,
        });
      }
    }
  }

  return json404({
    message: `${method} ${path} Not Found`,
  });
};
