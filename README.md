# Dr. Di Clinic

Модерен сайт за естетична клиника — React, TypeScript, Three.js и WebGL шейдъри.

## Features

- **WebGL Shader Background** — анимиран звезден фон с падащи звезди и мъглявина (пауза при скрит таб, статичен кадър при reduced-motion)
- **Three.js 3D Procedure Sphere** — интерактивна 3D сфера с етикети за процедурите (lazy chunk, зарежда се при доближаване на секцията; списъчен изглед по подразбиране на тъч устройства)
- **GSAP Scroll Animations** — scroll-reveal анимации със зачитане на `prefers-reduced-motion`
- **Lenis smooth scroll** — синхронизиран с GSAP ScrollTrigger
- **Cal.com booking** — popup за запазване на час, зарежда се при съгласие или при клик
- **GDPR consent** — банерът реално управлява зареждането на Cal.com и Google Maps
- **Dark Luxury Design** — тъмнозелено + злато, Playfair Display / Inter
- **Responsive** — мобилен, таблет, десктоп

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS
- Three.js (3D сфера с CSS3D етикети)
- GSAP + ScrollTrigger, Lenis
- WebGL шейдъри (звезден фон)
- Vercel (hosting + Serverless Functions)

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Запазване на часове (Cal.com)

Системата за часове ползва вграден **Cal.com** popup, който се отваря от всеки бутон
„Запази час". Реалната наличност и потвържденията се управляват от акаунта на клиниката.

> ⚠️ **Преди публикуване:** текущият fallback линк в `src/lib/booking.ts` е временен
> тестов календар (лична 30-мин „Cal Video" среща). Създайте акаунт на клиниката с
> **присъствен** event type (с адреса на клиниката) и задайте `VITE_CAL_LINK`.

Настройка:

1. Създайте акаунт в [cal.com](https://cal.com) и направете event type
   (напр. „Консултация", присъствено, с работно време и продължителност).
2. Вземете линка във формат `username/event-slug` (напр. `di-care/konsultacia`).
3. Задайте променливата на средата **`VITE_CAL_LINK`**:
   - локално: копирайте `.env.example` в `.env.local`;
   - на Vercel: **Settings → Environment Variables → `VITE_CAL_LINK`**, после redeploy.

Темата на календара (тъмно + златно) се задава в `src/lib/booking.ts`.

**GDPR:** embed скриптът на Cal се зарежда предварително само ако потребителят е
приел всички бисквитки; иначе — чак при клик на „Запази час". Ако скриптът е
блокиран (adblock), бутонът води към контактната форма.

## Контактна форма (Resend)

Формата изпраща имейл до клиниката чрез Vercel Serverless Function
(`api/contact.js`) + [Resend](https://resend.com). Без конфигурация формата показва
грешка с телефона като резервен канал (никога фалшив „успех").

Env променливи във Vercel:

| Променлива | Описание |
|---|---|
| `RESEND_API_KEY` | API ключ от resend.com (задължително) |
| `CONTACT_TO` | Имейл на клиниката (по подразбиране `drdiclinic21@gmail.com`) |
| `CONTACT_FROM` | Изпращач. До верифициране на домейн: `Dr. Di Clinic <onboarding@resend.dev>` (Resend тогава изпраща само към имейла на акаунта) |

В dev режим формата симулира успех и логва заявката в конзолата.

## Project Structure

```
api/
  contact.js           # Vercel Function: изпращане на формата през Resend
src/
  components/
    Header.tsx          # Фиксирана навигация + мобилно меню (Esc, focus trap)
    LoadingScreen.tsx   # Loading екран (само първо посещение в сесията)
    ShaderBackground.tsx# WebGL звезден фон
    ProcedureSphere.tsx # Three.js 3D сфера
    ProcedureGrid.tsx   # Достъпен списъчен изглед на процедурите
    ContactForm.tsx     # Форма със заявка за час
    CookieConsent.tsx   # GDPR банер (управлява Cal/Maps зареждането)
    BookingButton.tsx   # Всички бутони „Запази час" (Cal popup + fallback)
  sections/
    Hero.tsx            # Hero с текстова анимация
    ProcedureSection.tsx# Секция със сфера/списък
    Services.tsx        # Карти на услугите
    WhyUs.tsx           # Ценности на клиниката (grid)
    Equipment.tsx       # Апаратура
    Contact.tsx         # Форма + карта (двукликово зареждане) + контакти
    Footer.tsx          # Футър (вкл. „Настройки на бисквитките")
  pages/
    Home.tsx            # Начална страница
    ServicePage.tsx     # Страница на услуга (/uslugi/:slug)
    Privacy.tsx         # Политика за поверителност
  lib/
    booking.ts          # Cal.com конфигурация и зареждане
    consent.ts          # GDPR съгласие (storage + събития)
    scroll.ts           # Lenis помощници (винаги с force: true!)
    seo.ts              # Per-route title/canonical/OG мета
  data/
    procedures.ts       # Процедури и категории (единен източник)
    services.ts         # Съдържание за страниците на услугите
public/
  images/               # Лога + og-image.png
  apple-touch-icon.png  # 180×180
  robots.txt, sitemap.xml
```

## SEO

- Per-route `<title>`, `meta description`, `canonical` и OG тагове (`src/lib/seo.ts`)
- `robots.txt`, `sitemap.xml`, JSON-LD `MedicalClinic` схема в `index.html`
- OG изображение 1200×630 (`public/images/og-image.png`)

## License

All rights reserved — Dr. Di Clinic.
