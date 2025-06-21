import React, { useEffect, useState } from 'react';

// 🔑 Твой публичный VAPID ключ с сервера
const PUBLIC_VAPID_KEY = 'BD-OsbXoHHwg7KaxQsy5GsjV4YF0OV9FYl06UFs0cwd77pfvd1AF_dL2ZhnwYWAshHMBST517DAydyPBSr3FnK0'; // ← вставь СВОЙ ключ сюда

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
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

  const handleSend = async () => {
    try {
      setStatus('🔄 Подписка на push...');
      const subscription = await subscribeUser();

      setStatus('📤 Отправка сообщения...');
      const res = await fetch('http://localhost:4000/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription, message }),
      });

      if (res.ok) {
        setStatus('✅ Уведомление отправлено!');
      } else {
        setStatus('❌ Ошибка при отправке уведомления');
      }
    } catch (err) {
      console.error(err);
      setStatus('❌ Ошибка: ' + err.message);
    }
  };

   // 🔥 Удалить старую подписку при монтировании
  useEffect(() => {
    navigator.serviceWorker.ready
  .then(reg => reg.pushManager.getSubscription())
  .then(sub => sub?.unsubscribe())
  .then(() => console.log('✅ Подписка удалена'));

  }, []);

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h2>Push-уведомление</h2>
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
