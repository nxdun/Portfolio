import { CoreApiClient, type ApiResult } from "@/utils/CoreApiClient";
import type { ContributionGraphResponse } from "./types";

const CONTRIBUTIONS_PATH = "/api/v1/contributions";

export class ContributionsApiClient extends CoreApiClient {
  async getContributionGraph(
    signal?: AbortSignal
  ): Promise<ApiResult<ContributionGraphResponse>> {
    const response = await this.getJson<ContributionGraphResponse>(
      CONTRIBUTIONS_PATH,
      signal
    );

    if (!response.ok) {
      return response;
    }

    return {
      ok: true,
      data: response.data,
    };
  }
}
