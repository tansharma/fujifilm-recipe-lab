class UIManager {
  constructor() {
    this.currentMode = 'presets';
    this.currentRecipe = null;
    this._previewObjectUrl = null;
    this._activeAnnotationBadge = null;
  }

  init() {
    this.setupEventDelegation();
    this.indexRecipeButtons();
    this.restoreCameraSelection();
    this.populateComparisonDropdowns();
    this._setupPreviewUI();
    this._setupInstallNudge();
    this._setupTweakForm();
    this._setupAnnotationPopover();
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
    } else if (mode === 'variations') {
      this.populateVariations();
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
    if (this.currentMode === 'variations') {
      this.populateVariations();
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
    } else if (source === 'variation') {
      styleLabel = 'My variation';
    }
    document.getElementById('recipe-style').textContent = styleLabel;
    document.getElementById('tweak-form').classList.add('hidden');

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
    this._applyAnnotations(recipe, camera);

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

    const variations = appStorage.getVariations();

    historyDiv.innerHTML = recent
      .map(key => {
        if (key.startsWith('var__')) {
          const v = variations.find(v => v.id === key);
          if (!v) return '';
          return `
            <button class="history-item" onclick="appUI.loadVariation('${key}')">
              <div class="history-recipe-name">${v.name}</div>
              <div class="history-metadata">My variation</div>
            </button>
          `;
        }
        const recipe = getRecipeByKey(key);
        if (!recipe) return '';
        return `
          <button class="history-item" onclick="appUI.loadRecipe('${key}', '${recipe.style.includes('Film') ? 'film' : 'preset'}')">
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

  loadVariation(id) {
    const variation = appStorage.getVariations().find(v => v.id === id);
    if (!variation) {
      this.showToast('Variation not found');
      return;
    }
    const recipe = { ...variation.data, key: id };
    appStorage.addToHistory(id, 'view');
    this.currentRecipe = recipe;
    this.displayRecipeCard(recipe, 'variation');
    setTimeout(() => {
      document.getElementById('recipe-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  populateVariations() {
    const container = document.getElementById('variations-content');
    const variations = appStorage.getVariations();

    if (variations.length === 0) {
      container.innerHTML = '<p class="placeholder-text">No variations saved yet. Open a recipe and tap Tweak.</p>';
      return;
    }

    const camera = document.getElementById('camera-select').value;
    const sorted = [...variations].sort((a, b) => b.createdAt - a.createdAt);

    const compatible = sorted.filter(v => !camera || v.data.compatibility.includes(camera));
    const incompatible = sorted.filter(v => camera && !v.data.compatibility.includes(camera));

    container.innerHTML = '';

    compatible.forEach(v => container.appendChild(this._makeVariationButton(v, false)));

    if (incompatible.length > 0 && compatible.length > 0) {
      const divider = document.createElement('div');
      divider.className = 'extended-library-divider';
      divider.textContent = 'incompatible with selected camera';
      divider.setAttribute('aria-hidden', 'true');
      container.appendChild(divider);
    }

    incompatible.forEach(v => container.appendChild(this._makeVariationButton(v, true)));
  }

  _makeVariationButton(variation, dimmed) {
    const btn = document.createElement('button');
    btn.className = 'recipe-button variation-button' + (dimmed ? ' extended-library' : '');
    btn.dataset.variationId = variation.id;

    const label = document.createElement('span');
    label.className = 'variation-button-label';
    label.textContent = variation.name;
    btn.appendChild(label);

    const del = document.createElement('button');
    del.className = 'variation-delete';
    del.setAttribute('aria-label', `Delete ${variation.name}`);
    del.textContent = '×';
    del.addEventListener('click', e => {
      e.stopPropagation();
      appStorage.deleteVariation(variation.id);
      this.populateVariations();
      this.showToast('Variation deleted');
    });
    btn.appendChild(del);

    btn.addEventListener('click', () => {
      if (!document.getElementById('camera-select').value) {
        this.showToast('Please select a camera first');
        return;
      }
      this.loadVariation(variation.id);
    });

    return btn;
  }

  _setupTweakForm() {
    // Populate discrete -4..+4 selects once at init
    ['tweak-high', 'tweak-shad', 'tweak-color', 'tweak-sharp', 'tweak-nr'].forEach(id => {
      const sel = document.getElementById(id);
      for (let v = -4; v <= 4; v++) {
        const opt = document.createElement('option');
        opt.value = v >= 0 ? `+${v}` : `${v}`;
        opt.textContent = opt.value;
        sel.appendChild(opt);
      }
    });

    document.getElementById('tweak-button').addEventListener('click', () => {
      if (!this.currentRecipe) return;
      const form = document.getElementById('tweak-form');
      if (!form.classList.contains('hidden')) {
        form.classList.add('hidden');
        return;
      }
      this._openTweakForm(this.currentRecipe);
    });

    document.getElementById('tweak-cancel').addEventListener('click', () => {
      document.getElementById('tweak-form').classList.add('hidden');
    });

    document.getElementById('tweak-save').addEventListener('click', () => {
      this._saveTweakForm();
    });
  }

  _openTweakForm(recipe) {
    let wbR = 0, wbB = 0;
    if (recipe.wb !== 'N/A') {
      const rMatch = recipe.wb.match(/R:\s*([+-]?\d+)/);
      const bMatch = recipe.wb.match(/B:\s*([+-]?\d+)/);
      wbR = rMatch ? parseInt(rMatch[1]) : 0;
      wbB = bMatch ? parseInt(bMatch[1]) : 0;
    }

    const isBW = recipe.film.includes('Acros') || recipe.film.startsWith('Monochrome');
    const isWBNA = recipe.wb === 'N/A';

    document.getElementById('tweak-name').value = '';
    document.getElementById('tweak-name').placeholder = `${recipe.title} (my edit)`;
    document.getElementById('tweak-dr').value = recipe.dr;
    document.getElementById('tweak-grain').value = recipe.grain;

    const wbRInput = document.getElementById('tweak-wb-r');
    const wbBInput = document.getElementById('tweak-wb-b');
    wbRInput.value = wbR;
    wbBInput.value = wbB;
    wbRInput.disabled = isWBNA;
    wbBInput.disabled = isWBNA;

    const fmtVal = v => (parseInt(v) >= 0 ? `+${parseInt(v)}` : `${parseInt(v)}`);
    document.getElementById('tweak-high').value = fmtVal(recipe.high);
    document.getElementById('tweak-shad').value = fmtVal(recipe.shad);
    document.getElementById('tweak-sharp').value = fmtVal(recipe.sharp);
    document.getElementById('tweak-nr').value = fmtVal(recipe.nr);

    const colorSel = document.getElementById('tweak-color');
    colorSel.value = (isBW || recipe.color === 'N/A') ? '+0' : fmtVal(recipe.color);
    colorSel.disabled = isBW || recipe.color === 'N/A';

    document.getElementById('tweak-form').classList.remove('hidden');
    document.getElementById('tweak-name').focus();
  }

  _saveTweakForm() {
    const name = document.getElementById('tweak-name').value.trim();
    if (!name) {
      document.getElementById('tweak-name').focus();
      this.showToast('Give your variation a name');
      return;
    }

    const recipe = this.currentRecipe;
    const isBW = recipe.film.includes('Acros') || recipe.film.startsWith('Monochrome');
    const isWBNA = recipe.wb === 'N/A';

    const wbR = parseInt(document.getElementById('tweak-wb-r').value) || 0;
    const wbB = parseInt(document.getElementById('tweak-wb-b').value) || 0;
    const fmtWB = n => (n >= 0 ? `+${n}` : `${n}`);
    const wb = isWBNA ? 'N/A' : `R: ${fmtWB(wbR)}, B: ${fmtWB(wbB)}`;

    const id = `var__${Date.now()}`;
    const parentKey = recipe.isVariation ? recipe.parentKey : recipe.key;

    appStorage.saveVariation({
      id,
      parentKey,
      name,
      createdAt: Date.now(),
      data: {
        title: name,
        style: 'My variation',
        film: recipe.film,
        dr: document.getElementById('tweak-dr').value,
        wb,
        high: document.getElementById('tweak-high').value,
        shad: document.getElementById('tweak-shad').value,
        color: (isBW || recipe.color === 'N/A') ? 'N/A' : document.getElementById('tweak-color').value,
        sharp: document.getElementById('tweak-sharp').value,
        nr: document.getElementById('tweak-nr').value,
        grain: document.getElementById('tweak-grain').value,
        chrome_blue: recipe.chrome_blue,
        tip: `Tweaked from: ${recipe.title}`,
        compatibility: recipe.compatibility,
        tags: ['variation'],
        isVariation: true,
        parentKey
      }
    });

    document.getElementById('tweak-form').classList.add('hidden');
    navigator.vibrate?.(10);
    this.showToast(`"${name}" saved to My Variations`);
  }

  _setupAnnotationPopover() {
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.annotation-badge')) {
        this._hideAnnotationPopover();
      }
    });
  }

  _hideAnnotationPopover() {
    document.getElementById('annotation-popover').classList.add('hidden');
    this._activeAnnotationBadge = null;
  }

  _toggleAnnotationPopover(badge, text) {
    const popover = document.getElementById('annotation-popover');
    if (this._activeAnnotationBadge === badge && !popover.classList.contains('hidden')) {
      this._hideAnnotationPopover();
      return;
    }
    this._activeAnnotationBadge = badge;
    document.getElementById('annotation-text').textContent = text;
    const rect = badge.getBoundingClientRect();
    const pw = 240;
    let left = rect.left + rect.width / 2 - pw / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - pw - 12));
    popover.style.top = `${rect.bottom + 6}px`;
    popover.style.left = `${left}px`;
    popover.style.width = `${pw}px`;
    popover.classList.remove('hidden');
  }

  _getAnnotationText(recipe, settingKey, camera) {
    const ann = recipe.annotations?.[settingKey];
    if (!ann) return null;

    if (!camera) return ann;

    const limitations = CAMERA_INFO[camera]?.limitations ?? {};
    const drMinISO = CAMERA_INFO[camera]?.drMinISO ?? {};

    if (settingKey === 'film' && limitations.noAcros && recipe.film.includes('Acros')) {
      return 'Acros not available on this sensor — try Monochrome (Std) for similar tonal intent';
    }
    if (settingKey === 'grain' && limitations.noGrainEffect && recipe.grain !== 'None') {
      return 'Grain effect not available on this sensor — NR −4 preserves organic texture instead';
    }
    if (settingKey === 'chrome_blue' && limitations.noColorChromeBlue && recipe.chrome_blue !== 'Off') {
      return 'Color Chrome FX Blue not available on this generation';
    }
    if (settingKey === 'shad' && limitations.maxShadow != null) {
      const val = parseInt(recipe.shad, 10);
      if (!isNaN(val) && Math.abs(val) > limitations.maxShadow) {
        return `Use +${limitations.maxShadow} max on this sensor — same crushed-black intent, reduced range`;
      }
    }
    if (settingKey === 'high' && limitations.maxHighlight != null) {
      const val = parseInt(recipe.high, 10);
      if (!isNaN(val) && Math.abs(val) > limitations.maxHighlight) {
        return `Use ±${limitations.maxHighlight} max on this sensor`;
      }
    }
    if (settingKey === 'dr' && drMinISO[recipe.dr]) {
      return `${ann} · Requires ISO ${drMinISO[recipe.dr]}+`;
    }

    return ann;
  }

  _applyAnnotations(recipe, camera) {
    document.querySelectorAll('#recipe-card .annotation-badge').forEach(b => b.remove());
    this._hideAnnotationPopover();

    const settingMap = {
      film: 'recipe-film',
      dr: 'recipe-dr',
      wb: 'recipe-wb',
      high: 'recipe-high',
      shad: 'recipe-shad',
      color: 'recipe-color',
      sharp: 'recipe-sharp',
      nr: 'recipe-nr',
      grain: 'recipe-grain',
      chrome_blue: 'recipe-chrome-blue'
    };

    Object.entries(settingMap).forEach(([key, id]) => {
      const text = this._getAnnotationText(recipe, key, camera);
      if (!text) return;

      const valueEl = document.getElementById(id);
      if (!valueEl) return;
      const pair = valueEl.closest('.setting-pair');
      if (!pair) return;
      const label = pair.querySelector('.setting-label');
      if (!label) return;

      const badge = document.createElement('button');
      badge.className = 'annotation-badge';
      badge.setAttribute('aria-label', 'Why this setting');
      badge.setAttribute('type', 'button');
      badge.textContent = 'ⓘ';

      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        this._toggleAnnotationPopover(badge, text);
      });

      label.appendChild(badge);
    });
  }

  _setupInstallNudge() {
    // navigator.standalone is a boolean only on iOS Safari.
    // false = running in browser (not yet installed as PWA).
    // undefined on all non-iOS browsers — typeof guard avoids false positives.
    const isIOSBrowser = typeof window.navigator.standalone === 'boolean'
      && !window.navigator.standalone;
    const isDismissed = !!localStorage.getItem('recipe_lab_install_dismissed');

    if (!isIOSBrowser || isDismissed) return;

    document.getElementById('install-nudge').classList.remove('hidden');
    document.getElementById('install-nudge-dismiss').addEventListener('click', () => {
      document.getElementById('install-nudge').classList.add('hidden');
      localStorage.setItem('recipe_lab_install_dismissed', '1');
    });
  }
}

const appUI = new UIManager();
