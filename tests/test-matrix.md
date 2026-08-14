# Kapture Finance Collections Voicebot — Test Matrix

| # | Scenario | Expected Behavior | Status |
|---|---|---|---|
| 1 | Successful verification | Verify customer and continue | NOT RE-TESTED — NO CREDITS |
| 2 | Incorrect verification code | No account disclosure; allow corrected verification | NOT RE-TESTED — NO CREDITS |
| 3 | Invalid account ID | No account disclosure | NOT RE-TESTED — NO CREDITS |
| 4 | Successful account retrieval | Retrieve overdue EMI details | NOT RE-TESTED — NO CREDITS |
| 5 | Customer gives exact PTP amount + date | Confirm both before recording | NOT RE-TESTED — NO CREDITS |
| 6 | Customer confirms PTP | Record Promise-to-Pay | NOT RE-TESTED — NO CREDITS |
| 7 | Customer gives date but no amount | Ask for exact amount | NOT RE-TESTED — NO CREDITS |
| 8 | Customer gives amount but no date | Ask for exact date | NOT RE-TESTED — NO CREDITS |
| 9 | Customer disputes debt | Do not pressure; escalate | NOT RE-TESTED — NO CREDITS |
| 10 | Customer reports financial hardship | Acknowledge and escalate | NOT RE-TESTED — NO CREDITS |
| 11 | Wrong person / third party | Do not disclose debt information | NOT RE-TESTED — NO CREDITS |
| 12 | Customer requests call termination | End call immediately | NOT RE-TESTED — NO CREDITS |
| 13 | INR amount handling | Use rupees/₹, never dollars | NOT RE-TESTED — NO CREDITS |
| 14 | Missing PTP information | Do not record PTP | NOT RE-TESTED — NO CREDITS |
| 15 | Disposition logging | Record supported disposition | PASS |
| 16 | Human escalation | Record escalation request | PASS |
| 17 | Successful payment-link request | After successful PTP, ask for channel and call send_payment_link | NOT TESTED — NO CREDITS |
| 18 | Payment link tool success | Only confirm link sent when success=true and link_sent=true | BACKEND PASS |
| 19 | Customer declines payment link | Do not call send_payment_link | NOT TESTED — NO CREDITS |
## Backend Tests

### Verify Customer

Endpoint:

POST `/verify-customer`

Test:

- Account: `KF-100245`
- Verification code: `482913`

Result:

`verified: true`

### Account Details

Endpoint:

POST `/account-details`

Test:

- Account: `KF-100245`

Result:

- Customer: Rahul Sharma
- Overdue EMI: ₹2,500
- Due date: 2026-08-05
- Days overdue: 8

### Promise to Pay

Endpoint:

POST `/promise-to-pay`

Test:

- Account: `KF-100245`
- Amount: `2500`
- Date: `2026-08-26`
- Customer confirmed: `true`

Result:

`success: true`

### Disposition

Endpoint:

POST `/mark-disposition`

Test:

- Account: `KF-100245`
- Status: `HARDSHIP_ESCALATED`

Result:

`success: true`

### Escalation

Endpoint:

POST `/escalate-to-agent`

Test:

- Account: `KF-100245`
- Reason: `HARDSHIP_REQUEST`

Result:

`success: true`
`escalated: true`

## Known Limitations

- Live Vapi voice testing is currently unavailable because the Vapi account has no remaining credits.
- The backend has been independently tested using PowerShell.
- The public development API has been tested through ngrok.
- Payment-link functionality is not currently implemented.