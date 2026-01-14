import React, { useState } from 'react';
import { Shield, Lock, CheckCircle, Settings, Send } from 'lucide-react';
import { useTelegram } from '../hooks/useTelegram';

const HomePage: React.FC = () => {
  const { 
    user, 
    showPopup, 
    sendMessage, 
    isProtectionActive, 
    activateProtection, 
    deactivateProtection,
    getProtectionDuration,
    sendAdminBroadcast
  } = useTelegram();
  const [isLoading, setIsLoading] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');

  const handleConnect = async () => {
    if (isProtectionActive) {
      // Отключаем защиту
      showPopup(
        'Отключить защиту?',
        'Вы уверены, что хотите отключить защиту от OSINT? Вы перестанете получать уведомления о попытках получения ваших данных.',
        (buttonId) => {
          if (buttonId === 'ok') {
            deactivateProtection();
          }
        }
      );
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await activateProtection();
      if (success) {
        showPopup(
          'Защита активирована!',
          'Бесплатная защита активирована! Теперь я буду присылать тебе в личку уведомления, если кто-то попытается тебя пробить через OSINT-сервисы, боты или базы.\n\nПремиум-версия (скоро): отклонение в 1 клик, журнал атак, кто именно смотрел, полная анонимность.'
        );
      }
    } catch (error) {
      showPopup('Ошибка', 'Не удалось активировать защиту. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminBroadcast = async () => {
    if (!broadcastMessage.trim()) return;
    
    showPopup(
      'Подтверждение рассылки',
      `Вы уверены, что хотите отправить это сообщение всем пользователям?\n\n"${broadcastMessage}"`,
      async (buttonId) => {
        if (buttonId === 'ok') {
          const success = await sendAdminBroadcast(broadcastMessage);
          if (success) {
            setBroadcastMessage('');
            setShowAdminPanel(false);
            showPopup('Успешно', 'Сообщение отправлено всем пользователям!');
          } else {
            showPopup('Ошибка', 'Не удалось отправить сообщение.');
          }
        }
      }
    );
  };

  // Получаем реальную аватарку пользователя
  const getUserAvatar = () => {
    if (user?.photo_url) {
      return user.photo_url;
    }
    // Fallback для пользователей без аватарки
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.first_name || 'User')}&background=333333&color=ffffff&size=128`;
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Header с пользователем */}
      <div className="glass-card p-6">
        <div className="flex items-center space-x-4">
          {/* Админ кнопка */}
          {user?.id === 7251987829 && (
            <button
              onClick={() => setShowAdminPanel(!showAdminPanel)}
              className="absolute top-4 right-4 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 transition-colors"
            >
              <Settings className="w-5 h-5 text-yellow-400" />
            </button>
          )}
          
          <div className="relative">
            <img
              src={getUserAvatar()}
              alt="Avatar"
              className="w-16 h-16 rounded-full border-2 border-white/90 object-cover avatar-glow"
            />
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-black pulse-dot ${
              isProtectionActive ? 'bg-green-500' : 'bg-gray-500'
            }`} />
          </div>
          
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">
              {user?.first_name} {user?.last_name}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-gray-400">
                @{user?.username || `user${user?.id?.toString().slice(-4)}`}
              </span>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full pulse-dot ${
                  isProtectionActive ? 'bg-green-500' : 'bg-gray-500'
                }`} />
                <span className={`text-xs ${
                  isProtectionActive ? 'text-green-500' : 'text-gray-500'
                }`}>
                  {isProtectionActive ? 'защищен' : 'не защищен'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Админ панель */}
      {showAdminPanel && user?.id === 7251987829 && (
        <div className="glass-card p-6 border-yellow-500/30">
          <h3 className="text-lg font-bold text-yellow-400 mb-4">Админ панель</h3>
          <div className="space-y-4">
            <textarea
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="Введите сообщение для рассылки всем пользователям..."
              className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 resize-none"
              rows={4}
            />
            <button
              onClick={handleAdminBroadcast}
              disabled={!broadcastMessage.trim()}
              className="w-full py-3 px-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-400 font-semibold hover:bg-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              <Send className="w-5 h-5" />
              <span>Отправить всем пользователям</span>
            </button>
          </div>
        </div>
      )}
      {/* Бесплатная защита */}
      <div className="glass-card p-8 text-center cosmic-glow">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Бесплатная защита</h2>
          {isProtectionActive && (
            <p className="text-green-400 text-sm">Активна уже {getProtectionDuration()}</p>
          )}
          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-white to-transparent mx-auto opacity-50" />
        </div>
        
        {/* Анимация защиты */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className={`w-40 h-40 bg-gradient-to-br from-white/10 to-transparent rounded-full flex items-center justify-center backdrop-blur-xl border shield-animation ${
              isProtectionActive ? 'border-green-500/50' : 'border-white/20'
            }`}>
              <Shield className={`w-20 h-20 drop-shadow-2xl ${
                isProtectionActive ? 'text-green-400' : 'text-white'
              }`} strokeWidth={1} />
              {isProtectionActive && (
                <>
                  <div className="absolute inset-0 rounded-full animate-ping bg-green-500/20" />
                  <div className="absolute inset-2 rounded-full animate-pulse bg-green-500/10" />
                </>
              )}
            </div>
            {/* Орбитальные кольца */}
            <div className={`absolute inset-0 border-2 rounded-full animate-spin-slow ${
              isProtectionActive ? 'border-green-500/20' : 'border-white/10'
            }`} />
            <div className={`absolute inset-4 border rounded-full animate-spin-reverse ${
              isProtectionActive ? 'border-green-500/10' : 'border-white/5'
            }`} />
          </div>
        </div>
        
        <p className="text-gray-400 mb-8 leading-relaxed">
          {isProtectionActive 
            ? 'Защита активна - отслеживаем угрозы в реальном времени'
            : 'Базовая защита от OSINT-пробивов и утечек данных'
          }
        </p>
        
        <button
          onClick={handleConnect}
          disabled={isLoading}
          className={`w-full py-4 px-8 rounded-2xl font-semibold text-lg transition-all duration-300 transform ${
            isProtectionActive 
              ? 'bg-green-600/20 text-green-400 border border-green-500/30 cursor-not-allowed' 
              : isLoading
              ? 'bg-white/10 text-white/50 border border-white/20 cursor-wait scale-95'
              : 'bg-white text-black hover:bg-white/90 hover:scale-105 active:scale-95 shadow-2xl hover:shadow-white/20'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
              <span>Подключение...</span>
            </div>
          ) : isProtectionActive ? (
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Отключить защиту</span>
            </div>
          ) : (
            'Подключить защиту'
          )}
        </button>
      </div>

      {/* Премиум возможности */}
      <div className="glass-card p-8 opacity-70 hover:opacity-90 transition-opacity duration-500">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Lock className="w-6 h-6 text-white/70" />
            <h3 className="text-xl font-bold text-white">Премиум возможности</h3>
          </div>
          <span className="text-2xl font-light text-gray-500">Coming Soon</span>
        </div>
        
        <div className="space-y-4 text-left">
          {[
            'Мгновенное отклонение запросов',
            'Журнал всех попыток пробива',
            'Кто именно смотрел твой профиль',
            'Скрытие номера, ID, username',
            'Приоритетная защита + уведомления в реальном времени'
          ].map((feature, index) => (
            <div key={index} className="flex items-start space-x-3 text-gray-400 hover:text-white transition-colors duration-300">
              <div className="w-2 h-2 bg-white/50 rounded-full mt-2.5 flex-shrink-0" />
              <span className="leading-relaxed">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;