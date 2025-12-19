/**
 * دوال مساعدة لمعالجة مسارات الصور
 * يجب تضمين هذا الملف في جميع الصفحات التي تتعامل مع صور من Laravel
 */

// دالة مساعدة لتصحيح مسارات الصور
function getCorrectImageUrl(imagePath) {
  if (!imagePath) return null;
  
  // إذا كان المسار يبدأ بـ /storage/ فهو من Laravel
  if (imagePath.startsWith('/storage/')) {
    return `http://127.0.0.1:8001/${imagePath}`;
  }
  
  // إذا كان مسار كامل، استخدمه كما هو
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // مسار نسبي، أضف Laravel server
  return `/storage/${imagePath}`;
}

// دالة لتحديث صورة عنصر HTML
function updateImageSrc(elementId, imagePath, fallbackImage = 'images/default-avatar.png') {
  const element = document.getElementById(elementId);
  if (element) {
    element.src = getCorrectImageUrl(imagePath) || fallbackImage;
  }
}

// دالة لإنشاء عنصر صورة مع المسار الصحيح
function createImageElement(imagePath, attributes = {}) {
  const img = document.createElement('img');
  img.src = getCorrectImageUrl(imagePath) || attributes.fallback || 'images/default-avatar.png';
  
  // تطبيق الخصائص الإضافية
  Object.keys(attributes).forEach(key => {
    if (key !== 'fallback') {
      img.setAttribute(key, attributes[key]);
    }
  });
  
  return img;
}

// تصدير الدوال للاستخدام في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getCorrectImageUrl,
    updateImageSrc,
    createImageElement
  };
}
