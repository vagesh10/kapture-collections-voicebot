# Kapture Finance Collections Voicebot — Test Matrix

| # | Scenario | Expected Behavior | Status |
|---|---|---|---|
| 1 | Successful verification | Verify customer and continue | PASS — LIVE VAPI |
| 2 | Incorrect verification code | No account disclosure; allow corrected verification | NOT TESTED — LIMITED CREDITS |
| 3 | Invalid account ID | No account disclosure | NOT TESTED — LIMITED CREDITS |
| 4 | Successful account retrieval | Retrieve overdue EMI details | PASS — LIVE VAPI |
| 5 | Customer gives exact PTP amount + date | Confirm both before recording | PASS — LIVE VAPI |
| 6 | Customer confirms PTP | Record Promise-to-Pay | PASS — LIVE VAPI |
| 7 | Customer gives date but no amount | Ask for exact amount | NOT TESTED — LIMITED CREDITS |
| 8 | Customer gives amount but no date | Ask for exact date | NOT TESTED — LIMITED CREDITS |
| 9 | Customer disputes debt | Do not pressure; escalate | BACKEND PASS — LIVE VAPI NOT RETESTED |
| 10 | Customer reports financial hardship | Acknowledge and escalate | BACKEND PASS — LIVE VAPI NOT RETESTED |
| 11 | Wrong person / third party | Do not disclose debt information | NOT TESTED — LIMITED CREDITS |
| 12 | Customer requests call termination | End call immediately | PASS — LIVE VAPI |
| 13 | INR amount handling | Use rupees/₹, never dollars | PASS — LIVE VAPI |
| 14 | Missing PTP information | Do not record PTP | NOT TESTED — LIMITED CREDITS |
| 15 | Disposition logging | Record supported disposition | PASS — BACKEND |
| 16 | Human escalation | Record escalation request | PASS — BACKEND |
| 17 | Successful payment-link request | After successful PTP, ask for channel and call send_payment_link | NOT TESTED — LIMITED CREDITS |
| 18 | Payment link tool success | Only confirm link sent when success=true and link_sent=true | PASS — BACKEND |
| 19 | Customer declines payment link | Do not call send_payment_link | NOT TESTED — LIMITED CREDITS |

## Live Vapi Tests

### Successful Verification

The live Vapi conversation successfully collected the customer's
account ID and verification code.

Test data:

- Account ID: `KF-100245`
- Verification code: `482913`

Result:

`Verify Customer — Completed successfully`

The assistant then proceeded to retrieve account details.

### Successful Account Retrieval

The live Vapi conversation successfully called the account-details tool
after successful identity verification.

Result:

- Customer: Rahul Sharma
- Overdue EMI: ₹2,500
- Due date: 2026-08-05
- Days overdue: 8

### Successful Promise-to-Pay

The live Vapi conversation tested a complete Promise-to-Pay flow.

Customer commitment:

- Amount: ₹2,500
- Date: 2026-08-20
- Customer confirmation: `true`

The assistant confirmed the exact amount and date before calling the
Promise-to-Pay tool.

Result:

`Record Promise To Pay — Completed successfully`

The assistant recorded the Promise-to-Pay once and then closed the call
when the customer indicated there was nothing else needed.

### Already-Paid Edge Case

A live Vapi test was also performed where the customer stated:

> "I already paid the EMI."

The assistant recognized the customer's already-paid statement and did
not attempt to create a new Promise-to-Pay.

The conversation was subsequently closed.

## Backend Tests

### Verify Customer

Endpoint:

`POST /verify-customer`

Test:

- Account: `KF-100245`
- Verification code: `482913`

Result:

`verified: true`

### Account Details

Endpoint:

`POST /account-details`

Test:

- Account: `KF-100245`

Result:

- Customer: Rahul Sharma
- Overdue EMI: ₹2,500
- Due date: 2026-08-05
- Days overdue: 8

### Promise to Pay

Endpoint:

`POST /promise-to-pay`

Test:

- Account: `KF-100245`
- Amount: `2500`
- Date: `2026-08-26`
- Customer confirmed: `true`

Result:

`success: true`

### Disposition

Endpoint:

`POST /mark-disposition`

Test:

- Account: `KF-100245`
- Status: `HARDSHIP_ESCALATED`

Result:

`success: true`

### Escalation

Endpoint:

`POST /escalate-to-agent`

Test:

- Account: `KF-100245`
- Reason: `HARDSHIP_REQUEST`

Result:

`success: true`
`escalated: true`

## Known Limitations

- The successful collections flow was tested through live Vapi calls while
  trial credits were available.
- Additional edge-case live testing was limited after the trial credits
  were exhausted.
- Backend endpoints were independently tested using PowerShell.
- The public development API was tested through ngrok.
- The payment-link backend tool was tested successfully, but the complete
  payment-link flow was not tested through a live Vapi call.