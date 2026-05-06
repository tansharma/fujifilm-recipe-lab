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
        this.renderComparisonTable();
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
    }
  }

  onCameraChanged(cameraKey) {
    this.populateComparisonDropdowns();
    [1, 2, 3, 4].forEach(i => {
      document.getElementById(`compare-${i}`).value = '';
    });
    document.getElementById('compare-table-container').innerHTML =
      '<p class="placeholder-text">Select two or more recipes to compare</p>';
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

  renderComparisonTable() {
    const container = document.getElementById('compare-table-container');

    const selected = [1, 2, 3, 4]
      .map(i => document.getElementById(`compare-${i}`).value)
      .filter(Boolean)
      .map(key => ({ key, recipe: getRecipeByKey(key) }))
      .filter(r => r.recipe);

    if (selected.length < 2) {
      container.innerHTML = selected.length === 1
        ? '<p class="placeholder-text">Select at least one more recipe to compare</p>'
        : '<p class="placeholder-text">Select two or more recipes to compare</p>';
      return;
    }

    const settings = [
      { label: 'Film Simulation', key: 'film' },
      { label: 'Dynamic Range',   key: 'dr' },
      { label: 'WB Shift',        key: 'wb' },
      { label: 'Highlight Tone',  key: 'high' },
      { label: 'Shadow Tone',     key: 'shad' },
      { label: 'Color',           key: 'color' },
      { label: 'Sharpness',       key: 'sharp' },
      { label: 'Noise Reduction', key: 'nr' },
      { label: 'Grain Effect',    key: 'grain' },
    ];

    const headerCells = selected.map(r => `<th>${r.recipe.title}</th>`).join('');

    const bodyRows = settings.map(({ label, key }) => {
      const values = selected.map(r => r.recipe[key]);
      const allSame = values.every(v => v === values[0]);
      const cells = selected
        .map(r => `<td${allSame ? '' : ' class="diff"'}>${r.recipe[key]}</td>`)
        .join('');
      return `<tr><td class="setting-label-cell">${label}</td>${cells}</tr>`;
    }).join('');

    container.innerHTML = `
      <div class="compare-table-wrapper">
        <table class="compare-table">
          <thead><tr><th></th>${headerCells}</tr></thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </div>`;
  }

  loadRecipe(recipeKey, source) {
    const recipe = getRecipeByKey(recipeKey);
    if (!recipe) {
      this.showToast('Recipe not found');
      return;
    }

    const camera = document.getElementById('camera-select').value;
    const cameraName = document.getElementById('camera-select').options[document.getElementById('camera-select').selectedIndex].text;

    appStorage.addToHistory(recipeKey, 'view');

    this.currentRecipe = { ...recipe, key: recipeKey };
    this.displayRecipeCard(recipe, camera, cameraName, source);

    setTimeout(() => {
      document.getElementById('recipe-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  displayRecipeCard(recipe, cameraKey, cameraName, source) {
    const card = document.getElementById('recipe-card');

    document.getElementById('recipe-title').textContent = recipe.title;
    document.getElementById('recipe-camera').textContent = cameraName;

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

    card.classList.remove('hidden');
  }

  copyRecipeToClipboard() {
    if (!this.currentRecipe) {
      this.showToast('No recipe selected');
      return;
    }

    const recipe = this.currentRecipe;
    const camera = document.getElementById('camera-select').options[document.getElementById('camera-select').selectedIndex].text;

    const text = `${recipe.title}
Camera: ${camera}

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
