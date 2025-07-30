import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !session.isAdmin) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        email: session.email,
        isAdmin: session.isAdmin
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("사용자 정보 조회 오류:", error);
    return NextResponse.json(
      { error: "사용자 정보를 조회할 수 없습니다." },
      { status: 500 }
    );
  }
} 