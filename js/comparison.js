class ComparisonManager {
  init() {}

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
      const baseValue = selected[0].recipe[key];
      const cells = selected
        .map((r, i) => {
          // Recipe 1 (i=0) is the baseline — never highlighted.
          // Recipes 2–4 are highlighted only when their value differs from Recipe 1.
          const isDiff = i > 0 && r.recipe[key] !== baseValue;
          return `<td${isDiff ? ' class="diff"' : ''}>${r.recipe[key]}</td>`;
        })
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
}

const comparisonManager = new ComparisonManager();
