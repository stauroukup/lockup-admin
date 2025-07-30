"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import {
  VESTING_CONTRACTS,
  type VestingOverview,
  type VestingDetails,
  type CompleteVestingInfo,
} from "@/lib/web3-config";
import VestingManagerABI from "@/lib/abi/VestingManager.json";

export function useVestingData() {
  const publicClient = usePublicClient();
  const [vestingData, setVestingData] = useState<CompleteVestingInfo | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVestingData() {
      if (!publicClient) return;

      try {
        setIsLoading(true);
        setError(null);

        // 전체 베스팅 정보 가져오기 (토큰 주소는 null로 전달하여 전체 데이터 가져오기)
        const result = await publicClient.readContract({
          address: VESTING_CONTRACTS.MANAGER as `0x${string}`,
          abi: VestingManagerABI.abi,
          functionName: "getCompleteVestingInfo",
          args: ["0x0000000000000000000000000000000000000000"], // null 주소로 전체 데이터 가져오기
        });

        const [overview, contracts] = result as [
          VestingOverview,
          VestingDetails[]
        ];

        setVestingData({
          overview,
          contracts,
        });
      } catch (err) {
        console.error("베스팅 데이터 가져오기 실패:", err);
        setError("베스팅 데이터를 가져오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchVestingData();
  }, [publicClient]);

  return { vestingData, isLoading, error };
}

// 베스팅 계약별 이름 매핑
export const VESTING_CONTRACT_NAMES: Record<string, string> = {
  [VESTING_CONTRACTS.CONTRACTS.ecosystem]: "Ecosystem",
  [VESTING_CONTRACTS.CONTRACTS.foundation]: "Foundation",
  [VESTING_CONTRACTS.CONTRACTS["private investor"]]: "Private Investor",
  [VESTING_CONTRACTS.CONTRACTS.team]: "Team",
  [VESTING_CONTRACTS.CONTRACTS.marketing]: "Marketing",
  [VESTING_CONTRACTS.CONTRACTS.advisor]: "Advisor",
};

// 베스팅 계약별 색상 매핑
export const VESTING_CONTRACT_COLORS: Record<string, string> = {
  [VESTING_CONTRACTS.CONTRACTS.ecosystem]: "bg-green-500",
  [VESTING_CONTRACTS.CONTRACTS.foundation]: "bg-blue-500",
  [VESTING_CONTRACTS.CONTRACTS["private investor"]]: "bg-purple-500",
  [VESTING_CONTRACTS.CONTRACTS.team]: "bg-orange-500",
  [VESTING_CONTRACTS.CONTRACTS.marketing]: "bg-pink-500",
  [VESTING_CONTRACTS.CONTRACTS.advisor]: "bg-yellow-500",
};
