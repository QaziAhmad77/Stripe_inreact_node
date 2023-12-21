require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const stripe = require('stripe')(
  'sk_test_51OJvdzGwXkoBUKLLoePNpqEaUNP61ofOMLeDFoEKngtBMFJXGNXJhTPVaRQVqWQt4JqK9V3oApQhrW5thtDdpeOo003R5mEMtH'
);

app.use(express.json());
app.use(cors());

// checkout api
app.post('/api/create-checkout-session', async (req, res) => {
  const { products } = req.body;
  console.log(products, 'products');
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
    success_url: 'http://localhost:3000/sucess',
    cancel_url: 'http://localhost:3000/cancel',
    custom_fields: [
      {
        key: 'zipcode',
        label: {
          type: 'custom',
          custom: 'Zip Code',
        },
        type: 'numeric',
      },
    ],
  });

  res.json({ id: session.id });
});

app.listen(7000, () => {
  console.log('server start');
});
