class UIManager {
  constructor() {
    this.currentMode = 'presets';
    this.currentRecipe = null;
  }

  init() {
    this.setupEventDelegation();
    this.restoreCameraSelection();
    this.populateComparisonDropdowns();
  }

  setupEventDelegation() {
    document.getElementById('camera-select').addEventListener('change', (e) => {
      appStorage.setSelectedCamera(e.target.value);
      this.onCameraChanged(e.target.value);
    });

    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchTab(btn.dataset.mode);
      });
    });

    document.querySelectorAll('[data-recipe]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const recipeKey = e.target.dataset.recipe;
        const camera = document.getElementById('camera-select').value;
        if (!camera) {
          this.showToast('Please select a camera first');
          return;
        }
        this.loadRecipe(recipeKey, 'preset');
      });
    });

    document.querySelectorAll('[data-film]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filmKey = e.target.dataset.film;
        const camera = document.getElementById('camera-select').value;
        if (!camera) {
          this.showToast('Please select a camera first');
          return;
        }
        this.loadRecipe(filmKey, 'film');
      });
    });

    [1, 2, 3, 4].forEach(i => {
      document.getElementById(`compare-${i}`).addEventListener('change', () => {
        comparisonManager.renderComparisonTable();
      });
    });

    document.getElementById('copy-button').addEventListener('click', () => {
      this.copyRecipeToClipboard();
    });
  }

  switchTab(mode) {
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
      btn.setAttribute('aria-selected', btn.dataset.mode === mode);
    });

    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `${mode}-tab`);
    });

    this.currentMode = mode;

    if (mode === 'history') {
      this.populateHistory();
    }
  }

  restoreCameraSelection() {
    const saved = appStorage.getSelectedCamera();
    if (saved) {
      document.getElementById('camera-select').value = saved;
      this.filterRecipeButtons(saved);
    }
  }

  onCameraChanged(cameraKey) {
    this.filterRecipeButtons(cameraKey);
    this.populateComparisonDropdowns();
    [1, 2, 3, 4].forEach(i => {
      document.getElementById(`compare-${i}`).value = '';
    });
    document.getElementById('compare-table-container').innerHTML =
      '<p class="placeholder-text">Select two or more recipes to compare</p>';
    if (this.currentRecipe) {
      this.applyCompatibilityFilter(this.currentRecipe, cameraKey);
    }
  }

  filterRecipeButtons(camera) {
    document.querySelectorAll('[data-recipe]').forEach(btn => {
      const recipe = getRecipeByKey(btn.dataset.recipe);
      btn.classList.toggle('hidden', !!(camera && recipe && !recipe.compatibility.includes(camera)));
    });
    document.querySelectorAll('[data-film]').forEach(btn => {
      const recipe = getRecipeByKey(btn.dataset.film);
      btn.classList.toggle('hidden', !!(camera && recipe && !recipe.compatibility.includes(camera)));
    });
  }

  populateComparisonDropdowns() {
    const camera = document.getElementById('camera-select').value;

    [1, 2, 3, 4].forEach(i => {
      const select = document.getElementById(`compare-${i}`);
      const currentValue = select.value;
      select.innerHTML = '<option value="">— Select —</option>';

      if (camera) {
        Object.entries(ALL_RECIPES).forEach(([key, recipe]) => {
          if (recipe.compatibility.includes(camera)) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = recipe.title;
            select.appendChild(option);
          }
        });
      }

      select.value = currentValue;
    });
  }

  loadRecipe(recipeKey, source) {
    const recipe = getRecipeByKey(recipeKey);
    if (!recipe) {
      this.showToast('Recipe not found');
      return;
    }

    appStorage.addToHistory(recipeKey, 'view');

    this.currentRecipe = { ...recipe, key: recipeKey };
    this.displayRecipeCard(recipe, source);

    setTimeout(() => {
      document.getElementById('recipe-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  displayRecipeCard(recipe, source) {
    const card = document.getElementById('recipe-card');

    const compatibleCameras = recipe.compatibility
      .map(key => CAMERA_INFO[key]?.name.split(' (')[0] || key)
      .join(' · ');

    document.getElementById('recipe-title').textContent = recipe.title;
    document.getElementById('recipe-camera').textContent = compatibleCameras;

    let styleLabel = recipe.style;
    if (source === 'preset') {
      styleLabel = 'Leica reference library';
    } else if (source === 'film') {
      styleLabel = 'Film stock match';
    }
    document.getElementById('recipe-style').textContent = styleLabel;

    document.getElementById('recipe-film').textContent = recipe.film;
    document.getElementById('recipe-dr').textContent = recipe.dr;
    document.getElementById('recipe-wb').textContent = recipe.wb;
    document.getElementById('recipe-high').textContent = recipe.high;
    document.getElementById('recipe-shad').textContent = recipe.shad;
    document.getElementById('recipe-color').textContent = recipe.color;
    document.getElementById('recipe-sharp').textContent = recipe.sharp;
    document.getElementById('recipe-nr').textContent = recipe.nr;
    document.getElementById('recipe-grain').textContent = recipe.grain;
    document.getElementById('recipe-tip').textContent = recipe.tip;

    const camera = document.getElementById('camera-select').value;
    this.applyCompatibilityFilter(recipe, camera);

    card.classList.remove('hidden');
  }

  applyCompatibilityFilter(recipe, camera) {
    document.querySelectorAll('#recipe-card .setting-pair').forEach(el => {
      el.classList.remove('incompatible');
    });

    if (!camera) return;
    const limitations = CAMERA_INFO[camera]?.limitations ?? {};

    if (limitations.noAcros && recipe.film.includes('Acros')) {
      document.getElementById('recipe-film').closest('.setting-pair').classList.add('incompatible');
    }
    if (limitations.noGrainEffect && recipe.grain !== 'None') {
      document.getElementById('recipe-grain').closest('.setting-pair').classList.add('incompatible');
    }
    if (limitations.maxHighlight != null) {
      const val = parseInt(recipe.high, 10);
      if (!isNaN(val) && Math.abs(val) > limitations.maxHighlight) {
        document.getElementById('recipe-high').closest('.setting-pair').classList.add('incompatible');
      }
    }
    if (limitations.maxShadow != null) {
      const val = parseInt(recipe.shad, 10);
      if (!isNaN(val) && Math.abs(val) > limitations.maxShadow) {
        document.getElementById('recipe-shad').closest('.setting-pair').classList.add('incompatible');
      }
    }
  }

  copyRecipeToClipboard() {
    if (!this.currentRecipe) {
      this.showToast('No recipe selected');
      return;
    }

    const recipe = this.currentRecipe;
    const compatibleCameras = recipe.compatibility
      .map(key => CAMERA_INFO[key]?.name.split(' (')[0] || key)
      .join(', ');

    const text = `${recipe.title}
Compatible with: ${compatibleCameras}

Film Simulation: ${recipe.film}
Dynamic Range: ${recipe.dr}
WB Shift: ${recipe.wb}
Highlight Tone: ${recipe.high}
Shadow Tone: ${recipe.shad}
Color: ${recipe.color}
Sharpness: ${recipe.sharp}
Noise Reduction: ${recipe.nr}
Grain Effect: ${recipe.grain}

Usage & Guidance:
${recipe.tip}

Pro Tip: Set Exposure Compensation to -0.3 or -0.7 to protect highlights and deepen blacks.`;

    navigator.clipboard.writeText(text)
      .then(() => {
        appStorage.addToHistory(recipe.key, 'export');
        this.showToast('Recipe copied to clipboard');
      })
      .catch(err => {
        this.showToast('Failed to copy: ' + err.message);
      });
  }

  populateHistory() {
    const historyDiv = document.getElementById('history-content');
    const recent = appStorage.getRecentlyUsed(20);

    if (recent.length === 0) {
      historyDiv.innerHTML = '<p class="placeholder-text">No recipes viewed yet</p>';
      return;
    }

    historyDiv.innerHTML = recent
      .map(recipeKey => {
        const recipe = getRecipeByKey(recipeKey);
        if (!recipe) return '';

        return `
          <button class="history-item" onclick="appUI.loadRecipe('${recipeKey}', '${recipe.style.includes('Film') ? 'film' : 'preset'}')">
            <div class="history-recipe-name">${recipe.title}</div>
            <div class="history-metadata">${recipe.style}</div>
          </button>
        `;
      })
      .join('');
  }

  showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hidden');

    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }

  refreshUI() {
    this.restoreCameraSelection();
    this.populateComparisonDropdowns();
    this.populateHistory();
  }
}

const appUI = new UIManager();
