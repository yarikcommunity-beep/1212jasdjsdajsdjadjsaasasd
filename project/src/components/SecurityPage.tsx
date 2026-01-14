import React, { useState } from 'react';
import { Shield, Eye, AlertTriangle, Lock, Zap, Target } from 'lucide-react';
import { useTelegram } from '../hooks/useTelegram';

const SecurityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'threats' | 'logs' | 'settings'>('threats');
  const { 
    isProtectionActive, 
    threatLogs, 
    systemLogs, 
    getProtectionDuration,
    addThreatLog 
  } = useTelegram();

  // Функция для симуляции новой угрозы (только для демонстрации)
  const simulateThreat = () => {
    const threats = [
      { type: 'OSINT Scan', source: 'TrueCaller Bot', status: 'blocked' as const, severity: 'high' as const },
      { type: 'Profile Lookup', source: 'GetContact', status: 'blocked' as const, severity: 'medium' as const },
      { type: 'Data Mining', source: 'Unknown Bot', status: 'detected' as const, severity: 'low' as const },
      { type: 'Phone Search', source: 'Sync.me', status: 'blocked' as const, severity: 'high' as const },
      { type: 'Social Scan', source: 'Pipl.com', status: 'detected' as const, severity: 'medium' as const }
    ];
    
    const randomThreat = threats[Math.floor(Math.random() * threats.length)];
    addThreatLog(randomThreat);
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} дн назад`;
    if (hours > 0) return `${hours} ч назад`;
    if (minutes > 0) return `${minutes} мин назад`;
    return 'только что';
  };

  const blockedCount = threatLogs.filter(t => t.status === 'blocked').length;
  const detectedCount = threatLogs.filter(t => t.status === 'detected').length;

  const TabButton: React.FC<{ id: string; label: string; icon: React.ElementType }> = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id as any)}
      className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
        activeTab === id
          ? 'bg-white text-black'
          : 'bg-white/10 text-white hover:bg-white/20'
      }`}
    >
      <Icon className="w-5 h-5 mx-auto mb-1" />
      <span className="text-sm">{label}</span>
    </button>
  );

  return (
    <div className="space-y-8 pb-24">
      {/* Заголовок */}
      <div className="glass-card p-6 text-center">
        <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br rounded-2xl mb-4 border ${
          isProtectionActive 
            ? 'from-green-500/20 to-blue-500/20 border-green-500/30' 
            : 'from-red-500/20 to-orange-500/20 border-red-500/30'
        }`}>
          <Shield className={`w-8 h-8 ${isProtectionActive ? 'text-green-400' : 'text-red-400'}`} />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Центр безопасности</h1>
        <p className="text-gray-400">Мониторинг угроз и защита данных</p>
      </div>

      {/* Статус защиты */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Статус защиты</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              isProtectionActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
            }`} />
            <span className={`font-semibold ${
              isProtectionActive ? 'text-green-400' : 'text-gray-400'
            }`}>
              {isProtectionActive ? `Активна (${getProtectionDuration()})` : 'Неактивна'}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
            <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-400">{blockedCount}</p>
            <p className="text-xs text-green-300/70">Заблокировано</p>
          </div>
          <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <Eye className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-400">{detectedCount}</p>
            <p className="text-xs text-yellow-300/70">Обнаружено</p>
          </div>
          <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <Zap className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-400">1.2s</p>
            <p className="text-xs text-blue-300/70">Время реакции</p>
          </div>
        </div>
        
        {/* Кнопка для симуляции угрозы (только для демонстрации) */}
        {isProtectionActive && (
          <button
            onClick={simulateThreat}
            className="mt-4 w-full py-2 px-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm hover:bg-yellow-500/30 transition-colors"
          >
            🧪 Симулировать угрозу (для демонстрации)
          </button>
        )}
      </div>

      {/* Табы */}
      <div className="glass-card p-2">
        <div className="flex space-x-2">
          <TabButton id="threats" label="Угрозы" icon={AlertTriangle} />
          <TabButton id="logs" label="Логи" icon={Eye} />
          <TabButton id="settings" label="Настройки" icon={Lock} />
        </div>
      </div>

      {/* Контент табов */}
      <div className="glass-card p-6">
        {activeTab === 'threats' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">Обнаруженные угрозы</h3>
            {threatLogs.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">
                  {isProtectionActive ? 'Угроз пока не обнаружено' : 'Включите защиту для мониторинга угроз'}
                </p>
              </div>
            ) : (
              threatLogs.map((threat, index) => (
              <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">{threat.type}</span>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    threat.status === 'blocked' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {threat.status === 'blocked' ? 'Заблокировано' : 'Обнаружено'}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Источник: {threat.source}</span>
                  <span className="text-gray-500">{formatTimeAgo(threat.timestamp)}</span>
                </div>
                <div className={`mt-2 w-full h-1 rounded-full ${
                  threat.severity === 'high' ? 'bg-red-500' :
                  threat.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
              </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">Журнал событий</h3>
            {systemLogs.length === 0 ? (
              <div className="text-center py-8">
                <Eye className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Журнал событий пуст</p>
              </div>
            ) : (
              systemLogs.map((log, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <span className="text-gray-500 font-mono text-sm">
                  {log.timestamp.toLocaleTimeString('ru-RU')}
                </span>
                <div className={`w-2 h-2 rounded-full ${
                  log.type === 'security' ? 'bg-red-500' :
                  log.type === 'warning' ? 'bg-yellow-500' :
                  log.type === 'system' ? 'bg-green-500' : 'bg-blue-500'
                }`} />
                <span className="text-white text-sm flex-1">{log.event}</span>
              </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white mb-4">Настройки безопасности</h3>
            
            {[
              { title: 'Автоблокировка OSINT', description: 'Автоматически блокировать попытки сканирования', enabled: true },
              { title: 'Уведомления о угрозах', description: 'Получать мгновенные уведомления о подозрительной активности', enabled: true },
              { title: 'Скрытие статуса', description: 'Скрывать время последнего посещения', enabled: false },
              { title: 'Анонимный режим', description: 'Максимальная приватность (только премиум)', enabled: false, premium: true }
            ].map((setting, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-white font-semibold">{setting.title}</h4>
                    {setting.premium && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                        Premium
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{setting.description}</p>
                </div>
                <button
                  disabled={setting.premium}
                  className={`w-12 h-6 rounded-full transition-colors duration-300 ${
                    setting.enabled && !setting.premium
                      ? 'bg-green-500'
                      : 'bg-gray-600'
                  } ${setting.premium ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                    setting.enabled && !setting.premium ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityPage;