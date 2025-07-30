import { kv } from "@vercel/kv";
import * as bcrypt from "bcryptjs";

const ADMIN_USER_KEY = "user_admin";
const DEFAULT_ADMIN = {
  id: "admin",
  password: "admin1234", // 초기 비밀번호
};

export interface AdminUser {
  id: string;
  password: string;
}

// 관리자 사용자 초기화 (처음 한 번만)
export async function initializeAdmin(): Promise<void> {
  try {
    const existingAdmin = await kv.get<AdminUser>(ADMIN_USER_KEY);
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 12);
      await kv.set(ADMIN_USER_KEY, {
        id: DEFAULT_ADMIN.id,
        password: hashedPassword,
      });
    }
  } catch (error) {
    console.error(error);
  }
}

// 관리자 로그인 검증
export async function verifyAdmin(
  id: string,
  password: string
): Promise<boolean> {
  try {
    const admin = await kv.get<AdminUser>(ADMIN_USER_KEY);
    if (!admin) {
      await initializeAdmin();
      return verifyAdmin(id, password); // 재시도
    }

    if (admin.id !== id) {
      return false;
    }

    return await bcrypt.compare(password, admin.password);
  } catch (error) {
    console.error("❌ 로그인 검증 실패:", error);
    return false;
  }
}

// 관리자 비밀번호 변경
export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  try {
    const admin = await kv.get<AdminUser>(ADMIN_USER_KEY);
    if (!admin) {
      return { success: false, message: "관리자 계정을 찾을 수 없습니다." };
    }

    // 현재 비밀번호 확인
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      admin.password
    );
    if (!isCurrentPasswordValid) {
      return { success: false, message: "현재 비밀번호가 올바르지 않습니다." };
    }

    // 새 비밀번호 해시화 및 저장
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    await kv.set(ADMIN_USER_KEY, {
      id: admin.id,
      password: hashedNewPassword,
    });

    return { success: true, message: "비밀번호가 성공적으로 변경되었습니다." };
  } catch (error) {
    console.error("❌ 비밀번호 변경 실패:", error);
    return { success: false, message: "비밀번호 변경 중 오류가 발생했습니다." };
  }
}

// 관리자 정보 조회
export async function getAdminInfo(): Promise<{ id: string } | null> {
  try {
    const admin = await kv.get<AdminUser>(ADMIN_USER_KEY);
    if (admin) {
      return { id: admin.id };
    }
    return null;
  } catch (error) {
    console.error("❌ 관리자 정보 조회 실패:", error);
    return null;
  }
}
