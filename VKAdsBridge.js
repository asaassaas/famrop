import { NativeModules, Platform } from 'react-native';

const { VKAdsModule } = NativeModules;

// Проверяем, доступен ли модуль
const isModuleAvailable = VKAdsModule !== undefined && VKAdsModule !== null;

export const VKAds = {
    /**
     * Инициализация VK Ads SDK
     */
    initialize: () => {
        if (!isModuleAvailable) {
            console.warn('⚠️ VK Ads Module не доступен');
            return Promise.reject('VK Ads Module not available');
        }
        return VKAdsModule.initialize();
    },

    /**
     * Показать баннер
     * @param {string} slotId - ID рекламного блока (например, '2061029')
     */
    showBanner: (slotId) => {
        if (!isModuleAvailable) {
            console.warn('⚠️ VK Ads Module не доступен');
            return Promise.reject('VK Ads Module not available');
        }
        return VKAdsModule.showBanner(slotId);
    },

    /**
     * Скрыть баннер
     */
    hideBanner: () => {
        if (!isModuleAvailable) {
            return Promise.reject('VK Ads Module not available');
        }
        return VKAdsModule.hideBanner();
    },

    /**
     * Уничтожить баннер (освободить ресурсы)
     */
    destroyBanner: () => {
        if (!isModuleAvailable) {
            return Promise.reject('VK Ads Module not available');
        }
        return VKAdsModule.destroyBanner();
    },

    /**
     * Проверить, виден ли баннер
     */
    isBannerVisible: () => {
        if (!isModuleAvailable) {
            return Promise.resolve(false);
        }
        return VKAdsModule.isBannerVisible();
    }
};