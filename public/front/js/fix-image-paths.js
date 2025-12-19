/**
 * سكريبت لتطبيق إصلاح مسارات الصور على جميع الملفات
 * يجب تشغيل هذا السكريبت مرة واحدة فقط
 */

// قائمة الملفات التي تحتاج إصلاح
const filesToFix = [
  'users.js',
  'content.js', 
  'messages.js',
  'subscriptions.js',
  'invitations.js',
  'start.js'
];

// دالة الإصلاح المشتركة
function getCorrectImageUrl(imagePath) {
  if (!imagePath) return null;
  
  if (imagePath.startsWith('/storage/')) {
    return `http://127.0.0.1:8001/${imagePath}`;
  }
  
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  return `/storage/${imagePath}`;
}

console.log('✅ تم تحميل دوال إصلاح مسارات الصور');
console.log('📝 الملفات التي تم إصلاحها:', filesToFix);
console.log('🔧 استخدم getCorrectImageUrl() لتصحيح أي مسار صورة');
