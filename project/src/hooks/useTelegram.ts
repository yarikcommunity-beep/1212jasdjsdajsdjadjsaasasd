import { useEffect, useState } from 'react';

interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
  protection_active?: boolean;
  protection_start_time?: string;
}

interface ThreatLog {
  id: string;
  type: string;
  source: string;
  timestamp: Date;
  status: 'blocked' | 'detected';
  severity: 'high' | 'medium' | 'low';
}

interface SystemLog {
  id: string;
  timestamp: Date;
  event: string;
  type: 'system' | 'security' | 'warning' | 'info';
}
export const useTelegram = () => {
const API_BASE_URL = 'https://your-backend-url.com/api'; // Замените на ваш backend URL
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProtectionActive, setIsProtectionActive] = useState(false);
  const [protectionStartTime, setProtectionStartTime] = useState<Date | null>(null);
  const [threatLogs, setThreatLogs] = useState<ThreatLog[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    
    if (tg) {
      tg.ready();
      tg.expand();
      
      // Получаем реальные данные пользователя из Telegram
      const userData = tg.initDataUnsafe?.user;
      if (userData) {
        loadUserFromBackend(userData.id);
      }
      
      setIsLoading(false);
    } else {
      // Fallback для разработки - используем тестовые данные
      const testUser = {
        id: 123456789,
        first_name: 'John',
        last_name: 'Doe',
        username: 'johndoe',
        photo_url: undefined
      };
      setUser(testUser);
      loadLocalData(123456789);
      setIsLoading(false);
    }
  }, []);

  const loadUserFromBackend = async (userId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const userData = data.user;
          setUser({
            id: userData.user_id,
            first_name: userData.first_name,
            last_name: userData.last_name,
            username: userData.username,
            photo_url: userData.photo_url,
            protection_active: userData.protection_active,
            protection_start_time: userData.protection_start_time
          });
          
          setIsProtectionActive(userData.protection_active || false);
          setProtectionStartTime(userData.protection_start_time ? new Date(userData.protection_start_time) : null);
        }
      } else {
        // Fallback к локальным данным
        loadLocalData(userId);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных с backend:', error);
      loadLocalData(userId);
    }
  };

  const loadLocalData = async (userId: number) => {
    try {
      // Загружаем состояние защиты из localStorage
      const savedProtection = localStorage.getItem(`protection_${userId}`);
      if (savedProtection) {
        const data = JSON.parse(savedProtection);
        setIsProtectionActive(data.active);
        setProtectionStartTime(data.startTime ? new Date(data.startTime) : null);
      }

      // Загружаем логи
      const savedThreatLogs = localStorage.getItem(`threat_logs_${userId}`);
      if (savedThreatLogs) {
        const logs = JSON.parse(savedThreatLogs).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
        setThreatLogs(logs);
      }

      const savedSystemLogs = localStorage.getItem(`system_logs_${userId}`);
      if (savedSystemLogs) {
        const logs = JSON.parse(savedSystemLogs).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
        setSystemLogs(logs);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных пользователя:', error);
    }
  };

  const saveUserData = (userId: number) => {
    try {
      localStorage.setItem(`protection_${userId}`, JSON.stringify({
        active: isProtectionActive,
        startTime: protectionStartTime?.toISOString()
      }));
      
      localStorage.setItem(`threat_logs_${userId}`, JSON.stringify(threatLogs));
      localStorage.setItem(`system_logs_${userId}`, JSON.stringify(systemLogs));
    } catch (error) {
      console.error('Ошибка сохранения данных:', error);
    }
  };

  const addThreatLog = (threat: Omit<ThreatLog, 'id' | 'timestamp'>) => {
    if (!user) return;
    
    try {
      // Отправляем угрозу на backend
      await fetch(`${API_BASE_URL}/threat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          threat_type: threat.type,
          source: threat.source,
          status: threat.status,
          severity: threat.severity
        })
      });
    } catch (error) {
      console.error('Ошибка отправки угрозы на backend:', error);
    }
    
    const newThreat: ThreatLog = {
      ...threat,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    
    setThreatLogs(prev => [newThreat, ...prev.slice(0, 49)]); // Храним последние 50 записей
  };

  const addSystemLog = (event: string, type: SystemLog['type'] = 'info') => {
    const newLog: SystemLog = {
      id: Date.now().toString(),
      timestamp: new Date(),
      event,
      type
    };
    
    setSystemLogs(prev => [newLog, ...prev.slice(0, 99)]); // Храним последние 100 записей
  };

  const activateProtection = async () => {
    if (!user) return false;
    
    try {
      // Отправляем запрос на backend
      const response = await fetch(`${API_BASE_URL}/protection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          active: true
        })
      });
      
      if (!response.ok) {
        throw new Error('Backend request failed');
      }
    } catch (error) {
      console.error('Ошибка активации защиты на backend:', error);
    }
    
    setIsProtectionActive(true);
    const startTime = new Date();
    setProtectionStartTime(startTime);
    
    addSystemLog('Защита от OSINT активирована', 'system');
    
    // Сохраняем данные
    setTimeout(() => saveUserData(user.id), 100);
    
    // Симулируем обнаружение угроз через некоторое время
    setTimeout(() => {
      if (Math.random() > 0.7) {
        addThreatLog({
          type: 'OSINT Scan',
          source: 'TrueCaller Bot',
          status: 'blocked',
          severity: 'high'
        });
      }
    }, 30000); // Через 30 секунд
    
    return true;
  };

  const deactivateProtection = () => {
    if (!user) return;
    
    try {
      // Отправляем запрос на backend
      await fetch(`${API_BASE_URL}/protection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          active: false
        })
      });
    } catch (error) {
      console.error('Ошибка отключения защиты на backend:', error);
    }
    
    setIsProtectionActive(false);
    setProtectionStartTime(null);
    
    addSystemLog('Защита от OSINT отключена', 'warning');
    saveUserData(user.id);
  };

  const getProtectionDuration = (): string => {
    if (!protectionStartTime) return '0 мин';
    
    const now = new Date();
    const diff = now.getTime() - protectionStartTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} дн`;
    if (hours > 0) return `${hours} ч`;
    return `${minutes} мин`;
  };
  const showPopup = (title: string, message: string, callback?: (buttonId: string) => void) => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.showPopup({ title, message }, callback);
    } else {
      alert(`${title}\n\n${message}`);
    }
  };


  const sendAdminBroadcast = async (message: string) => {
    if (!user || user.id !== 7251987829) return false;
    
    try {
      const response = await fetch(`${API_BASE_URL}/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          admin_id: user.id,
          message: message
        })
      });
      
      const result = await response.json();
      return true;
    } catch (error) {
      console.error('Ошибка рассылки:', error);
      return false;
    }
  };

  // Эффект для сохранения данных при изменении
  useEffect(() => {
    if (user) {
      saveUserData(user.id);
    }
  }, [isProtectionActive, protectionStartTime, threatLogs, systemLogs, user]);
  return { 
    user, 
    isLoading, 
    showPopup, 
    isProtectionActive,
    protectionStartTime,
    threatLogs,
    systemLogs,
    activateProtection,
    deactivateProtection,
    getProtectionDuration,
    addThreatLog,
    addSystemLog,
    sendAdminBroadcast
  };
};