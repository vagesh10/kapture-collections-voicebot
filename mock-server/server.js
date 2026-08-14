const express = require("express");

const app = express();

app.use(express.json());

const customers = {
  "KF100245": {
    verification_code: "482913",
    customer_name: "Rahul Sharma",
    overdue_emi: 2500,
    due_date: "2026-08-05",
    days_overdue: 8
  },

  "KF100246": {
    verification_code: "731824",
    customer_name: "Priya Mehta",
    overdue_emi: 1800,
    due_date: "2026-08-05",
    days_overdue: 8
  },

  "KF100247": {
    verification_code: "915362",
    customer_name: "Amit Kumar",
    overdue_emi: 3200,
    due_date: "2026-08-05",
    days_overdue: 8
  }
};


// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "Kapture Finance Collections API"
  });
});


// ============================================================
// VERIFY CUSTOMER
// ============================================================

app.post("/verify-customer", (req, res) => {
  const { account_id, verification_code } = req.body;

  if (!account_id || verification_code === undefined) {
    return res.status(400).json({
      verified: false,
      customer_name: "",
      message: "account_id and verification_code are required."
    });
  }

  const normalizedAccountId = String(account_id)
    .replace(/-/g, "")
    .replace(/\s/g, "")
    .toUpperCase();

  const customer = customers[normalizedAccountId];

  if (!customer) {
    return res.json({
      verified: false,
      customer_name: "",
      message: "Account ID could not be verified."
    });
  }

  const normalizedVerificationCode = String(verification_code)
    .replace(/\s/g, "")
    .trim();

  if (customer.verification_code !== normalizedVerificationCode) {
    return res.json({
      verified: false,
      customer_name: "",
      message: "Verification code is incorrect."
    });
  }

  return res.json({
    verified: true,
    customer_name: customer.customer_name,
    message: "Customer identity verified successfully."
  });
});


// ============================================================
// GET ACCOUNT DETAILS
// ============================================================

app.post("/account-details", (req, res) => {
  const { account_id } = req.body;

  if (!account_id) {
    return res.status(400).json({
      success: false,
      message: "account_id is required."
    });
  }

  const normalizedAccountId = String(account_id)
    .replace(/-/g, "")
    .replace(/\s/g, "")
    .toUpperCase();

  const customer = customers[normalizedAccountId];

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: "Account could not be found."
    });
  }

  return res.json({
    success: true,
    account_id: normalizedAccountId,
    customer_name: customer.customer_name,
    overdue_emi: customer.overdue_emi,
    due_date: customer.due_date,
    days_overdue: customer.days_overdue
  });
});


// ============================================================
// RECORD PROMISE TO PAY
// ============================================================

app.post("/promise-to-pay", (req, res) => {
  const {
    account_id,
    promise_amount,
    promise_date,
    customer_confirmed
  } = req.body;

  if (
    !account_id ||
    promise_amount === undefined ||
    !promise_date ||
    customer_confirmed !== true
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Complete and confirmed Promise-to-Pay details are required."
    });
  }

  console.log("Promise-to-Pay received:", {
    account_id,
    promise_amount,
    promise_date,
    customer_confirmed
  });

  return res.json({
    success: true,
    message: "Promise-to-Pay details recorded successfully.",
    account_id,
    promise_amount,
    promise_date
  });
});


// ============================================================
// MARK DISPOSITION
// ============================================================

app.post("/mark-disposition", (req, res) => {
  const {
    account_id,
    status,
    notes
  } = req.body;

  const allowedStatuses = [
    "PTP_AGREED",
    "ALREADY_PAID",
    "DISPUTED",
    "HARDSHIP_ESCALATED",
    "WRONG_PERSON",
    "DO_NOT_CALL",
    "NO_RESPONSE"
  ];

  if (!account_id || !status) {
    return res.status(400).json({
      success: false,
      message: "account_id and status are required."
    });
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid disposition status."
    });
  }

  const disposition = {
    account_id,
    status,
    notes: notes || "",
    timestamp: new Date().toISOString()
  };

  console.log("Disposition received:", disposition);

  return res.json({
    success: true,
    disposition_logged: status,
    account_id,
    notes: notes || "",
    timestamp: disposition.timestamp
  });
});


// ============================================================
// ESCALATE TO HUMAN AGENT
// ============================================================

app.post("/escalate-to-agent", (req, res) => {
  const {
    account_id,
    reason,
    notes
  } = req.body;

  const allowedReasons = [
    "DISPUTE",
    "HARDSHIP_REQUEST",
    "UNRECOGNIZED_DEBT",
    "CUSTOMER_REQUEST"
  ];

  if (!account_id || !reason) {
    return res.status(400).json({
      success: false,
      message: "account_id and reason are required."
    });
  }

  if (!allowedReasons.includes(reason)) {
    return res.status(400).json({
      success: false,
      message: "Invalid escalation reason."
    });
  }

  const escalation = {
    account_id,
    reason,
    notes: notes || "",
    timestamp: new Date().toISOString()
  };

  console.log("Escalation received:", escalation);

  return res.json({
    success: true,
    escalated: true,
    account_id,
    reason,
    notes: notes || "",
    timestamp: escalation.timestamp,
    message: "Customer has been escalated to a human agent."
  });
});

// SEND PAYMENT LINK
app.post("/send-payment-link", (req, res) => {
  const { account_id, channel } = req.body;

  if (!account_id || !channel) {
    return res.status(400).json({
      success: false,
      message: "account_id and channel are required."
    });
  }

  const allowedChannels = ["SMS", "WhatsApp", "BOTH"];

  if (!allowedChannels.includes(channel)) {
    return res.status(400).json({
      success: false,
      message: "Channel must be SMS, WhatsApp, or BOTH."
    });
  }

  const normalizedAccountId = String(account_id)
    .replace(/-/g, "")
    .replace(/\s/g, "")
    .toUpperCase();

  const customer = customers[normalizedAccountId];

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: "Account could not be found."
    });
  }

  // Mock payment link for demonstration only.
  const paymentLink =
    `https://pay.kapture.example/${normalizedAccountId}`;

  console.log("Payment link requested:", {
    account_id: normalizedAccountId,
    channel
  });

  return res.json({
    success: true,
    account_id: normalizedAccountId,
    channel,
    link_sent: true,
    payment_link: paymentLink,
    message: `Payment link sent successfully via ${channel}.`
  });
});


// ============================================================
// START SERVER
// ============================================================

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Kapture Finance Collections API running on port ${PORT}`);
});