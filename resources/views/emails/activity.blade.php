<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="UTF-8">
    <title>طلب جديد من مستخدم</title>
</head>

<body>
    <h2>طلب إنشاء شجرة جديد</h2>
    <p><strong>الاسم:</strong> {{ $activity->user_name }}</p>
    <p><strong>الإيميل:</strong> {{ $activity->user_email }}</p>
    <p><strong>رقم الجوال:</strong> {{ $activity->user_phone }}</p>
    <p><strong>اسم العائلة / القبيلة:</strong> {{ $activity->family_name }}</p>
    <p><strong>نبذة عن العائلة:</strong></p>
    <p>{{ $activity->user_message }}</p>
    <p><strong>الحالة الحالية للنشاط:</strong> {{ $activity->status }}</p>

</body>

</html>