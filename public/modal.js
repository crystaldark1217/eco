// Modal Confirmation System
class ModalManager {
    constructor() {
        this.overlay = null;
    }

    show(options) {
        return new Promise((resolve) => {
            // Create overlay
            this.overlay = document.createElement('div');
            this.overlay.className = 'modal-overlay';
            
            const iconClass = options.type === 'danger' ? 'danger' : 
                            options.type === 'warning' ? 'warning' : 'success';
            
            const iconName = options.type === 'danger' ? 'fa-exclamation-triangle' :
                           options.type === 'warning' ? 'fa-exclamation-circle' : 'fa-check-circle';
            
            this.overlay.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="modal-icon ${iconClass}">
                            <i class="fas ${iconName}"></i>
                        </div>
                        <h3 class="modal-title">${options.title || 'Confirm Action'}</h3>
                    </div>
                    <div class="modal-body">
                        ${options.message || 'Are you sure you want to proceed?'}
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-secondary modal-cancel">
                            <i class="fas fa-times"></i>
                            ${options.cancelText || 'Cancel'}
                        </button>
                        <button class="btn ${options.type === 'danger' ? 'btn-danger' : 'btn-primary'} modal-confirm">
                            <i class="fas fa-check"></i>
                            ${options.confirmText || 'Confirm'}
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(this.overlay);
            
            // Add event listeners
            const cancelBtn = this.overlay.querySelector('.modal-cancel');
            const confirmBtn = this.overlay.querySelector('.modal-confirm');
            
            cancelBtn.addEventListener('click', () => {
                this.close();
                resolve(false);
            });
            
            confirmBtn.addEventListener('click', () => {
                this.close();
                resolve(true);
            });
            
            // Close on overlay click
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) {
                    this.close();
                    resolve(false);
                }
            });
        });
    }

    close() {
        if (this.overlay) {
            this.overlay.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                if (this.overlay && this.overlay.parentElement) {
                    this.overlay.remove();
                }
                this.overlay = null;
            }, 300);
        }
    }

    confirm(message, title = 'Confirm Action') {
        return this.show({
            title,
            message,
            type: 'warning',
            confirmText: 'Confirm',
            cancelText: 'Cancel'
        });
    }

    danger(message, title = 'Warning') {
        return this.show({
            title,
            message,
            type: 'danger',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        });
    }
}

// Create global modal instance
const modal = new ModalManager();