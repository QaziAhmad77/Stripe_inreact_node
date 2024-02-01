require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
app.use(
  bodyParser.json({
    verify: function (req, res, buf) {
      req.rawBody = buf;
    },
  })
);
app.use(bodyParser.json());
const stripe = require('stripe')(process.env.STRIPE_KEY);

const admin = require('firebase-admin');
const credentials = require('./key.json');
admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

const db = admin.firestore();

app.use(express.json());
app.use(cors());

// checkout api
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { products } = req.body;
    // console.log(products, 'products');
    const lineItems = products.map((product) => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name: product.dish,
          images: [product.imgdata],
        },
        unit_amount: product.price * 100,
      },
      quantity: product.qnty,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
      // custom_fields: [
      //   {
      //     key: 'zipcode',
      //     label: {
      //       type: 'custom',
      //       custom: 'Zip Code',
      //     },
      //     type: 'numeric',
      //   },
      // ],
      metadata: {
        userId: 'user123', // Replace with actual user ID
      },
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error(err, 'Error while creating Stripe session');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Stripe webhook endpoint
app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const endpointSecret = process.env.END_POINT_SECRET; // Replace with your actual Stripe endpoint secret
    // Use req.body directly, without parsing it
    // const payload = req.body;
    // console.log(payload, 'payload');
    const sig = req.headers['stripe-signature'];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
      console.log(event.type, 'event.type');
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        console.log(session, 'event.data.object');
        // Save transaction details to Firebase
        await db.collection('transactionHistory').add({
          userId: session.metadata.userId,
          date: new Date(session.created * 1000),
          status: 'buy',
        });
        console.log('Payment success. Transaction details saved to Firebase.');
      }
      res.json({ received: true });
    } catch (err) {
      console.error(err, 'Webhook signature verification failed');
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);
app.listen(5000, () => {
  console.log('Server started on port 7000');
});
