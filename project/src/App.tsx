import React, { useState } from 'react';
import { Home, User, Shield, Settings as SettingsIcon } from 'lucide-react';
import BlackHole from './components/BlackHole';
import HomePage from './components/HomePage';
import ProfilePage from './components/ProfilePage';
import SecurityPage from './components/SecurityPage';
import SettingsPage from './components/SettingsPage';
import './styles/animations.css';

type TabType = 'home' | 'profile' | 'security' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');

  const navigationItems = [
    { id: 'home' as TabType, label: 'Главная', icon: Home },
    { id: 'profile' as TabType, label: 'Профиль', icon: User },
    { id: 'security' as TabType, label: 'Защита', icon: Shield },
    { id: 'settings' as TabType, label: 'Настройки', icon: SettingsIcon }
  ];

  const renderCurrentPage = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'profile':
        return <ProfilePage />;
      case 'security':
        return <SecurityPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden stars-background">
      {/* Анимированная чёрная дыра */}
      <BlackHole />
      
      {/* Основной контент */}
      <div className="relative z-10 px-4 pt-6">
        {renderCurrentPage()}
      </div>

      {/* Нижняя навигация */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="glass-card mx-4 mb-4 p-4">
          <div className="flex items-center justify-around">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center space-y-1 py-2 px-4 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-white text-black scale-110 shadow-lg' 
                      : 'text-gray-400 hover:text-white hover:bg-white/10 hover:scale-105'
                  }`}
                >
                  <Icon 
                    className={`w-6 h-6 ${isActive ? 'drop-shadow-lg' : ''}`} 
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                  <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                    {item.label}
                  </span>
                  
                  {/* Активный индикатор */}
                  {isActive && (
                    <div className="absolute -top-1 w-8 h-1 bg-gradient-to-r from-transparent via-white to-transparent rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Декоративная линия */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-white/20 rounded-full -translate-y-2" />
        </div>
      </div>
    </div>
  );
}

export default App;