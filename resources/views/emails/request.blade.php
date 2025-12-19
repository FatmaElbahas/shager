<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="UTF-8">
    <title>طلب جديد من مستخدم</title>
</head>

<body>
    <h2>طلب انضمام للعائلة</h2>
    <p><strong>الاسم:</strong> {{ $activity->user_name }}</p>
    <p><strong>الايميل:</strong> {{ $activity->user_email }}</p>
    <p><strong>رقم الجوال:</strong> {{ $activity->user_phone }}</p>
    <p><strong>اسم العائلة / القبيلة:</strong> {{ $activity->family_name }}</p>
    <p><strong>سبب طلب الانضمام :</strong></p>
    <p>{{ $activity->user_message }}</p>
    <p><strong>تاريخ الميلاد:</strong> {{ $activity->birth_date }}</p>
    <p><strong>الحالة الاجتماعية:</strong> {{ $activity->social_status }}</p>
    <p><strong>الوظيفة:</strong> {{ $activity->job }}</p>
    <p><strong>الحالة الحالية للنشاط:</strong> {{ $activity->status }}</p>

</body>

</html>