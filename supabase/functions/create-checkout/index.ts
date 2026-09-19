// Edge Function: create-checkout
// Cria o pedido no banco e a preferência de pagamento no Mercado Pago.
// A chave MERCADOPAGO_ACCESS_TOKEN nunca é exposta ao frontend.
import { createAdminClient, corsHeaders, getAuthenticatedUser } from '../_shared/supabase-admin.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { user, admin } = await getAuthenticatedUser(req)
    if (!user) return json({ error: 'Não autenticado.' }, 401)

    const { data: course } = await admin.from('courses').select('*').eq('is_published', true).limit(1).maybeSingle()
    if (!course) return json({ error: 'Curso não encontrado.' }, 404)

    // Já matriculado? Evita cobrar de novo.
    const { data: existingEnrollment } = await admin
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', course.id)
      .eq('status', 'active')
      .maybeSingle()
    if (existingEnrollment) {
      return json({ alreadyEnrolled: true })
    }

    const { data: order, error: orderError } = await admin
      .from('orders')
      .insert({
        user_id: user.id,
        course_id: course.id,
        amount_cents: course.price_cents,
        status: 'pending',
        provider: 'mercadopago',
        customer_email: user.email,
      })
      .select()
      .single()
    if (orderError) throw orderError

    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    const appUrl = Deno.env.get('APP_URL') ?? 'http://localhost:3000'

    if (!accessToken) {
      // Estrutura pronta, mas sem credencial configurada ainda.
      return json({
        error:
          'Pagamento ainda não configurado. Defina MERCADOPAGO_ACCESS_TOKEN nas variáveis de ambiente das Edge Functions.',
        orderId: order.id,
      }, 400)
    }

    const preferenceRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({
        items: [
          {
            title: course.title,
            quantity: 1,
            unit_price: course.price_cents / 100,
            currency_id: 'BRL',
          },
        ],
        payer: { email: user.email },
        back_urls: {
          success: `${appUrl}/sucesso`,
          failure: `${appUrl}/checkout`,
          pending: `${appUrl}/checkout`,
        },
        auto_return: 'approved',
        external_reference: order.id,
        notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-webhook`,
      }),
    })

    if (!preferenceRes.ok) {
      const errText = await preferenceRes.text()
      console.error('Erro Mercado Pago:', errText)
      return json({ error: 'Não foi possível iniciar o pagamento agora. Tente novamente.' }, 502)
    }

    const preference = await preferenceRes.json()

    await admin.from('orders').update({ provider_preference_id: preference.id }).eq('id', order.id)

    return json({ checkoutUrl: preference.init_point, orderId: order.id })
  } catch (err) {
    console.error('create-checkout error:', err)
    return json({ error: 'Não foi possível iniciar o checkout. Tente novamente.' }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}
