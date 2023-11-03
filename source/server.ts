import Express, { response } from "express";
import Stripe from "stripe";
const app = Express();
const stripe = new Stripe('sk_test_4eC39HqLyjWDarjtT1zdp7dc');

app.use(Express.json());
app.use(Express.urlencoded({ extended: false }));

app.post('/customers', async function (req, res) {
    try {
        const customer = await stripe.customers.create({
            name: "Kiran Badola 1",
            description: 'My First Test Customer',
            expand: [],
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
            {
                expand: ['customer', 'invoice.subscription'],
            });
        return res.json(customer);
    } catch (error: any) {
        return res.json(error);
    }
});

app.post('/payment-intents', async function (req, res) {
    try {
        const { amount, currency } = req.body;
        // Create a PaymentMethod
        const paymentMethod = await stripe.paymentMethods.create({
            type: 'card',
            card: {
                number: '4242424242424242',
                exp_month: 12,
                exp_year: 2034,
                cvc: '314',
            },
        });
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: currency,
            payment_method: paymentMethod.id,
            confirmation_method: "automatic",
            confirm: true,
            return_url: `http://localhost:3000`,
            description: "Order 12",
            transfer_group: 'ORDER12',
        });
        return res.json(paymentIntent);
    } catch (error: any) {
        return res.json(error);
    }
})


app.post('/transfer-payment/restaurants', async function (req, res) {
    try {
        const { customerID } = req.body;
        const transfer = await stripe.transfers.create({
            amount: 7000,
            currency: 'usd',
            destination: customerID,
            transfer_group: 'ORDER12',
            description: 'description',
        });
        return res.json(transfer);
    } catch (error: any) {
        return res.json(error);
    }
});

/***Final */
// acct_1O7zkDGhOvUgjOZ4
app.post('/create-account', async function (req, res) {
    try {
        const email = 'test@gmail.com';
        const full_name = 'Test';
        const phone = '8888675309';

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
                first_name: 'Lelia',
                last_name: 'Spencer',
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
                    year: 1900
                }
            },
            external_account: {
                object: 'bank_account',
                country: 'CA',
                currency: 'cad',
                account_holder_name: 'The Best Cookie Co',
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
                name: 'The Best Cookie Co',
                phone: '8888675309',

            },
            capabilities: {
                // card_payments: {
                //     requested: true,
                // },
                transfers: {
                    requested: true,
                }
            },
            tos_acceptance: {
                date: Math.floor(Date.now() / 1000),
                ip: '127.0.0.1',
                service_agreement: 'recipient',
            }
        });
        return res.json(account);
    } catch (error: any) {
        return res.json(error);
    }
});
app.post('/account', async function (req, res) {
    try {
        const { stripeAccount } = req.body;
        const account = await stripe.accounts.retrieve({ stripeAccount: stripeAccount });
        return res.json(account);
    } catch (error: any) {
        return res.json(error);
    }
});

app.get('/:paymentIntentID', async function (req, res) {
    try {
        const { paymentIntentID } = req.body;
        const paymentIntent = await stripe.paymentIntents.retrieve(
            "pi_3O8FSn2eZvKYlo2C0DzQnA5b"
        );
        return res.json(paymentIntent);
    } catch (error: any) {
        return res.json(error);
    }
});




app.listen(3000, () => {
    console.log("Server is running on 3000")
});
