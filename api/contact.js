// Vercel Serverless Function: приема заявката от контактната форма и я
// изпраща като имейл до клиниката чрез Resend (https://resend.com).
//
// Нужни env променливи във Vercel (Settings → Environment Variables):
//   RESEND_API_KEY   — API ключ от resend.com (безплатният план стига)
//   CONTACT_TO       — имейл на клиниката (по подразбиране drdiclinic21@gmail.com)
//   CONTACT_FROM     — изпращач; до верифициране на домейн ползвайте
//                      "Dr. Di Clinic <onboarding@resend.dev>" (Resend позволява
//                      изпращане само към имейла на акаунта, докато няма домейн).
//
// Без конфигуриран RESEND_API_KEY функцията връща 503 и формата показва
// съобщение за грешка с телефона като резервен канал — никога фалшив успех.

const MESSAGE_MAX = 600

/** Минимална защита от злоупотреба: дължини + задължителни полета. */
function validate(body) {
  if (!body || typeof body !== 'object') return 'Невалидна заявка.'
  const name = String(body.name ?? '').trim()
  const phone = String(body.phone ?? '').trim()
  if (name.length < 2 || name.length > 120) return 'Невалидно име.'
  if (phone.replace(/\D/g, '').length < 6 || phone.length > 30) return 'Невалиден телефон.'
  if (String(body.message ?? '').length > MESSAGE_MAX) return 'Твърде дълго съобщение.'
  if (String(body.email ?? '').length > 200) return 'Невалиден имейл.'
  return null
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body

  // Honeypot: ботовете попълват скритото поле — преструваме се на успех.
  if (body && typeof body.company === 'string' && body.company.trim() !== '') {
    return res.status(200).json({ ok: true })
  }

  const invalid = validate(body)
  if (invalid) return res.status(400).json({ ok: false, error: invalid })

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('[contact] RESEND_API_KEY не е зададен — заявката не е изпратена.')
    return res.status(503).json({ ok: false, error: 'Изпращането не е конфигурирано.' })
  }

  const to = process.env.CONTACT_TO || 'drdiclinic21@gmail.com'
  const from = process.env.CONTACT_FROM || 'Dr. Di Clinic <onboarding@resend.dev>'

  const name = String(body.name).trim()
  const phone = String(body.phone).trim()
  const email = String(body.email ?? '').trim()
  const procedure = String(body.procedure ?? '').trim()
  const message = String(body.message ?? '').trim()

  const lines = [
    `<p><strong>Име:</strong> ${escapeHtml(name)}</p>`,
    `<p><strong>Телефон:</strong> <a href="tel:${escapeHtml(phone.replace(/\s/g, ''))}">${escapeHtml(phone)}</a></p>`,
    email && `<p><strong>Имейл:</strong> ${escapeHtml(email)}</p>`,
    procedure && `<p><strong>Услуга:</strong> ${escapeHtml(procedure)}</p>`,
    message && `<p><strong>Съобщение:</strong><br/>${escapeHtml(message).replaceAll('\n', '<br/>')}</p>`,
  ].filter(Boolean)

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email || undefined,
        subject: `Заявка за час от сайта — ${name}${procedure ? ` (${procedure})` : ''}`,
        html: `<h2>Нова заявка от drdiclinic сайта</h2>${lines.join('')}`,
      }),
    })

    if (!resendRes.ok) {
      const detail = await resendRes.text().catch(() => '')
      console.error('[contact] Resend отказа изпращането:', resendRes.status, detail)
      return res.status(502).json({ ok: false, error: 'Изпращането се провали.' })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[contact] Грешка при изпращане:', err)
    return res.status(500).json({ ok: false, error: 'Вътрешна грешка.' })
  }
}

function safeParse(s) {
  try {
    return JSON.parse(s)
  } catch {
    return null
  }
}
