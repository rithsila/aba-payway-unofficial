# Schedule Payment

## Introduction
A **scheduled payment** is a payment that happens automatically at a fixed time and for a fixed amount based on a predefined agreement. It starts with a **customer initiated transaction (CITR – Customer Initiated Transaction for Registration)**, where the customer subscribes their payment method and gives consent. After that, the next payments are **merchant initiated transactions (MITR – Merchant Initiated Transaction Recurring)**, where the merchant automatically charges the customer at the agreed time and amount (for example, a monthly subscription). In this case, both the timing and the amount are fixed, and no action is needed from the customer after the initial setup.




## Understanding Token Flags

To classify the type of the transaction, PayWay uses the `token_flag` parameter to define the Transaction Context. 


| Flag      | Full name        | Amount   | Use case                                                                                  |API Endpoint |
|-----------|------------------|----------|-------------------------------------------------------------------------------------------|-----|
| `CITR_FIX` | CIT Recurring        | Fixed | Registration: The customer starts a subscription and authorizes the fixed amount/frequency (e.g., signing up for a $20 gym plan).     | [Subscription](https://developer.payway.com.kh/subscription-21402227e0.md) |
| `MITR_FIX` | MIT Recurring  | Fixed | Subsequent Billing: The merchant's server automatically charges the agreed fixed amount at the scheduled interval (e.g., the monthly $20 gym fee).  | [Payment](https://developer.payway.com.kh/payment-19336821e0.md) |


## How it works 


<Tabs>
  <Tab title="ABA Account">
    **Subscribe using ABA Account**
      
      
<Frame caption="Subscripiton flow with ABA Account">




![Subscribe with ABA Account (1).png](https://api.apidog.com/api/v1/projects/831852/resources/374501/image-preview)
      
</Frame>

  </Tab>
  <Tab title="Credit/Debit Card">
    **Subscribe using Card**
    
    
<Frame caption="Subscripiton flow with Credit/Debit Card">
 

![Subscribe with Card.png](https://api.apidog.com/api/v1/projects/831852/resources/374084/image-preview)
    
</Frame>

  </Tab>

</Tabs>


**Subsequent Transaction**
<Frame caption="This flow is for Merchant-Initiated scheduled transactions.">


![Scheduled payment.png](https://api.apidog.com/api/v1/projects/831852/resources/374085/image-preview)
</Frame>



1. **Batch Identification**: Every day, the Merchant Server runs a scheduled job to identify all active subscriptions due for billing.

2. **Execution**: For every identified record, the server calls the PayWay Purchase API using the stored payment token.

3. **Confirmation**: PayWay processes the payment and sends an asynchronous Payment Notification (Webhook) to the merchant's server.

4. **Verification**: In the event of a missing callback, the Merchant Server performs a Transaction Status Query to ensure the database stays synchronized with the actual payment state.





## Set up your UI

Before integrating the API, build a section in your app where customers can:

- **Subscribe** – allow customers to link their payment method and give consent for future scheduled or recurring payments.
- **View subscription** – allow customers to see all active subscriptions, including details like merchant name, amount, and billing frequency.
- **Unsubscribe** – allow customers to cancel an existing subscription so no future payments will be charged.

:::caution[]
You **must** follow PayWay Credential on file guidelines to ensure proper customer card/account storage.
<CardGroup cols={2}>
  <Card title="Web UI Guideline" icon="material-outline-web_asset" href="https://www.figma.com/design/ML0Io9zCYnEq6PEZvdEqtJ/AOF---COF-Scheduled-Payments?node-id=4010-5664&t=iIQrPXiqXdyqL3q3-0">
    To store ABA accounts or cards securely on your website
  </Card>
  <Card title="Mobile UI Guideline" icon="material-outline-smartphone"href="https://www.figma.com/design/ML0Io9zCYnEq6PEZvdEqtJ/AOF---COF-Scheduled-Payments?node-id=4010-3237&t=iIQrPXiqXdyqL3q3-0">
    To store ABA accounts or cards securely on your mobile apps
  </Card>
  
</CardGroup>
:::


## Integration Steps



<Steps>
  <Step title="Subscribe">
  
      
      Initiate the subscription by calling the [subscription](https://developer.payway.com.kh/subscription-21402227e0.md) API after the customer selects a plan (with predefined amount and frequency). This step is a CITR (Customer Initiated Transaction for Registration) where the customer provides consent and links their payment method.
      
       **Sample Request** 
```
<html lang="en">
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
      
    <!-- Remove PayWay Plugin JS if you prefer Hosted view mode. This URL is valid for both Sanbdbox and Production -->
    <script src="https://checkout.payway.com.kh/plugins/checkout2-0.js" defer></script>
      
  </head>
  <body>
    <form method="POST" target="aba_webservice" id="aba_merchant_request"
      action="https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase" >
      <input type="hidden" name="hash" value="D8SaUWAA/AhxNro00wAykb4ibeo9kM3if7ioN7cnBfihXP/38anLGwGUxHK+J6HvaiUEV8Ho+nz5nkQrzowm7g==" />
      <input id="tran_id" type="hidden" name="tran_id" value="17536691884" /><br />
      <input type="hidden" name="amount" value="0.10" />
      <input type="hidden" name="merchant_id" value="ec000002" />
      <input type="hidden" name="req_time" value="20250728022056" />
        
        <input type="hidden" name="ctid" value="your_unique_reference" />
        <input type="hidden" name="token_flag" value="CITR_FIX" />
        <input type="hidden" name="frequency" value="1W" />

      <input type="hidden" id="payment_option" name="payment_option" value="abapay" />

      <input type="hidden" name="currency" value="USD" />

      <input type="hidden" name="firstname" value="sina" />
      <input type="hidden" name="lastname" value="chhum" />
      <input type="hidden" name="phone" value="093939399" />
      <input type="submit" value="submit" />
    </form>

    <script>
      var form = document.getElementById('aba_merchant_request')
      form.addEventListener('submit', function (event) {
        event.preventDefault()
        AbaPayway.checkout() // Use it with PayWay Plugin JS to display as a bottom sheet on mobile or a modal popup on desktop // document.getElementById(form_id).submit() // Use it to display as Hosted view mode
      })
    </script>
  </body>
</html>
      
```
      
     PayWay will respond with a HTML response that contains the checkout interface, which you must render on your website/platform for the customer to complete the payment.

  </Step>
  <Step title="Handle Callback">
      
      Once the customer completes the payment, PayWay will send two callback notification to merchant.
      
       Your `callback_url` endpoint must:

- Accept the HTTP POST method
- Accept Content-Type: application/json

:::highlight red 💡
We highly recommend securing this URL to ensure that only PayWay has access to it.
:::
      
      
    **1) Payment completion callback notification**
      
     Upon completion of the customer’s payment, PayWay transmits the transaction details and critical metadata to the callback_url specified in your request parameters. If no parameter is provided, PayWay defaults to the callback_url configured within your API Settings.
      
      
:::highlight red 💡
If you provide a custom `callback_url` in your API request, ensure the domain is whitelisted within your merchant profile to allow PayWay to communicate securely with your server.
:::



  

**Sample Pushback Data**
      
```
{
    "tran_id": "17425401324",
    "apv": "619195",
    "status": "0", 
    "return_params": "xxxxxxxxxx"
}    
```


---
    **tran_id** `string`
    Transaction ID sent during the initial payment process.
    
    ---
    **apv** `string`
    Transaction approval code.
    
    ---
    **status** `string`
    Payment status
    
    ---
    **return_params** `string`
    Extra information sent to the payment gateway during the payment initiation request.
    
    ---
    
    **Verify Callback Signature**
    
    For security purposes, PayWay includes a hash signature in the request header.
You should verify this signature to confirm that the callback was sent by PayWay and that the data has not been modified.

Below is an example in PHP demonstrating how to:

1. Read the callback data

2. Generate the signature

3. Compare it with the signature received in the header

PHP Example
    
   ```
    // Read request body
$response = json_decode(file_get_contents('php://input'), true);

$secretKey = "YOUR_SECRET_KEY";

// 1. Sort fields by key (ascending)
ksort($response);

// 2. Concatenate all values
$b4hash = '';
foreach ($response as $value) {
    if (is_array($value)) {
        $value = json_encode($value);
    }
    $b4hash .= $value;
}

// 3. Generate HMAC-SHA512 signature
$signature = base64_encode(
    hash_hmac('sha512', $b4hash, $secretKey, true)
);

// 4. Get signature from request header
$receivedSignature = $_SERVER['HTTP_X_PAYWAY_HMAC_SHA512'] ?? '';

// 5. Compare signatures
if (hash_equals($signature, $receivedSignature)) {
    // Valid request – process the notification
} else {
    // Invalid request
    http_response_code(401);
    exit('Invalid signature');
}
    ```
      
      
      **2) Token callback**
      
      PayWay will use `callback_url` configured within your Outlet Profile > Services > Credential on File to delivery the token information.
      
      **Sample Callback Data**
      
      ```json
      {
          "request_id": "175317626731593",
          "payment_credential": {
            "ctid": "64513556cc930062e8cb3ae59eee8fbf459c53e",
            "pwt": "6451355C97035CDE21FB13..E0945C21007136F3D423A1B",
            "source_of_fund": "*****5312",
            "type": "ABA ACCOUNT",
            "status": 1,
            "expired_at": "2025-10-20T08:20:03",
            "token_flag": "CITR_FIX",
            "frequency": "1W",
            "subscribed_amount": 100.00,
            "amount_limit_per_tran": 100.00,
            "currency": "USD",
          }
        }
      ```
      
      ---
      **request_id** **`string`**
      Your original requst ID.
      
      ---
      **payment_credential** **`object`**
      
      - **ctid** **`string`**
     Your consumer identification number.
      
      - **pwt** **`string`**
     PWT (PayWay Token) is a unique token automatically generated by the PayWay system and is used to complete the purchase..
       - **source_of_fund** **`string`**
      This field displays either the card number or the ABA account number, depending on the payer's selected payment method. For security reasons, the number is masked and only the last 4 digits are shown.
       - **type** **`string`**
            - `Visa` - Visa card
            - `MC` - Mastercard
            - `CUP` - UnionPay card
            - `JCB` - JCB card
            - `ABA ACCOUNT` - ABA Account
       - **status** **`number`**
      
            - `0` - Token has been removed.
            - `1` - Token is active.
            - `2` - Token has been frozen.
       - **expired_at** **`string`**
      Expiry date of the token.
      - **token_flag** **`string`**
      Possible values: `CITR_FIX`.
      - **frequency** **`string`**
      Possible value are `1W` - Weekly, `1M` - Monthly, `2M` - Every 2 months.
      
      - **subscribed_amount** **`number`**
      The `subscribed_amount` is the fixed monetary value authorized by the customer during the registration phase (`CITR_FIX`)
      - **amount_limit_per_tran** **`number`**
      For scheduled payments, the `amount_limit_per_tran` is automatically locked to the subscribed_amount. Users are restricted from adjusting this limit in their ABA Mobile app, guaranteeing that the authorized payment can always be processed.
      - **currency** **`string`**
       Payment amount limit transaction currency. Possible value `KHR` or `USD`.
      
      
  </Step>
  <Step title="Subsequent Transactions">
    Once the subscription is done, all future payments are automatically triggered by the merchant as MITR (Merchant Initiated Transaction Recurring). These transactions follow the fixed schedule and fixed amount defined during the subscription setup, without requiring further customer action.
      
 
      
      Please use the [Payment](https://developer.payway.com.kh/payment-19336821e0.md) API to trigger each subsequent transaction.
  </Step>
</Steps>

## Frequently Asked Questions (FAQs)

<AccordionGroup>
  <Accordion title="Can a transaction be initiated using an expired token?" >
  No, expired tokens cannot be used to process payments. If an expired ABA Account or ABA Card token is used, the transaction will be declined. The user will receive a notification on their ABA Mobile stating that the payment method is no longer valid. To resume seamless payments, the user must renew the token by re-authorizing through the ABA Mobile app or via your platform's **"Manage Payment Methods"** section.
  </Accordion>
  <Accordion title="Can a transaction be initiated using a frozen token?">
    Frozen tokens are temporarily disabled and cannot be used to process payments. If a frozen ABA Account or ABA Card token is used for a transaction, the request will be declined. The user will receive a notification on their ABA Mobile informing them that the selected payment method is currently inactive or frozen. To resume seamless payments, the user must unfreeze the token through the ABA Mobile app.
  </Accordion>
  <Accordion title="Can a token initiated as CITI_FLEX be used for MITU_FLEX transactions?">
    **No**. Tokens are restricted by the Initiation Type defined during the linking process.
      
          
`CITI_FLEX` Tokens: These are authorized specifically for Customer-Initiated Transactions (CIT). They can only be used when the customer is actively present and triggers the payment (e.g., a one-click checkout).

`CITO_FLEX` Tokens: To perform Merchant-Initiated Transactions (MIT)—such as automated subscriptions or unscheduled utility billings—the merchant must initiate the linking process as `CITO_FLEX`. This ensures the user has explicitly consented to the merchant triggering future payments on their behalf.
  
  </Accordion>
    
      <Accordion title="Can a buyer change the token amount limit from ABA Mobile after subscribing to a plan?">
          **No**, buyer is not allowed to update the token limit after subscription.
        
  
  </Accordion>
</AccordionGroup>










