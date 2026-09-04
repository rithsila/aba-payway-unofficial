# Subscription

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/payment-gateway/v1/payments/purchase:
    post:
      summary: Subscription
      deprecated: false
      description: >
        This API allows a merchant to make a purchase transaction while at the
        same time linking the customer’s card and ABA account to the merchant’s
        system. Once the purchase is successfully completed, the API will push a
        token back to the merchant, which can be used for future payments or
        account verification.



        <Tabs>
          <Tab title="ABA PAY">
              
        <Frame caption="Subscription flow with ABA Account">



        ![Subscribe with ABA Account
        (1).png](https://api.apidog.com/api/v1/projects/831852/resources/374502/image-preview)
              
        </Frame>

           

          </Tab>
          <Tab title="Credit/Debit Card">
            
            
        <Frame caption="Subscripiton flow with Credit/Debit Card">
         ![Subscribe with Card.png](https://api.apidog.com/api/v1/projects/831852/resources/374024/image-preview)
        </Frame>

            
            


          </Tab>
          
        </Tabs>
      tags:
        - Credentials on File
      parameters:
        - name: Content-Type
          in: header
          description: ''
          required: true
          example: multipart/form-data
          schema:
            type: string
      requestBody:
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                req_time:
                  description: Request date and time in UTC format as YYYYMMDDHHmmss.
                  example: ''
                  type: string
                merchant_id:
                  type: string
                  maxLength: 30
                  description: A unique merchant key which provided by ABA Bank.
                  example: ''
                tran_id:
                  type: string
                  maxLength: 20
                  description: A unique transaction identifier for the payment.
                  example: ''
                firstname:
                  type: string
                  maxLength: 20
                  description: Buyer's first name.
                  example: ''
                lastname:
                  type: string
                  maxLength: 20
                  description: Buyer's last name.
                  example: ''
                email:
                  type: string
                  maxLength: 50
                  description: Buyer's email.
                  example: ''
                phone:
                  type: string
                  maxLength: 20
                  description: Buyer's phone.
                  example: ''
                type:
                  type: string
                  maxLength: 20
                  description: '- `purchase` : for full purchase'
                  example: ''
                payment_option:
                  type: string
                  maxLength: 20
                  description: >
                    **Payment Methods for Transactions:**  


                    - **`cards`**: For card payments.  

                    - **`abapay`**: QR payment that can be scanned and paid
                    using ABA PAY.

                    - **`abapay_deeplink`**: Allows customers to pay using **ABA
                    PAY**. The payment gateway will respond with a JSON object
                    containing `qr_string`, `abapay_deeplink`, and
                    `checkout_qr_url`. See the sample response in the response
                    section below.  
                  example: ''
                items:
                  type: string
                  maxLength: 500
                  description: >-
                    A base64-encoded JSON array describing the items being
                    purchased.


                    **PHP Sample Code**


                    ```php

                    $item = base64_encode(json_encode([
                        ["name" => "product 1","quantity" => 1,"price" => 1.00], 
                        ["name" => "product 2","quantity" => 2, "price" => 4.00]
                    ]));

                    ```

                    **Note: This is only description/remark.  The price or
                    quantity in this info will not be used for calculation or
                    any validation purposes**
                  example: ''
                shipping:
                  type: number
                  description: Shipping fee.
                  example: 0
                amount:
                  type: number
                  description: Purchase amount.
                  example: 0
                currency:
                  description: >-
                    Transaction currency of the payment. If you don't pass any
                    value, it will take default value from your merchant profile
                    (the first account's the currency of the first account you
                    registered). Supported values are `KHR` or `USD`.
                  example: ''
                  type: string
                return_url:
                  description: >-
                    The URL to which PayWay will send the payment notification
                    upon success. 
                  example: ''
                  type: string
                cancel_url:
                  description: >-
                    The URL to redirect to after the user closes the payment
                    dialog or when user cancel the payment.
                  example: ''
                  type: string
                skip_success_page:
                  type: integer
                  description: >-
                    Skip success page can be configure on checkout service
                    level. We also provide option via the API for you to
                    override the setting too. If you don't pass this param, it
                    will follow the configuration on the profile level.
                    Supported value:

                    - `0` : Don't skip success pages

                    -  `1`: Skip success page.


                    Once you skipe success page, `continue_success_url` on
                    profile level will be used to redirect user to the specific
                    location if you don't pass value of continue_success_url in
                    the request.
                  example: 0
                continue_success_url:
                  description: The URL to redirect to after a successful payment.
                  example: ''
                  type: string
                return_deeplink:
                  description: >-
                    The deep link for redirecting to the app after a successful
                    payment from ABA Mobile. Must be base64-encoded and include
                    both iOS and Android schemes. This field is mandatory for
                    mobile integration.


                    **PHP Sample Code**


                    ```php

                    $return_deeplink =base64_encode(json_encode([
                        "ios_scheme" => "DEEPLINK TO RETURN TO YOUR IOS APP",
                        "android_scheme" => "DEEPLINK TO RETURN TO YOUR ANDROID APP"
                    ]));

                    ```
                  example: ''
                  type: string
                custom_fields:
                  description: >
                    Additional information that you want to attach to the
                    transaction. This information will appear in the transaction
                    list, transaction details and export report. It's
                    base64-encoded JSON info.


                    **PHP Sample Code**


                    ```php

                    $custom_field = base64_encode(json_encode([
                        "field1" => "myvalue1",
                        "field2" => "myvalue2"
                    ]));

                    ```
                  example: ''
                  type: string
                return_params:
                  description: >-
                    Information to include when PayWay calls your return URL
                    after a successful payment.
                  example: ''
                  type: string
                view_type:
                  description: >-
                    Defines the view type for the payment page.

                    - `hosted_view` : redirect payer to a new tab

                    - `popup` : Display as a **bottom sheet** on mobile web
                    browsers and as a **modal popup** on desktop web browsers.
                  example: ''
                  type: string
                payment_gate:
                  type: integer
                  description: >-
                    If your merchant profile also supports the **QR Payment
                    API** service, please set this parameter to `0` to use the
                    Checkout service.
                  example: 0
                payout:
                  description: |-
                    Base64-encoded JSON string representing payout details.

                    **PHP Sample Code**
                    ```php
                    $payout = base64_encode(json_encode([
                        ["acc" => "000133879","amt"=> 1], 
                        ["acc" => "000133880","amt" => 1]
                    ]));
                    ```
                  example: ''
                  type: string
                lifetime:
                  type: integer
                  description: >-
                    The payment's lifetime in minutes, once it exceeds customer
                    will not allow to make payment.  Default value is 30 days.

                    - Min: 3 mins

                    - Max: 30 days
                  example: 0
                ctid:
                  example: ''
                  type: string
                token_flag:
                  description: Supported token flag `CITR_FIX`.
                  example: ''
                  type: string
                frequency:
                  description: >-
                    The field is require when the token flag is `CITR_FIX`. The
                    possible values are:

                    - `1W` – Weekly

                    - `1M` – Monthly

                    - `2M` – Every 2 months
                  example: ''
                  type: string
                hash:
                  description: >-
                    Base64 encode of hash hmac sha512 encryption of concatenates
                    values
                    `req_time`,`merchant_id`,`tran_id`,`amount`,`items`,`shipping`,`firstname`,`lastname`,`email`,`phone`,`type`,`payment_option`,`return_url`,`cancel_url`,`continue_success_url`,`return_deeplink`,`currency`,`custom_fields`,`return_params`,`payout`,`lifetime`,`additional_params`,
                    `skip_success_page`, `token_flag` and `frequency` with
                    `public_key`.




                    **PHP Sample Code**

                    ```php

                    // public key provided by ABA Bank

                    $api_key = "API KEY PROVIDED BY ABA BANK";


                    // Prepare the data to be hashed

                    $b4hash = $req_time . $merchant_id . $tran_id . $amount .
                    $items . $shipping . $firstname . $lastname . $email .
                    $phone . $type . $payment_option . $return_url . $cancel_url
                    . $continue_success_url . $return_deeplink . $currency .
                    $custom_fields . $return_params . $payout . $lifetime .
                    $additional_params .$skip_success_page .$token_flag .
                    $frequency;



                    // Generate the HMAC hash using SHA-512 and encode it in
                    Base64 

                    $hash = base64_encode(hash_hmac('sha512', $b4hash, $api_key,
                    true));

                    ```
                  example: ''
                  type: string
              required:
                - req_time
                - merchant_id
                - tran_id
                - payment_option
                - amount
                - ctid
                - hash
            examples: {}
      responses:
        '200':
          description: ''
          content:
            '*/*':
              schema:
                type: object
                properties:
                  01JME5PQCH7BA4JH9V9C51N1FV:
                    type: string
                x-apidog-orders:
                  - 01JME5PQCH7BA4JH9V9C51N1FV
                required:
                  - 01JME5PQCH7BA4JH9V9C51N1FV
              examples:
                '1':
                  summary: Success
                  value: >-
                    <!DOCTYPE html>

                    <html data-capo="">

                    <head>

                    <meta charset="utf-8">

                    <meta name="viewport" content="width=device-width,
                    initial-scale=1.0, maximum-scale=1.0, user-scalab

                    <title>PayWay - Checkout</title>

                    ...

                    </head>

                    <body>

                    ...

                    </body>

                    </html>
                '2':
                  summary: Success
                  value: |-
                    {
                        "status": {
                            "code": "00",
                            "message": "Success!",
                            "tran_id": "trx-20201019130949"
                        },
                        "qr_string": "00020101021230510016abaakhppxxx@abaa01153250212100849350208ABA Bank520410165...",
                        "abapay_deeplink": "abamobilebank://ababank.com?type=payway&qrcode=00020101021230510016...",
                        "checkout_qr_url": "https://checkout-uat.payway.com.kh/eyJzdGF0dXMiOnsiY29kZSI6IjAwIiw..."
                    }
          headers: {}
          x-apidog-name: Success
        x-200:OK:
          description: ''
          content:
            application/json:
              schema:
                title: ''
                type: object
                properties:
                  status:
                    type: object
                    properties:
                      code:
                        type: string
                      message:
                        type: string
                      tran_id:
                        type: string
                    x-apidog-orders:
                      - code
                      - message
                      - tran_id
                    description: status
                    required:
                      - code
                      - message
                      - tran_id
                  qr_string:
                    type: string
                  abapay_deeplink:
                    type: string
                  checkout_qr_url:
                    type: string
                x-apidog-orders:
                  - status
                  - qr_string
                  - abapay_deeplink
                  - checkout_qr_url
                required:
                  - status
                  - qr_string
                  - abapay_deeplink
                  - checkout_qr_url
          headers: {}
          x-apidog-name: OK
        'x-200:Exception ':
          description: ''
          content:
            application/json:
              schema:
                title: ''
                type: object
                properties:
                  status:
                    type: object
                    properties:
                      code:
                        type: integer
                        description: >
                          - `0` : Success  

                          - `1` : Wrong hash  

                          - `2` : Invalid transaction ID  

                          - `3` : Invalid transaction amount  

                          - `4` : Duplicated transaction ID  

                          - `5` : Transaction not found  

                          - `6` : Requested domain is not in whitelist  

                          - `7` : Wrong return param  

                          - `8` : Something went wrong while saving data. Please
                          try again later or contact merchant for help.  

                          - `10` : Wrong shipping price  

                          - `11` : Something went wrong. Try again or contact
                          the merchant for help.  

                          - `12` : Payment currency is not allowed  

                          - `13` : Invalid items  

                          - `14` : Invalid credit multi acc  

                          - `15` : Invalid or missing channel values from smart
                          merchant  

                          - `16` : Invalid first name. It must not contain
                          numbers or special characters or not more than 100
                          characters.  

                          - `17` : Invalid last name. It must not contain
                          numbers or special characters or not more than 100
                          characters.  

                          - `18` : Invalid phone number  

                          - `19` : Invalid email  

                          - `20` : Something went wrong. Please contact
                          merchant.  

                          - `21` : End of API lifetime  

                          - `23` : Selected payment option is not enabled for
                          this merchant profile  

                          - `24` : Cannot decrypt data  

                          - `25` : Allow maximum 10 payout per requests  

                          - `26` : Invalid merchant profile  

                          - `27` : Invalid ctid  

                          - `28` : Invalid pwt  

                          - `29` : Invalid pwt or ctid  

                          - `30` : Merchant is not enabled COF  

                          - `31` : Unsecure 3Ds page  

                          - `33` : Cannot identify cardOrigin  

                          - `34` : Exchange rate data is invalid  

                          - `35` : Payout info is invalid  

                          - `36` : Payout account or amount is invalid  

                          - `37` : Payout accounts are not in whitelist  

                          - `38` : Payout contain invalid transaction ID  

                          - `39` : Payout contain duplicated account  

                          - `40` : Payout contain duplicated transaction ID  

                          - `41` : Payout info contain mid not link with any
                          merchant profile  

                          - `42` : Payout info contain account invalid status  

                          - `43` : Merchant profile's MID is missing. Please try
                          again or contact merchant for help.  

                          - `44` : Purchase amount has reached transaction
                          limit  

                          - `45` : Purchase with zero amount is not allowed  

                          - `46` : Purchase amount for KHR currency could not
                          contain decimal place  

                          - `47` : KHR amount must be greater than 100 KHR  

                          - `48` : Something went wrong with requested
                          parameters. Please try again or contact merchant for
                          help.  

                          - `49` : Invalid start date  

                          - `50` : Invalid end date  

                          - `51` : Invalid date range  

                          - `52` : Maximum date range is allowed only 3 days  

                          - `53` : Invalid amount range  

                          - `54` : Transaction is expired. Please try again or
                          contact the merchant for help.  

                          - `55` : We are unable to request QR from Wechat
                          system. Please try again or contact merchant for
                          help.  

                          - `56` : We are unable to validate your transaction
                          with Wechat system. Please try again or contact
                          merchant for help.  

                          - `57` : We are unable to validate your card source.
                          Please try again or contact merchant for help.  

                          - `58` : Provide invalid card number  

                          - `59` : Payout info can not be fixed with MID and ABA
                          account  

                          - `60` : Something went wrong with QR String. Please
                          try again or contact merchant for help.  

                          - `61` : Something went wrong. Please try again or
                          contact merchant for help.  

                          - `62` : QR is already in used  

                          - `63` : Transaction is already exist in core banking.
                          Please perform new transaction or contact merchant for
                          help.  

                          - `64` : Payer's account is same as merchant profile's
                          account. Please choose different account.  

                          - `65` : Merchant profile's MID is not found in core
                          banking. Please try again or contact merchant for
                          help.  

                          - `66` : Something went wrong. Please try again or
                          contact merchant for help.  

                          - `67` : QR on invoice is currently not available for
                          this merchant profile.  

                          - `68` : Transaction is expired. Please re-initiate
                          the transaction.  

                          - `69` : Transaction lifetime can not be less than 3
                          minutes.  

                          - `70` : Total purchase amount has reached daily
                          limit. Please use difference account.  

                          - `71` : Payout for card payment is not allowed to ABA
                          account.  

                          - `72` : The merchant profile cannot accept payment
                          because its settlement account is closed.  

                          - `73` : Invalid transaction status  

                          - `74` : Invalid tran_id or merchant_id  

                          - `75` : tran_id not found  

                          - `76` : Invalid additional parameters  

                          - `77` : Merchant transactions do not support
                          transaction fees  

                          - `78` : Card payout transactions are not compatible
                          with the discount program.  

                          - `79` : Payment token missing in Google Pay  

                          - `80` : Failed to decrypt the payment token provided
                          by Google Pay  

                          - `81` : The return URL is not in the whitelist  

                          - `82` : The payout has exceeded the maximum allowable
                          amount per transaction  

                          - `83` : Payment credential is disabled  

                          - `84` : Payment credential is expired  

                          - `85` : Purchase reach limit amount per transaction  

                          - `86` : Unsupported merchant purchase mode  

                          - `87` : Payment credential is removed  

                          - `200` : Payment was canceled  

                          - `201` : Payment was declined  

                          - `401` : Unauthorized access  

                          - `403` : Something went wrong. Try again or contact
                          the merchant for help.  

                          - `429` : Too many request, please try again in
                          1min.  

                          - `503` : System under maintenance  
                      message:
                        type: string
                        description: refer to `code` for response message
                    x-apidog-orders:
                      - code
                      - message
                    description: status
                    required:
                      - code
                      - message
                x-apidog-orders:
                  - status
                required:
                  - status
          headers: {}
          x-apidog-name: 'Exception '
      security: []
      x-apidog-folder: Credentials on File
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/831852/apis/api-21402227-run
components:
  schemas: {}
  securitySchemes: {}
servers:
  - url: https://checkout-sandbox.payway.com.kh/
    description: StillZeroBug
security: []

```
