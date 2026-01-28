import React, { useState } from 'react';
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Loader2 } from "lucide-react";
import logo from 'figma:asset/3c932fc983ca3acf7249b17e711f1ddce4427b2c.png';

interface LoginViewProps {
  onLogin: (role: 'admin' | 'staff') => void;
}

export const LoginView = ({ onLogin }: LoginViewProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    // Simulate a brief loading state for better UX
    setTimeout(() => {
      setIsLoading(false);
      onLogin('admin');
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-sm shadow-xl border-slate-200">
        <CardHeader className="space-y-1 text-center pb-2">
          <div className="flex flex-col items-center justify-center mb-2">
            <img src={logo} alt="PrivateSky Tour" className="h-10 object-contain mb-2" />
            <p className="text-sm text-slate-400 font-medium">管理画面</p>
          </div>
        </CardHeader>
        <CardContent className="pt-2 pb-8">
          <Button 
            onClick={handleLogin} 
            className="w-full bg-indigo-600 hover:bg-indigo-700 h-10 font-medium" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                認証中...
              </>
            ) : (
              'ログイン'
            )}
          </Button>
          <p className="text-xs text-center text-slate-400 mt-4">
            Authorized Personnel Only
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
