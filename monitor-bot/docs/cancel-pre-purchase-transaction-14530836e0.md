# Cancel pre-purchase transaction

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/merchant-portal/merchant-access/online-transaction/pre-auth-cancellation:
    post:
      summary: Cancel pre-purchase transaction
      deprecated: false
      description: >-
        Cancel pre-auth (or cancel pre-authorization) is the process of
        releasing a temporary hold on funds placed on a customer's payment
        method before the final transaction is completed.


        **Important Notes:**


        - You can only cancel a pre-authorization if the transaction is still
        pending; if the pre-auth has already been completed or previously
        cancelled, it cannot be cancelled again.

        - Each transaction’s pre-authorization can be cancelled only once.

        - Once the cancellation is successfully processed, the transaction
        status will update to "CANCELLED."

        - For ABA PAY and Card transactions, funds are instantly released back
        to the payer, whereas for KHQR transactions, the funds will be refunded
        to the payer.
      tags:
        - Pre-auth
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
                    The JSON-encoded object containing `mc_id` and `tran_id`
                    using RSA public key encryption in chunks. The encrypted
                    data is then concatenated and encoded in Base64 format.


                    ---

                    **mc_id** `string` `mandatory`

                    A unique merchant key which provided by ABA Bank. Same value
                    as `merchant_id`.


                    ---

                    **tran_id** `string` `mandatory`

                    Pre-auth purcahse transaction id to cancel.


                    ---


                    **PHP Sample Code**


                    ```php

                    // Prepare data to be encrypted

                    $data_object = json_encode([
                        'mc_id' => $merchant_id,
                        'tran_id' => $tran_id
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

                    ``
                hash:
                  type: string
                  title: ''
                  description: >-
                    Base64-encoded HMAC-SHA512 hash of concatenated values:
                    `merchant_id`, `merchant_auth`, and  `request_time`  with
                    `public_key`.


                    **PHP Sample Code**


                    ```php

                    // public key provided by ABA Bank

                    $api_key = "API KEY PROVIDED BY ABA BANK";

                    // Prepare the data to be hashed

                    $b4hash = $merchant_id . $merchant_auth . $request_time;

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
              merchant_auth: b1453eac8cd686f...c026a3f70678afd
              hash: wR2bVPV...Q6/llsnJ bw==
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
                    description: The original amount authorized for pre-auth transactions.
                  currency:
                    type: string
                    title: ''
                    description: Original transaction currency
                  transaction_status:
                    type: string
                    description: >-
                      Status of the transaction. After successfully cancelling,
                      its status is `CANCELLED`
                  status:
                    type: object
                    properties:
                      code:
                        type: string
                        title: ''
                        description: >-
                          - `00`: Success!  

                          - `PTL02`: Invalid hash provided. Ensure you are using
                          the correct hash key.  

                          - `PTL04`: Parameter validation failed. Verify that
                          all required fields are correctly formatted.  

                          - `PTL06`: The request has expired. Please generate a
                          new request and retry.  

                          - `PTL36`: Invalid transaction. Ensure that the
                          transaction ID is correct.  

                          - `PTL62`: Invalid merchant information. Verify your
                          merchant ID and try again.  

                          - `PTL63`: Merchant does not have a security
                          configuration file. Contact support for assistance.  

                          - `PTL59`: Unable to complete or cancel Pre-auth.
                          Check the transaction status before retrying.  

                          - `PTL60`: Pre-auth amount exceeds the allowed limit.
                          Reduce the amount and try again.  

                          - `PTL61`: Invalid action type. Ensure you are using a
                          valid operation type.  

                          - `PTL157`: An unexpected error occurred. Please try
                          again later or contact our digital support team.  

                          - `PTL168`: Concurrent requests are not allowed. Wait
                          a few seconds and retry.  

                          - `PTL169`: The merchant profile cannot accept
                          payments. Settlement account is closed.  

                          - `USD-NOT-ALLOW`: The requested amount is not
                          permitted. Choose a valid amount.  

                          - `KHR-LESS-100`: KHR amount must be greater than 100
                          KHR.  

                          - `KHR-CONTAIN-DECIMAL`: Amount for KHR currency must
                          be a whole number (no decimals allowed).  
                      message:
                        type: string
                        title: ''
                        description: Please see more details on the property `code` above.
                    required:
                      - code
                      - message
                    x-apidog-orders:
                      - code
                      - message
                required:
                  - grand_total
                  - status
                  - transaction_status
                  - currency
                x-apidog-orders:
                  - grand_total
                  - currency
                  - transaction_status
                  - status
          headers: {}
          x-apidog-name: OK
      security: []
      x-apidog-folder: Pre-auth
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/831852/apis/api-14530836-run
components:
  schemas: {}
  securitySchemes: {}
servers:
  - url: https://checkout-sandbox.payway.com.kh/
    description: StillZeroBug
security: []

```
