class ThemeManager {
  constructor() {
    this.storageKey = 'recipe_lab_theme';
    this.mq = window.matchMedia('(prefers-color-scheme: dark)');
  }

  init() {
    const saved = localStorage.getItem(this.storageKey) || 'auto';
    this._apply(saved);
    this._setupControl(saved);
    this.mq.addEventListener('change', () => {
      if ((localStorage.getItem(this.storageKey) || 'auto') === 'auto') {
        this._updateMetaColor();
      }
    });
  }

  _apply(theme) {
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    if (theme !== 'auto') document.documentElement.classList.add(`theme-${theme}`);
    this._updateMetaColor();
  }

  _updateMetaColor() {
    const theme = localStorage.getItem(this.storageKey) || 'auto';
    const isDark = theme === 'dark' || (theme === 'auto' && this.mq.matches);
    document.querySelector('meta[name="theme-color"]').content = isDark ? '#000000' : '#ffffff';
  }

  _setupControl(active) {
    document.querySelectorAll('.theme-segment').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === active);
      btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        localStorage.setItem(this.storageKey, theme);
        this._apply(theme);
        document.querySelectorAll('.theme-segment').forEach(b => {
          b.classList.toggle('active', b === btn);
        });
      });
    });
  }
}

const themeManager = new ThemeManager();
