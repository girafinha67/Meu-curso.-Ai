// Edge Function: payment-webhook
// Recebe notificações do Mercado Pago. NUNCA confia em confirmação vinda
// do navegador — toda liberação de acesso acontece aqui, validando o
// pagamento diretamente na API do provedor antes de matricular o aluno.
import { createAdminClient, corsHeaders } from '../_shared/supabase-admin.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const admin = createAdminClient()
    const url = new URL(req.url)
    const topic = url.searchParams.get('topic') ?? url.searchParams.get('type')
    const body = await req.json().catch(() => ({}))
    const paymentId = body?.data?.id ?? url.searchParams.get('id')

    if (topic !== 'payment' || !paymentId) {
      // Mercado Pago envia vários tipos de evento; ignoramos o que não é pagamento.
      return json({ received: true })
    }

    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    if (!accessToken) return json({ error: 'Pagamento não configurado.' }, 400)

    // Busca o pagamento DIRETO na API do Mercado Pago — nunca confia no payload recebido.
    const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!paymentRes.ok) return json({ error: 'Pagamento não encontrado no provedor.' }, 400)
    const payment = await paymentRes.json()

    const orderId = payment.external_reference
    if (!orderId) return json({ received: true })

    const { data: order } = await admin.from('orders').select('*').eq('id', orderId).maybeSingle()
    if (!order) return json({ received: true })

    await admin.from('payments').upsert(
      {
        order_id: orderId,
        provider: 'mercadopago',
        provider_payment_id: String(payment.id),
        status: payment.status,
        amount_cents: Math.round((payment.transaction_amount ?? 0) * 100),
        method: payment.payment_method_id,
        raw: payment,
      },
      { onConflict: 'provider_payment_id' }
    )

    if (payment.status === 'approved' && order.status !== 'paid') {
      await admin
        .from('orders')
        .update({
          status: 'paid',
          provider_payment_id: String(payment.id),
          payment_method: payment.payment_method_id,
          paid_at: new Date().toISOString(),
        })
        .eq('id', orderId)

      // Libera o curso — matrícula real, feita pelo servidor após confirmação.
      await admin.rpc('enroll_user', {
        p_user_id: order.user_id,
        p_course_id: order.course_id,
        p_source: 'checkout',
        p_order_id: order.id,
      })
    } else if (['rejected', 'cancelled'].includes(payment.status)) {
      await admin.from('orders').update({ status: 'failed' }).eq('id', orderId)
    }

    return json({ received: true })
  } catch (err) {
    console.error('payment-webhook error:', err)
    // Sempre 200 para o Mercado Pago não ficar reenviando indefinidamente em erros já tratados,
    // mas logamos o erro real para investigação.
    return json({ received: true })
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}
