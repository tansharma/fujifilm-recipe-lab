class PermissionsManager {
  constructor() {
    this.fileInput = null;
  }

  init() {
    this.fileInput = document.getElementById('image-input');
    if (!this.fileInput) {
      console.warn('File input element not found');
    }
  }

  requestPhotoLibraryAccess() {
    if (!this.fileInput) {
      console.error('File input not initialized');
      return Promise.reject(new Error('File input not available'));
    }

    return new Promise((resolve, reject) => {
      const handleChange = () => {
        this.fileInput.removeEventListener('change', handleChange);
        this.fileInput.removeEventListener('cancel', handleCancel);
        
        if (this.fileInput.files && this.fileInput.files[0]) {
          const file = this.fileInput.files[0];
          const reader = new FileReader();
          
          reader.onload = (e) => {
            resolve({
              url: e.target.result,
              name: file.name,
              type: file.type,
              size: file.size
            });
          };
          
          reader.onerror = () => {
            reject(new Error('Failed to read file'));
          };
          
          reader.readAsDataURL(file);
        }
      };

      const handleCancel = () => {
        this.fileInput.removeEventListener('change', handleChange);
        this.fileInput.removeEventListener('cancel', handleCancel);
        reject(new Error('User cancelled image selection'));
      };

      this.fileInput.addEventListener('change', handleChange);
      this.fileInput.addEventListener('cancel', handleCancel);
      
      this.fileInput.click();
    });
  }

  canAccessFiles() {
    return typeof File !== 'undefined' && typeof FileReader !== 'undefined';
  }

  async getPermissionStatus() {
    if (!navigator.permissions) {
      return { status: 'unknown', message: 'Permissions API not available' };
    }

    try {
      const result = await navigator.permissions.query({ name: 'camera' });
      return {
        status: result.state,
        message: `Camera permission: ${result.state}`
      };
    } catch (err) {
      return { status: 'unknown', message: 'Could not check permissions' };
    }
  }
}

const permissionsManager = new PermissionsManager();
