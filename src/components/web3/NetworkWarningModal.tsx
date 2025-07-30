import { AlertTriangle, Network } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface NetworkWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  expectedNetworkName: string;
  expectedChainId: number;
  currentChainId: number | undefined;
}

export function NetworkWarningModal({
  isOpen,
  onClose,
  expectedNetworkName,
  expectedChainId,
  currentChainId,
}: NetworkWarningModalProps) {
  const switchNetwork = async () => {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${expectedChainId.toString(16)}` }],
        });
      }
    } catch (error) {
      console.error("네트워크 전환 실패:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            네트워크 연결 오류
          </DialogTitle>
          <DialogDescription>
            올바른 네트워크에 연결되어 있지 않습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="border-red-200 bg-red-50">
            <Network className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              현재 환경에서는 <strong>{expectedNetworkName}</strong> 네트워크에
              연결되어 있어야 합니다.
            </AlertDescription>
          </Alert>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">예상 네트워크:</span>
              <span className="font-semibold text-green-600">
                {expectedNetworkName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">현재 네트워크:</span>
              <span className="font-semibold text-red-600">
                {currentChainId
                  ? `Chain ID: ${currentChainId}`
                  : "연결되지 않음"}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={switchNetwork} className="flex-1" size="sm">
              네트워크 전환
            </Button>
            <Button onClick={onClose} variant="outline" size="sm">
              닫기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
