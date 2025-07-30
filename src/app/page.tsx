"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Activity, TrendingUp, DollarSign, Users } from "lucide-react";
import { VestingCard } from "@/components/vesting/VestingCard";
import { useVestingData } from "@/hooks/useVestingData";
import { formatEther } from "viem";
import { currentNetwork } from "@/lib/web3-config";

export default function Home() {
  const { vestingData, isLoading, error } = useVestingData();

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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
            <p className="text-gray-600 mt-2">
              STAU 토큰 락업 및 베스팅 현황을 관리합니다.
            </p>
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
            <p className="text-gray-600 mt-2">
              STAU 토큰 락업 및 베스팅 현황을 관리합니다.
            </p>
          </div>

          <Alert>
            <AlertDescription>베스팅 데이터가 없습니다.</AlertDescription>
          </Alert>
        </div>
      </AdminLayout>
    );
  }

  const { overview, contracts } = vestingData;

  const totalLockedNumber = Number(formatEther(overview.totalLocked));
  const totalVestedNumber = Number(formatEther(overview.totalVested));
  const totalReleasableNumber = Number(formatEther(overview.totalReleasable));
  const totalReleasedNumber = Number(formatEther(overview.totalReleased));

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
          <p className="text-gray-600 mt-2">
            STAU 토큰 락업 및 베스팅 현황을 관리합니다.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{currentNetwork.name}</Badge>
            <Badge variant="secondary">{contracts.length}개 컨트랙트</Badge>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />총 락업 물량
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {totalLockedNumber.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">전체 할당량</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                베스팅된 물량
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {totalVestedNumber.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {totalLockedNumber > 0
                  ? ((totalVestedNumber / totalLockedNumber) * 100).toFixed(1)
                  : 0}
                % 진행
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                릴리즈 가능한 물량
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {totalReleasableNumber.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">즉시 릴리즈 가능</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="h-4 w-4" />
                릴리즈된 물량
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {totalReleasedNumber.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">이미 릴리즈됨</p>
            </CardContent>
          </Card>
        </div>

        {/* Vesting Contracts */}
        <Card>
          <CardHeader>
            <CardTitle>베스팅 컨트랙트별 현황</CardTitle>
            <p className="text-sm text-gray-600">
              각 수혜자별 베스팅 진행 상황과 릴리즈 가능한 토큰량을 확인할 수
              있습니다.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contracts.map((contract) => (
                <VestingCard
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

        {/* Summary Information */}
        <Card>
          <CardHeader>
            <CardTitle>요약 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    전체 베스팅 진행률
                  </h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {totalLockedNumber > 0
                      ? ((totalVestedNumber / totalLockedNumber) * 100).toFixed(
                          1
                        )
                      : 0}
                    %
                  </p>
                  <p className="text-sm text-blue-700">
                    {totalVestedNumber.toLocaleString()} /{" "}
                    {totalLockedNumber.toLocaleString()} 토큰
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">
                    릴리즈 완료율
                  </h4>
                  <p className="text-2xl font-bold text-green-600">
                    {totalVestedNumber > 0
                      ? (
                          (totalReleasedNumber / totalVestedNumber) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </p>
                  <p className="text-sm text-green-700">
                    {totalReleasedNumber.toLocaleString()} /{" "}
                    {totalVestedNumber.toLocaleString()} 토큰
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                <Activity className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-700">
                  현재 {totalReleasableNumber.toLocaleString()} 토큰이 릴리즈
                  대기 중입니다.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
