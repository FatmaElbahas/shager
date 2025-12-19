<!DOCTYPE html>
<html lang="ar">

<head>
    <meta charset="UTF-8">
    <title>تقرير الإحصائيات</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            direction: rtl;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        th,
        td {
            border: 1px solid #444;
            padding: 8px;
            text-align: center;
        }

        th {
            background-color: #eee;
        }
    </style>
</head>

<body>
    <h2>تقرير الإحصائيات</h2>
    <table>
        <thead>
            <tr>
                <th>المعرف</th>
                <th>النوع</th>
                <th>القيمة</th>
                <th>تاريخ الإنشاء</th>
            </tr>
        </thead>
        <tbody>
            @foreach($reports as $report)
            <tr>
                <td>{{ $report->id }}</td>
                <td>{{ $report->type }}</td>
                <td>{{ $report->value }}</td>
                <td>{{ $report->created_at->format('Y-m-d') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>

</html>