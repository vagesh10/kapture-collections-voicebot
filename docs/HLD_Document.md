# Kapture Finance Collections Voicebot
## High-Level Design (HLD)

## 1. Project Overview

The Kapture Finance Collections Voicebot is an outbound voice assistant designed to contact customers regarding overdue loan EMIs.

The assistant performs identity verification before disclosing account information, retrieves account details from a mock backend, discusses payment intent, records a confirmed Promise-to-Pay (PTP), and handles common collection edge cases such as financial hardship, disputes, wrong-person calls, and call termination.

The solution consists of:

- Vapi voice assistant
- Speech-to-text (STT)
- Large language model (LLM)
- Text-to-speech (TTS)
- Node.js/Express mock backend
- ngrok for public webhook exposure
- Tool-based API integration


## 2. High-Level Architecture

```text
                    ┌──────────────────────┐
                    │      Customer        │
                    │    Phone / Voice     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    Vapi Assistant    │
                    │                      │
                    │ STT → LLM → TTS      │
                    │ System Prompt        │
                    │ Tool Calling         │
                    └──────────┬───────────┘
                               │
                     HTTPS Tool Requests
                               │
                               ▼
                    ┌──────────────────────┐
                    │        ngrok         │
                    │ Public HTTPS Tunnel  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Node.js / Express    │
                    │ Mock Backend API     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Mock Customer DB   │
                    │                      │
                    │ Account ID           │
                    │ Verification Code    │
                    │ Customer Name        │
                    │ EMI Details          │
                    └──────────────────────┘