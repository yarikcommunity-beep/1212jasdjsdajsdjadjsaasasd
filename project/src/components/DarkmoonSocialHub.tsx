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

const sanitizeUsername = (value: string) => value.replace(/[^A-Za-z]/g, '').slice(0, 18).toUpperCase();

const isValidUsername = (value: string) => /^[A-Z]{4,}$/.test(value);

const mergeSeedUsers = (users: SocialUser[]) => {
  const mergedUsers = [...users];
  seedUsers.forEach((seedUser) => {
    if (!mergedUsers.some((user) => user.username === seedUser.username)) {
      mergedUsers.push(seedUser);
    }
  });
  return mergedUsers;
};

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
    const nextUsers = mergeSeedUsers(parsedUsers);
    window.localStorage.setItem(directoryStorageKey, JSON.stringify(nextUsers));
    return nextUsers;
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
  const [profileMessage, setProfileMessage] = useState('Выбери свободный username.');
  const [query, setQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<SocialUser | null>(null);

  useEffect(() => {
    const storedUsers = readUsers();
    setUsers(storedUsers);

    const rawProfile = window.localStorage.getItem(profileStorageKey);
    if (!rawProfile) {
      return;
    }

    try {
      const storedProfile = JSON.parse(rawProfile) as SocialUser;
      setCurrentUser(storedProfile);
      setUsername(storedProfile.username);
    } catch {
      window.localStorage.removeItem(profileStorageKey);
    }
  }, []);

  const normalizedQuery = normalizeUsername(query);
  const normalizedUsername = normalizeUsername(username);

  const isDuplicateUsername = users.some(
    (user) => user.username === normalizedUsername && user.username !== currentUser?.username,
  );

  const usernameFeedback = useMemo(() => {
    if (!normalizedUsername) {
      return 'Введи username: минимум 4 английские буквы.';
    }

    if (normalizedUsername.length < 4) {
      return 'Минимум 4 английские буквы.';
    }

    if (!isValidUsername(normalizedUsername)) {
      return 'Только латинские буквы A-Z.';
    }

    if (isDuplicateUsername) {
      return `Username ${normalizedUsername} уже занят.`;
    }

    if (currentUser?.username === normalizedUsername) {
      return `@${normalizedUsername} уже закреплен за тобой.`;
    }

    return `@${normalizedUsername} свободен.`;
  }, [currentUser?.username, isDuplicateUsername, normalizedUsername]);

  const filteredUsers = useMemo(() => {
    if (!normalizedQuery) {
      return users;
    }

    return users.filter((user) => user.username.includes(normalizedQuery));
  }, [normalizedQuery, users]);

  const canSaveUsername =
    isValidUsername(normalizedUsername) &&
    !isDuplicateUsername &&
    currentUser?.username !== normalizedUsername;

  const saveDirectory = (nextUsers: SocialUser[]) => {
    setUsers(nextUsers);
    window.localStorage.setItem(directoryStorageKey, JSON.stringify(nextUsers));
  };

  const handleUsernameChange = (value: string) => {
    setUsername(sanitizeUsername(value));
    setProfileMessage('Выбери свободный username.');
  };

  const handleCreateProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSaveUsername) {
      setProfileMessage(usernameFeedback);
      return;
    }

    const nextUser = {
      username: normalizedUsername,
      signal: currentUser ? 'darkmoon profile updated' : 'new darkmoon profile',
    };
    const withoutPreviousProfile = currentUser
      ? users.filter((user) => user.username !== currentUser.username)
      : users;
    const nextUsers = [nextUser, ...withoutPreviousProfile];
    saveDirectory(nextUsers);
    setCurrentUser(nextUser);
    setSelectedUser(nextUser);
    setProfileMessage(`Профиль @${normalizedUsername} сохранен.`);
    window.localStorage.setItem(profileStorageKey, JSON.stringify(nextUser));
  };

  const handleTabClick = (panel: Panel) => {
    setActivePanel(panel);

    if (panel === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearchChange = (value: string) => {
    setQuery(sanitizeUsername(value));
    setSelectedUser(null);
  };

  return (
    <>
      <div className={`social-glass-panel ${activePanel === 'home' ? '' : 'is-open'}`}>
        {activePanel === 'profile' && (
          <section aria-label="Create profile">
            <div className="panel-kicker">profile signal</div>
            <div className="panel-heading">
              <h2>Создай профиль</h2>
              <span>{users.length.toString().padStart(2, '0')} signals</span>
            </div>
            <p>
              Username должен быть уникальным: минимум 4 символа, только английские буквы.
            </p>

            {currentUser ? (
              <div className="current-profile-card">
                <span>Твой профиль</span>
                <strong>@{currentUser.username}</strong>
                <small>{currentUser.signal}</small>
              </div>
            ) : (
              <div className="profile-empty-card">
                <span>Профиль еще не создан</span>
                <small>Займи свободный username и появись в поиске.</small>
              </div>
            )}

            <form className="profile-form" onSubmit={handleCreateProfile}>
              <label htmlFor="username">username</label>
              <div className="username-input-shell">
                <span>@</span>
                <input
                  autoComplete="off"
                  id="username"
                  maxLength={18}
                  onChange={(event) => handleUsernameChange(event.target.value)}
                  placeholder="DARKMOON"
                  spellCheck={false}
                  type="text"
                  value={username}
                />
              </div>
              <button disabled={!canSaveUsername} type="submit">
                {currentUser ? 'save username' : 'create profile'}
              </button>
            </form>
            <p
              className={`profile-message ${
                canSaveUsername ? 'is-success' : isDuplicateUsername ? 'is-error' : ''
              }`}
              aria-live="polite"
            >
              {profileMessage === 'Выбери свободный username.' ? usernameFeedback : profileMessage}
            </p>
          </section>
        )}

        {activePanel === 'search' && (
          <section aria-label="Search users">
            <div className="panel-kicker">user search</div>
            <div className="panel-heading">
              <h2>Найти людей</h2>
              <span>{filteredUsers.length.toString().padStart(2, '0')} found</span>
            </div>
            <p>Ищи пользователей по username в локальной darkmoon-директории.</p>
            <label className="search-field" htmlFor="search-users">
              <Search size={18} />
              <input
                autoComplete="off"
                id="search-users"
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Введите username"
                spellCheck={false}
                type="search"
                value={query}
              />
            </label>
            <div className="user-results">
              {selectedUser && (
                <div className="selected-user-card">
                  <span>Открытый профиль</span>
                  <strong>@{selectedUser.username}</strong>
                  <small>{selectedUser.signal}</small>
                </div>
              )}

              {filteredUsers.map((user) => (
                <article className="user-result-card" key={user.username}>
                  <div>
                    <strong>@{user.username}</strong>
                    <span>{user.signal}</span>
                  </div>
                  <button onClick={() => setSelectedUser(user)} type="button">
                    open
                  </button>
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
