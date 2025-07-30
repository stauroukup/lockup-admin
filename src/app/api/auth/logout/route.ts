import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json(
      { message: "로그아웃 되었습니다." },
      { status: 200 }
    );

    // 세션 쿠키 삭제
    response.cookies.delete("session");

    return response;
  } catch (error) {
    console.error("로그아웃 오류:", error);
    return NextResponse.json(
      { error: "로그아웃 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 