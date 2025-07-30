"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  email: string | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  email: null,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setEmail(data.email);
      } else {
        setIsAuthenticated(false);
        setEmail(null);
        
        // 로그인 페이지가 아닌 경우에만 리다이렉트
        if (pathname !== "/login") {
          router.push("/login");
        }
      }
    } catch (error) {
      console.error("인증 확인 오류:", error);
      setIsAuthenticated(false);
      setEmail(null);
      
      if (pathname !== "/login") {
        router.push("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  // 로그인 페이지에서는 인증 체크를 하지 않음
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // 로딩 중일 때 표시할 화면
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, email }}>
      {children}
    </AuthContext.Provider>
  );
} 