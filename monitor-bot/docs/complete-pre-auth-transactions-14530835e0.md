# Complete pre-auth transactions

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/merchant-portal/merchant-access/online-transaction/pre-auth-completion:
    post:
      summary: Complete pre-auth transactions
      deprecated: false
      description: >+
        A complete pre-auth refers to the action where the merchant proceeds
        with capturing the funds after the initial authorization, typically at
        the time the product or service is provided.


        **This process involves two steps:**


        - Pre-authorization: The merchant requests a certain amount to be
        reserved on the customer’s account, usually to confirm the customer has
        sufficient funds or credit.

        - Completion (or Capture): The merchant later captures the
        pre-authorized amount, finalizing the transaction and actually charging
        the customer's account.



        **Conditions**

        - You can only complete the pre-auth once.

        - Pre-auth cannot be completed on transactions that have already expired
        or been canceled.

        - For card payments, you can complete the pre-auth with an additional
        10% above the original pre-auth amount.







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
                  description: A unique merchant key provided by ABA Bank.
                  title: ''
                  maxLength: 20
                merchant_auth:
                  type: string
                  title: ''
                  description: >-
                    The JSON-encoded object contains the fields `mc_id`,
                    `tran_id`, and `complete_amount`, which are encrypted using
                    RSA public key encryption in chunks.



                    ---

                    **mc_id** `string` `mandatory`

                    A unique merchant key which provided by ABA Bank. Same value
                    as `merchant_id`.


                    ---

                    **tran_id** `string` `mandatory`

                    Pre-auth purcahse transaction id to complete.


                    ---

                    **complete_amount** `decimal` `mandatory`

                    Amount to complete.


                    ---



                    **PHP Sample Code**


                    ```php

                    // Prepare data to be encrypted for complete pre auth

                    $data_object = json_encode([
                        'mc_id' => $merchant_id,
                        'tran_id' => $tran_id,
                        'complete_amount' => $complete_amount
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
                    Base64-encoded HMAC-SHA512 hash of concatenated values:
                    `merchant_auth`,  `request_time`, and `merchant_id` with
                    `public_key`.




                    ```php

                    // public key provided by ABA Bank

                    $api_key = "API KEY PROVIDED BY ABA BANK";

                    // Prepare the data to be hashed

                    $b4hash = $merchant_auth . $request_time . $merchant_id;

                    // Generate the HMAC hash using SHA-512 and encode it in
                    Base64 

                    $hash = base64_encode(hash_hmac('sha512', $b4hash, $api_key,
                    true));

                    ```
              required:
                - merchant_id
                - request_time
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
              merchant_auth: b1453eac8cd686f90542c9d7dc026a3f70678afd
              hash: >-
                wR2bVPVKY9M4WmeGoQUUcmtrJYFofFuMrgTMBLj/g8kPfXgnpK/qpjptO+1D0nKbpFktqM/iPWEyQ6/llsnJ
                bw==
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
                    minLength: 3
                    maxLength: 3
                  transaction_status:
                    type: string
                    description: >-
                      Transaction status. Once successfully completed, the
                      status will be`COMPLETED`
                  status:
                    type: object
                    properties:
                      code:
                        type: string
                        title: ''
                        description: >-
                          - **`00`** - Transaction successful.  

                          - **`PTL02`** - Invalid hash value.  

                          - **`PTL04`** - Parameter validation failed.  

                          - **`PTL06`** - The request has expired.  

                          - **`PTL36`** - Invalid transaction.  

                          - **`PTL62`** - Merchant information is invalid.  

                          - **`PTL63`** - The merchant does not have a security
                          configuration file.  

                          - **`PTL59`** - Unable to complete or cancel the
                          pre-authorization.  

                          - **`PTL60`** - Pre-authorization completion amount
                          exceeds the authorized limit.  

                          - **`PTL61`** - Invalid action type.  

                          - **`PTL153`** - Completing pre-authorization fees for
                          a merchant with multiple settlement accounts is not
                          allowed.  

                          - **`PTL157`** - An unexpected error occurred. Please
                          try again later or contact our digital support team.  

                          - **`PTL168`** - Concurrent requests are not allowed
                          for this operation. Please try again in a few
                          seconds.  

                          - **`PTL169`** - The merchant profile cannot accept
                          payments because the settlement account is closed.  

                          - **`USD-NOT-ALLOW`** - The requested amount is not
                          allowed for USD transactions.  

                          - **`KHR-LESS-100`** - The transaction amount in KHR
                          must be at least 100 KHR.  

                          - **`KHR-CONTAIN-DECIMAL`** - KHR transaction amounts
                          cannot contain decimal places.  
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
                  - currency
                  - transaction_status
                  - status
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
      x-run-in-apidog: https://app.apidog.com/web/project/831852/apis/api-14530835-run
components:
  schemas: {}
  securitySchemes: {}
servers:
  - url: https://checkout-sandbox.payway.com.kh/
    description: StillZeroBug
security: []

```
