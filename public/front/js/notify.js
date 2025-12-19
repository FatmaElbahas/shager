(function(){
  // Create toast container once
  function ensureContainer(){
    let container = document.getElementById('global-toast-container');
    if(!container){
      container = document.createElement('div');
      container.id = 'global-toast-container';
      container.style.position = 'fixed';
      container.style.top = '1rem';
      container.style.left = '50%';
      container.style.transform = 'translateX(-50%)';
      container.style.zIndex = '1080'; // above modals backdrop
      container.style.pointerEvents = 'none';
      document.body.appendChild(container);
    }
    return container;
  }

  function buildToast(message, type){
    const container = ensureContainer();
    const wrapper = document.createElement('div');
    wrapper.style.pointerEvents = 'auto';

    const bgMap = {
      success: 'bg-success text-white',
      error: 'bg-danger text-white',
      info: 'bg-primary text-white',
      warning: 'bg-warning'
    };

    const titleMap = {
      success: 'تم بنجاح',
      error: 'حدث خطأ',
      info: 'تنويه',
      warning: 'تنبيه'
    };

    const headerClass = bgMap[type] || bgMap.info;
    const title = titleMap[type] || titleMap.info;

    // Use Bootstrap Toast markup if available
    wrapper.innerHTML = `
      <div class="toast shadow-lg" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3500" style="min-width: 320px; margin-bottom: 8px;">
        <div class="toast-header ${headerClass}">
          <i class="bi bi-info-circle me-2"></i>
          <strong class="me-auto">${title}</strong>
          <small class="text-light">الآن</small>
          <button type="button" class="btn-close btn-close-white ms-2 mb-1" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body" style="direction: rtl; text-align: right;">
          ${message}
        </div>
      </div>`;

    const toastEl = wrapper.querySelector('.toast');
    container.appendChild(wrapper);

    try {
      // Bootstrap 5
      if (window.bootstrap && window.bootstrap.Toast) {
        const toast = new window.bootstrap.Toast(toastEl);
        toast.show();
        toastEl.addEventListener('hidden.bs.toast', () => wrapper.remove());
      } else {
        // Fallback: simple auto-hide
        toastEl.style.display = 'block';
        setTimeout(() => {
          wrapper.remove();
        }, 3500);
      }
    } catch (e) {
      // Last resort
      console.log('Notification:', message);
      setTimeout(() => wrapper.remove(), 3500);
    }
  }

  // Public helpers
  const notify = {
    success: (msg) => buildToast(msg, 'success'),
    error: (msg) => buildToast(msg, 'error'),
    info: (msg) => buildToast(msg, 'info'),
    warning: (msg) => buildToast(msg, 'warning')
  };

  // Override window.alert to a nicer toast
  const originalAlert = window.alert;
  window.alert = function(message){
    try {
      notify.info(typeof message === 'string' ? message : String(message));
    } catch (e) {
      // If something goes wrong, fallback to original alert
      originalAlert(message);
    }
  };

  // Expose globally
  window.notify = notify;
})();
