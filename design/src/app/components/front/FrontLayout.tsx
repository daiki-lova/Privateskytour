import React from 'react';
import { User, Menu, Phone, Instagram, Twitter, Facebook, Youtube, ChevronUp } from 'lucide-react';
import logoImage from 'figma:asset/3c932fc983ca3acf7249b17e711f1ddce4427b2c.png';

export const FrontHeader = ({ transparent = false }: { transparent?: boolean }) => {
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${transparent ? 'bg-transparent text-white border-b border-white/10' : 'bg-white text-slate-900 border-b border-slate-200 shadow-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <img src={logoImage} alt="PRIVATESKY TOUR" className={`h-8 w-auto ${transparent ? 'brightness-0 invert' : ''}`} />
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#" className="hover:opacity-70 transition-opacity">プラン一覧</a>
          <a href="#" className="hover:opacity-70 transition-opacity">ご利用の流れ</a>
          <a href="#" className="hover:opacity-70 transition-opacity">よくあるご質問</a>
          <a href="#" className="hover:opacity-70 transition-opacity">ヘリポート</a>
        </nav>

        <div className="flex items-center gap-4">
          <a href="#" className="flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity">
            <User className="w-5 h-5" />
            <span className="hidden md:inline">マイページ</span>
          </a>
          <a href="#" className={`text-sm font-bold px-5 py-2.5 rounded-full transition-colors ${transparent ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
            お問い合わせ
          </a>
        </div>
      </div>
    </header>
  );
};

export const FrontFooter = () => {
  return (
    <footer className="bg-[#0F172A] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between mb-16 gap-10">
          <div className="space-y-6">
            <img src={logoImage} alt="PRIVATESKY TOUR" className="h-8 w-auto brightness-0 invert" />
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              上質な空の旅を、あなたに。<br />
              特別な日の思い出作りをお手伝いします。
            </p>
            <div className="flex gap-4">
              {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div className="flex gap-10 md:gap-20 flex-wrap">
            <div>
              <h4 className="font-bold mb-6 text-sm tracking-wider text-slate-400">MENU</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">プラン一覧</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">ご利用の流れ</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">よくあるご質問</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">ヘリポート</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-sm tracking-wider text-slate-400">INFORMATION</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">運営会社</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">特定商取引法に基づく表記</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">プライバシーポリシー</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">運航約款</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
           <p>© 2024 SkyView Inc. All rights reserved.</p>
           
           <div className="space-y-2 text-right hidden md:block">
              <p>※天候状況等により運航できない場合がございます。</p>
              <p>※フライト時間は目安であり、当日の風向き等により多少前後する場合がございます。</p>
           </div>
           
           <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 hover:text-white transition-colors">
             Page Top <ChevronUp className="w-4 h-4" />
           </button>
        </div>
      </div>
    </footer>
  );
};
