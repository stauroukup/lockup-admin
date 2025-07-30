import { createConfig, http } from "wagmi";
import { polygon, polygonAmoy } from "wagmi/chains";
import { injected } from "wagmi/connectors";

console.log("process.env.NODE_ENV", process.env.NODE_ENV);
console.log("process.env.NEXT_PUBLIC_NETWORK", process.env.NEXT_PUBLIC_NETWORK);
// 환경 변수로 네트워크 설정
const isTestnet =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_NETWORK === "testnet";

// Wagmi 설정 - Polygon 메인넷과 Amoy 테스트넷 지원
export const wagmiConfig = isTestnet
  ? createConfig({
      chains: [polygonAmoy],
      connectors: [injected()],
      transports: {
        [polygonAmoy.id]: http("https://rpc-amoy.polygon.technology"),
      },
      ssr: true,
    })
  : createConfig({
      chains: [polygon],
      connectors: [injected()],
      transports: {
        [polygon.id]: http("https://polygon-rpc.com"),
      },
      ssr: true,
    });

// 현재 사용 중인 네트워크 정보
export const currentNetwork = isTestnet ? polygonAmoy : polygon;

// 베스팅 컨트랙트 주소들 (환경변수에서 가져오거나 기본값 사용)
export const VESTING_CONTRACTS = {
  MANAGER:
    process.env.NEXT_PUBLIC_VESTING_MANAGER_ADDRESS ||
    "0x8CC178bB60Ae361a655610009D3B4E18d64D0b22",
  CONTRACTS: {
    ecosystem:
      process.env.NEXT_PUBLIC_VESTING_ECOSYSTEM_ADDRESS ||
      "0x4f1202E6e6f2f2BeB96CcBc5c1E0dc739Fa6e7e8",
    foundation:
      process.env.NEXT_PUBLIC_VESTING_FOUNDATION_ADDRESS ||
      "0xfc5221B71D694f34621BF424A2431FE41EDD6131",
    "private investor":
      process.env.NEXT_PUBLIC_VESTING_PRIVATE_INVESTOR_ADDRESS ||
      "0xe2a592F2B71f53aB10De1293dfe73D6A178E4ea1",
    team:
      process.env.NEXT_PUBLIC_VESTING_TEAM_ADDRESS ||
      "0x022022BCd209234D89FE605F42F57b5Af38276d7",
    marketing:
      process.env.NEXT_PUBLIC_VESTING_MARKETING_ADDRESS ||
      "0x4cee01b5766A55Ce59602AECFc59df64a33a9959",
    advisor:
      process.env.NEXT_PUBLIC_VESTING_ADVISOR_ADDRESS ||
      "0x067De3706DaBC25b27B6a816Cea216e2723739ab",
  },
} as const;

// 베스팅 컨트랙트 타입 정의
export interface VestingOverview {
  totalLocked: bigint;
  totalVested: bigint;
  totalReleasable: bigint;
  totalReleased: bigint;
}

export interface VestingDetails {
  contractAddress: string;
  beneficiary: string;
  token: string;
  totalAllocation: bigint;
  vestedAmount: bigint;
  releasableAmount: bigint;
  releasedAmount: bigint;
}

export interface CompleteVestingInfo {
  overview: VestingOverview;
  contracts: VestingDetails[];
}

// Polygon 네트워크 추가/전환 함수
export const addPolygonNetwork = async () => {
  if (
    typeof window === "undefined" ||
    !(window as { ethereum?: EthereumProvider }).ethereum
  ) {
    throw new Error("MetaMask is not installed");
  }

  const ethereum = (window as { ethereum: EthereumProvider }).ethereum;

  try {
    // 네트워크 전환 시도
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x89" }], // 137 in hex
    });
  } catch (switchError: unknown) {
    // 네트워크가 존재하지 않는 경우 추가
    if (
      switchError &&
      typeof switchError === "object" &&
      "code" in switchError &&
      switchError.code === 4902
    ) {
      try {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x89",
              chainName: "Polygon",
              nativeCurrency: {
                name: "MATIC",
                symbol: "MATIC",
                decimals: 18,
              },
              rpcUrls: ["https://polygon-rpc.com"],
              blockExplorerUrls: ["https://polygonscan.com"],
            },
          ],
        });
      } catch {
        throw new Error("Failed to add Polygon network");
      }
    } else {
      throw switchError;
    }
  }
};

// 지갑 주소 포맷팅 함수
export const formatAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// 네트워크 확인 함수
export const isCorrectNetwork = (chainId: number) => {
  return chainId === currentNetwork.id;
};

// ethereum 타입 정의
interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  isMetaMask?: boolean;
}
