"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatEther } from "viem";
import {
  VESTING_CONTRACT_NAMES,
  VESTING_CONTRACT_COLORS,
} from "@/hooks/useVestingData";
import { Copy, Check, Calendar } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getNextVestingInfo, formatKoreanDate } from "@/lib/vesting-schedule";
import { ExternalLink } from "lucide-react";
import { currentNetwork } from "@/lib/web3-config";

interface VestingCardProps {
  contractAddress: string;
  beneficiary: string;
  totalAllocation: bigint;
  vestedAmount: bigint;
  releasableAmount: bigint;
  releasedAmount: bigint;
}

export function VestingCard({
  contractAddress,
  beneficiary,
  totalAllocation,
  vestedAmount,
  releasableAmount,
  releasedAmount,
}: VestingCardProps) {
  const name = VESTING_CONTRACT_NAMES[contractAddress] || "Unknown";
  const colorClass = VESTING_CONTRACT_COLORS[contractAddress] || "bg-gray-500";
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Explorer URL 생성
  const explorerUrl =
    currentNetwork.blockExplorers?.default?.url || "https://polygonscan.com";

  // 진행률 계산
  const totalAllocNumber = Number(formatEther(totalAllocation));
  const vestedNumber = Number(formatEther(vestedAmount));
  const releasedNumber = Number(formatEther(releasedAmount));
  const releasableNumber = Number(formatEther(releasableAmount));

  const vestedPercentage =
    totalAllocNumber > 0 ? (vestedNumber / totalAllocNumber) * 100 : 0;

  // 다음 베스팅 날짜 계산
  const nextVestingDate = getNextVestingInfo(contractAddress);
  const nextVestingDateFormatted = nextVestingDate
    ? formatKoreanDate(nextVestingDate.date)
    : null;

  // 클립보드 복사 함수
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      toast.success("주소가 클립보드에 복사되었습니다!");
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch {
      toast.error("클립보드 복사에 실패했습니다.");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{name}</CardTitle>
          <div className={`w-3 h-3 rounded-full ${colorClass}`} />
        </div>
        <div className="space-y-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">컨트랙트 주소</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => copyToClipboard(contractAddress)}
                  className="p-1 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer rounded hover:bg-gray-100"
                >
                  {copiedAddress === contractAddress ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
                <a
                  href={`${explorerUrl}/address/${contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer rounded hover:bg-gray-100"
                  title="PolygonScan"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-mono break-all mt-1">
              {contractAddress}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">수혜자 주소</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => copyToClipboard(beneficiary)}
                  className="p-1 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer rounded hover:bg-gray-100"
                >
                  {copiedAddress === beneficiary ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
                <a
                  href={`${explorerUrl}/address/${beneficiary}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer rounded hover:bg-gray-100"
                  title="PolygonScan"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-mono break-all mt-1">
              {beneficiary}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 총 할당량 */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">총 할당량</span>
          <span className="text-sm font-bold">
            {parseFloat(formatEther(totalAllocation)).toLocaleString()} 토큰
          </span>
        </div>

        {/* 베스팅 진행률 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">베스팅 진행률</span>
            <span className="text-sm">{vestedPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={vestedPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>베스팅됨: {vestedNumber.toLocaleString()}</span>
            <span>
              남은 락업: {(totalAllocNumber - vestedNumber).toLocaleString()}
            </span>
          </div>
        </div>

        {/* 릴리즈 상태 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-gray-500">릴리즈 가능</p>
            <p className="text-sm font-semibold text-green-600">
              {releasableNumber.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500">릴리즈됨</p>
            <p className="text-sm font-semibold text-blue-600">
              {releasedNumber.toLocaleString()}
            </p>
          </div>
        </div>

        {/* 다음 베스팅 날짜 */}
        {nextVestingDateFormatted && (
          <div className="space-y-1">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              다음 베스팅 예정
            </p>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-purple-600">
                {nextVestingDateFormatted}
              </p>
              <p className="text-xs text-gray-600">
                {nextVestingDate?.amount.toLocaleString()} 토큰
              </p>
            </div>
          </div>
        )}

        {/* 상태 뱃지 */}
        <div className="flex justify-end">
          {releasableNumber > 0 && (
            <Badge variant="secondary" className="text-xs">
              릴리즈 가능
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
