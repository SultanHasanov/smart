import React, { useEffect } from "react";

const YMap = ({ from, to, onRouteInfo }) => {
  useEffect(() => {
    if (!from || !to || !window.ymaps) return;

    window.ymaps.ready(init);

    async function init() {
      try {
        const map = new window.ymaps.Map(`map-${from}-${to}`, {
          center: [43.3185, 45.6987],
          zoom: 12,
          controls: [],
        });

        // Геокодирование точек
        const [fromGeocode, toGeocode] = await Promise.all([
          window.ymaps.geocode(from),
          window.ymaps.geocode(to)
        ]);
        
        if (!fromGeocode.geoObjects.get(0) || !toGeocode.geoObjects.get(0)) {
          throw new Error("Один из адресов не найден");
        }
        
        const fromCoords = fromGeocode.geoObjects.get(0).geometry.getCoordinates();
        const toCoords = toGeocode.geoObjects.get(0).geometry.getCoordinates();

        // Создаем метки с подписями
        const fromPlacemark = new window.ymaps.Placemark(
          fromCoords,
          { iconCaption: 'Магазин'},
        );
        
        const toPlacemark = new window.ymaps.Placemark(
          toCoords,
          { iconCaption: 'Клиент' },
        );

        map.geoObjects.add(fromPlacemark);
        map.geoObjects.add(toPlacemark);
        
        // Центрируем карту чтобы были видны обе точки
        map.setBounds(map.geoObjects.getBounds(), { checkZoomRange: true });

        // Создаем маршруты
        const [carRoute, pedestrianRoute] = await Promise.all([
          window.ymaps.route([from, to], { routingMode: "auto" }).catch(e => {
            
            console.error("Ошибка автомобильного маршрута:", e);
            return null;
          }),
          window.ymaps.route([from, to], { routingMode: "pedestrian" }).catch(e => {
            console.error("Ошибка пешеходного маршрута:", e);
            return null;
          }),
        ]);

        // Добавляем маршруты на карту
        if (carRoute) map.geoObjects.add(carRoute);
        if (pedestrianRoute) map.geoObjects.add(pedestrianRoute);

        // Формируем информацию о маршрутах
        const info = {
          car: {
            distance: carRoute ? formatDistance(carRoute.getLength()) : "недоступно",
            time: carRoute ? formatTime(carRoute.getTime()) : "недоступно",
          },
          pedestrian: {
            distance: pedestrianRoute ? formatDistance(pedestrianRoute.getLength()) : "недоступно",
            time: pedestrianRoute ? formatTime(pedestrianRoute.getTime()) : "недоступно",
          },
        };

        if (onRouteInfo) onRouteInfo(info);
      } catch (e) {
        console.error("Ошибка инициализации карты:", e);
        if (onRouteInfo) {
          onRouteInfo({
            car: { distance: "ошибка", time: "ошибка" },
            pedestrian: { distance: "ошибка", time: "ошибка" },
          });
        }
      }
    }

    function formatDistance(meters) {
      if (isNaN(meters)) return "неизвестно";
      return meters >= 1000
        ? `${(meters / 1000).toFixed(1)} км`
        : `${Math.round(meters)} м`;
    }

    function formatTime(seconds) {
      if (isNaN(seconds)) return "неизвестно";
      const minutes = Math.round(seconds / 60);
      if (minutes < 60) return `${minutes} мин`;
      const hrs = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hrs} ч ${mins > 0 ? `${mins} мин` : ''}`.trim();
    }

    return () => {
      // Очистка при размонтировании
      const mapElement = document.getElementById(`map-${from}-${to}`);
      if (mapElement) mapElement.innerHTML = '';
    };
  }, [from, to]);

  return (
    <div
      id={`map-${from}-${to}`}
      style={{ width: "100%", height: "100%" }}
    ></div>
  );
};

export default YMap;