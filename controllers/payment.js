const mongoose = require("mongoose");
const responseManager = require("../utilities/responseManager");
const paypal = require("paypal-rest-sdk");

paypal.configure({
  mode: "sandbox", // Use 'sandbox' for testing and 'live' for production
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

exports.pay = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token"
  );
  res.setHeader("Access-Control-Allow-Methods", "*");

  const { amount, description } = req.body;
  const payment = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    transactions: [
      {
        amount: {
          total: amount,
          currency: "USD",
        },
        description: description,
      },
    ],
    redirect_urls: {
      return_url: process.env.PAYPAL_SUCCESS_URL,
      cancel_url: process.env.PAYPAL_ERROR_URL,
    },
  };
  paypal.payment.create(payment, (error, payment) => {
    if (error) {
      console.error("Error creating payment:", error.response);
      res.status(500).json({ error: "Could not create payment" });
    } else {
      // Redirect the user to PayPal for payment approval
      for (const link of payment.links) {
        if (link.method === "REDIRECT") {
          res.send(link.href);
        }
      }
    }
  });
};

exports.success = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token"
  );
  res.setHeader("Access-Control-Allow-Methods", "*");
  const { paymentId, PayerID } = req.query;

  const executePayment = {
    payer_id: PayerID,
  };

  // Execute the payment with PayPal API
  paypal.payment.execute(paymentId, executePayment, (error, payment) => {
    if (error) {
      console.error("Error executing payment:", error.response);
      res.status(500).json({ error: "Could not execute payment" });
    } else {
      res.json({ success: true, payment });
    }
  });
};
