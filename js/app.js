class RecipeLabApp {
  constructor() {
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;

    console.log('Initializing Recipe Lab...');

    permissionsManager.init();
    themeManager.init();
    appUI.init();
    comparisonManager.init();

    this.restoreState();
    appUI.populateHistory();

    window.addEventListener('hashchange', () => this.handleHash());
    this.handleHash();

    this.initialized = true;
    console.log('Recipe Lab initialized');
  }

  handleHash() {
    const match = window.location.hash.match(/^#recipe\/(.+)$/);
    if (!match) return;

    const key = match[1];
    const recipe = getRecipeByKey(key);
    if (!recipe) return;

    const cameraSelect = document.getElementById('camera-select');
    if (!cameraSelect.value && recipe.compatibility.length > 0) {
      const cam = recipe.compatibility[0];
      cameraSelect.value = cam;
      appStorage.setSelectedCamera(cam);
      appUI.onCameraChanged(cam);
    }

    const source = recipe.style.includes('Film') ? 'film' : 'preset';
    appUI.loadRecipe(key, source);
  }

  restoreState() {
    const state = appStorage.getState();
    
    if (state.selectedCamera) {
      document.getElementById('camera-select').value = state.selectedCamera;
      appUI.onCameraChanged(state.selectedCamera);
    }
  }

  exportRecipeAsJSON() {
    if (!appUI.currentRecipe) {
      appUI.showToast('No recipe selected');
      return;
    }

    const recipe = appUI.currentRecipe;
    const camera = document.getElementById('camera-select').options[document.getElementById('camera-select').selectedIndex].text;

    const data = {
      title: recipe.title,
      camera: camera,
      settings: {
        filmSimulation: recipe.film,
        dynamicRange: recipe.dr,
        whiteBalanceShift: recipe.wb,
        highlightTone: recipe.high,
        shadowTone: recipe.shad,
        color: recipe.color,
        sharpness: recipe.sharp,
        noiseReduction: recipe.nr,
        grainEffect: recipe.grain,
        colorChromeFXBlue: recipe.chrome_blue
      },
      usage: recipe.tip,
      proTip: 'Set Exposure Compensation to -0.3 or -0.7 to protect highlights and deepen blacks.'
    };

    return JSON.stringify(data, null, 2);
  }

  getAppInfo() {
    return {
      name: 'Recipe Lab',
      version: '1.0.0',
      description: 'Leica-inspired Fujifilm camera recipes',
      dataStorageVersion: '1'
    };
  }

  debug() {
    console.log('Recipe Lab Debug Info:');
    console.log('App Info:', this.getAppInfo());
    appStorage.debugLogState();
    console.log('Current Recipe:', appUI.currentRecipe);
    console.log('Current Mode:', appUI.currentMode);
  }
}

const app = new RecipeLabApp();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    app.init();
  });
} else {
  app.init();
}
