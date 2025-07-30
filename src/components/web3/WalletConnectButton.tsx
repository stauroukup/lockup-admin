"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { injected } from "wagmi/connectors";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Wallet,
  Network,
  LogOut,
  AlertCircle,
  ChevronDown,
  Copy,
  ExternalLink,
} from "lucide-react";
import { currentNetwork, isCorrectNetwork } from "@/lib/web3-config";

// 지갑 주소 포맷팅 함수
const formatAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// 네트워크 이름 매핑 - 환경에 따라 올바른 네트워크와 다른 네트워크 구분
const getNetworkName = (chainId: number) => {
  if (chainId === 137) return "Polygon";
  if (chainId === 80002) return "Polygon Amoy";
  return "다른 네트워크";
};

export function WalletConnectButton() {
  const { address, isConnected } = useAccount();
  const {
    connect,
    error: connectError,
    isPending: isConnecting,
  } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const [isNetworkSwitching, setIsNetworkSwitching] = useState(false);
  const [showNetworkDialog, setShowNetworkDialog] = useState(false);
  const [realChainId, setRealChainId] = useState<number | null>(null);

  // 실제 메타마스크 네트워크 감지
  useEffect(() => {
    const getRealChainId = async () => {
      if (typeof window !== "undefined" && window.ethereum && isConnected) {
        try {
          const currentChainId = (await window.ethereum.request({
            method: "eth_chainId",
          })) as string;
          const decimalChainId = parseInt(currentChainId, 16);
          setRealChainId(decimalChainId);
        } catch (error) {
          console.error(error);
        }
      }
    };

    const handleChainChanged = (newChainId: string) => {
      const decimalChainId = parseInt(newChainId, 16);
      setRealChainId(decimalChainId);
    };

    // 초기 체인 ID 가져오기
    getRealChainId();

    // 네트워크 변경 이벤트 리스너 등록
    if (window.ethereum) {
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [isConnected]);

  // 연결 에러 처리
  useEffect(() => {
    if (connectError) {
      toast.error("지갑 연결에 실패했습니다: " + connectError.message);
    }
  }, [connectError]);

  // 네트워크 자동 전환 유도
  useEffect(() => {
    if (isConnected && realChainId && !isCorrectNetwork(realChainId)) {
      // 잠시 딜레이 후 다이얼로그 표시 (연결 완료 후)
      const timer = setTimeout(() => {
        setShowNetworkDialog(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isConnected, realChainId]);

  // 지갑 연결 함수
  const handleConnect = async () => {
    try {
      connect({ connector: injected() });
    } catch {
      toast.error("지갑 연결에 실패했습니다");
    }
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

  // 주소 복사 함수
  const handleCopyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      toast.success("주소가 복사되었습니다");
    } catch {
      toast.error("주소 복사에 실패했습니다");
    }
  };

  // 익스플로러에서 보기
  const handleViewInExplorer = () => {
    if (!address) return;
    const explorerUrl = `https://polygonscan.com/address/${address}`;
    window.open(explorerUrl, "_blank");
  };

  // 지갑 연결 해제 함수
  const handleDisconnect = () => {
    disconnect();
    setShowNetworkDialog(false);

    // wagmi 관련 localStorage 데이터 완전 제거
    try {
      if (typeof window !== "undefined") {
        // wagmi에서 사용하는 키들을 제거
        Object.keys(localStorage).forEach((key) => {
          if (
            key.startsWith("wagmi.") ||
            key.includes("wallet") ||
            key.includes("connector") ||
            key.includes("recentConnector")
          ) {
            localStorage.removeItem(key);
          }
        });
      }
    } catch (error) {
      console.warn("localStorage 정리 중 오류:", error);
    }

    toast.success("지갑 연결이 해제되었습니다");
  };

  // 네트워크 확인
  const isCurrentNetwork = realChainId ? isCorrectNetwork(realChainId) : false;

  if (!isConnected) {
    return (
      <Button
        onClick={handleConnect}
        disabled={isConnecting}
        className="flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
      >
        <Wallet className="h-4 w-4" />
        {isConnecting ? "연결 중..." : "Wallet Connect"}
      </Button>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3">
        {/* 네트워크 상태 표시 */}
        {!isCurrentNetwork && (
          <div className="flex items-center gap-2 px-3 py-2 bg-orange-100 border border-orange-200 rounded-lg text-orange-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              {getNetworkName(realChainId || 0)} 연결됨
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSwitchToCorrectNetwork}
              disabled={isNetworkSwitching}
              className="ml-2 h-7 cursor-pointer disabled:cursor-not-allowed"
            >
              <Network className="h-3 w-3 mr-1" />
              {isNetworkSwitching
                ? "전환 중..."
                : `${currentNetwork.name}으로 전환`}
            </Button>
          </div>
        )}

        {/* 연결된 지갑 드롭다운 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 h-10 px-4 cursor-pointer"
            >
              <Wallet className="h-4 w-4" />
              <span className="font-medium">
                {formatAddress(address || "")}
              </span>
              {isCurrentNetwork && (
                <Badge variant="secondary" className="text-xs ml-1">
                  {currentNetwork.name}
                </Badge>
              )}
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">연결된 지갑</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {address}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  네트워크: {getNetworkName(realChainId || 0)}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleCopyAddress}
              className="cursor-pointer"
            >
              <Copy className="mr-2 h-4 w-4" />
              <span>주소 복사</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleViewInExplorer}
              className="cursor-pointer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              <span>익스플로러에서 보기</span>
            </DropdownMenuItem>
            {!isCurrentNetwork && (
              <DropdownMenuItem
                onClick={handleSwitchToCorrectNetwork}
                disabled={isNetworkSwitching}
                className="cursor-pointer"
              >
                <Network className="mr-2 h-4 w-4" />
                <span>
                  {isNetworkSwitching
                    ? "전환 중..."
                    : `${currentNetwork.name}으로 전환`}
                </span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDisconnect}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>연결 해제</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 네트워크 전환 안내 다이얼로그 */}
      <Dialog open={showNetworkDialog} onOpenChange={setShowNetworkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              네트워크 전환이 필요합니다
            </DialogTitle>
            <DialogDescription>
              현재 <strong>{getNetworkName(realChainId || 0)}</strong>에
              연결되어 있습니다.
              <br />이 애플리케이션을 사용하려면{" "}
              <strong>{currentNetwork.name}</strong>
              으로 전환해주세요.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowNetworkDialog(false)}
              className="cursor-pointer"
            >
              나중에
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
