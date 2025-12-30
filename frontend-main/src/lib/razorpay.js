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
    // Use payment link for new activities
    const paymentLink = 'https://rzp.io/rzp/FTxz5Xk'
    
    // Redirect to payment link
    window.location.href = paymentLink
    
    // Note: Payment verification will need to be handled via webhook
    // or callback URL configured in Razorpay dashboard
  } catch (error) {
    onFailure?.(error)
  }
}

