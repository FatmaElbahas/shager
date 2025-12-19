<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>شجرة العائلة</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f7f5eb;
            margin: 0;
            padding: 20px;
        }
        
        .family-tree {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .family-member {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            margin: 10px;
            background-color: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            min-width: 150px;
            text-align: center;
        }
        
        .family-member.level-0 {
            background-color: #d1fae5;
            border-color: #10b981;
            min-width: 200px;
        }
        
        .family-member.level-1 {
            background-color: #fef3c7;
            border-color: #f59e0b;
        }
        
        .family-member.level-2 {
            background-color: #dbeafe;
            border-color: #3b82f6;
        }
        
        .member-info h3 {
            margin: 0 0 5px 0;
            color: #333;
        }
        
        .age {
            margin: 0;
            color: #666;
            font-size: 0.9em;
        }
        
        .children {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            margin-top: 15px;
            gap: 10px;
        }
        
        @media (max-width: 768px) {
            .family-member {
                min-width: 120px;
                padding: 10px;
            }
            
            .family-member.level-0 {
                min-width: 150px;
            }
        }
    </style>
</head>
<body>
    <div class="family-tree">
        <h1>شجرة العائلة</h1>
        <div class="family-member level-0" data-id="root">
  <div class="member-info">
    <h3>محمد</h3>
    <p class="age">الجد</p>
  </div>
  <div class="children">
  <div class="family-member level-1" data-id="mosaad-branch">
    <div class="member-info">
      <h3>مسعد</h3>
      <p class="age">50</p>
    </div>
    <div class="children">
    <div class="family-member level-2" data-id="mohamed-sub">
      <div class="member-info">
        <h3>محمد</h3>
        <p class="age">25</p>
      </div>
    </div>
    </div>
  </div>
  <div class="family-member level-1" data-id="kamal">
    <div class="member-info">
      <h3>كمال</h3>
      <p class="age">45</p>
    </div>
    <div class="children">
    <div class="family-member level-2" data-id="abubakr">
      <div class="member-info">
        <h3>ابوبكر</h3>
        <p class="age">20</p>
      </div>
    </div>
    <div class="family-member level-2" data-id="hassan">
      <div class="member-info">
        <h3>حسن</h3>
        <p class="age">18</p>
      </div>
    </div>
    <div class="family-member level-2" data-id="abdelaziz">
      <div class="member-info">
        <h3>عبدالعزيز</h3>
        <p class="age">15</p>
      </div>
    </div>
    </div>
  </div>
  <div class="family-member level-1" data-id="mohsen">
    <div class="member-info">
      <h3>محسن</h3>
      <p class="age">55</p>
    </div>
    <div class="children">
    <div class="family-member level-2" data-id="hamza">
      <div class="member-info">
        <h3>حمزة</h3>
        <p class="age">30</p>
      </div>
    </div>
    <div class="family-member level-2" data-id="oweiss">
      <div class="member-info">
        <h3>اويس</h3>
        <p class="age">28</p>
      </div>
    </div>
    <div class="family-member level-2" data-id="tamim">
      <div class="member-info">
        <h3>تيم</h3>
        <p class="age">25</p>
      </div>
    </div>
    <div class="family-member level-2" data-id="tamim2">
      <div class="member-info">
        <h3>تميم</h3>
        <p class="age">24</p>
      </div>
    </div>
    <div class="family-member level-2" data-id="rajab">
      <div class="member-info">
        <h3>رجب</h3>
        <p class="age">22</p>
      </div>
    </div>
    <div class="family-member level-2" data-id="jumaa">
      <div class="member-info">
        <h3>جمعه</h3>
        <p class="age">20</p>
      </div>
    </div>
    <div class="family-member level-2" data-id="abdelnasser">
      <div class="member-info">
        <h3>عبدالناصر</h3>
        <p class="age">30</p>
      </div>
    </div>
    <div class="family-member level-2" data-id="ibrahim">
      <div class="member-info">
        <h3>ابراهيم</h3>
        <p class="age">28</p>
      </div>
    </div>
    <div class="family-member level-2" data-id="anwar">
      <div class="member-info">
        <h3>انور</h3>
        <p class="age">26</p>
      </div>
    </div>
    <div class="family-member level-2" data-id="morsi">
      <div class="member-info">
        <h3>مرسي</h3>
        <p class="age">24</p>
      </div>
    </div>
    </div>
  </div>
  <div class="family-member level-1" data-id="yassin">
    <div class="member-info">
      <h3>ياسين</h3>
      <p class="age">52</p>
    </div>
    <div class="children">
    <div class="family-member level-2" data-id="sofian">
      <div class="member-info">
        <h3>سفيان</h3>
        <p class="age">26</p>
      </div>
    </div>
    <div class="family-member level-2" data-id="hesham">
      <div class="member-info">
        <h3>هشام</h3>
        <p class="age">24</p>
      </div>
    </div>
    <div class="family-member level-2" data-id="khalil-sub">
      <div class="member-info">
        <h3>خليل</h3>
        <p class="age">22</p>
      </div>
    </div>
    <div class="family-member level-2" data-id="essam">
      <div class="member-info">
        <h3>عصام</h3>
        <p class="age">20</p>
      </div>
    </div>
    <div class="family-member level-2" data-id="karim-sub">
      <div class="member-info">
        <h3>كريم</h3>
        <p class="age">18</p>
      </div>
    </div>
    </div>
  </div>
  <div class="family-member level-1" data-id="amr">
    <div class="member-info">
      <h3>عمرو</h3>
      <p class="age">50</p>
    </div>
    <div class="children">
    <div class="family-member level-2" data-id="yahya">
      <div class="member-info">
        <h3>يحيي</h3>
        <p class="age">21</p>
      </div>
    </div>
    <div class="family-member level-2" data-id="kamel">
      <div class="member-info">
        <h3>كامل</h3>
        <p class="age">27</p>
      </div>
    </div>
    <div class="family-member level-2" data-id="mahmoud-sub">
      <div class="member-info">
        <h3>محمود</h3>
        <p class="age">25</p>
      </div>
    </div>
    <div class="family-member level-2" data-id="abbas">
      <div class="member-info">
        <h3>عباس</h3>
        <p class="age">35</p>
      </div>
      <div class="children">
      <div class="family-member level-3" data-id="salman">
        <div class="member-info">
          <h3>سلمان</h3>
          <p class="age">10</p>
        </div>
      </div>
      <div class="family-member level-3" data-id="nasser">
        <div class="member-info">
          <h3>ناصر</h3>
          <p class="age">8</p>
        </div>
      </div>
      <div class="family-member level-3" data-id="bilal">
        <div class="member-info">
          <h3>بلال</h3>
          <p class="age">6</p>
        </div>
      </div>
      <div class="family-member level-3" data-id="ahmed">
        <div class="member-info">
          <h3>أحمد</h3>
          <p class="age">5</p>
        </div>
      </div>
      <div class="family-member level-3" data-id="ismail">
        <div class="member-info">
          <h3>اسماعيل</h3>
          <p class="age">4</p>
        </div>
      </div>
      <div class="family-member level-3" data-id="moamen">
        <div class="member-info">
          <h3>مؤمن</h3>
          <p class="age">12</p>
        </div>
      </div>
      <div class="family-member level-3" data-id="khaled-sub">
        <div class="member-info">
          <h3>خالد</h3>
          <p class="age">11</p>
        </div>
      </div>
      <div class="family-member level-3" data-id="ibrahim-sub">
        <div class="member-info">
          <h3>ابراهيم</h3>
          <p class="age">9</p>
        </div>
      </div>
      </div>
    </div>
    </div>
  </div>
  <div class="family-member level-1" data-id="khalil">
    <div class="member-info">
      <h3>خليل</h3>
      <p class="age">48</p>
    </div>
    <div class="children">
    <div class="family-member level-2" data-id="karam">
      <div class="member-info">
        <h3>كرم</h3>
        <p class="age">20</p>
      </div>
    </div>
    <div class="family-member level-2" data-id="khaled">
      <div class="member-info">
        <h3>خالد</h3>
        <p class="age">18</p>
      </div>
    </div>
    <div class="family-member level-2" data-id="salim">
      <div class="member-info">
        <h3>سليم</h3>
        <p class="age">25</p>
      </div>
      <div class="children">
      <div class="family-member level-3" data-id="salim-sub">
        <div class="member-info">
          <h3>سليم</h3>
          <p class="age">5</p>
        </div>
      </div>
      <div class="family-member level-3" data-id="mahmoud">
        <div class="member-info">
          <h3>محمود</h3>
          <p class="age">4</p>
        </div>
      </div>
      <div class="family-member level-3" data-id="mortada">
        <div class="member-info">
          <h3>مرتضى</h3>
          <p class="age">3</p>
        </div>
      </div>
      <div class="family-member level-3" data-id="ali">
        <div class="member-info">
          <h3>علي</h3>
          <p class="age">2</p>
        </div>
      </div>
      </div>
    </div>
    <div class="family-member level-2" data-id="omar-sub">
      <div class="member-info">
        <h3>عمر</h3>
        <p class="age">22</p>
      </div>
      <div class="children">
      <div class="family-member level-3" data-id="seif">
        <div class="member-info">
          <h3>سيف</h3>
          <p class="age">5</p>
        </div>
      </div>
      <div class="family-member level-3" data-id="mustafa">
        <div class="member-info">
          <h3>مصطفى</h3>
          <p class="age">4</p>
        </div>
      </div>
      <div class="family-member level-3" data-id="karim-sub2">
        <div class="member-info">
          <h3>كريم</h3>
          <p class="age">2</p>
        </div>
      </div>
      </div>
    </div>
    </div>
  </div>
  </div>
</div>

    </div>
</body>
</html>