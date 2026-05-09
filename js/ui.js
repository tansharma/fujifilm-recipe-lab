class UIManager {
  constructor() {
    this.currentMode = 'presets';
    this.currentRecipe = null;
    this._previewObjectUrl = null;
  }

  init() {
    this.setupEventDelegation();
    this.indexRecipeButtons();
    this.restoreCameraSelection();
    this.populateComparisonDropdowns();
    this._setupPreviewUI();
  }

  indexRecipeButtons() {
    document.querySelectorAll('[data-recipe]').forEach((btn, i) => {
      btn.dataset.originalIndex = i;
    });
    document.querySelectorAll('[data-film]').forEach((btn, i) => {
      btn.dataset.originalIndex = i;
    });
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

    document.getElementById('share-button').addEventListener('click', () => {
      this.shareRecipe();
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
      this.updateDRNote(this.currentRecipe, cameraKey);
      this.applyFallbackHints(this.currentRecipe, cameraKey);
    }
  }

  filterRecipeButtons(camera) {
    [
      { selector: '[data-recipe]', keyAttr: 'recipe' },
      { selector: '[data-film]', keyAttr: 'film' }
    ].forEach(({ selector, keyAttr }) => {
      const buttons = [...document.querySelectorAll(selector)];

      const grids = new Map();
      buttons.forEach(btn => {
        const grid = btn.parentElement;
        if (!grids.has(grid)) grids.set(grid, []);
        grids.get(grid).push(btn);
      });

      grids.forEach((btns, grid) => {
        grid.querySelector('.extended-library-divider')?.remove();

        if (!camera) {
          btns
            .sort((a, b) => Number(a.dataset.originalIndex) - Number(b.dataset.originalIndex))
            .forEach(btn => {
              btn.classList.remove('hidden', 'extended-library');
              grid.appendChild(btn);
            });
          return;
        }

        const fully = [], partial = [], hidden = [];
        btns.forEach(btn => {
          const key = btn.dataset[keyAttr];
          const recipe = getRecipeByKey(key);
          if (!recipe || !recipe.compatibility.includes(camera)) {
            hidden.push(btn);
          } else if (isRecipeFullyCompatible(key, camera)) {
            fully.push(btn);
          } else {
            partial.push(btn);
          }
        });

        const byIndex = arr =>
          arr.sort((a, b) => Number(a.dataset.originalIndex) - Number(b.dataset.originalIndex));

        byIndex(fully).forEach(btn => {
          btn.classList.remove('hidden', 'extended-library');
          grid.appendChild(btn);
        });

        if (partial.length > 0) {
          const divider = document.createElement('div');
          divider.className = 'extended-library-divider';
          divider.textContent = 'extended library';
          divider.setAttribute('aria-hidden', 'true');
          grid.appendChild(divider);

          byIndex(partial).forEach(btn => {
            btn.classList.remove('hidden');
            btn.classList.add('extended-library');
            grid.appendChild(btn);
          });
        }

        byIndex(hidden).forEach(btn => {
          btn.classList.add('hidden');
          btn.classList.remove('extended-library');
          grid.appendChild(btn);
        });
      });
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
    document.getElementById('recipe-chrome-blue').textContent = recipe.chrome_blue;
    document.getElementById('recipe-tip').textContent = recipe.tip;

    const camera = document.getElementById('camera-select').value;
    this.applyCompatibilityFilter(recipe, camera);
    this.updateDRNote(recipe, camera);
    this.applyFallbackHints(recipe, camera);
    this._updatePreviewFilter(recipe);

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
    if (limitations.noColorChromeBlue && recipe.chrome_blue !== 'Off') {
      document.getElementById('recipe-chrome-blue').closest('.setting-pair').classList.add('incompatible');
    }
  }

  updateDRNote(recipe, camera) {
    const note = document.getElementById('recipe-dr-note');
    const minISO = camera && recipe ? CAMERA_INFO[camera]?.drMinISO?.[recipe.dr] : null;
    if (!minISO) {
      note.textContent = '';
      note.classList.add('hidden');
      return;
    }
    note.textContent = `Requires ISO ${minISO}+`;
    note.classList.remove('hidden');
  }

  applyFallbackHints(recipe, camera) {
    document.querySelectorAll('#recipe-card .fallback-hint').forEach(el => {
      el.textContent = '';
      el.classList.add('hidden');
    });

    if (!camera || !recipe) return;
    const limitations = CAMERA_INFO[camera]?.limitations ?? {};

    if (limitations.noAcros && recipe.film.includes('Acros')) {
      const hint = document.getElementById('recipe-film-fallback');
      hint.textContent = '→ try Monochrome';
      hint.classList.remove('hidden');
    }

    if (limitations.noGrainEffect && recipe.grain !== 'None') {
      const hint = document.getElementById('recipe-grain-fallback');
      hint.textContent = '→ use None';
      hint.classList.remove('hidden');
    }

    if (limitations.maxHighlight != null) {
      const val = parseInt(recipe.high, 10);
      if (!isNaN(val) && Math.abs(val) > limitations.maxHighlight) {
        const clamped = val > 0 ? `+${limitations.maxHighlight}` : `-${limitations.maxHighlight}`;
        const hint = document.getElementById('recipe-high-fallback');
        hint.textContent = `→ use ${clamped}`;
        hint.classList.remove('hidden');
      }
    }

    if (limitations.maxShadow != null) {
      const val = parseInt(recipe.shad, 10);
      if (!isNaN(val) && Math.abs(val) > limitations.maxShadow) {
        const clamped = val > 0 ? `+${limitations.maxShadow}` : `-${limitations.maxShadow}`;
        const hint = document.getElementById('recipe-shad-fallback');
        hint.textContent = `→ use ${clamped}`;
        hint.classList.remove('hidden');
      }
    }

    if (limitations.noColorChromeBlue && recipe.chrome_blue !== 'Off') {
      const hint = document.getElementById('recipe-chrome-blue-fallback');
      hint.textContent = '→ use Off';
      hint.classList.remove('hidden');
    }
  }

  _recipeToFilter(recipe) {
    const high   = parseInt(recipe.high)  || 0;
    const shad   = parseInt(recipe.shad)  || 0;
    const color  = recipe.color === 'N/A' ? 0 : (parseInt(recipe.color) || 0);
    const sharp  = parseInt(recipe.sharp) || 0;
    const isBW   = recipe.film.includes('Acros') || recipe.film.startsWith('Monochrome');

    // Brightness: highlight tone (3% per step) + shadow lift (1.5% per step)
    const bright = Math.round(Math.min(130, Math.max(75,
      100 + (high * 3) + (shad * 1.5)
    )));

    // Contrast: DR widens tonal range (flattens contrast); sharpness adds micro-contrast
    const drBase = { DR100: 100, DR200: 93, DR400: 86 }[recipe.dr] ?? 100;
    const contrast = Math.round(Math.min(110, Math.max(75, drBase + sharp)));

    // Saturation: 0 for BW films; Velvia gets a +20 boost on top of color setting
    let saturate = 0;
    if (!isBW) {
      let sat = 100 + (color * 15);
      if (recipe.film === 'Velvia') sat += 20;
      saturate = Math.round(Math.min(200, Math.max(0, sat)));
    }

    // WB: warm R shift → sepia wash; cool R shift → slight hue rotation
    let sepia = 0;
    let hueRot = 0;
    if (recipe.wb !== 'N/A') {
      const m = recipe.wb.match(/R:\s*([+-]?\d+)/);
      const r = m ? parseInt(m[1]) : 0;
      if (r > 0) sepia  = Math.min(20, r * 5);
      else if (r < 0) hueRot = Math.min(12, Math.abs(r) * 3);
    }

    let f = `brightness(${bright}%) contrast(${contrast}%) saturate(${saturate}%)`;
    if (sepia)  f += ` sepia(${sepia}%)`;
    if (hueRot) f += ` hue-rotate(${hueRot}deg)`;
    if (isBW)   f += ' grayscale(100%)';
    return f;
  }

  _setupPreviewUI() {
    document.getElementById('preview-input').addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      if (this._previewObjectUrl) URL.revokeObjectURL(this._previewObjectUrl);
      this._previewObjectUrl = URL.createObjectURL(file);
      const img = document.getElementById('preview-img');
      img.src = this._previewObjectUrl;
      if (this.currentRecipe) img.style.filter = this._recipeToFilter(this.currentRecipe);
      document.getElementById('preview-container').classList.remove('hidden');
      document.getElementById('preview-upload-label').classList.add('hidden');
      navigator.vibrate?.(10);
      e.target.value = '';
    });

    document.getElementById('preview-clear').addEventListener('click', () => {
      if (this._previewObjectUrl) {
        URL.revokeObjectURL(this._previewObjectUrl);
        this._previewObjectUrl = null;
      }
      const img = document.getElementById('preview-img');
      img.src = '';
      img.style.filter = '';
      document.getElementById('preview-container').classList.add('hidden');
      document.getElementById('preview-upload-label').classList.remove('hidden');
    });
  }

  _updatePreviewFilter(recipe) {
    if (!this._previewObjectUrl) return;
    document.getElementById('preview-img').style.filter = this._recipeToFilter(recipe);
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
Color Chrome FX Blue: ${recipe.chrome_blue}

Usage & Guidance:
${recipe.tip}

Pro Tip: Set Exposure Compensation to -0.3 or -0.7 to protect highlights and deepen blacks.`;

    this._copyText(text)
      .then(() => {
        navigator.vibrate?.(10);
        appStorage.addToHistory(recipe.key, 'export');
        this.showToast('Recipe copied to clipboard');
      })
      .catch(() => {
        this.showToast('Failed to copy settings');
      });
  }

  shareRecipe() {
    if (!this.currentRecipe) return;

    const recipe = this.currentRecipe;
    const url = `${location.origin}${location.pathname}#recipe/${recipe.key}`;

    const copyUrlFallback = () => {
      this._copyText(url)
        .then(() => {
          navigator.vibrate?.(10);
          this.showToast('Link copied to clipboard');
        })
        .catch(() => this.showToast('Unable to copy link'));
    };

    if (navigator.share) {
      navigator.share({ title: recipe.title, url })
        .catch(err => {
          // AbortError = user dismissed the sheet — silent.
          // Any other error (e.g. iOS rejecting http:// URLs) → clipboard fallback.
          if (err.name !== 'AbortError') copyUrlFallback();
        });
    } else {
      copyUrlFallback();
    }
  }

  async _copyText(text) {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch {
        // clipboard API failed — fall through to execCommand
      }
    }
    await this._execCopy(text);
  }

  async _execCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    if (!ok) throw new Error('execCommand failed');
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
