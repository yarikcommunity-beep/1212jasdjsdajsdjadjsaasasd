import React from 'react';
import { User, Shield, Activity, Clock, Globe } from 'lucide-react';
import { useTelegram } from '../hooks/useTelegram';

const ProfilePage: React.FC = () => {
  const { 
    user, 
    isProtectionActive, 
    getProtectionDuration, 
    threatLogs, 
    systemLogs 
  } = useTelegram();

  // Получаем реальную аватарку пользователя
  const getUserAvatar = () => {
    if (user?.photo_url) {
      return user.photo_url;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.first_name || 'User')}&background=333333&color=ffffff&size=128`;
  };

  const stats = [
    { 
      label: 'Время защиты', 
      value: isProtectionActive ? getProtectionDuration() : '0 мин', 
      icon: Shield, 
      color: isProtectionActive ? 'text-green-500' : 'text-gray-500' 
    },
    { 
      label: 'Заблокировано угроз', 
      value: threatLogs.filter(t => t.status === 'blocked').length.toString(), 
      icon: Activity, 
      color: 'text-red-500' 
    },
    { 
      label: 'Всего событий', 
      value: systemLogs.length.toString(), 
      icon: Clock, 
      color: 'text-blue-500' 
    },
    { 
      label: 'Статус', 
      value: isProtectionActive ? 'Защищен' : 'Не защищен', 
      icon: Globe, 
      color: isProtectionActive ? 'text-green-500' : 'text-gray-500' 
    }
  ];

  return (
    <div className="space-y-8 pb-24">
      {/* Профиль пользователя */}
      <div className="glass-card p-8 text-center">
        <div className="relative inline-block mb-6">
          <img
            src={getUserAvatar()}
            alt="Avatar"
            className="w-24 h-24 rounded-full border-4 border-white/20 object-cover avatar-glow"
          />
          <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-black flex items-center justify-center ${
            isProtectionActive ? 'bg-green-500' : 'bg-gray-500'
          }`}>
            <Shield className="w-4 h-4 text-white" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">
          {user?.first_name} {user?.last_name}
        </h1>
        <p className="text-gray-400 mb-6">@{user?.username || `user${user?.id?.toString().slice(-4)}`}</p>
        
        <div className={`border rounded-xl p-4 ${
          isProtectionActive 
            ? 'bg-green-500/20 border-green-500/30' 
            : 'bg-gray-500/20 border-gray-500/30'
        }`}>
          <p className={`font-semibold ${
            isProtectionActive ? 'text-green-400' : 'text-gray-400'
          }`}>
            {isProtectionActive ? '✅ Профиль защищен' : '❌ Профиль не защищен'}
          </p>
          <p className={`text-sm mt-1 ${
            isProtectionActive ? 'text-green-300/70' : 'text-gray-300/70'
          }`}>
            {isProtectionActive ? 'Активная защита от OSINT' : 'Защита отключена'}
          </p>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="glass-card p-6 text-center hover:scale-105 transition-transform duration-300">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 mb-4`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Информация о защите */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-white mb-4">Информация о защите</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
            <span className="text-gray-300">ID пользователя</span>
            <span className="text-white font-mono">***{String(user?.id).slice(-4)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
            <span className="text-gray-300">Язык</span>
            <span className="text-white">{user?.language_code?.toUpperCase() || 'EN'}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
            <span className="text-gray-300">Тип защиты</span>
            <span className="text-green-400">Бесплатная</span>
          </div>
        </div>
      </div>

      {/* Активность */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-white mb-4">Последняя активность</h3>
        <div className="space-y-3">
          {[
            { time: '14:30', action: 'Активирована защита профиля', type: 'success' },
            { time: '12:15', action: 'Заблокирован OSINT запрос', type: 'warning' },
            { time: '09:45', action: 'Обновлены настройки приватности', type: 'info' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'success' ? 'bg-green-500' :
                activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
              }`} />
              <div className="flex-1">
                <p className="text-white text-sm">{activity.action}</p>
                <p className="text-gray-400 text-xs">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;