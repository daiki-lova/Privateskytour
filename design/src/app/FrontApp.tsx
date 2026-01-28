import React, { useState } from 'react';
import HomePage from './components/front/HomePage';
import MyPage from './components/front/MyPage';
import PlanDetailPage from './components/front/PlanDetailPage';

import ReservationFlow from './components/front/ReservationFlow';

type Page = 'home' | 'mypage' | 'detail' | 'search' | 'reservation';

export default function FrontApp() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const navigate = (page: string) => {
    // Basic routing logic
    if (['home', 'mypage', 'detail', 'search', 'reservation'].includes(page)) {
      setCurrentPage(page as Page);
    } else {
      console.warn(`Unknown page: ${page}`);
      setCurrentPage('home');
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  return (
    <div className="min-h-screen bg-white">
      {currentPage === 'home' && <HomePage onNavigate={navigate} />}
      {currentPage === 'search' && <HomePage onNavigate={navigate} />} 
      {currentPage === 'mypage' && <MyPage onNavigate={navigate} />}
      {currentPage === 'detail' && <PlanDetailPage onNavigate={navigate} />}
      {currentPage === 'reservation' && <ReservationFlow onNavigate={navigate} />}
      
      {/* Dev Navigation Helper (Hidden in production ideally) */}
      <div className="fixed bottom-4 left-4 z-[100] flex gap-2 bg-black/80 p-2 rounded-lg backdrop-blur-md opacity-0 hover:opacity-100 transition-opacity">
        <button onClick={() => navigate('home')} className="text-xs text-white px-2 py-1 hover:bg-white/20 rounded">Home</button>
        <button onClick={() => navigate('mypage')} className="text-xs text-white px-2 py-1 hover:bg-white/20 rounded">MyPage</button>
        <button onClick={() => navigate('detail')} className="text-xs text-white px-2 py-1 hover:bg-white/20 rounded">Detail</button>
        <button onClick={() => navigate('reservation')} className="text-xs text-white px-2 py-1 hover:bg-white/20 rounded">Reserve</button>
      </div>
    </div>
  );
}
