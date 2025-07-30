"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, Settings, LogOut } from "lucide-react";
import { toast } from "sonner";

const navigation = [
  {
    name: "대시보드",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "토큰 릴리즈",
    href: "/token",
    icon: Users,
  },
  // {
  //   name: "콘텐츠 관리",
  //   href: "/admin/content",
  //   icon: FileText,
  // },
  // {
  //   name: "통계",
  //   href: "/admin/analytics",
  //   icon: BarChart3,
  // },
  {
    name: "설정",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("로그아웃 되었습니다.");
        router.push("/login");
      } else {
        toast.error("로그아웃 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("로그아웃 오류:", error);
      toast.error("로그아웃 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-bold text-white">
          STAU Lockup Management System
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start text-left font-normal cursor-pointer",
                  isActive
                    ? "bg-gray-800 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                )}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:bg-gray-800 hover:text-white cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          로그아웃
        </Button>
      </div>
    </div>
  );
}
