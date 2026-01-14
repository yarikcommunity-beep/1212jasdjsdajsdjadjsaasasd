#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Telegram Bot для OSINT Protection Mini App
Обрабатывает команды, показывает приветствие и управляет состоянием защиты
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional
import aiohttp
from aiohttp import web, ClientSession
import sqlite3
import os

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Конфигурация
BOT_TOKEN = "8120721611:AAH4lvAdaV-1x4C9ssqPj2vAOdYz0JhhXGA"
WEBAPP_URL = "https://telegram-osint-profi-tvfu.bolt.host"
ADMIN_ID = 7251987829

class TelegramBot:
    def __init__(self, token: str):
        self.token = token
        self.api_url = f"https://api.telegram.org/bot{token}"
        self.session: Optional[ClientSession] = None
        self.init_database()
    
    def init_database(self):
        """Инициализация базы данных SQLite"""
        self.conn = sqlite3.connect('users.db', check_same_thread=False)
        cursor = self.conn.cursor()
        
        # Создаем таблицу пользователей
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY,
                username TEXT,
                first_name TEXT,
                last_name TEXT,
                photo_url TEXT,
                protection_active BOOLEAN DEFAULT FALSE,
                protection_start_time TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Создаем таблицу логов угроз
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS threat_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                threat_type TEXT,
                source TEXT,
                status TEXT,
                severity TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (user_id)
            )
        ''')
        
        # Создаем таблицу системных логов
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS system_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                event TEXT,
                event_type TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (user_id)
            )
        ''')
        
        self.conn.commit()
        logger.info("База данных инициализирована")
    
    async def start_session(self):
        """Запуск HTTP сессии"""
        self.session = ClientSession()
    
    async def close_session(self):
        """Закрытие HTTP сессии"""
        if self.session:
            await self.session.close()
    
    async def send_message(self, chat_id: int, text: str, reply_markup: Dict = None) -> bool:
        """Отправка сообщения пользователю"""
        try:
            data = {
                'chat_id': chat_id,
                'text': text,
                'parse_mode': 'HTML'
            }
            
            if reply_markup:
                data['reply_markup'] = json.dumps(reply_markup)
            
            async with self.session.post(f"{self.api_url}/sendMessage", json=data) as response:
                result = await response.json()
                return result.get('ok', False)
        except Exception as e:
            logger.error(f"Ошибка отправки сообщения: {e}")
            return False
    
    async def get_user_profile_photos(self, user_id: int) -> Optional[str]:
        """Получение URL аватарки пользователя"""
        try:
            async with self.session.get(f"{self.api_url}/getUserProfilePhotos", 
                                      params={'user_id': user_id, 'limit': 1}) as response:
                result = await response.json()
                
                if result.get('ok') and result['result']['total_count'] > 0:
                    file_id = result['result']['photos'][0][-1]['file_id']
                    
                    # Получаем информацию о файле
                    async with self.session.get(f"{self.api_url}/getFile", 
                                              params={'file_id': file_id}) as file_response:
                        file_result = await file_response.json()
                        
                        if file_result.get('ok'):
                            file_path = file_result['result']['file_path']
                            return f"https://api.telegram.org/file/bot{self.token}/{file_path}"
                
                return None
        except Exception as e:
            logger.error(f"Ошибка получения аватарки: {e}")
            return None
    
    def save_user(self, user_data: Dict[str, Any], photo_url: str = None):
        """Сохранение данных пользователя в БД"""
        cursor = self.conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO users 
            (user_id, username, first_name, last_name, photo_url, last_activity)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            user_data['id'],
            user_data.get('username'),
            user_data.get('first_name'),
            user_data.get('last_name'),
            photo_url,
            datetime.now()
        ))
        
        self.conn.commit()
        logger.info(f"Пользователь {user_data['id']} сохранен в БД")
    
    def get_user(self, user_id: int) -> Optional[Dict]:
        """Получение данных пользователя из БД"""
        cursor = self.conn.cursor()
        cursor.execute('SELECT * FROM users WHERE user_id = ?', (user_id,))
        row = cursor.fetchone()
        
        if row:
            columns = [description[0] for description in cursor.description]
            return dict(zip(columns, row))
        return None
    
    def update_protection_status(self, user_id: int, active: bool):
        """Обновление статуса защиты"""
        cursor = self.conn.cursor()
        
        if active:
            cursor.execute('''
                UPDATE users 
                SET protection_active = TRUE, protection_start_time = ?
                WHERE user_id = ?
            ''', (datetime.now(), user_id))
            
            # Добавляем системный лог
            cursor.execute('''
                INSERT INTO system_logs (user_id, event, event_type)
                VALUES (?, ?, ?)
            ''', (user_id, 'Защита от OSINT активирована', 'system'))
        else:
            cursor.execute('''
                UPDATE users 
                SET protection_active = FALSE, protection_start_time = NULL
                WHERE user_id = ?
            ''', (user_id,))
            
            # Добавляем системный лог
            cursor.execute('''
                INSERT INTO system_logs (user_id, event, event_type)
                VALUES (?, ?, ?)
            ''', (user_id, 'Защита от OSINT отключена', 'warning'))
        
        self.conn.commit()
    
    def add_threat_log(self, user_id: int, threat_type: str, source: str, status: str, severity: str):
        """Добавление лога угрозы"""
        cursor = self.conn.cursor()
        cursor.execute('''
            INSERT INTO threat_logs (user_id, threat_type, source, status, severity)
            VALUES (?, ?, ?, ?, ?)
        ''', (user_id, threat_type, source, status, severity))
        self.conn.commit()
    
    async def handle_start_command(self, user_data: Dict[str, Any]):
        """Обработка команды /start"""
        user_id = user_data['id']
        first_name = user_data.get('first_name', 'Пользователь')
        
        # Получаем аватарку пользователя
        photo_url = await self.get_user_profile_photos(user_id)
        
        # Сохраняем пользователя в БД
        self.save_user(user_data, photo_url)
        
        # Приветственное сообщение
        welcome_text = f"""🛡️ <b>Добро пожаловать в OSINT Shield, {first_name}!</b>

🚀 <b>Наш проект каждый день обновляется</b> и становится лучше!

✨ <b>Что мы предлагаем:</b>
• Защита от OSINT-пробивов
• Мониторинг угроз в реальном времени  
• Уведомления о подозрительной активности
• Журнал всех попыток получения ваших данных

🔒 <b>Ваша приватность — наш приоритет!</b>

Нажмите "Продолжить" чтобы начать использование."""
        
        keyboard = {
            'inline_keyboard': [[
                {'text': '🚀 Продолжить', 'callback_data': 'continue_to_app'}
            ]]
        }
        
        await self.send_message(user_id, welcome_text, keyboard)
    
    async def handle_continue_callback(self, user_id: int):
        """Обработка нажатия кнопки 'Продолжить'"""
        text = f"""✅ <b>Всё готово!</b>

🎯 <b>Переходите в Mini App</b> для настройки защиты и мониторинга угроз.

🔗 <b>Ссылка на приложение:</b>
{WEBAPP_URL}

💡 <b>Совет:</b> Добавьте бота в избранное для быстрого доступа к уведомлениям о безопасности."""
        
        keyboard = {
            'inline_keyboard': [[
                {'text': '🚀 Открыть Mini App', 'web_app': {'url': WEBAPP_URL}}
            ]]
        }
        
        await self.send_message(user_id, text, keyboard)

# Создаем экземпляр бота
bot = TelegramBot(BOT_TOKEN)

# Web сервер для обработки запросов от Mini App
async def handle_webhook(request):
    """Обработка webhook от Telegram"""
    try:
        data = await request.json()
        logger.info(f"Получен webhook: {data}")
        
        if 'message' in data:
            message = data['message']
            user = message['from']
            
            if message.get('text') == '/start':
                await bot.handle_start_command(user)
        
        elif 'callback_query' in data:
            callback = data['callback_query']
            user_id = callback['from']['id']
            callback_data = callback['data']
            
            if callback_data == 'continue_to_app':
                await bot.handle_continue_callback(user_id)
        
        return web.Response(text='OK')
    
    except Exception as e:
        logger.error(f"Ошибка обработки webhook: {e}")
        return web.Response(text='Error', status=500)

async def handle_user_data(request):
    """API для получения данных пользователя"""
    try:
        data = await request.json()
        user_id = data.get('user_id')
        
        if not user_id:
            return web.json_response({'error': 'user_id required'}, status=400)
        
        user = bot.get_user(user_id)
        if user:
            return web.json_response({
                'success': True,
                'user': user
            })
        else:
            return web.json_response({'error': 'User not found'}, status=404)
    
    except Exception as e:
        logger.error(f"Ошибка получения данных пользователя: {e}")
        return web.json_response({'error': str(e)}, status=500)

async def handle_protection_toggle(request):
    """API для включения/отключения защиты"""
    try:
        data = await request.json()
        user_id = data.get('user_id')
        active = data.get('active')
        
        if user_id is None or active is None:
            return web.json_response({'error': 'user_id and active required'}, status=400)
        
        # Обновляем статус защиты
        bot.update_protection_status(user_id, active)
        
        # Отправляем уведомление пользователю
        if active:
            message = """🛡️ <b>Защита активирована!</b>

✅ Теперь я буду отслеживать попытки получения ваших данных и уведомлять вас о любых подозрительных активностях.

🔔 <b>Вы будете получать уведомления о:</b>
• OSINT-сканированиях
• Попытках пробива через боты
• Поиске в базах данных
• Подозрительной активности

🚀 <b>Защита работает в реальном времени!</b>"""
        else:
            message = """⚠️ <b>Защита отключена</b>

❌ Мониторинг угроз приостановлен. Вы больше не будете получать уведомления о попытках получения ваших данных.

💡 <b>Рекомендуем включить защиту обратно</b> для обеспечения безопасности вашего профиля."""
        
        await bot.send_message(user_id, message)
        
        return web.json_response({'success': True})
    
    except Exception as e:
        logger.error(f"Ошибка переключения защиты: {e}")
        return web.json_response({'error': str(e)}, status=500)

async def handle_add_threat(request):
    """API для добавления угрозы"""
    try:
        data = await request.json()
        user_id = data.get('user_id')
        threat_type = data.get('threat_type')
        source = data.get('source')
        status = data.get('status')
        severity = data.get('severity')
        
        if not all([user_id, threat_type, source, status, severity]):
            return web.json_response({'error': 'All fields required'}, status=400)
        
        # Добавляем угрозу в БД
        bot.add_threat_log(user_id, threat_type, source, status, severity)
        
        # Отправляем уведомление пользователю
        status_text = '🛡️ Заблокировано' if status == 'blocked' else '👁️ Обнаружено'
        severity_emoji = '🔴' if severity == 'high' else '🟡' if severity == 'medium' else '🟢'
        
        message = f"""🚨 <b>Обнаружена угроза!</b>

{severity_emoji} <b>Тип:</b> {threat_type}
🔍 <b>Источник:</b> {source}
⚡ <b>Статус:</b> {status_text}
🕐 <b>Время:</b> {datetime.now().strftime('%H:%M:%S')}

🛡️ <b>Ваши данные под защитой!</b>"""
        
        await bot.send_message(user_id, message)
        
        return web.json_response({'success': True})
    
    except Exception as e:
        logger.error(f"Ошибка добавления угрозы: {e}")
        return web.json_response({'error': str(e)}, status=500)

async def handle_admin_broadcast(request):
    """API для админской рассылки"""
    try:
        data = await request.json()
        admin_id = data.get('admin_id')
        message = data.get('message')
        
        if admin_id != ADMIN_ID:
            return web.json_response({'error': 'Access denied'}, status=403)
        
        if not message:
            return web.json_response({'error': 'Message required'}, status=400)
        
        # Получаем всех пользователей
        cursor = bot.conn.cursor()
        cursor.execute('SELECT user_id FROM users')
        users = cursor.fetchall()
        
        # Отправляем сообщение всем пользователям
        success_count = 0
        for (user_id,) in users:
            broadcast_message = f"📢 <b>Обновление бота</b>\n\n{message}"
            if await bot.send_message(user_id, broadcast_message):
                success_count += 1
        
        return web.json_response({
            'success': True,
            'sent_to': success_count,
            'total_users': len(users)
        })
    
    except Exception as e:
        logger.error(f"Ошибка рассылки: {e}")
        return web.json_response({'error': str(e)}, status=500)

async def init_app():
    """Инициализация приложения"""
    await bot.start_session()
    
    app = web.Application()
    
    # Добавляем CORS middleware
    async def cors_middleware(request, handler):
        response = await handler(request)
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response
    
    app.middlewares.append(cors_middleware)
    
    # Маршруты
    app.router.add_post('/webhook', handle_webhook)
    app.router.add_post('/api/user', handle_user_data)
    app.router.add_post('/api/protection', handle_protection_toggle)
    app.router.add_post('/api/threat', handle_add_threat)
    app.router.add_post('/api/broadcast', handle_admin_broadcast)
    
    # Обработка OPTIONS запросов
    async def options_handler(request):
        return web.Response(headers={
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        })
    
    app.router.add_route('OPTIONS', '/{path:.*}', options_handler)
    
    return app

async def main():
    """Главная функция"""
    app = await init_app()
    
    # Устанавливаем webhook
    webhook_url = "https://your-server.com/webhook"  # Замените на ваш URL
    async with bot.session.post(f"{bot.api_url}/setWebhook", 
                               json={'url': webhook_url}) as response:
        result = await response.json()
        if result.get('ok'):
            logger.info(f"Webhook установлен: {webhook_url}")
        else:
            logger.error(f"Ошибка установки webhook: {result}")
    
    # Запускаем сервер
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, '0.0.0.0', 8000)
    await site.start()
    
    logger.info("Бот запущен на порту 8000")
    
    try:
        await asyncio.Future()  # Бесконечное ожидание
    finally:
        await bot.close_session()

if __name__ == '__main__':
    asyncio.run(main())