import { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { currentNetwork } from "@/lib/web3-config";

export interface NetworkCheckResult {
  isCorrectNetwork: boolean;
  currentChainId: number | undefined;
  expectedChainId: number;
  expectedNetworkName: string;
  shouldShowModal: boolean;
}

export function useNetworkCheck() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const [shouldShowModal, setShouldShowModal] = useState(false);

  const isCorrectNetwork = chainId === currentNetwork.id;
  const expectedChainId = currentNetwork.id;
  const expectedNetworkName = currentNetwork.name;

  useEffect(() => {
    // 지갑이 연결되어 있고 네트워크가 올바르지 않으면 모달을 표시
    if (isConnected && !isCorrectNetwork) {
      setShouldShowModal(true);
    } else {
      setShouldShowModal(false);
    }
  }, [isConnected, isCorrectNetwork]);

  const hideModal = () => {
    setShouldShowModal(false);
  };

  return {
    isCorrectNetwork,
    currentChainId: chainId,
    expectedChainId,
    expectedNetworkName,
    shouldShowModal,
    hideModal,
  };
}
