// Razorpay Checkout Handler
// Isolated, reusable payment logic

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export const initiateRazorpayCheckout = async ({
  amount,
  activityName,
  activityId,
  attendeeName,
  attendeeEmail,
  attendeePhone,
  onSuccess,
  onFailure,
}) => {
  try {
    const scriptLoaded = await loadRazorpayScript()
    if (!scriptLoaded) {
      throw new Error('Failed to load Razorpay script')
    }

    // Create order on backend
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.exora.in'
    const token = document.cookie
      .split(';')
      .find((c) => c.trim().startsWith('authToken='))
      ?.split('=')[1]

    const orderResponse = await fetch(`${API_BASE_URL}/api/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to paise
        activityId,
        activityName,
      }),
    })

    if (!orderResponse.ok) {
      throw new Error('Failed to create payment order')
    }

    const orderData = await orderResponse.json()

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: amount * 100,
      currency: 'INR',
      name: 'Exora',
      description: activityName,
      order_id: orderData.orderId,
      handler: async function (response) {
        try {
          // Verify payment on backend
          const verifyResponse = await fetch(`${API_BASE_URL}/api/payments/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              activityId,
              attendeeName,
              attendeeEmail,
              attendeePhone,
            }),
          })

          const verifyData = await verifyResponse.json()

          if (verifyData.success) {
            onSuccess?.(response, verifyData)
          } else {
            onFailure?.(new Error(verifyData.message || 'Payment verification failed'))
          }
        } catch (error) {
          onFailure?.(error)
        }
      },
      prefill: {
        name: attendeeName || '',
        email: attendeeEmail || '',
        contact: attendeePhone || '',
      },
      theme: {
        color: '#0a7ea4',
      },
      modal: {
        ondismiss: () => {
          onFailure?.(new Error('Payment cancelled by user'))
        },
      },
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()
  } catch (error) {
    onFailure?.(error)
  }
}

