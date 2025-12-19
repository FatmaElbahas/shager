<!DOCTYPE html>
<html lang="ar" dir="rtl">

<body>
    <h2>رسالة من نموذج التواصل</h2>
    <p><strong>الاسم:</strong> {{ $details['name'] }}</p>
    <p><strong>الإيميل:</strong> {{ $details['email'] }}</p>
    <p><strong>الموضوع:</strong> {{ $details['subject'] }}</p>
    <p><strong>الرسالة:</strong></p>
    <p>{{ $details['message'] }}</p>
</body>

</html>