# The API for a pizza-delivery company
### Homework Assignment #2 [(Node.js master class)](https://pirple.thinkific.com)
___
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

For a successful result, you need to use two environment variables:
 - STRIPE_SECRET_KEY - you can get secret key [here](https://dashboard.stripe.com/account/apikeys)
 - MAILGUN_PRIVATE_KEY - you can get private API key [here](https://app.mailgun.com/app/account/security)