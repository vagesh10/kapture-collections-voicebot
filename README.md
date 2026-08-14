# Kapture Finance Collections Voicebot

A voice-based finance collections assistant built using Vapi, Node.js, Express, and a mock customer API.

## Project Overview

The assistant handles a controlled collections workflow:

1. Customer greeting
2. Account-holder confirmation
3. Customer identity verification
4. Account and overdue EMI retrieval
5. Payment discussion
6. Promise-to-Pay collection
7. Payment-link delivery
8. Disposition logging
9. Human-agent escalation
10. Call termination

The assistant must not disclose account or debt information before successful identity verification.

## Architecture

Customer
→ Vapi Assistant
→ ngrok HTTPS tunnel
→ Node.js / Express Mock API
→ Mock Customer Data / Collections Actions

Architecture diagram:

`docs/System_Architecture.png`

## Vapi Configuration

- Transcriber: Deepgram STT
- LLM: GPT-4.1
- Voice: ElevenLabs / Vapi voice
- Tool calling: Vapi API Request tools

## Configured Tools

- `verify_customer`
- `get_account_details`
- `record_promise_to_pay`
- `send_payment_link`
- `mark_disposition`
- `escalate_to_agent`
- `end_collections_call`

## Backend API

The mock backend is implemented using Node.js and Express.

Endpoints:

- `POST /verify-customer`
- `POST /account-details`
- `POST /promise-to-pay`
- `POST /send-payment-link`
- `POST /mark-disposition`
- `POST /escalate-to-agent`

## Running the Backend

```bash
cd kapture-test-api
npm install
node server.js