import { makeAutoObservable } from "mobx";
import axios from "axios";

const api = "https://44899c88203381ec.mokky.dev/banner";

class BannerStore {
  banners = [];
  activeBanner = null;
  loading = false;
  error = null;

  constructor() {
    makeAutoObservable(this);
    // Убедитесь, что fetchBanners вызывается после инициализации
    this.fetchBanners();
  }

  // Получение баннеров
  async fetchBanners() {
    this.loading = true;
    try {
      const res = await axios.get(api);
      this.banners = res.data;
      this.setActiveBanner(); // Устанавливаем активный баннер
      this.error = null; // Сбрасываем ошибку при успешной загрузке
    } catch (error) {
      this.error = "Ошибка загрузки баннеров"; // Устанавливаем ошибку
      console.error("Ошибка загрузки баннеров", error);
    } finally {
      this.loading = false;
    }
  }

  // Устанавливаем активный баннер
  setActiveBanner() {
    const now = Date.now();
    const activeBanners = this.banners.filter(
      (b) => b.active && now < b.endTime
    );
    this.activeBanner = activeBanners.length > 0 ? activeBanners[0] : null;
  }

  // Отключение баннера
  deactivateBanner() {
    if (this.activeBanner) {
      const updatedBanner = { ...this.activeBanner, active: false };
      axios
        .patch(`${api}/${this.activeBanner.id}`, updatedBanner)
        .then(() => {
          this.activeBanner = null; // Убираем активный баннер
          this.fetchBanners(); // Обновляем список баннеров
        })
        .catch((error) => {
          console.error("Ошибка обновления баннера", error);
        });
    }
  }
}

const bannerStore = new BannerStore();
export default bannerStore;
