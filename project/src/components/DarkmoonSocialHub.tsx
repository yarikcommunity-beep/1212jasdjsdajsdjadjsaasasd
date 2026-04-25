'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Compass, Search, UserRound } from 'lucide-react';

type SocialUser = {
  username: string;
  signal: string;
};

type Panel = 'home' | 'profile' | 'search';

const directoryStorageKey = 'darkmoon-directory';
const profileStorageKey = 'darkmoon-profile';

const seedUsers: SocialUser[] = [
  { username: 'VOID', signal: 'black orbit online' },
  { username: 'MOON', signal: 'silent profile found' },
  { username: 'NOVA', signal: 'white gravity user' },
  { username: 'ECLIPSE', signal: 'hidden identity active' },
];

const normalizeUsername = (value: string) => value.trim().toUpperCase();

const isValidUsername = (value: string) => /^[A-Za-z]{4,}$/.test(value);

const readUsers = () => {
  if (typeof window === 'undefined') {
    return seedUsers;
  }

  const rawUsers = window.localStorage.getItem(directoryStorageKey);
  if (!rawUsers) {
    window.localStorage.setItem(directoryStorageKey, JSON.stringify(seedUsers));
    return seedUsers;
  }

  try {
    const parsedUsers = JSON.parse(rawUsers) as SocialUser[];
    return parsedUsers.length > 0 ? parsedUsers : seedUsers;
  } catch {
    window.localStorage.setItem(directoryStorageKey, JSON.stringify(seedUsers));
    return seedUsers;
  }
};

export default function DarkmoonSocialHub() {
  const [activePanel, setActivePanel] = useState<Panel>('home');
  const [users, setUsers] = useState<SocialUser[]>(seedUsers);
  const [currentUser, setCurrentUser] = useState<SocialUser | null>(null);
  const [username, setUsername] = useState('');
  const [profileMessage, setProfileMessage] = useState('Username: минимум 4 английские буквы.');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const storedUsers = readUsers();
    setUsers(storedUsers);

    const rawProfile = window.localStorage.getItem(profileStorageKey);
    if (!rawProfile) {
      return;
    }

    try {
      setCurrentUser(JSON.parse(rawProfile) as SocialUser);
    } catch {
      window.localStorage.removeItem(profileStorageKey);
    }
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = normalizeUsername(query);
    if (!normalizedQuery) {
      return users;
    }

    return users.filter((user) => user.username.includes(normalizedQuery));
  }, [query, users]);

  const saveDirectory = (nextUsers: SocialUser[]) => {
    setUsers(nextUsers);
    window.localStorage.setItem(directoryStorageKey, JSON.stringify(nextUsers));
  };

  const handleCreateProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextUsername = normalizeUsername(username);
    if (!isValidUsername(username.trim())) {
      setProfileMessage('Ошибка: только английские буквы, минимум 4 символа.');
      return;
    }

    const alreadyExists = users.some((user) => user.username === nextUsername);
    if (alreadyExists) {
      setProfileMessage(`Username ${nextUsername} уже занят.`);
      return;
    }

    const nextUser = {
      username: nextUsername,
      signal: 'new darkmoon profile',
    };
    const nextUsers = [nextUser, ...users];
    saveDirectory(nextUsers);
    setCurrentUser(nextUser);
    setUsername('');
    setProfileMessage(`Профиль @${nextUsername} создан.`);
    window.localStorage.setItem(profileStorageKey, JSON.stringify(nextUser));
  };

  const handleTabClick = (panel: Panel) => {
    setActivePanel(panel);

    if (panel === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <div className={`social-glass-panel ${activePanel === 'home' ? '' : 'is-open'}`}>
        {activePanel === 'profile' && (
          <section aria-label="Create profile">
            <div className="panel-kicker">profile signal</div>
            <h2>Создай свой профиль</h2>
            <p>
              Username уникальный: нельзя повторять, минимум 4 буквы, только латиница.
            </p>

            {currentUser && (
              <div className="current-profile-card">
                <span>Твой профиль</span>
                <strong>@{currentUser.username}</strong>
                <small>{currentUser.signal}</small>
              </div>
            )}

            <form className="profile-form" onSubmit={handleCreateProfile}>
              <label htmlFor="username">username</label>
              <input
                id="username"
                maxLength={18}
                onChange={(event) => setUsername(event.target.value)}
                pattern="[A-Za-z]{4,}"
                placeholder="DARKMOON"
                type="text"
                value={username}
              />
              <button type="submit">create profile</button>
            </form>
            <p className="profile-message">{profileMessage}</p>
          </section>
        )}

        {activePanel === 'search' && (
          <section aria-label="Search users">
            <div className="panel-kicker">user search</div>
            <h2>Найти людей</h2>
            <p>Поиск работает по username в локальной darkmoon-директории.</p>
            <label className="search-field" htmlFor="search-users">
              <Search size={18} />
              <input
                id="search-users"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Введите username"
                type="search"
                value={query}
              />
            </label>
            <div className="user-results">
              {filteredUsers.map((user) => (
                <article className="user-result-card" key={user.username}>
                  <div>
                    <strong>@{user.username}</strong>
                    <span>{user.signal}</span>
                  </div>
                  <button type="button">open</button>
                </article>
              ))}
              {filteredUsers.length === 0 && (
                <div className="empty-results">Никого не найдено.</div>
              )}
            </div>
          </section>
        )}
      </div>

      <nav className="iphone-glass-nav" aria-label="Darkmoon navigation">
        <button
          className={activePanel === 'home' ? 'is-active' : ''}
          onClick={() => handleTabClick('home')}
          type="button"
        >
          <Compass size={20} />
          <span>Void</span>
        </button>
        <button
          className={activePanel === 'profile' ? 'is-active' : ''}
          onClick={() => handleTabClick('profile')}
          type="button"
        >
          <UserRound size={20} />
          <span>Profile</span>
        </button>
        <button
          className={activePanel === 'search' ? 'is-active' : ''}
          onClick={() => handleTabClick('search')}
          type="button"
        >
          <Search size={20} />
          <span>Search</span>
        </button>
      </nav>
    </>
  );
}
