# Recipe Lab — Engineering Notes

---

# URL Fragment Routing

**Branch:** `feature/recipe-routing`

## Approach

Hash-based routing is handled entirely in `js/app.js` via two additions to `RecipeLabApp`:

### `handleHash()`

```javascript
handleHash() {
  const match = window.location.hash.match(/^#recipe\/(.+)$/);
  if (!match) return;                        // no recipe hash → no-op

  const recipe = getRecipeByKey(match[1]);
  if (!recipe) return;                       // invalid ID → graceful no-op

  // Auto-select a compatible camera only when none is stored
  const cameraSelect = document.getElementById('camera-select');
  if (!cameraSelect.value && recipe.compatibility.length > 0) {
    const cam = recipe.compatibility[0];
    cameraSelect.value = cam;
    appStorage.setSelectedCamera(cam);
    appUI.onCameraChanged(cam);
  }

  const source = recipe.style.includes('Film') ? 'film' : 'preset';
  appUI.loadRecipe(match[1], source);
}
```

A regex match on the hash (`/^#recipe\/(.+)$/`) extracts the recipe key. Two guard clauses (`if (!match)`, `if (!recipe)`) ensure no invalid state is ever applied — the app simply stays on the default list view.

### Registration in `init()`

```javascript
window.addEventListener('hashchange', () => this.handleHash());
this.handleHash();   // runs once for initial page load
```

## Initial page load vs. mid-session hash changes

| Scenario | Mechanism | Behaviour |
|---|---|---|
| Direct deep-link (`index.html#recipe/m10-rich`) | `this.handleHash()` called once at the end of `init()` | Full init completes first, then hash is processed. Camera is auto-selected if none is stored. |
| User navigates back/forward in browser | `hashchange` event fires | Same `handleHash()` runs; picks up the new hash and loads the corresponding recipe. |
| User shares a URL with a hash mid-session | `hashchange` event fires | As above. If a different camera is already selected, the stored camera is preserved (only auto-selects when the dropdown is empty). |

## Why there is no initialization conflict

The task specified checking for conflicts between the existing init sequence and hash-based state setting. Here is the analysis:

`init()` runs synchronously in this order:
1. All managers initialize
2. `restoreState()` — reads localStorage, sets camera, calls `appUI.onCameraChanged()`
3. `appUI.populateHistory()`
4. `hashchange` listener is registered
5. `this.handleHash()` fires

By the time step 5 runs, `restoreState()` has already populated the camera dropdown from localStorage. `handleHash()` checks `cameraSelect.value` at that point — if it is non-empty, the stored camera is respected and not overridden. If it is empty (first-ever visit), a compatible camera is auto-selected from the recipe's `compatibility` array.

No conflict exists; ordering is the solution.

## Source type detection

`appUI.loadRecipe()` accepts a `source` string (`'preset'` or `'film'`) which controls the style label displayed on the recipe card. The same heuristic used by the history renderer in `ui.js` is reused here:

```javascript
const source = recipe.style.includes('Film') ? 'film' : 'preset';
```

Preset recipes carry `style: "Preset recipe"`; film stock recipes carry `style` values containing `"Film"` (e.g. `"Film stock match"`).

---

# Comparison Diff — Logic Documentation

**Branch:** `feature/comparison-diff`

## What the diff feature does

When two or more recipes are displayed side-by-side in the Compare tab, any setting value in Recipes 2–4 that differs from the same setting in Recipe 1 receives the CSS class `diff`. Recipe 1 acts as the **baseline** and is never highlighted.

## How value mismatches are identified

The core logic lives in `ComparisonManager.renderComparisonTable()` in `js/comparison.js`:

```javascript
const baseValue = selected[0].recipe[key];   // Recipe 1 is the baseline
const cells = selected
  .map((r, i) => {
    const isDiff = i > 0 && r.recipe[key] !== baseValue;
    return `<td${isDiff ? ' class="diff"' : ''}>${r.recipe[key]}</td>`;
  })
  .join('');
```

**Step by step:**

1. For each setting row (Film Simulation, Dynamic Range, etc.), extract the value from Recipe 1 (`baseValue`).
2. Iterate over all selected recipes with their index (`i`).
3. A cell is marked as differing (`isDiff = true`) only when:
   - `i > 0` — it is not the baseline recipe itself, **and**
   - `r.recipe[key] !== baseValue` — its value differs from Recipe 1 using strict equality.
4. When `isDiff` is true, the `<td>` receives `class="diff"`. All other cells render with no class.

## Why strict equality (`!==`) is used

All recipe values stored in `recipes.js` are plain strings or numbers. Strict equality handles both types correctly without coercion and avoids false negatives (e.g. `"0" !== 0`).

## CSS

The `.diff` class is defined in `css/styles.css`:

```css
.compare-table td.diff {
  background-color: var(--diff-bg);
  font-weight: 600;
}
```

`--diff-bg` is a warm amber tint (`rgba(255, 190, 0, 0.15)` in light mode, `rgba(255, 190, 0, 0.1)` in dark mode) defined in the `:root` token block, and already present in both the system-preference dark variant and the forced `.theme-dark` variant.

## What was changed and why

| File | Change | Reason |
|---|---|---|
| `js/comparison.js` | Full `renderComparisonTable()` implementation | Comparison logic belongs in `ComparisonManager`, not `UIManager` |
| `js/ui.js` | Removed `renderComparisonTable()`; event listeners now delegate to `comparisonManager` | Single responsibility — `UIManager` handles recipe cards and tabs; `ComparisonManager` owns comparison rendering |
| `css/styles.css` | No changes | `.compare-table td.diff` and `--diff-bg` tokens were already correctly defined |

## Previous behaviour (before this branch)

The old logic in `ui.js`:

```javascript
const allSame = values.every(v => v === values[0]);
const cells = selected.map(r => `<td${allSame ? '' : ' class="diff"'}>${r.recipe[key]}</td>`).join('');
```

This applied `class="diff"` to **every** cell in a row whenever any value in that row differed — including Recipe 1's own cell. The new logic marks only the cells in Recipes 2–4 that diverge from the Recipe 1 baseline, giving the user a clear directional read: "Recipe 1 is the reference; highlighted cells show what changed."
