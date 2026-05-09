class ImageStorage {
  constructor() {
    this.db = null;
    this.available = false;
    this._DB_NAME = 'recipe_lab_images';
    this._DB_VERSION = 1;
    this._STORE = 'reference_images';
    this._KEY = 'comparison_reference';
  }

  async init() {
    if (!window.indexedDB) return;
    try {
      this.db = await this._open();
      this.available = true;
    } catch {
      // IndexedDB blocked or unavailable — session-only object URL fallback applies
    }
  }

  _open() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this._DB_NAME, this._DB_VERSION);
      req.onupgradeneeded = e => {
        e.target.result.createObjectStore(this._STORE);
      };
      req.onsuccess = e => resolve(e.target.result);
      req.onerror = e => reject(e.target.error);
      req.onblocked = () => reject(new Error('IndexedDB blocked'));
    });
  }

  async save(blob) {
    if (!this.available) return;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this._STORE, 'readwrite');
      tx.objectStore(this._STORE).put(blob, this._KEY);
      tx.oncomplete = resolve;
      tx.onerror = e => reject(e.target.error);
    });
  }

  async load() {
    if (!this.available) return null;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this._STORE, 'readonly');
      const req = tx.objectStore(this._STORE).get(this._KEY);
      req.onsuccess = e => resolve(e.target.result ?? null);
      req.onerror = e => reject(e.target.error);
    });
  }

  async clear() {
    if (!this.available) return;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this._STORE, 'readwrite');
      tx.objectStore(this._STORE).delete(this._KEY);
      tx.oncomplete = resolve;
      tx.onerror = e => reject(e.target.error);
    });
  }
}

const imageStorage = new ImageStorage();