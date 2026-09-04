# Unschedule Payment

## Introduction

An **unscheduled payment** is a payment that happens anytime, not on a fixed schedule. It can be started either by the **customer** or the **merchant**. When the **customer initiates the transaction (CIT / CITU – Customer Initiated Transaction)**, it means the customer actively makes the payment themselves (for example, during checkout, booking a taxi, or ordering food from a delivery service). When the **merchant initiates the transaction (MIT / MITU – Merchant Initiated Transaction)**, it means the business triggers the payment (for example, charging for an extra service or an additional fee). In both cases, the payment is not automatic or recurring—it only happens when it is triggered.


## Understanding Token 
### Token Flags

To classify the type of the transaction, PayWay uses the `token_flag` parameter to define the Transaction Context. This tells our system who is triggering the payment and whether the billing amount is fixed or variable.

### Customer-Initiated Transactions (CIT)
The customer triggers each payment from your app or website.

| Flag       | Full name          | Amount   | Use case                                                                 | API Endpoint
|------------|-------------------|----------|--------------------------------------------------------------------------| --------|
| `CITI_FLEX`  | CIT Initial       | Variable | Customer saves their method for future purchases with varying amounts.   | [Link Account](https://developer.payway.com.kh/link-account-19336820e0.md), [Link Card](https://developer.payway.com.kh/link-card-19336819e0.md)|
| `CITU_FLEX`  | CIT Unscheduled   | Variable | Customer makes a one-time payment using a previously saved method.       |[Payment](https://developer.payway.com.kh/payment-19336821e0.md) |

### Merchant-Initiated Transactions (MIT)
Your server charges the customer without their direct interaction at the time of payment.



| Flag      | Full name        | Amount   | Use case                                                                                  | API Endpoint |
|-----------|------------------|----------|-------------------------------------------------------------------------------------------|------|
| `CITO_FLEX` | CIT Other        | Variable | Customer authorizes the merchant to charge variable amounts later (e.g. toll setup).     | [Link Account](https://developer.payway.com.kh/link-account-19336820e0.md), [Link Card](https://developer.payway.com.kh/link-card-19336819e0.md) |
| `MITU_FLEX` | MIT Unscheduled  | Variable | Merchant charges on-demand with no fixed schedule (e.g. auto-recharge for a toll card).  | [Payment](https://developer.payway.com.kh/payment-19336821e0.md) |

### Token lifecycle


<Frame caption="Token lifecycle">


![Token lifecycle (2).png](https://api.apidog.com/api/v1/projects/831852/resources/374500/image-preview)
</Frame>




## How it works   
<Tabs>
  <Tab title="ABA Account">


**Link Account** 
<Frame caption="Link Account Flow">

      
![Link Account.png](https://api.apidog.com/api/v1/projects/831852/resources/374078/image-preview)
      
</Frame>
    

1. **Initiation**: The customer selects "Link ABA Account" on your platform.

2. **Request**: Your server sends a request to PayWay to initiate the account linking process.

3. **Response**: PayWay returns a QR string or an ABA Mobile deep link.

4. **Display**:
    * Web: Convert the QR string into a QR code image for the user to scan.
    * Mobile: Use the deep link to automatically launch the ABA Mobile app.

5. **Authorization**: Once redirected or after scanning, the user selects their preferred ABA account and authorizes the link within the app.

6. **Tokenization**: PayWay generates a secure payment token and sends it to your server via the callback_url.

7. **Storage**: Store this token securely to enable seamless, one-click purchases in the future.

 
 

  </Tab>
  <Tab title="Credit/Debit card">
    **Link Card**
<Frame caption="Link Card Flow">
    
![Link Card.png](https://api.apidog.com/api/v1/projects/831852/resources/374079/image-preview)
    
</Frame>

1. **Initiation**: The customer selects **"Add/Link New Card"** on your platform.

2. **Request**: Your client-side app sends a request to your server to initiate the card linking process.

3. **API Call**: Your server calls the PayWay **Link Card API**.

4. **Form Generation**: PayWay provides a secure, hosted Card Form (or a URL to one).

5. **Data Entry**: You display the secure form to the user. The user enters their sensitive card details (Card Number, Expiry, CVV) **directly into the PayWay-hosted interface**.

6. **Secure Processing**: PayWay processes the card details and generates a **unique Payment Token**.

7. **Callback**: PayWay sends the token and masked card details (e.g., **** **** **** 1234) back to your server via the `callback_url`.

8. **Persistence**: Your server stores the token securely for future transactions, and the user receives a "Success" notification.


:::info[Important Note]
Once your merchant profile has Card on File (CoF) enabled, a 'Save Card for Future Use' checkbox will appear on the e-commerce checkout screen. When a user selects this option, PayWay securely processes the transaction and simultaneously generates a unique Payment Token. This token is delivered to your server via the `callback_url`. Please ensure your system is configured to capture and store this callback data correctly to enable one-click checkouts for returning customers.

:::
    



  </Tab>

</Tabs>





**Subsequent Transaction**
<Frame caption="This flow supports both Customer-Initiated and Merchant-Initiated unscheduled transactions.">

![Unscheduled payment without 3DS challenge.png](https://api.apidog.com/api/v1/projects/831852/resources/374081/image-preview)

</Frame>



    
1. **Selection**: The customer chooses the "Linked ABA Account/Card" as their payment method during checkout.

2. **One-Click Initiation**: The customer clicks "Place Order" or "Pay Now" to trigger the transaction.

3. **Payment Request**: Your server sends a **Payment API** request to PayWay using the previously stored Token.

4. **Processing**: PayWay securely processes the transaction without requiring the user to open the ABA Mobile app or scan a QR code or entering card details.

5. **Status Update**: PayWay returns the real-time Payment Status (Success/Fail) to your server.

6. **Notification**: PayWay sends a detailed transaction confirmation to your registered `callback_url`.

7. **Completion**: You display the final Order Confirmation to the customer on your platform.


## Set up your UI
Before integrating the API, build a payment methods section in your app where customers can:

- **Add** - Link an ABA account or credit/debit card
- **View** - See all their saved payment methods
- **Remove** - Unlink a payment method when needed
- **Renew** - Allow customer to renew the expired token.
- **Set default token** - Allow customer to set a default token (in case user has multiple tokens) that will be used for checkout.

:::caution[]
You **must** follow PayWay Credential on file guidelines to ensure proper customer card/account storage.
<CardGroup cols={2}>
  <Card title="Web UI Guideline" icon="material-outline-web_asset" href="https://www.figma.com/design/i6pWxR6XLMBCvh1ihhAnvy/Account---Card-on-File-flows?node-id=0-1&p=f&t=eQFWXjR6h7gCk7ez-0">
    To store ABA accounts or cards securely on your website
  </Card>
  <Card title="Mobile UI Guideline" icon="material-outline-smartphone"href="https://www.figma.com/design/i6pWxR6XLMBCvh1ihhAnvy/Account---Card-on-File-flows?node-id=0-1&p=f&t=eQFWXjR6h7gCk7ez-0">
    To store ABA accounts or cards securely on your mobile apps
  </Card>
  
</CardGroup>
:::


## Integration Steps


 <Steps>
      <Step title="Linking Process">
          
          
<Tabs>
  <Tab title="Link ABA Account">
To allow your customers to link their ABA account on your platform, use the [Link Account](https://developer.payway.com.kh/link-account-19336820e0.md) API. Below is a sample of a successful API response:
          
```json
{
    "status": {
        "code": "00",
        "message": "Success",
        "trace_id": "bce9c83c-922e-4672-87f5-7f92cd15047c"
    },
    "data": {
        "deeplink": "abamobilebank://ababank.com?type=account_on_file&qrcode=ABA...gFses",
        "qr_string": "ABAAOF+hEGxkym...6SbF19enqLB2xU46jTzVY",
        "expire_in": 1627113926
    }
}
```
          
          
<Tabs>
  <Tab title="Web Browser">
Display a QR code using `qr_string` for customers to scan with ABA Mobile and authorise the account linking.
  </Tab>
  <Tab title="Mobile Browser">

      
Use the `deeplink` to launch ABA Mobile automatically, where customers can select which account to link to your platform.

Here's a JavaScript code snippet to open it:
      
      
      ```js
  const data = {DATA RESPONSE FROM LINK ACCOUNT API}

if (isAndroid) {
        window.location = `intent://ababank.com?type=account_on_file&qrcode=${encodeURIComponent(
    data.qr_string
  )}#Intent;scheme=abamobilebank;end;`
} else {
        window.location = data.deeplink
}
      ```
  </Tab>
  <Tab title="Android">
Use the `deeplink` to launch ABA Mobile automatically, where customers can select which account to link to your platform.
      
      Here is a sample Android code snippet to open it:
      ```js
      private fun openDeepLink(qrString: String) {
          try {
              val url = "${ABA_SCHEME}://${ABA_DOMAIN}?type=payway&qrcode=${qrString}" 
              // value from "abapay_deeplink"
              val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
              startActivity(intent)
          } catch (ex: Exception) {
              val intent = Intent(Intent.ACTION_VIEW).apply {
              intent.data = Uri.parse("market://details?id=com.paygo24.ibank")
              startActivity(intent)
          }
      }
      
     companion object {
        const val ABA_SCHEME = "abamobilebank"
        const val ABA_DOMAIN = "ababank.com"
}
      
      
      ```
  </Tab>
  <Tab title="iOS">
Use the `deeplink` to launch ABA Mobile automatically, where customers can select which account to link to your platform.
      
      Here is a sample iOS code snippet to open it:
      ```js
      let deeplink = response.deeplink
      let appStore = "https://apps.apple.com/us/app/aba-mobile-bank/id968860649"
      
      guard
      let deeplinkURL = URL(string: deeplink),
      let appStoreURL = URL(string: appStore) else {
        //Something went wrong, check url respond from API.
        return
      }
      UIApplication.shared.open(deeplinkURL, options: [:]) { success in if !success
              // Open app store
              UIApplication.shared.open(appStoreURL, options: [:]) 
          } 
      }
      ```
  </Tab>
   
</Tabs>
      
    
      
 
      
      
      
     
      
  </Tab>
  <Tab title="Link Credit/Debit Card">
      

      
     To integrate this, use the [Link Card](https://developer.payway.com.kh/link-card-19336819e0.md) API. 
      
      
      
      
      PayWay will respond with a saved card web page that you can render in an iFrame, allowing customers to securely enter their card details directly on the PayWay screen.
      
      
      **Sample Code**

Place this code snippet to your project and point `action` of the form to the correct url environment.

```html

<!doctype html>
<html lang="en">
   <head> 
      <meta charset="utf-8"> 
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
      <meta name="description" content="">
      <meta name="author" content="PayWay">
      <title>PayWay Add Card Sample</title>
 
      <link rel="stylesheet" href="{payway based url}/checkout-popup.html?file=css"/>
      <style type="text/css">
         /* Your css style*/
      </style>
   
      <script src="{payway based url}/checkout-popup.html?file=js"></script>
      <script>
        $(document).ready(function () {
        $('#add_card_button').click(function () {
        AbaPayway.addCard(); 
        }); 
      });
      </script>
   </head> 
   <body> 
      <div class="container">
        <a href="#" id="add_card_button" class="btn btn-primary add-to-card">Add New Card</a>
      </div>
      <!-- The Modal -->
      <div id="aba_main_modal" class="aba-modal">
         <!-- Modal content --> 
         <div class="aba-modal-content add-card"> 
            <form method="POST" target="aba_webservice" id="aba_merchant_add_card"  action="{payway based url}/api/payment-credential/v3/cof/link-card">
              
              <input type="hidden" name="ctid" value="{YOUR CTID VALUE}"/>
              <input type="hidden" name="merchant_id" value="{YOUR MERCHANT ID/KEY}"/>
              <input type="hidden" name="return_param" value="{YOUR RETURN PARAM}"/>
              <input type="hidden" name="hash" value="{HASH VALUE FROM YOUR SERVER}"/>
            </form>
         </div>
      </div>
   </body>
</html>

```
      
     

          
  </Tab>

</Tabs>
          
          
      ### Callback handling    
            
     When a user successfully links their ABA Account or Card, PayWay issues an asynchronous notification to your server via the `callback_url`. This allows your system to capture the linking status and store the necessary tokens for future transactions.
          
PayWay prioritizes the `callback_url` passed dynamically as a request parameter; however, if this parameter is absent, the system defaults to the `callback_url` configured within your Outlet Profile > Services > Credential on File.
          
**Connection Requirements**
To ensure a successful handshake between PayWay and your server, your endpoint must adhere to the following specifications:

- HTTP Method: Must accept POST requests.
- Content Type: application/json.
- Network Security: Your domain and origin IP addresses must be whitelisted by ABA Bank.

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
            "token_flag": "CITI_FLEX",
            "frequency": "",
            "subscribed_amount": 0.0,
            "amount_limit_per_tran": 0.0,
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
      Possible values: `CITI_FLEX`, `CITO_FLEX`.
      - **frequency** **`string`**
      Always return empty string for token flag is `CITI_FLEX` or `CITO_FLEX`.
      
      - **subscribed_amount** **`number`**
      Always return `0` for token flag `CITI_FLEX` or `CITO_FLEX`.
      - **amount_limit_per_tran** **`number`**
      Token payment amount limit per transaction. 
      - **currency** **`string`**
       Payment amount limit transaction currency. Possible value `KHR` or `USD`. 
     
      
      If you encounter issues with the pushback notification and do not receive the details, you can manually retrieve the linked account information using the [Get token details](https://developer.payway.com.kh/get-token-details-19336824e0.md) API.
          
          

:::tip[Important Note]
ABA Mobile users have the autonomy to **freeze**, **unfreeze**, **renew**, or **remove** a linked token directly within their app. Through the Credentials on File configuration, merchants can opt-in to receive real-time callback notifications whenever a user initiates these actions. Once enabled, PayWay will trigger a callback to the merchant for every status change, utilizing the same standardized data format previously specified to ensure consistent integration.
:::
   

          
      </Step>

<Step title="Purchase using token">
       To perform purchase using the token, please follow the specification of [Payment](https://developer.payway.com.kh/payment-19336821e0.md) API.
            

   Once the customer completes the payment, PayWay will send the transaction details and other important information to the `callback_url`.

- If `callback_url` is not provided in the request, PayWay will use the default `callback_url` configured in the API Settings.
- If you provide a custom `callback_url`, make sure the domain is whitelisted in your merchant profile.

Your `callback_url` endpoint must:

- Accept the HTTP POST method

- Accept Content-Type: application/json
 

    
:::highlight red 💡
We highly recommend securing this URL to ensure that only PayWay has access to it.
:::
  

**Sample Pushback Data**
      
```
{
  "tran_id": "6605586317",
  "apv": "541181",
  "status": 0
}
```


---
    **tran_id** `string`
    Transaction ID sent during the initial payment process.
    
    ---
    **apv** `string`
    Transaction approval code.
    
    ---
    **status** `number`
    Payment status
    
    ---

    
    ### Verify Callback Signature
    
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
            
            
            

            :::tip[]
You should receive a real-time callback response within 3 seconds. If you do not receive a response, we recommend using the [Check transaction](https://developer.payway.com.kh/check-transaction-14530826e0.md) API to verify the payment status.
:::    
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
    
      <Accordion title="Can a customer link the same ABA account multiple times?">
          **No**. To prevent duplicate tokens and ensure security, a customer (identified by a unique `ctid`) cannot link the same ABA account multiple times if an Active or Frozen token already exists for that account. During the linking process, the ABA Mobile app automatically filters out previously linked accounts, ensuring the user cannot select them for a duplicate enrollment.
  
  </Accordion>
</AccordionGroup>


