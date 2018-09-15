# Pizza-delivery company app
### Homework Assignment #3 [(Node.js master class)](https://pirple.thinkific.com)
___
In order to use my app, you need to:
- clone this repository to the selected folder
 ~~~
git clone https://github.com/mikhailsinyakov/Nodejs-master-class-HA3.git
 ~~~
- run node command with your own environment variables
~~~
STRIPE_SECRET_KEY=yourStripeKey  MAILGUN_PRIVATE_KEY=yourMailgunKey node index.js
~~~
- go to localhost:300 in your browser

You can get your Stripe secret key  [here](https://dashboard.stripe.com/account/apikeys)

You can get your Mailgun private key  [here](https://app.mailgun.com/app/account/security)

An unauthenticated user can:
 - create new account with required fields: firstName, lastName, email, streetAddress

An authenticated user can:
 - change their information
 - delete their account
 - create, update, and delete their token
 - get all the possible menu items
 - to fill a shopping cart with menu items
 - create an order

The server will send an email in response to a successful operation

You can get information by using CLI, for help enter help or man in the console.