import Express, { response } from "express";
import Stripe from "stripe";
const app = Express();
const stripe = new Stripe('sk_test_51O4BHPLEn5AbYWhqGUSbTy5Hf5ZYexsXAyk6Yu4S9Qpju7fOszgTF2afSSvm9AmtbtGIyEXzZgifzK1l43lcf2wE00PleLyeyQ');

app.use(Express.json());
app.use(Express.urlencoded({ extended: false }));
app.get('/connect-account', async function (req, res) {
    try {
        let query: any = req.query;
        const account = await stripe.accounts.list({ limit: query.limit ?? 20 });
        return res.json(account);
    } catch (error: any) {
        return res.json(error);
    }
});
app.post('/connect-account', async function (req, res) {
    try {
        const email = 'test@gmail.com';
        const full_name = 'Test';
        const phone = '+10000000000';
        /**
         * This may include legal business name, tax ID, bank account details, and more.
         * 
         * 
         * 
         */
        const account = await stripe.accounts.create({
            country: 'CA',
            type: 'custom',
            email: email,
            business_type: 'individual',
            business_profile: {
                name: full_name,
                support_email: email,
                support_phone: phone,
                mcc: '5045',
                url: 'https://disallowed.stripe.com',
            },
            individual: {
                email: email,
                first_name: 'test',
                last_name: 'test',
                phone: phone,
                address: {
                    city: 'Toronto',
                    line1: '4 Avenue Rd',
                    postal_code: 'M5R 2E8',
                    state: 'ON',
                },
                // ssn_last_4: '0001',
                dob: {
                    day: 1,
                    month: 1,
                    year: 1901
                }
            },
            external_account: {
                object: 'bank_account',
                country: 'CA',
                currency: 'cad',
                account_holder_name: full_name,
                routing_number: '11000-000',
                account_number: '000123456789',
            },
            company: {
                address: {
                    city: 'Toronto',
                    line1: '4 Avenue Rd',
                    postal_code: 'M5R 2E8',
                    state: 'ON',
                },
                tax_id: '000000000',
                name: full_name,
                phone: phone,

            },
            capabilities: {
                card_payments: {
                    requested: true,
                },
                transfers: {
                    requested: true,
                }
            },
            tos_acceptance: {
                date: Math.floor(Date.now() / 1000),
                ip: '127.0.0.1',
                // service_agreement: 'recipient',
            }
        });
        return res.json(account);
    } catch (error: any) {
        return res.json(error);
    }
});
app.get('/connect-account/:id', async function (req, res) {
    try {
        const { id } = req.params;
        const account = await stripe.accounts.retrieve({ stripeAccount: id });
        const requirements = account.requirements;
        if (requirements && requirements.currently_due?.length !== 0 && requirements.errors?.length !== 0) {
            console.log('Connect account is complete and verified.');
        } else {
            console.log('Connect account is not yet complete or verified.', requirements);
        }
        return res.json(account);
    } catch (error: any) {
        return res.json(error);
    }
});


app.delete('/connect-account/:id', async function (req, res) {
    try {
        const { id } = req.params;
        const account = await stripe.accounts.del(id);
        return res.json(account);
    } catch (error: any) {
        return res.json(error);
    }
});

app.get('/payment-method', async function (req, res) {
    return res.sendFile(__dirname + '/index.html');
});

app.post('/payment-intents', async function (req, res) {
    try {
        const { amount, currency, paymentIntentID, transferGroup } = req.body;
        // Create a PaymentMethod
        // const paymentMethod = await stripe.paymentMethods.create({
        //     type: 'card',
        //     card: {
        //         number: '4242424242424242',
        //         exp_month: 12,
        //         exp_year: 2034,
        //         cvc: '314',
        //     },
        // });
        // const paymentIntent = await stripe.paymentIntents.create({
        //     amount: amount,
        //     currency: currency,
        //     payment_method: paymentIntentID,
        //     confirmation_method: "automatic",
        //     confirm: true,
        //     return_url: `http://localhost:3000`,
        //     description: "Order 12",
        //     transfer_group: transferGroup,
        // });
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: currency,
            payment_method_types: ['card'],
            use_stripe_sdk: true,
        });
        //   const clientSecret = paymentIntent.client_secret
        return res.json(paymentIntent);
    } catch (error: any) {
        return res.json(error);
    }
})

app.post('/payment-intents-2', async function (req, res) {
    try {
        const { amount, currency, paymentIntentID, transferGroup } = req.body;
        // Create a PaymentMethod
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: currency,
            payment_method: paymentIntentID,
            confirmation_method: "automatic",
            confirm: true,
            return_url: `http://localhost:3000`,
            description: "Order 12",
            transfer_group: transferGroup,
        });
        return res.json(paymentIntent);
    } catch (error: any) {
        return res.json(error);
    }
})


app.get('/payment-intents/:paymentIntentID', async function (req, res) {
    try {
        const { paymentIntentID } = req.params;
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentID);
        return res.json(paymentIntent);
    } catch (error: any) {
        return res.json(error);
    }
});

app.post('/transfer', async function (req, res) {
    try {
        const { customerID, transferGroup } = req.body;
        const transfer = await stripe.transfers.create({
            amount: 50,
            currency: 'cad',
            destination: customerID,
            transfer_group: transferGroup,
            description: 'description',
        });
        return res.json(transfer);
    } catch (error: any) {
        return res.json(error);
    }
});

app.get('/transfer/:id', async function (req, res) {
    try {
        const { id } = req.params;
        const transfer = await stripe.transfers.retrieve(id);
        return res.json(transfer);
    } catch (error: any) {
        return res.json(error);
    }
});


app.get('/balance-transactions/:id', async function (req, res) {
    try {
        const { id } = req.params;
        const balanceTransactions = await stripe.balanceTransactions.retrieve(id);
        return res.json(balanceTransactions);
    } catch (error: any) {
        return res.json(error);
    }
});





app.post('/customers', async function (req, res) {
    try {
        const customer = await stripe.customers.create({
            name: "Kiran Badola",
            email: "kiran.badola@yopmail.com",
            phone: "+10000000000",
            description: 'FYK test customer',
            invoice_prefix: "FYK",
            metadata: {

            }
        });
        return res.json(customer);
    } catch (error: any) {
        return res.json(error);
    }
});

app.get('/customers', async function (req, res) {
    try {
        let parsedQuerySet: any = req.query;
        let { id }: any = parsedQuerySet;
        const customer = await stripe.customers.retrieve(id,
            // {
            //     expand: ['customer', 'invoice.subscription'],
            // }
        );
        return res.json(customer);
    } catch (error: any) {
        return res.json(error);
    }
});


app.delete('/customers/:id', async function (req, res) {
    try {
        const { id } = req.params;
        const customer = await stripe.customers.retrieve(id);
        return res.json(customer);
    } catch (error: any) {
        return res.json(error);
    }
});

app.post('/ephemeral-keys', async (request, response) => {
    const { customerID, nonce } = request.body;

    const ephemeralKey = await stripe.ephemeralKeys.create({
        //   nonce: nonce,
        customer: customerID,
    }, {
        apiVersion: '2023-10-16',
    });

    response.json({
        ephemeralKeySecret: ephemeralKey.secret,
    });
});

app.post("/charge", async function (req, res) {
    try {
        const { token } = req.body;

        const paymentIntent = await stripe.charges.create({
            amount: 80000,
            currency: 'usd',
            source: token,
        });
        return res.json(paymentIntent);
    } catch (error: any) {
        return res.json(error);
    }
})

/***Final */
// acct_1O9RSE2fKbxjrYrm


app.listen(5000, () => {
    console.log("Server is running on 3000")
});
