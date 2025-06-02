import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import LanguageSwitcher from '../common/LanguageSwitcher.vue';

// Mock the i18n plugin
vi.mock('@/plugins/i18n', () => ({
  supportedLocales: [
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
  ],
  setLocale: vi.fn(),
  getCurrentLocale: vi.fn(() => 'ja'),
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    const wrapper = mount(LanguageSwitcher);

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.language-switcher').exists()).toBe(true);
  });

  it('renders correctly in compact mode', () => {
    const wrapper = mount(LanguageSwitcher, {
      props: {
        compact: true,
      },
    });

    expect(wrapper.exists()).toBe(true);
    const button = wrapper.find('.language-switcher');
    expect(button.exists()).toBe(true);
  });

  it('displays current language flag', () => {
    const wrapper = mount(LanguageSwitcher);

    const flag = wrapper.find('.flag');
    expect(flag.exists()).toBe(true);
    expect(flag.text()).toBe('🇯🇵');
  });

  it('component module can be imported', async () => {
    const module = await import('../common/LanguageSwitcher.vue');
    expect(module.default).toBeDefined();
    expect(typeof module.default).toBe('object');
  });
});
