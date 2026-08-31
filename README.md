# פלטפורמת לידים למשלוחים

מערכת שמחברת בין לקוחות שמחפשים שירותי משלוח/הובלה לבין ספקים, עם עמלה על כל
עסקה. הלידים מגיעים **בהסכמה מפורשת** (opt-in) דרך דפי נחיתה, ולא דרך גירוד
או פרסום אוטומטי בקבוצות/פורומים — זה מפר את תנאי השימוש של הפלטפורמות ואת
חוק הספאם (תיקון 40 לחוק התקשורת), ולכן במכוון לא נתמך כאן.

## מה יש כאן

- **50 דפי נחיתה** (`/lp/[slug]`) — קומבינציה של 10 ערים × 5 סוגי משלוח,
  מוגדרים ב-`src/lib/landingPages.ts`. הוספת עיר/סוג משלוח נוספת = שורה אחת.
- **טופס ליד עם צ'קבוקס הסכמה חובה** — אי אפשר לשלוח בלי אישור מפורש.
- **התאמת ספק אוטומטית** — `POST /api/leads` מגאוקד את הכתובת (Google
  Geocoding API) ומוצא את הספק הפעיל הקרוב ביותר מאותה קטגוריה.
- **התראת וואטסאפ מיידית** על כל ליד חדש, דרך ה-WhatsApp Cloud API הרשמי של
  Meta (`src/lib/whatsapp.ts`).
- **קמפיינים ממומנים אוטומטיים** ב-Facebook/Instagram וב-Google Ads, דרך
  ה-SDK-ים הרשמיים (`src/lib/ads/`), מופעלים דרך `npm run ads:launch`. כל
  קמפיין נוצר **במצב מושהה (PAUSED)** בכוונה — יש לבדוק ולהפעיל ידנית ב-Ads
  Manager, כדי שלא ייווצר תקציב פרסום בלי בקרה אנושית.
- **לוח ניהול** — `/admin/leads` (רשימת לידים ועמלות) ו-`/admin/suppliers`
  (רשימת ספקים + טופס הוספה).

## הפעלה מקומית

```bash
npm install
cp .env.example .env   # ומלא את המפתחות שלך
npm run db:push        # יוצר את בסיס הנתונים לפי prisma/schema.prisma
npm run db:seed        # מזין כמה ספקים לדוגמה
npm run dev
```

האתר יעלה על `http://localhost:3000`. עמוד הבית מציג קישורים לכל 50 דפי
הנחיתה, ו-`/admin/leads` + `/admin/suppliers` מציגים את הנתונים.

## מפתחות API שצריך להשלים ב-`.env`

| משתנה | לאן ללכת |
|---|---|
| `GOOGLE_MAPS_API_KEY` | Google Cloud Console, הפעלת Geocoding API |
| `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `ADMIN_WHATSAPP_NUMBER` | Meta Business Manager → WhatsApp → API Setup |
| `FACEBOOK_ACCESS_TOKEN`, `FACEBOOK_AD_ACCOUNT_ID`, `FACEBOOK_PAGE_ID` | Meta Business Manager → Marketing API |
| `GOOGLE_ADS_*` | Google Ads API — [מדריך רשמי](https://developers.google.com/google-ads/api/docs/get-started) |

לפני הרצת `npm run ads:launch` לגוגל, צריך למלא ב-`scripts/createCampaigns.ts`
את `GEO_TARGET_CONSTANTS` עם מזהי המיקום המספריים של Google Ads לכל עיר
(נמצאים ב-[רשימת ה-geo targets הרשמית](https://developers.google.com/google-ads/api/data/geotargets)
או דרך `GeoTargetConstantService`).

## דברים שחשוב להוסיף לפני production

- **אימות (auth)** בעמודי `/admin/*` — כרגע פתוחים לכל מי שיודע את הכתובת.
- מעבר מ-SQLite ל-Postgres (`DATABASE_URL` + שינוי `provider` ב-`schema.prisma`).
- תבנית WhatsApp מאושרת (`new_lead_alert`) אם רוצים לשלוח התראות גם מחוץ
  לחלון שיחה של 24 שעות מול המספר של הלקוח/אדמין.
- Rate limiting על `POST /api/leads` כדי למנוע spam בטפסים עצמם.
