"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatEther } from "viem";
import {
  VESTING_CONTRACT_NAMES,
  VESTING_CONTRACT_COLORS,
} from "@/hooks/useVestingData";
import { useAccount, useWalletClient, useSwitchChain } from "wagmi";
import { useState } from "react";
import { toast } from "sonner";
import { currentNetwork, isCorrectNetwork } from "@/lib/web3-config";
import VestingContractABI from "@/lib/abi/VestingContract.json";
import { Copy, Check, AlertCircle, Network, Calendar } from "lucide-react";
import { getNextVestingInfo, formatKoreanDate } from "@/lib/vesting-schedule";
import { ExternalLink } from "lucide-react";

interface ReleaseCardProps {
  contractAddress: string;
  beneficiary: string;
  totalAllocation: bigint;
  vestedAmount: bigint;
  releasableAmount: bigint;
  releasedAmount: bigint;
}

export function ReleaseCard({
  contractAddress,
  beneficiary,
  totalAllocation,
  vestedAmount,
  releasableAmount,
  releasedAmount,
}: ReleaseCardProps) {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { switchChain } = useSwitchChain();
  const [isReleasing, setIsReleasing] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [showNetworkDialog, setShowNetworkDialog] = useState(false);
  const [isNetworkSwitching, setIsNetworkSwitching] = useState(false);
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);

  const name = VESTING_CONTRACT_NAMES[contractAddress] || "Unknown";
  const colorClass = VESTING_CONTRACT_COLORS[contractAddress] || "bg-gray-500";

  // Explorer URL 생성
  const explorerUrl =
    currentNetwork.blockExplorers?.default?.url || "https://polygonscan.com";

  // 진행률 계산
  const totalAllocNumber = Number(formatEther(totalAllocation));
  const vestedNumber = Number(formatEther(vestedAmount));
  const releasedNumber = Number(formatEther(releasedAmount));
  const releasableNumber = Number(formatEther(releasableAmount));

  const vestingTokenAddress = process.env.NEXT_PUBLIC_VESTING_TOKEN_ADDRESS;

  const vestedPercentage =
    totalAllocNumber > 0 ? (vestedNumber / totalAllocNumber) * 100 : 0;
  const hasReleasableTokens = releasableNumber > 0;

  // 다음 베스팅 날짜 계산
  const nextVestingDate = getNextVestingInfo(contractAddress);
  const nextVestingDateFormatted = nextVestingDate
    ? formatKoreanDate(nextVestingDate.date)
    : null;

  // 실제 메타마스크 체인 ID 확인 함수
  const getRealChainId = async (): Promise<number | null> => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const currentChainId = (await window.ethereum.request({
          method: "eth_chainId",
        })) as string;
        return parseInt(currentChainId, 16);
      } catch (error) {
        console.error("체인 ID 확인 중 오류:", error);
        return null;
      }
    }
    return null;
  };

  // 네트워크 이름 매핑
  const getNetworkName = (chainId: number) => {
    if (chainId === 137) return "Polygon";
    if (chainId === 80002) return "Polygon Amoy";
    return "다른 네트워크";
  };

  // 네트워크 전환 함수
  const handleSwitchToCorrectNetwork = async () => {
    if (!switchChain) {
      toast.error("네트워크 전환을 지원하지 않습니다");
      return;
    }

    setIsNetworkSwitching(true);
    try {
      await switchChain({ chainId: currentNetwork.id });
      toast.success(`${currentNetwork.name} 네트워크로 전환되었습니다`);
      setShowNetworkDialog(false);
    } catch (error) {
      console.error("네트워크 전환 실패:", error);
      toast.error("네트워크 전환에 실패했습니다");
    } finally {
      setIsNetworkSwitching(false);
    }
  };

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

  const handleRelease = async () => {
    // 1. 지갑 연결 확인
    if (!isConnected || !address) {
      toast.error("지갑을 먼저 연결해주세요.", {
        description: "토큰을 릴리즈하려면 지갑 연결이 필요합니다.",
      });
      return;
    }

    // 2. 네트워크 확인 (실제 메타마스크 체인 ID 확인)
    const realChainId = await getRealChainId();
    if (!realChainId) {
      toast.error("네트워크 정보를 확인할 수 없습니다.", {
        description: "메타마스크 연결 상태를 확인해주세요.",
      });
      return;
    }

    if (!isCorrectNetwork(realChainId)) {
      // 네트워크 전환 모달 띄우기
      setCurrentChainId(realChainId);
      setShowNetworkDialog(true);
      return;
    }

    // 3. 릴리즈 가능한 토큰이 있는지 확인
    if (!hasReleasableTokens) {
      toast.error("릴리즈 가능한 토큰이 없습니다.", {
        description: "현재 릴리즈할 수 있는 토큰이 없습니다.",
      });
      return;
    }

    // 4. 릴리즈 실행
    if (!walletClient) {
      toast.error("지갑 클라이언트를 찾을 수 없습니다.");
      return;
    }

    try {
      setIsReleasing(true);

      toast.info("트랜잭션을 진행 중입니다...", {
        description: "지갑에서 트랜잭션을 승인해주세요.",
      });

      const hash = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi: VestingContractABI.abi,
        functionName: "release",
        args: [vestingTokenAddress],
      });

      toast.success("릴리즈 트랜잭션이 제출되었습니다!", {
        description: `트랜잭션 해시: ${hash.slice(0, 10)}...${hash.slice(-8)}`,
      });

      // 트랜잭션이 완료될 때까지 기다릴 수도 있지만,
      // 여기서는 일단 제출만 확인하고 사용자가 새로고침하도록 안내
      setTimeout(() => {
        toast.info("페이지를 새로고침하여 업데이트된 정보를 확인하세요.");
      }, 3000);
    } catch (error: unknown) {
      console.error("릴리즈 실행 중 오류:", error);

      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (errorMessage.includes("User rejected")) {
        toast.error("트랜잭션이 취소되었습니다.");
      } else {
        toast.error("릴리즈 실행 중 오류가 발생했습니다.", {
          description: errorMessage || "알 수 없는 오류가 발생했습니다.",
        });
      }
    } finally {
      setIsReleasing(false);
    }
  };

  return (
    <>
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

          {/* 릴리즈 버튼 */}
          <div className="pt-2">
            <Button
              onClick={handleRelease}
              disabled={!hasReleasableTokens || isReleasing}
              className="w-full cursor-pointer disabled:cursor-not-allowed"
              variant={hasReleasableTokens ? "default" : "secondary"}
            >
              {isReleasing
                ? "릴리즈 중..."
                : hasReleasableTokens
                ? `${releasableNumber.toLocaleString()} 토큰 릴리즈`
                : "릴리즈 가능한 토큰 없음"}
            </Button>
          </div>

          {/* 상태 뱃지 */}
          <div className="flex justify-end">
            {hasReleasableTokens && (
              <Badge variant="secondary" className="text-xs">
                릴리즈 가능
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 네트워크 전환 안내 다이얼로그 */}
      <Dialog open={showNetworkDialog} onOpenChange={setShowNetworkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              네트워크 전환이 필요합니다
            </DialogTitle>
            <DialogDescription>
              현재 <strong>{getNetworkName(currentChainId || 0)}</strong>에
              연결되어 있습니다.
              <br />
              토큰을 릴리즈하려면 <strong>{currentNetwork.name}</strong>으로
              전환해주세요.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowNetworkDialog(false)}
              className="cursor-pointer"
            >
              취소
            </Button>
            <Button
              onClick={handleSwitchToCorrectNetwork}
              disabled={isNetworkSwitching}
              className="flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <Network className="h-4 w-4" />
              {isNetworkSwitching
                ? "전환 중..."
                : `${currentNetwork.name}으로 전환`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
