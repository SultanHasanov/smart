import React, { useEffect, useState } from 'react';
import { Modal, Input } from 'antd';

const frames = [
  `
  |\\---/|
  | o_o |
   \\_^_/  [взламываю...]
  `,
  `
  |\\---/|
  | -_- |
   /   \\  [взлом почти готов]
  `,
  `
  |\\---/|
  | >_< |
  /_____| [успешно получен root-доступ]
  `
];

const commandsHelp = `
Доступные команды:
- whoami — кто ты
- fortune — предсказание
- clear — очистить терминал
- help — список команд
`;

const HackerCatTerminal = () => {
  const [visible, setVisible] = useState(false);
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState('🐱 Запуск хакер-кота...\n');
  const [frameIndex, setFrameIndex] = useState(0);

  const openTerminal = () => {
    setVisible(true);
    setCommand('');
    setOutput('🐱 Запуск хакер-кота...\n');
    setFrameIndex(0);
  };

  useEffect(() => {
    const keyboardHandler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'K') {
        openTerminal();
      }
    };
  
    const customEventHandler = () => {
      openTerminal(); // Обработка события hackerCatOpen (мобильная пасхалка)
    };
  
    window.addEventListener('keydown', keyboardHandler);
    window.addEventListener('hackerCatOpen', customEventHandler);
    window.activateHackerCat = openTerminal;
  
    return () => {
      window.removeEventListener('keydown', keyboardHandler);
      window.removeEventListener('hackerCatOpen', customEventHandler);
    };
  }, []);
  

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % frames.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [visible]);

  const handleCommand = (value) => {
    setCommand('');
    switch (value.toLowerCase()) {
      case 'whoami':
        setOutput((prev) => prev + '\n👤 Я — Хакер Кот. Защитник кода и багов.\n');
        break;
      case 'fortune':
        setOutput((prev) => prev + '\n🔮 Сегодня всё задеплоится с первого раза. Возможно.\n');
        break;
      case 'clear':
        setOutput('');
        break;
      case 'help':
        setOutput((prev) => prev + `\n${commandsHelp}`);
        break;
      default:
        setOutput((prev) => prev + `\n🤷 Неизвестная команда: ${value}`);
    }
  };

  return (
    <Modal
      open={visible}
      title="🐱 Хакер Кот"
      onCancel={() => setVisible(false)}
      footer={null}
      width={600}
    >
      <pre style={{
        background: 'black',
        color: 'lime',
        minHeight: 180,
        fontFamily: 'monospace',
        padding: 12,
        borderRadius: 10,
        marginBottom: 10
      }}>
        {frames[frameIndex] + '\n' + output}
      </pre>
      <Input
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        onPressEnter={() => handleCommand(command)}
        placeholder="Введи команду (help — список)"
      />
    </Modal>
  );
};

export default HackerCatTerminal;
