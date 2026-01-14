import React from 'react';
import { Settings, Bell, Palette, Info, HelpCircle, LogOut, Zap } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const settingsGroups = [
    {
      title: 'Основные',
      items: [
        { icon: Bell, label: 'Уведомления', description: 'Настройка push-уведомлений', action: 'toggle', enabled: true },
        { icon: Palette, label: 'Тема', description: 'Темная тема (всегда включена)', action: 'info', enabled: true }
      ]
    },
    {
      title: 'Премиум',
      items: [
        { icon: Zap, label: 'Премиум статус', description: 'Получить дополнительные возможности', action: 'premium', premium: true },
        { icon: Settings, label: 'Расширенные настройки', description: 'Доступно только в премиум версии', action: 'premium', premium: true }
      ]
    },
    {
      title: 'Поддержка',
      items: [
        { icon: HelpCircle, label: 'Справка', description: 'Часто задаваемые вопросы', action: 'link' },
        { icon: Info, label: 'О приложении', description: 'Информация о версии и разработчиках', action: 'info' }
      ]
    },
    {
      title: 'Аккаунт',
      items: [
        { icon: LogOut, label: 'Выход', description: 'Закрыть приложение', action: 'logout', danger: true }
      ]
    }
  ];

  const handleSettingClick = (action: string, item: any) => {
    switch (action) {
      case 'premium':
        alert('Премиум функции скоро будут доступны!');
        break;
      case 'logout':
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.close();
        }
        break;
      case 'info':
        alert('Telegram Mini App v1.0\nОСИНТ Защита\n\nРазработано для защиты от утечек данных');
        break;
      case 'link':
        alert('Справочная информация:\n\n• Как работает защита от OSINT\n• Что делать при обнаружении угрозы\n• Настройки приватности\n• Контакты поддержки');
        break;
    }
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Заголовок */}
      <div className="glass-card p-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl mb-4 border border-purple-500/30">
          <Settings className="w-8 h-8 text-purple-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Настройки</h1>
        <p className="text-gray-400">Управление приложением и профилем</p>
      </div>

      {/* Группы настроек */}
      {settingsGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="glass-card p-6">
          <h2 className="text-lg font-bold text-white mb-4">{group.title}</h2>
          <div className="space-y-3">
            {group.items.map((item, itemIndex) => (
              <button
                key={itemIndex}
                onClick={() => handleSettingClick(item.action, item)}
                className={`w-full flex items-center space-x-4 p-4 rounded-lg transition-all duration-300 ${
                  item.danger
                    ? 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/30'
                    : item.premium
                    ? 'bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10'
                }`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                  item.danger
                    ? 'bg-red-500/20'
                    : item.premium
                    ? 'bg-yellow-500/20'
                    : 'bg-white/10'
                }`}>
                  <item.icon className={`w-5 h-5 ${
                    item.danger
                      ? 'text-red-400'
                      : item.premium
                      ? 'text-yellow-400'
                      : 'text-white'
                  }`} />
                </div>
                
                <div className="flex-1 text-left">
                  <div className="flex items-center space-x-2">
                    <h3 className={`font-semibold ${
                      item.danger ? 'text-red-400' : 'text-white'
                    }`}>
                      {item.label}
                    </h3>
                    {item.premium && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                        Premium
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${
                    item.danger ? 'text-red-300/70' : 'text-gray-400'
                  }`}>
                    {item.description}
                  </p>
                </div>

                {item.action === 'toggle' && (
                  <div className={`w-12 h-6 rounded-full transition-colors duration-300 ${
                    item.enabled ? 'bg-green-500' : 'bg-gray-600'
                  }`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                      item.enabled ? 'translate-x-7 translate-y-1' : 'translate-x-1 translate-y-1'
                    }`} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Информация о версии */}
      <div className="glass-card p-6 text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">OS</span>
          </div>
          <span className="text-white font-semibold">OSINT Shield</span>
        </div>
        <p className="text-gray-400 text-sm">Версия 1.0.0</p>
        <p className="text-gray-500 text-xs mt-1">Защита от утечек данных</p>
      </div>
    </div>
  );
};

export default SettingsPage;