import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from './store/AuthContext';

// ⚙️ Контекст, из которого берётся роль

const PUBLIC_VAPID_KEY = 'BNzjcHZGKpcIGvMLbuAxxLx7nDDduh17XkP37wB3gW-mShK-rinrnTHA3MCbS3_kaGM7gWguuzBA9nizvQKB-70';

// 🔐 Преобразование ключа
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

// 📦 Подписка на Push
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
  const { userRole } = useContext(AuthContext); // 🎭 Получаем роль из контекста

 const handleSend = async () => {
  try {
    setStatus('🔄 Подписка на push...');
    const subscription = await subscribeUser();

    // ✅ Сохраняем подписку в localStorage
    localStorage.setItem("pushSubscription", JSON.stringify(subscription));

    const isAdmin = userRole === 'admin';

    setStatus('📤 Отправка сообщения...');
    const res = await fetch('https://chechnya-product.ru/api/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription, message, isAdmin }),
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
      .then(() => console.log('✅ Старая подписка удалена'));
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
        🔔 Подписаться и отправить Push
      </button>
      <div style={{ marginTop: 10 }}>{status}</div>
    </div>
  );
};

export default PushSender;
