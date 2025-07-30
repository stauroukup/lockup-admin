import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin, initializeAdmin } from "@/lib/auth";
import { createSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const { id, password } = await request.json();

    if (!id || !password) {
      return NextResponse.json(
        { error: "아이디와 비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    // 관리자 계정 초기화 (처음 실행 시)
    await initializeAdmin();

    // 로그인 검증
    const isValid = await verifyAdmin(id, password);

    if (!isValid) {
      return NextResponse.json(
        { error: "이메일 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    // 세션 토큰 생성
    const token = await createSession(id);

    // 쿠키 설정
    const response = NextResponse.json(
      { message: "로그인 성공", id },
      { status: 200 }
    );

    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24시간
    });

    return response;
  } catch (error) {
    console.error("로그인 오류:", error);
    return NextResponse.json(
      { error: "로그인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
