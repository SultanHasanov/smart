import React, { useEffect, useState } from 'react';

const PUBLIC_VAPID_KEY =
  'BD-OsbXoHHwg7KaxQsy5GsjV4YF0OV9FYl06UFs0cwd77pfvd1AF_dL2ZhnwYWAshHMBST517DAydyPBSr3FnK0';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function subscribeUser() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    const reg = await navigator.serviceWorker.ready;
    return await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
    });
  } else {
    throw new Error('Push уведомления не поддерживаются в этом браузере');
  }
}

const PushSender = () => {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsername, setSelectedUsername] = useState('');

  // 🧲 Подписка + сохранение подписки в мокке
  const handleSubscribe = async () => {
    try {
      setStatus('🔄 Подписка...');
      const subscription = await subscribeUser();
      const username = localStorage.getItem('username') || 'anonymous';

      // Проверка на существование
      const checkRes = await fetch(`https://e9bdb34d48b55567.mokky.dev/data?username=${username}`);
      const existing = await checkRes.json();

      if (existing.length > 0) {
        // Обновить
        await fetch(`https://e9bdb34d48b55567.mokky.dev/data/${existing[0].id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, subscription }),
        });
      } else {
        // Создать
        await fetch('https://e9bdb34d48b55567.mokky.dev/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, subscription }),
        });
      }

      setStatus('✅ Подписка сохранена');
      loadUsers(); // Обновить список
    } catch (err) {
      console.error(err);
      setStatus('❌ Ошибка подписки: ' + err.message);
    }
  };

  // 📤 Отправить уведомление пользователю
  const handleSend = async () => {
    if (!selectedUsername) {
      setStatus('❗ Выберите пользователя');
      return;
    }

    try {
      setStatus('📤 Отправка...');
      const res = await fetch('https://server-pwa-iota.vercel.app/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: selectedUsername, message }),
      });

      if (res.ok) {
        setStatus('✅ Уведомление отправлено');
      } else {
        setStatus('❌ Ошибка отправки');
      }
    } catch (err) {
      console.error(err);
      setStatus('❌ Ошибка: ' + err.message);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch('https://e9bdb34d48b55567.mokky.dev/data');
      const data = await res.json();
      setUsers(data.map((u) => u.username));
    } catch (err) {
      console.error('❌ Не удалось загрузить пользователей', err);
    }
  };

  useEffect(() => {
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => sub?.unsubscribe())
      .then(() => console.log('✅ Подписка удалена'));

    loadUsers();
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h2>Push-уведомление</h2>

      <button onClick={handleSubscribe} style={{ marginBottom: 10, padding: '8px 16px' }}>
        🔐 Подписаться и сохранить
      </button>

      <div style={{ margin: '10px 0' }}>
        <select
          value={selectedUsername}
          onChange={(e) => setSelectedUsername(e.target.value)}
          style={{ padding: '8px', width: '220px' }}
        >
          <option value="">👤 Выбери пользователя</option>
          {users.map((u, i) => (
            <option key={i} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>

      <input
        type="text"
        placeholder="Текст уведомления"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ width: '300px', padding: '8px', marginRight: '10px' }}
      />
      <button onClick={handleSend} style={{ padding: '8px 16px' }}>
        Отправить Push
      </button>

      <div style={{ marginTop: 10 }}>{status}</div>
    </div>
  );
};

export default PushSender;
