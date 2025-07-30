"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Activity, AlertTriangle } from "lucide-react";
import { WalletConnectButton } from "@/components/web3/WalletConnectButton";
import { ReleaseCard } from "@/components/vesting/ReleaseCard";
import { useVestingData } from "@/hooks/useVestingData";
import { formatEther } from "viem";
import { currentNetwork } from "@/lib/web3-config";
import { useAccount } from "wagmi";
import { useNetworkCheck } from "@/hooks/useNetworkCheck";
import { NetworkWarningModal } from "@/components/web3/NetworkWarningModal";

export default function TokenPage() {
  const { vestingData, isLoading, error } = useVestingData();
  const { isConnected } = useAccount();
  const {
    isCorrectNetwork,
    currentChainId,
    expectedChainId,
    expectedNetworkName,
    shouldShowModal,
    hideModal,
  } = useNetworkCheck();

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>베스팅 데이터를 불러오는 중...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">토큰 릴리즈</h1>
              <p className="text-gray-600 mt-2">
                베스팅 일정에 도달한 토큰을 릴리즈합니다.
              </p>
            </div>
            <WalletConnectButton />
          </div>

          <Alert>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </AdminLayout>
    );
  }

  if (!vestingData) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">토큰 릴리즈</h1>
              <p className="text-gray-600 mt-2">
                베스팅 일정에 도달한 토큰을 릴리즈합니다.
              </p>
            </div>
            <WalletConnectButton />
          </div>

          <Alert>
            <AlertDescription>베스팅 데이터가 없습니다.</AlertDescription>
          </Alert>
        </div>
      </AdminLayout>
    );
  }

  const { overview, contracts } = vestingData;
  const totalReleasableNumber = Number(formatEther(overview.totalReleasable));
  const releasableContracts = contracts.filter(
    (contract) => Number(formatEther(contract.releasableAmount)) > 0
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">토큰 릴리즈</h1>
            <p className="text-gray-600 mt-2">
              베스팅 일정에 도달한 토큰을 릴리즈합니다.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{currentNetwork.name}</Badge>
              <Badge variant="secondary">{contracts.length}개 컨트랙트</Badge>
              {totalReleasableNumber > 0 && (
                <Badge variant="default" className="bg-green-600">
                  {totalReleasableNumber.toLocaleString()} 토큰 릴리즈 가능
                </Badge>
              )}
            </div>
          </div>
          <WalletConnectButton />
        </div>

        {/* 릴리즈 안내 */}
        {!isConnected && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              토큰을 릴리즈하려면 먼저 지갑을 연결해주세요.
            </AlertDescription>
          </Alert>
        )}

        {/* 네트워크 연결 오류 안내 */}
        {isConnected && !isCorrectNetwork && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              현재 환경에서는 <strong>{expectedNetworkName}</strong> 네트워크에
              연결되어 있어야 합니다. 올바른 네트워크로 전환해주세요.
            </AlertDescription>
          </Alert>
        )}

        {/* 중요 안내사항 */}
        <Card>
          <CardHeader>
            <CardTitle>⚠️ 중요 안내사항</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-semibold">1.</span>
                <span>
                  각 컨트랙트별로 개별 트랜잭션이 필요하며, 가스비가 발생합니다.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-semibold">2.</span>
                <span>
                  릴리즈된 토큰은 해당 베스팅 컨트랙트의 수혜자 주소로
                  전송됩니다.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-semibold">3.</span>
                <span>
                  트랜잭션 완료 후 페이지를 새로고침하여 최신 상태를 확인하세요.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-semibold">4.</span>
                <span>
                  네트워크는 {currentNetwork.name}에 연결되어 있어야 합니다.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 릴리즈 가능한 토큰 요약 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              릴리즈 현황 요약
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">
                  총 릴리즈 가능
                </h4>
                <p className="text-2xl font-bold text-green-600">
                  {totalReleasableNumber.toLocaleString()}
                </p>
                <p className="text-sm text-green-700">
                  즉시 릴리즈 가능한 토큰
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">
                  릴리즈 가능한 컨트랙트
                </h4>
                <p className="text-2xl font-bold text-blue-600">
                  {releasableContracts.length}
                </p>
                <p className="text-sm text-blue-700">
                  총 {contracts.length}개 중
                </p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-2">
                  총 릴리즈됨
                </h4>
                <p className="text-2xl font-bold text-orange-600">
                  {Number(formatEther(overview.totalReleased)).toLocaleString()}
                </p>
                <p className="text-sm text-orange-700">누적 릴리즈 토큰</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 베스팅 컨트랙트별 릴리즈 */}
        <Card>
          <CardHeader>
            <CardTitle>컨트랙트별 토큰 릴리즈</CardTitle>
            <p className="text-sm text-gray-600">
              각 베스팅 컨트랙트에서 릴리즈 가능한 토큰을 개별적으로 릴리즈할 수
              있습니다.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contracts.map((contract) => (
                <ReleaseCard
                  key={contract.contractAddress}
                  contractAddress={contract.contractAddress}
                  beneficiary={contract.beneficiary}
                  totalAllocation={contract.totalAllocation}
                  vestedAmount={contract.vestedAmount}
                  releasableAmount={contract.releasableAmount}
                  releasedAmount={contract.releasedAmount}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 네트워크 경고 모달 */}
        <NetworkWarningModal
          isOpen={shouldShowModal}
          onClose={hideModal}
          expectedNetworkName={expectedNetworkName}
          expectedChainId={expectedChainId}
          currentChainId={currentChainId}
        />
      </div>
    </AdminLayout>
  );
}
