# Refund API

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/merchant-portal/merchant-access/online-transaction/refund:
    post:
      summary: Refund API
      deprecated: false
      description: >+
        You can use the Refund API to issue full or partial refunds within 30
        days after the transaction was created. ABA PAY and KHQR refunds is
        immediate, while Card, WeChat, and Alipay refunds follow your agreement
        with PayWay. This API works both for instore transaction and online
        transaction.

        <p>


        - **Eligible Transactions**: Only transactions with a status of
        COMPLETED can be refunded.

        - **Time Frame**: Refunds must be requested within 30 days of the
        payment created date.

        - **Pending Settlements**: Refunds can be issued even if the settlement
        is still pending (Alipay, WeChat, Card).

        - **Partial Refunds**: Multiple partial refunds can be issued until the
        total amount paid is refunded.

        - **Rate limit**: Request limit 500 reqeusts/second.

        - **Refund Enablement**: The outlet/terminal must have the refund
        feature enabled to allow refunds.


        </p>

      tags:
        - Ecommerce Checkout
      parameters:
        - name: Content-Type
          in: header
          description: ''
          required: true
          example: application/json
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                request_time:
                  type: string
                  title: ''
                  description: Request date and time in UTC format as YYYYMMDDHHmmss.
                merchant_id:
                  type: string
                  description: A unique merchant key which provided by ABA Bank.
                  title: ''
                  maxLength: 20
                merchant_auth:
                  type: string
                  title: ''
                  description: >-
                    The JSON-encoded object containing `mc_id`, `tran_id`, and
                    `refund_amount` using RSA public key encryption in chunks.
                    The encrypted data is then concatenated and encoded in
                    Base64 format.


                    ---

                    **mc_id** `string` `mandatory`

                    A unique merchant key which provided by ABA Bank. Same value
                    as `merchant_id`


                    ---

                    **tran_id** `string` `mandatory`

                    Purcahse transaction id to refund.


                    ---

                    **refund_amount** `decimal` `mandatory`

                    Amount to refund back to payer.


                    ---

                    **PHP Sample Code**


                    ```php

                    // Prepare data to be encrypted

                    $data_object = json_encode([
                        'mc_id' => $merchant_id, // same value as merchant_id
                        'tran_id' => $tran_id,
                        'refund_amount' => $amount
                    ]);

                    // RSA public key provided by the bank

                    $rsa_public_key = "RSA PUBLIC KEY PROVIDED BY ABA BANK";

                    // Maximum length for encryption chunks

                    $maxlength = 117;

                    // Initialize output for encrypted data

                    $encrypted_output = '';

                    // Encrypt data in chunks

                    while ($data_object !== '') {
                        // Extract a substring of the allowed maximum length
                        $chunk = substr($data_object, 0, $maxlength);
                        $data_object = substr($data_object, $maxlength);
                    // Encrypt the chunk using the public key

                    if (openssl_public_encrypt($chunk, $encrypted_chunk,
                    $rsa_public_key)) {
                            $encrypted_output .= $encrypted_chunk;
                        } else {
                            // Handle encryption failure (optional: log the error or throw an exception)
                            throw new Exception('Encryption failed for a data chunk.');
                        }
                    }

                    // Encode the concatenated encrypted output in Base64

                    $merchant_auth = base64_encode($encrypted_output);

                    ```
                hash:
                  type: string
                  title: ''
                  description: >-
                    Base64 encode of hash hmac sha512 encryption of concatenates
                    values `request_time`, `merchant_id` and `merchant_auth`
                    with `public_key`.


                    **PHP Sample Code**


                    ```php

                    // public key provided by ABA Bank

                    $api_key = "API KEY PROVIDED BY ABA BANK";

                    // Prepare the data to be hashed

                    $b4hash = $request_time . $merchant_id . $merchant_auth;

                    // Generate the HMAC hash using SHA-512 and encode it in
                    Base64 

                    $hash = base64_encode(hash_hmac('sha512', $b4hash, $api_key,
                    true));

                    ```
              required:
                - request_time
                - merchant_id
                - merchant_auth
                - hash
              x-apidog-orders:
                - request_time
                - merchant_id
                - merchant_auth
                - hash
            example:
              request_time: '20200728093403'
              merchant_id: ec000002
              merchant_auth: 884113079983a...2c3e460be35f2a3
              hash: 3nd/2Z4g45...wnA2WA/M/Qg==
      responses:
        '200':
          description: ''
          content:
            application/json:
              schema:
                type: object
                properties:
                  grand_total:
                    type: number
                    description: >-
                      Example: A customer pays 20USD by card. A 2USD discount is
                      applied, so the final amount is 18USD.
                    format: double
                  total_refunded:
                    type: number
                    description: >-
                      Total of refunded amount. If the purchase transactions has
                      refunded 3 times, and each time was 1USD, to
                      total_refunded = 3USD.
                    format: double
                  currency:
                    type: string
                    title: ''
                    description: Original currency of the transaction.
                  transaction_status:
                    type: string
                    description: >-
                      Either it's full refund or partial refund the status here
                      is `REFUNDED`
                  status:
                    type: object
                    properties:
                      code:
                        type: string
                        title: ''
                        description: >-
                          - `00` : Success

                          - `PTL02` : Invalid hash

                          - `PTL04` : Parameter validation required

                          - `PTL05` : Parameter invalid format

                          - `PTL06` : The `request_time` value is missing or
                          incorrectly formatted.

                          - `PTL37` : Refund amount cannot exceed the original
                          purchase amount.

                          - `PTL57` : Unable to refund

                          - `PTL58` : Fail to refund

                          - `PTL62` : Invalid merchant information

                          - `PTL63` : Merchant have no security config file

                          - `PTL168` : Concurrent requests are not allowed for
                          this operation. Please try again in a few seconds

                          - `PTL169` : The merchant profile cannot accept
                          payment because its settlement account is closed

                          - `PTL181` : The available balance is not enough to
                          refund the customer

                          - `PTL186` : Invalid amount format

                          - `PTL187` : Amount is below the minimum allowed
                      message:
                        type: string
                        title: ''
                        description: >-
                          Please see the property reponse `code` for the
                          details.
                    x-apidog-orders:
                      - code
                      - message
                x-apidog-orders:
                  - grand_total
                  - total_refunded
                  - currency
                  - transaction_status
                  - status
              examples:
                '1':
                  summary: Success
                  value:
                    grand_total: 1.5
                    total_refunded: 0.09
                    currency: USD
                    transaction_status: REFUNDED
                    status:
                      code: '00'
                      message: Success!
                '2':
                  summary: Exception
                  value:
                    status:
                      code: PTL02
                      message: Wrong Hash
          headers: {}
          x-apidog-name: OK
      security: []
      x-apidog-folder: Ecommerce Checkout
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/831852/apis/api-14530821-run
components:
  schemas: {}
  securitySchemes: {}
servers:
  - url: https://checkout-sandbox.payway.com.kh/
    description: StillZeroBug
security: []

```
