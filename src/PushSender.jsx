import { useState } from 'react';

export default function PushSender() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState('');

  const sendPush = async () => {
    try {
      const res = await fetch('https://chechnya-product.ru/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message }),
      });

      if (res.ok) {
        setResult('✅ Уведомление отправлено!');
      } else {
        setResult('❌ Ошибка при отправке');
      }
    } catch (error) {
      setResult('❌ Сеть или ошибка CORS');
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '400px' }}>
      <h3>Отправка пуш-уведомления</h3>
      <input
        type="text"
        placeholder="Заголовок"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: '100%', marginBottom: '0.5rem' }}
      />
      <textarea
        placeholder="Сообщение"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ width: '100%', height: '80px', marginBottom: '0.5rem' }}
      />
      <button onClick={sendPush} style={{ padding: '0.5rem 1rem' }}>
        📤 Отправить
      </button>
      {result && <p>{result}</p>}
    </div>
  );
}
