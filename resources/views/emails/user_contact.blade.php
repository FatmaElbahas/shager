<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="UTF-8">
    <title>طلب مراسلة جديد من مستخدم</title>
</head>

<body>
    <h2>طلب مراسلة جديد :</h2>
    <p><strong>الاسم:</strong> {{ $activity->user_name }}</p>
    <p><strong>رقم الجوال:</strong> {{ $activity->user_phone }}</p>
    <p><strong>اسم العائلة / القبيلة:</strong> {{ $activity->family_name }}</p>
    <p><strong>سبب طلب المراسلة :</strong></p>
    <p>{{ $activity->user_message }}</p>

</body>

</html>