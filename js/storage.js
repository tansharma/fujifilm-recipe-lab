const STORAGE_KEYS = {
  SELECTED_CAMERA: 'recipe_lab_selected_camera',
  USER_HISTORY: 'recipe_lab_user_history',
  RECENTLY_USED: 'recipe_lab_recently_used',
  VARIATIONS: 'recipe_lab_variations'
};

class Storage {
  constructor() {
    this.defaultState = {
      selectedCamera: '',
      userHistory: [],
      recentlyUsed: []
    };
  }

  getState() {
    const state = {};
    
    state.selectedCamera = localStorage.getItem(STORAGE_KEYS.SELECTED_CAMERA) || '';
    
    try {
      state.userHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_HISTORY)) || [];
    } catch (e) {
      state.userHistory = [];
    }
    
    try {
      state.recentlyUsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENTLY_USED)) || [];
    } catch (e) {
      state.recentlyUsed = [];
    }
    
    return state;
  }

  setState(key, value) {
    if (key === 'selectedCamera') {
      localStorage.setItem(STORAGE_KEYS.SELECTED_CAMERA, value);
    } else if (key === 'userHistory') {
      localStorage.setItem(STORAGE_KEYS.USER_HISTORY, JSON.stringify(value));
    } else if (key === 'recentlyUsed') {
      localStorage.setItem(STORAGE_KEYS.RECENTLY_USED, JSON.stringify(value));
    }
  }

  setSelectedCamera(cameraKey) {
    this.setState('selectedCamera', cameraKey);
  }

  getSelectedCamera() {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_CAMERA) || '';
  }

  addToHistory(recipeKey, action = 'view') {
    const history = this.getHistory();
    history.push({
      recipeKey,
      timestamp: Date.now(),
      action
    });
    if (history.length > 100) {
      history.shift();
    }
    this.setState('userHistory', history);
  }

  getHistory() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_HISTORY)) || [];
    } catch (e) {
      return [];
    }
  }

  getRecentlyUsed(limit = 10) {
    const history = this.getHistory();
    const seen = new Set();
    const recent = [];
    
    for (let i = history.length - 1; i >= 0 && recent.length < limit; i--) {
      if (!seen.has(history[i].recipeKey)) {
        recent.push(history[i].recipeKey);
        seen.add(history[i].recipeKey);
      }
    }
    
    return recent;
  }

  getVariations() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.VARIATIONS)) || [];
    } catch (e) {
      return [];
    }
  }

  saveVariation(variation) {
    const all = this.getVariations();
    const idx = all.findIndex(v => v.id === variation.id);
    if (idx >= 0) {
      all[idx] = variation;
    } else {
      all.push(variation);
    }
    localStorage.setItem(STORAGE_KEYS.VARIATIONS, JSON.stringify(all));
  }

  deleteVariation(id) {
    const remaining = this.getVariations().filter(v => v.id !== id);
    localStorage.setItem(STORAGE_KEYS.VARIATIONS, JSON.stringify(remaining));
  }

  clearHistory() {
    localStorage.removeItem(STORAGE_KEYS.USER_HISTORY);
  }

  clearAll() {
    localStorage.removeItem(STORAGE_KEYS.SELECTED_CAMERA);
    localStorage.removeItem(STORAGE_KEYS.USER_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.RECENTLY_USED);
    localStorage.removeItem(STORAGE_KEYS.VARIATIONS);
  }

  debugLogState() {
    console.log('Recipe Lab Storage State:');
    console.log('Selected Camera:', this.getSelectedCamera());
    console.log('History:', this.getHistory());
    console.log('Recently Used:', this.getRecentlyUsed());
  }
}

const appStorage = new Storage();
