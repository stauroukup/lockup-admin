// Vesting Schedule Data
// 각 베스팅 스케줄의 타입 정의
export interface VestingSchedule {
  vestingDate: number; // Unix timestamp (seconds)
  vestingAmount: number; // Amount in Wei (considering 18 decimals)
}

function generateMonthlyVesting(
  startYear: number,
  startMonth: number, // 0-indexed (0 = January, 7 = August)
  endYear: number,
  endMonth: number, // 0-indexed (10 = November)
  monthlyAmount: number
): VestingSchedule[] {
  const schedule: VestingSchedule[] = [];

  let currentYear = startYear;
  let currentMonth = startMonth;

  while (
    currentYear < endYear ||
    (currentYear === endYear && currentMonth <= endMonth)
  ) {
    schedule.push({
      vestingDate: Math.floor(
        new Date(Date.UTC(currentYear, currentMonth, 1)).getTime() / 1000
      ),
      vestingAmount: monthlyAmount,
    });

    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
  }

  return schedule;
}

// Ecosystem 베스팅 스케줄
// 2026년 8월부터 2034년 11월까지 매달 40M씩, 총 4B
export const ecosystem: VestingSchedule[] = generateMonthlyVesting(
  2026,
  7, // 2026년 8월 (7 = August)
  2034,
  10, // 2034년 11월 (10 = November)
  40_000_000 // 40M
);

// Foundation 베스팅 스케줄
// 2026년 8월부터 2034년 11월까지 매달 30M씩, 총 3B
export const foundation: VestingSchedule[] = generateMonthlyVesting(
  2026,
  7, // 2026년 8월
  2034,
  10, // 2034년 11월
  30_000_000 // 30M
);

// Private Investment 베스팅 스케줄
// 2026년 8월부터 2034년 11월까지 매달 10M씩, 총 1B
export const privateInvestment: VestingSchedule[] = generateMonthlyVesting(
  2026,
  7, // 2026년 8월
  2034,
  10, // 2034년 11월
  10_000_000 // 10M
);

// Team 베스팅 스케줄
// 2026년 8월부터 2034년 11월까지 매달 5M씩, 총 500M
export const team: VestingSchedule[] = generateMonthlyVesting(
  2026,
  7, // 2026년 8월
  2034,
  10, // 2034년 11월
  5_000_000 // 5M
);

// Marketing 베스팅 스케줄
// 2025년 8월부터 2033년 11월까지 매달 10M씩, 총 1B
export const marketing: VestingSchedule[] = generateMonthlyVesting(
  2025,
  7, // 2025년 8월
  2033,
  10, // 2033년 11월
  10_000_000 // 10M
);

// Advisors 베스팅 스케줄
// 2026년 8월부터 2034년 11월까지 매달 5M씩, 총 500M
export const advisors: VestingSchedule[] = generateMonthlyVesting(
  2026,
  7, // 2026년 8월
  2034,
  10, // 2034년 11월
  5_000_000 // 5M
);

export const getVestingSchedules = (address: string) => {
  switch (address) {
    case process.env.NEXT_PUBLIC_VESTING_ECOSYSTEM_ADDRESS:
      return ecosystem;
    case process.env.NEXT_PUBLIC_VESTING_FOUNDATION_ADDRESS:
      return foundation;
    case process.env.NEXT_PUBLIC_VESTING_PRIVATE_INVESTOR_ADDRESS:
      return privateInvestment;
    case process.env.NEXT_PUBLIC_VESTING_TEAM_ADDRESS:
      return team;
    case process.env.NEXT_PUBLIC_VESTING_MARKETING_ADDRESS:
      return marketing;
    case process.env.NEXT_PUBLIC_VESTING_ADVISOR_ADDRESS:
      return advisors;
    default:
      throw new Error("Invalid Address");
  }
};

// 다음 베스팅 예정 날짜를 구하는 함수
export const getNextVestingDate = (address: string): Date | null => {
  try {
    const schedules = getVestingSchedules(address);
    const now = Math.floor(Date.now() / 1000); // 현재 시간을 Unix timestamp로 변환

    // 현재 시간보다 이후인 베스팅 날짜 중 가장 가까운 것을 찾기
    const nextVesting = schedules.find(
      (schedule) => schedule.vestingDate > now
    );

    if (nextVesting) {
      return new Date(nextVesting.vestingDate * 1000);
    }

    return null; // 모든 베스팅이 완료된 경우
  } catch (error) {
    console.error("Error getting next vesting date:", error);
    return null;
  }
};

// 다음 베스팅 정보(날짜와 금액)을 구하는 함수
export const getNextVestingInfo = (
  address: string
): { date: Date; amount: number } | null => {
  try {
    const schedules = getVestingSchedules(address);
    const now = Math.floor(Date.now() / 1000); // 현재 시간을 Unix timestamp로 변환

    // 현재 시간보다 이후인 베스팅 날짜 중 가장 가까운 것을 찾기
    const nextVesting = schedules.find(
      (schedule) => schedule.vestingDate > now
    );

    if (nextVesting) {
      return {
        date: new Date(nextVesting.vestingDate * 1000),
        amount: nextVesting.vestingAmount,
      };
    }

    return null; // 모든 베스팅이 완료된 경우
  } catch (error) {
    console.error("Error getting next vesting info:", error);
    return null;
  }
};

// 한국시간으로 날짜 포맷팅하는 함수
export const formatKoreanDate = (date: Date): string => {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Seoul",
  }).format(date);
};
