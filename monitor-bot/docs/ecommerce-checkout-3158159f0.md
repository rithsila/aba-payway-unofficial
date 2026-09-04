# Ecommerce Checkout 

## 1. Introduction

With PayWay eCommerce Checkout, you can easily **accept payments on your website or mobile app**. This solution lets your customers pay quickly and securely using **Credit/Debit Cards**, **ABA Pay & KHQR** (via ABA Mobile or other KHQR-supported banking apps), **WeChat Pay** or **Alipay**  — to give them a seamless and secure checkout experience.

**Common Use Cases**
- **Online shopping** – Accept payments for products and services.
- **Wallet top-ups & digital services** – Let users add funds or pay for digital services.
- **Subscriptions & bills** – As a checkout to process recurring payments and utility bills.
- **On-demand services** – Handle payments for food delivery, ride-hailing, and more.
- **Event bookings** – Enable seamless ticket and reservation payments

## 2. How it works   

1. The **customer selects a product or service** and clicks **"Pay"**.  
2. They **choose a payment method**, and a **checkout modal appears**.  
3. The **customer completes payment** with their chosen method (credit/debit cards, ABA Pay, KHQR, WeChat Pay, Alipay, or Google Pay). 
4. Once the payment is processed, **your system receives a pushback notification** with the payment status.  
5. Your system **verifies the payment** and confirms the order.  






:::info[]
Selling on an eCommerce platform? See our [eCommerce Checkout Plugins](https://developer.payway.com.kh/plugins-3186291f0.md) instead!
:::

## 3. Set up your payment selection UI

To ensure a smooth payment experience, your platform **must** include UI to accommodate the online payment acceptance. This includes:

- A section where **customers can choose a payment options** they want to pay with. 
- A **"We Accept..."** area that shows the payment options you offer.

:::caution[]
You **must** follows PayWay eCommerce checkout guidelines to ensure seamless customer payments.

<CardGroup cols={2}>
  <Card title="Web UI Guidelines" icon="material-outline-web_asset"href="https://www.figma.com/design/xS8d19OkA9jMh4gGsxUZPe/-External-Use--Merchant-Integration-Guideline---2.11?node-id=18242-3423&t=LHfI2NGGuNrUoeJS-4" >
    To accept payments on your website
  </Card>
  <Card title="Mobile UI Guidelines" icon="material-outline-smartphone"href="https://www.figma.com/design/xS8d19OkA9jMh4gGsxUZPe/-External-Use--Merchant-Integration-Guideline---2.11?node-id=18242-3756&t=evjdsIrE2bpqJ9wW-4">
To accept payments on your app or web app
  </Card>
  
</CardGroup>
:::

## 4. Integration Steps


:::tip[]
Before you start, make sure you have the following:
- PayWay Sandbox Account – **[Register here](https://sandbox.payway.com.kh/register-sandbox/)** to test transactions.
- Sandbox Merchant ID & API Key—You’ll receive these via email after registering for the sandbox.
:::

To integrate online payments on your website or mobile app, follow these steps:


<Steps>
  <Step title="Create a Payment Transaction">
    When the customer selects "Pay" and **chooses a payment method**, call the **[Create Transaction API](https://developer.payway.com.kh/purchase-14530820e0.md)** to generate a transaction and display it on your platform. 

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

      <input type="hidden" id="payment_option" name="payment_option" value="" />

      <input type="hidden" name="currency" value="" />

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
      
      
PayWay will respond with a **HTML response** that contains the checkout interface, which you must render on your website/platform for the customer to complete the payment.  
        
<Tabs>
  <Tab title="Web">
      
**Sample Response (Varies Based on Payment Method):**      

```html
<!DOCTYPE html>
<html data-capo="">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalab
<title>PayWay - Checkout</title>
...
</head>
<body>
...
</body>
</html>
```
  <Accordion title="Payment method responses" defaultOpen={false} icon="material-rounded-payments">
       | Payment Options |Checkout UI  |
| --- | --- |
| `cards` | <img src="https://api.apidog.com/api/v1/projects/831852/resources/351796/image-preview" width="300" />   |
| `abapay` | <img src="https://api.apidog.com/api/v1/projects/831852/resources/351795/image-preview" width="300" />  |
    | `bakong` | <img src="https://api.apidog.com/api/v1/projects/831852/resources/351794/image-preview" width="300" /> |
    | `alipay` | <img src="https://api.apidog.com/api/v1/projects/831852/resources/351793/image-preview" width="300" />  |
    | `wechat` | <img src="https://api.apidog.com/api/v1/projects/831852/resources/351791/image-preview" width="300" /> |
   
  </Accordion>



  </Tab>
  <Tab title="WAP/Mobile">

For a better user experience on mobile apps or webview, ensure you use the following parameters when you call **[Create Transaction API](https://developer.payway.com.kh/purchase-14530820e0.md)** :

- `view_type=hosted` → To respond the hosted checkout page on mobile.
- `return_deeplink` → Handles redirection for native iOS and hybrid apps, so your customers can return to your platform after making a payment in ABA Mobile.
      
**Sample Response (Varies Based on Payment Method):**    
                         
```html
<!DOCTYPE html>
<html data-capo="">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalab
<title>PayWay - Checkout</title>
...
</head>
<body>
...
</body>
</html>
```
    
    
    
  <Accordion title="Payment method responses">
       | Payment Options |Checkout UI  |
| --- | --- |
| `cards` | <img src="https://api.apidog.com/api/v1/projects/831852/resources/351729/image-preview" width="250" />   |
| `abapay` | <img src="https://api.apidog.com/api/v1/projects/831852/resources/351729/image-preview" width="250" />  |
    | `bakong` | <img src="https://api.apidog.com/api/v1/projects/831852/resources/351729/image-preview" width="250" /> |
    | `alipay` | <img src="https://api.apidog.com/api/v1/projects/831852/resources/351729/image-preview" width="250" />  |
    | `wechat` | <img src="https://api.apidog.com/api/v1/projects/831852/resources/351729/image-preview" width="250" /> |
    | `google_pay` | <img src="https://api.apidog.com/api/v1/projects/831852/resources/351729/image-preview" width="250" />  |
  </Accordion>
  
    
    </Tab>
</Tabs>      
      
      
  </Step>
  
      <Step title="Verify Payment Status">
      
Use the Check Transaction API to confirm whether a payment was successful.
After you create a payment, call the API with the transaction ID to check its status. Please respect the rate limit of 600 requests per second and stop checking once a result is returned.
For response details and error explanations, see the API guide here:
      **[Check transaction API](https://developer.payway.com.kh/check-transaction-14530826e0.md)**


  </Step>
  <Step title="(Optional) Handle Callback URL for payment status updates">
    
    Once the customer completes the payment, PayWay will send the transaction details and other important information to the `return_url`.

- If return_url is not provided in the request, PayWay will use the default return_url configured in the API Settings.
- If you provide a custom return_url, make sure the domain is whitelisted in your merchant profile.

Your return_url endpoint must:

- Accept the HTTP POST method

- Accept Content-Type: application/json
 

    
:::highlight red 💡
We highly recommend securing this URL to ensure that only ABA PayWay has access to it.
:::
  

**Sample Pushback Data**
      
```
{
    "tran_id": "9e55c7c4b4d9488a96db",
    "apv": "832865",
    "status": "0",
    "return_params": "{\"order_id\":\"123\",\"amount\":100,\"client_id\":\"1234567890\"}",
    "merchant_ref": ""
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
   
    
  </Step>

</Steps>
                          





    

    
    
    
 
