import React, { useState, useRef, useEffect } from 'react';
import { Button, message, Image } from 'antd';

const FileUpload = () => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Загружаем URL из localStorage при монтировании компонента
  useEffect(() => {
    const savedImageUrl = localStorage.getItem('uploadedImageUrl');
    if (savedImageUrl) {
      setImageUrl(savedImageUrl);
    }
  }, []);

  const uploadFile = async () => {
    const file = fileInputRef.current.files[0];
    if (!file) {
      message.error("Пожалуйста, выберите файл.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    try {
      const res = await fetch('https://44899c88203381ec.mokky.dev/uploads', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Ошибка при загрузке файла');
      }

      const json = await res.json();
      console.log('Success:', json);

      const uploadedImageUrl = json.url; // Получаем URL изображения
      setImageUrl(uploadedImageUrl);

      // Сохраняем URL в localStorage
      localStorage.setItem('uploadedImageUrl', uploadedImageUrl);

      message.success('Файл успешно загружен!');
    } catch (err) {
      console.error('Error during file upload:', err);
      message.error('Произошла ошибка при загрузке файла.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    // Удаляем изображение из состояния и localStorage
    setImageUrl(null);
    localStorage.removeItem('uploadedImageUrl');
    message.success('Фото удалено');
  };

  return (
    <div>
      {/* Выбор файла */}
      <input
        type="file"
        ref={fileInputRef}
      />
      {/* Кнопка для загрузки файла */}
      <Button
        type="primary"
        onClick={uploadFile}
        loading={loading}
        disabled={loading}
        style={{ marginTop: 10 }}
      >
        Загрузить
      </Button>

      {/* Если фото загружено, отображаем его и кнопку для удаления */}
      {imageUrl && (
        <div style={{ marginTop: 20 }}>
          <h3>Загруженное фото:</h3>
          <Image
            src={imageUrl}
            alt="Загруженное фото"
            style={{ maxWidth: "100%", maxHeight: "400px", objectFit: "cover" }}
          />
          <Button
            type="danger"
            onClick={handleDelete}
            style={{ marginTop: 10 }}
          >
            Удалить фото
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
