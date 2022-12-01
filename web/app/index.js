document.addEventListener('DOMContentLoaded', async function () {
  const urlParams = new URLSearchParams(window.location.search)
  const paymentId = (await (await fetch(`http://kaspapay.kaffinp.xyz/api/createPayment?amount=${urlParams.get('amount')}&recipient=${urlParams.get('recipient')}`)).json()).result.paymentId
  const payment = (await (await fetch(`http://kaspapay.kaffinp.xyz/api/getPayment?paymentId=${paymentId}`)).json()).result

  document.getElementById('secondsLeft').innerText = '180'
  document.getElementById('paymentAddress').value = payment.address
  document.getElementById('paymentAmount').innerText = payment.amount / 1e8

  const checkLoop = setInterval(async () => {
    document.getElementById('secondsLeft').innerText = parseInt(document.getElementById('secondsLeft').innerText) - 1

    const paymentCheck = (await (await fetch(`http://kaspapay.kaffinp.xyz/api/getPayment?paymentId=${paymentId}`)).json()).result

    if (paymentCheck.status === 1) {
      document.getElementById('paymentStatus').innerText = `Payment with ID ${paymentId} completed successfully!`
      clearInterval(checkLoop)
    } else if (paymentCheck.status === 2) {
      document.getElementById('paymentStatus').innerText = 'Timed out!'
      clearInterval(checkLoop)
    }
  }, 1000)
})
