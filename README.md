### Kapture Finance Collections Voicebot

A voice-based outbound finance collections assistant built using Vapi, Node.js, Express, and a mock customer/collections API.

The agent is designed to conduct controlled collections conversations while enforcing identity verification before disclosing any account or debt information.

1. Project Overview

The Kapture Finance Collections Voicebot handles the following workflow:

Customer greeting

Account-holder confirmation

Identity verification

Account and overdue EMI retrieval

Payment discussion

Promise-to-Pay collection

Optional payment-link delivery

Disposition logging

Human-agent escalation

Call termination

The most important privacy rule is:

The agent must not disclose account, loan, EMI, overdue balance, debt, or payment-status information until identity verification succeeds.

The agent uses backend tools instead of inventing customer or account information.

2. Architecture

                    Customer
                       |
                       v
                +-------------+
                | Vapi Voice  |
                |  Assistant  |
                +-------------+
                       |
                       | HTTPS
                       v
                +-------------+
                |    ngrok    |
                | HTTPS Tunnel|
                +-------------+
                       |
                       v
              +------------------+
              | Node.js / Express|
              |    Mock API     |
              +------------------+
                       |
                       v
             Mock Customer Data
             & Collection Actions

Architecture diagram:

docs/System_Architecture.png

3. Technology Stack

Vapi

Used for:

Voice agent orchestration

LLM conversation

Speech-to-text

Voice output

Tool calling

Call handling

LLM

GPT-4.1

Used for:

Conversation reasoning

Collections dialogue

Verification flow

Payment negotiation

Tool selection

Guardrail enforcement

Transcriber

Deepgram STT

Used to convert customer speech into text for the assistant.

Voice

ElevenLabs / Vapi voice

Selected to provide a natural voice for the outbound collections conversation.

Backend

Node.js + Express

Used to implement the mock customer and collections APIs.

Public API Access

ngrok

Used to expose the local Express API through HTTPS so that Vapi can call the mock backend.

4. Vapi Assistant Flow

The assistant follows this sequence:

Greeting
   |
   v
Confirm account holder
   |
   v
Collect Account ID
   |
   v
Collect Verification Code
   |
   v
verify_customer
   |
   +---- verified=false ----> No disclosure / retry or end
   |
   +---- verified=true
              |
              v
      get_account_details
              |
              v
       Discuss overdue EMI
              |
              v
       Understand customer intent
              |
       +------+------+
       |             |
       v             v
      PTP        Edge Case
       |        (dispute / hardship /
       |         already paid / DNC)
       v             |
Confirm amount       |
and date             |
       |             v
       v       disposition / escalation
record_promise       |
       |             |
       +------+------+
              |
              v
       Optional payment link
              |
              v
       Close the call

5. Identity Verification and Privacy

The assistant follows a verification-before-disclosure policy.

The customer must provide:

Account ID

Verification code

The assistant then calls:

verify_customer

The verified response from the tool is the authoritative verification status.

If verified = true, the assistant can proceed to get_account_details.

If verified = false, the assistant must not disclose:

Account information

Loan information

EMI amount

Overdue amount

Debt information

Payment status

The assistant can allow corrected verification information or end the call.

The system prompt requires the agent to wait for the verification result before speaking or disclosing account information.

6. Promise-to-Pay Logic

The Promise-to-Pay workflow uses a strict confirmation gate.

The assistant must have:

An exact payment amount

An exact payment date

A confirmation containing that exact amount and date

Explicit customer confirmation

Only then can the assistant call:

record_promise_to_pay

For example:

Customer:
I can pay 2,500 rupees on August 20.

Assistant:
Just to confirm, you will pay 2,500 rupees on August 20, 2026.
Is that correct?

Customer:
Yes.

Assistant:
[record_promise_to_pay]

The assistant does not infer missing payment information.

All monetary values are handled as Indian rupees (INR).

The system prompt explicitly prohibits dollar conversion or use of $.

7. Post-PTP Behavior

After a successful Promise-to-Pay:

The assistant treats the commitment as complete.

It does not record the same PTP twice.

It does not unnecessarily ask for the amount or date again.

It asks whether the customer needs anything else.

If the customer indicates they are finished, the call is ended.

This rule was added after an early test showed the same Promise-to-Pay being recorded twice.

8. Edge-Case Handling

Already Paid

If the customer says they already paid:

The assistant acknowledges the statement.

It does not create a new Promise-to-Pay.

It does not pressure the customer for payment.

The conversation can be closed or the appropriate disposition can be recorded.

A live Vapi test demonstrated recognition of the already-paid statement.

Wrong Person / Third Party

The assistant must not disclose account or debt information to:

Relatives

Friends

Colleagues

Representatives

Other third parties

The assistant should ask to speak with the account holder or end the call.

Do Not Call

The supported disposition value includes:

DO_NOT_CALL

The assistant should respect the customer's request and avoid continuing the collections conversation.

Dispute

If the customer disputes the debt or account information:

Do not argue.

Do not pressure the customer.

Do not create a Promise-to-Pay because of the dispute.

Escalate the issue when appropriate.

Financial Hardship

If the customer reports financial hardship:

Acknowledge the situation.

Do not pressure the customer.

Do not demand a Promise-to-Pay.

Escalate to the appropriate Kapture Finance team when appropriate.

9. Configured Tools

The assistant has seven configured tools:

verify_customer

get_account_details

record_promise_to_pay

send_payment_link

mark_disposition

escalate_to_agent

end_collections_call

verify_customer

Verifies the customer's identity.

POST /verify-customer

Required inputs:

account_id

verification_code

Returns:

verified

customer_name

message

get_account_details

Retrieves account and overdue EMI information after successful verification.

POST /account-details

Required input:

account_id

Returns:

success

account_id

customer_name

overdue_emi

due_date

days_overdue

message

record_promise_to_pay

Records a confirmed payment commitment.

POST /promise-to-pay

Required inputs:

account_id

promise_amount

promise_date

customer_confirmed

The tool should only be called after the customer explicitly confirms the exact amount and date.

send_payment_link

Sends a mock payment link after a successful Promise-to-Pay and customer consent.

POST /send-payment-link

Required inputs:

account_id

channel

Supported example channels include:

SMS

WhatsApp

The assistant must not claim that the link was sent unless the tool returns:

success = true

and

link_sent = true

mark_disposition

Records the final supported collections disposition.

POST /mark-disposition

Supported statuses:

PTP_AGREED

ALREADY_PAID

HARDSHIP_ESCALATED

DISPUTED

WRONG_PERSON

DO_NOT_CALL

NO_RESPONSE

escalate_to_agent

Escalates the customer to a human agent when appropriate.

POST /escalate-to-agent

Example reasons include:

HARDSHIP_REQUEST

DISPUTE

HUMAN_ASSISTANCE

The assistant should only state that an escalation was completed after the tool returns a successful result.

end_collections_call

Ends the outbound collections call.

It is used when:

The customer asks to end the call

The customer has no further questions

The requested action is completed

Verification cannot be completed

The conversation should otherwise be closed

10. Backend API

The mock backend is implemented using Node.js and Express.

Available endpoints:

POST /verify-customer

POST /account-details

POST /promise-to-pay

POST /send-payment-link

POST /mark-disposition

POST /escalate-to-agent

The backend runs locally on:

http://localhost:3001

11. Running the Backend

From the project root:

node mock-server/server.js

Expected output:

Kapture Finance Collections API running on port 3001

12. Exposing the API Through ngrok

Start ngrok:

ngrok http 3001

The generated HTTPS URL is configured in the Vapi API Request tools.

The ngrok process must remain running while testing the Vapi assistant.

13. Backend Testing

Verify Customer

Endpoint:

POST /verify-customer

Test:

Account ID: KF-100245

Verification Code: 482913

Result:

verified: true

Account Details

Endpoint:

POST /account-details

Test:

Account ID: KF-100245

Result:

Customer: Rahul Sharma

Overdue EMI: ₹2,500

Due Date: 2026-08-05

Days Overdue: 8

Promise-to-Pay

Endpoint:

POST /promise-to-pay

Test:

Account ID: KF-100245

Amount: 2500

Date: 2026-08-26

Customer Confirmed: true

Result:

success: true

Disposition

Endpoint:

POST /mark-disposition

Test:

Account ID: KF-100245

Status: HARDSHIP_ESCALATED

Result:

success: true

Human Escalation

Endpoint:

POST /escalate-to-agent

Test:

Account ID: KF-100245

Reason: HARDSHIP_REQUEST

Result:

success: true

escalated: true

14. Live Vapi Testing

The successful collections flow was tested through live Vapi calls while trial credits were available.

A successful live flow demonstrated:

Customer/account-holder interaction

Account ID collection

Verification code collection

Successful verify_customer

Successful get_account_details

Overdue EMI disclosure after verification

Exact payment amount and date

Customer confirmation

Successful record_promise_to_pay

Call termination

An additional live test demonstrated handling of an already-paid statement without creating a new Promise-to-Pay.

15. Demo

Demo Recording

Task 2 demo recording:

https://drive.google.com/file/d/14DM_fEcFnB9X-tJUrlU4OGCYE_6MIeZ2/view

The demonstrated workflow includes:

Identity verification
        ↓
Account retrieval
        ↓
Overdue EMI disclosure
        ↓
Payment commitment
        ↓
Exact amount/date confirmation
        ↓
Promise-to-Pay tool
        ↓
Call closure

16. Test Matrix

Detailed test results are maintained in:

testmatrix.md

The test matrix distinguishes between:

Live Vapi tests

Backend tests

Tests not performed because of remaining Vapi credits

This avoids claiming that a backend test proves the complete voice-agent flow.

17. What Broke During Development

Issue 1 — Incorrect Account Details Endpoint

Initially, the Vapi tool used:

/get-account-details

However, the Express server exposed:

/account-details

The local request returned:

Cannot POST /get-account-details

The available Express routes were inspected using:

Select-String -Path .\mock-server\server.js -Pattern "app.post"

This revealed:

/verify-customer

/account-details

/promise-to-pay

/mark-disposition

/escalate-to-agent

/send-payment-link

The Vapi tool was then corrected to:

/account-details

After the correction, the local API returned:

success: true

customer_name: Rahul Sharma

overdue_emi: 2500

due_date: 2026-08-05

days_overdue: 8

Issue 2 — ngrok Endpoint Offline

During development, the ngrok endpoint periodically became unavailable.

The error was:

ERR_NGROK_3200

The local API was tested independently first.

This separated the problem into:

Node.js API
    ↓
Working

ngrok tunnel
    ↓
Intermittently offline

The tunnel was restarted and the public endpoint was tested separately.

Issue 3 — Voice Interruption and Repetition

Some early voice calls contained repeated or fragmented phrases when the customer started speaking before the assistant finished.

Examples included repeated questions and incomplete sentences.

The system prompt was strengthened with conversation rules requiring:

One question at a time

Waiting for the customer to finish

No unnecessary echoing

No repeated questions

Priority for the customer's latest complete utterance

Concise responses

Issue 4 — Duplicate Promise-to-Pay

During an early test, the assistant recorded the same Promise-to-Pay more than once.

The system prompt was updated to explicitly state that after record_promise_to_pay succeeds:

The PTP is considered complete.

The same PTP must not be recorded again.

The assistant should not ask for the amount/date again unless the customer explicitly corrects the commitment.

The conversation should proceed to closure.

A subsequent test showed the PTP being recorded only once.

Issue 5 — First Message Behavior

During configuration, the assistant was initially configured to generate the opening message using the model.

This caused the assistant to generate an opening that immediately asked for the account ID instead of first confirming that the account holder was on the call.

The intended opening is:

Hello, this is a representative from Kapture Finance.
May I please speak with the account holder?

The Vapi First Message configuration was adjusted so that the explicit first message is used rather than a model-generated opening.

18. Debugging Approach

The system was debugged in layers rather than changing everything at once:

Tested the local Node.js API.

Inspected Express POST routes.

Corrected the account-details endpoint.

Tested the corrected local endpoint.

Tested the API through ngrok.

Connected the working public endpoint to Vapi.

Tested Vapi tool execution.

Tested the complete voice workflow.

Reviewed call transcripts.

Fixed duplicate PTP behavior.

Improved interruption and conversation rules.

Recorded the final demonstration.

This approach made it possible to distinguish backend, networking, configuration, and conversation-model problems.

19. Security and Privacy Considerations

This project uses mock data and a development API.

It is not intended to connect directly to production financial systems.

Important production considerations would include:

Secure authentication

Encrypted API communication

Secrets management

Production database controls

Customer-data access controls

Audit logging

PII protection

Call-recording policies

Regulatory/compliance review

Rate limiting

Monitoring and alerting

The ngrok URL used during development is temporary infrastructure and should not be treated as a production endpoint.

20. Known Limitations

The backend uses mock customer and collections data.

The development API uses ngrok rather than production infrastructure.

Additional live Vapi edge-case testing was limited after trial credits were exhausted.

Payment-link functionality is configured as a mock API tool and its backend response was tested, but the complete payment-link workflow was not demonstrated through a live Vapi call.

Some voice interruption behavior was observed during development.

The current system prompt contains several overlapping guardrail rules and could be simplified in a future revision.

21. What I Would Improve With More Time

Conversation Quality

Improve barge-in and interruption handling so the agent immediately stops speaking when the customer begins responding.

Production Backend

Replace the mock Express API with secure production services and a persistent database.

Authentication

Integrate production-grade customer authentication and verification services.

Observability

Add structured:

Call logs

Tool-call logs

Error tracking

Latency metrics

Disposition analytics

Automated Testing

Add automated tests for:

Incorrect verification

Invalid account ID

Wrong person

Do-not-call

Already paid

Dispute

Financial hardship

Missing PTP amount

Missing PTP date

Payment-link consent

Backend failures

Prompt Simplification

Consolidate overlapping system-prompt rules into a smaller, priority-based policy so the model has fewer conflicting or repetitive instructions.

Production Safety

Before production deployment, add appropriate financial-services, privacy, call-recording, and regulatory controls.

22. Repository Contents

Recommended repository structure:

kapture-collections-voicebot/
│
├── README.md
├── testmatrix.md
├── test-definition.json
├── system-prompt.txt
│
├── mock-server/
│   └── server.js
│
└── docs/
    └── System_Architecture.png

23. Submission Checklist

Vapi assistant configured

Model selected

Transcriber selected

Voice selected

System prompt implemented

Identity verification guardrail implemented

Account-details retrieval implemented

Promise-to-Pay tool implemented

Payment-link tool configured

Disposition tool configured

Human escalation tool configured

Call termination configured

Mock backend implemented

Backend endpoints tested

ngrok connectivity tested

Successful PTP live flow demonstrated

Already-paid behavior tested

Test matrix documented

Demo recording provided

Final system prompt provided

Tool schemas provided

README provided