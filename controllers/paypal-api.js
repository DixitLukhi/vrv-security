const mongoose = require("mongoose");
const responseManager = require("../utilities/responseManager");
const { User } = require("../models/user");
const Order = require("../models/order");
const Payment = require("../models/payment");
const AddToCart = require("../models/addToCartProduct");
const allowedContentTypes = require("../utilities/contentTypes");
const { transporter } = require("../utilities/helper");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

// const base = "https://api-m.sandbox.paypal.com";
const base = "https://api-m.paypal.com";

/**
 * Generate an OAuth 2.0 access token
 * @see https://developer.paypal.com/api/rest/authentication/
 */
exports.generateAccessToken = async () => {
  const auth = Buffer.from(
    process.env.LIVE_PAYPAL_CLIENT_ID + ":" + process.env.LIVE_PAYPAL_CLIENT_SECRET
    // process.env.PAYPAL_CLIENT_ID + ":" + process.env.PAYPAL_CLIENT_SECRET
  ).toString("base64");
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: "post",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  const jsonData = await handleResponse(response);
  return jsonData.access_token;
};

/**
 * Create an order
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_create
 */
exports.createOrder = async (data) => {
  //   console.log("hi", data.product);

  const accessToken = await this.generateAccessToken();
  const url = `${base}/v2/checkout/orders`;
  const response = await fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: data.product.amount,
          },
          // products: data.product.orderDetails,
        },
      ],
    }),
  });
  return await handleResponse(
    response,
    data.product.orderDetails,
    data.product.address,
    data.product.contactEmail,
    data.userid
  );
};

/**
 * Capture payment for an order
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_capture
 */
exports.capturePayment = async (
  orderId,
  orderDetails,
  address,
  contactEmail,
  userid,
  origin
) => {
  if (!allowedContentTypes.allowedDomains.includes(origin)) {
    return res.status(403).json({
      Message: "Unauthorized origin!",
      Data: 0,
      Status: 403,
      IsSuccess: false,
    });
  }
  const accessToken = await this.generateAccessToken();
  const url = `${base}/v2/checkout/orders/${orderId}/capture`;
  const response = await fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  //   DB UPDATE
  const paymentResponse = await handleResponse(
    response,
    orderDetails,
    address,
    contactEmail,
    userid
  );
  paymentResponse.orderDetails = orderDetails;
  paymentResponse.address = address;
  paymentResponse.contactEmail = contactEmail;
  paymentResponse.userid = userid;

  if (paymentResponse.status === "COMPLETED") {
    // Update your database with successful payment and order details
    // ...
    const orderObj = {
      userid: userid,
      // customerDetail:
      status: paymentResponse.status,
      address: address,
      contactEmail: contactEmail,
      products: orderDetails,
      transactionid: paymentResponse.id,
      orderid: orderId,
      amount:
        paymentResponse.purchase_units[0].payments.captures[0].amount.value,
      created_at:
        paymentResponse.purchase_units[0].payments.captures[0].create_time,
    };
    const paymentObj = {
      payment: paymentResponse,
      status: paymentResponse.status,
      transactionid: paymentResponse.id,
      orderid: orderId,
      amount:
        paymentResponse.purchase_units[0].payments.captures[0].amount.value,
    };
    await Order.create(orderObj);
    await Payment.create(paymentObj);
    if (userid && userid !== "") {
      await User.findByIdAndUpdate(userid, {
        purchases: paymentResponse.orderDetails,
      });
      await AddToCart.deleteMany({ userid: userid });
    } 
    let mailOptions = {
      from: process.env.EMAIL, // Sender address
      to: contactEmail, // List of recipients
      subject: `Your Gold Touch Order Is Confirmed(Order ID: ${orderId})`, // Subject line
      // text: "Hello, Your otp is " + otp, // Plain text body
      html: `Total Amount is ${amount}.`, // HTML body (optional)
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        // console.log("Error:", error);
      } else {
        // console.log("Email sent:", info.response);
      }
    });

    //  send mail
  } else {
    // Handle case where payment was not successful
    const paymentObj = {
      payment: paymentResponse,
      status: paymentResponse.status,
      transactionid: paymentResponse.id,
      orderid: orderId,
      amount:
        paymentResponse.purchase_units[0].payments.captures[0].amount.value,
    };
    await Payment.create(paymentObj);
    throw new Error("Payment was not successful.");
  }
  // Return the modified response
  return paymentResponse;
  // return await handleResponse(response);
};

async function handleResponse(
  response,
  orderDetails = null,
  address = null,
  contactEmail = null,
  userid = null
) {
  if (response.status === 200 || response.status === 201) {
    const responseData = await response.json();
    // return { response: responseData, products };
    if (orderDetails !== null) {
      responseData.orderDetails = orderDetails;
      responseData.userid = userid;
    }
    if (address !== null) {
      responseData.address = address;
    } else {
      // responseData.address =
    }
    if (contactEmail !== null) {
      responseData.contactEmail = contactEmail;
    }
    return responseData;
  }

  const errorMessage = await response.text();
  throw new Error(errorMessage);
}
