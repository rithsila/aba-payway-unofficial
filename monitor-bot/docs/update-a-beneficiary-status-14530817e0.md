# Update a beneficiary status

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/merchant-portal/merchant-access/whitelist-account/update-whitelist-status:
    post:
      summary: Update a beneficiary status
      deprecated: false
      description: >+
        This API allows you to update the status of a beneficiary, toggling
        between active and inactive status.


        **When to use this API?**

        - To prevent a whitelisted beneficiary from receiving future funds or
        from being used in payout instructions.

        - To resume a previously disabled beneficiary so they can start
        receiving funds again or be used in payout instructions.

















      tags:
        - Payout
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
                    The JSON-encoded object containing `mc_id`, `payee`, and
                    `status` is encrypted using RSA public key encryption in
                    chunks. The resulting encrypted data is then concatenated
                    and encoded in Base64 format.


                    ---

                    **mc_id** `string` `mandatory`

                    A unique merchant key which provided by ABA Bank. Same value
                    as `merchant_id`


                    ---

                    **payee** `string` `mandatory`

                    Beneficiary identifier: It can be either a MID or an ABA
                    account.


                    ---

                    **status** `int` `mandatory`

                    To disable the beneficiary, set the value to `0`. To
                    activate the beneficiary, set the value to `1`.



                    ---


                    **PHP Sample Code**
                     
                      ```php
                    // Prepare data to be encrypted

                    $data_object = json_encode([
                         'mc_id' => 'ec000002',
                          'payee' => '318111358120004',
                          'status' => 0
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
                         if (openssl_public_encrypt($chunk, $encrypted_chunk, $rsa_public_key)) {
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
                    values `request_time` and `merchant_auth` with `public_key`.


                    **Here is an example code in PHP**


                    ```php

                    // public key provided by ABA Bank

                    $api_key = "API KEY PROVIDED BY ABA BANK";

                    // Prepare the data to be hashed

                    $b4hash = $request_time . $merchant_auth;

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
              merchant_auth: 39aaa43.....0c00a
              hash: EVDFA2118UD0boKhkAcOb...+5KCCt+sWw==
      responses:
        '200':
          description: ''
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: object
                    properties:
                      name:
                        type: string
                        description: >-
                          The name of the beneficiary: if the type is MID, it
                          will be the outlet name; if it is an account, it will
                          be the account holder's name
                      payee:
                        type: string
                        description: >-
                          This value represent the destination beneficiary it
                          can be MID or ABA Account number
                        title: ''
                        maxLength: 250
                      currency:
                        type: string
                        title: ''
                        description: >-
                          If payee is MID, the value here will be merchant's
                          currency and  if the payee is an ABA Account holder it
                          will return account currency.
                      type:
                        type: string
                        description: >-
                          If payee is MID, the value here is "Merchant" if the
                          payee is an ABA Account holder it will return "ABA
                          Account"
                        maxLength: 20
                      status:
                        type: integer
                        description: |-
                          The current status of the beneficiary. 
                          - `1` : Active
                          - `0` : Inactive
                      created_at:
                        type: string
                        description: >-
                          Date and time that the beneficiary was created or
                          added to the list.
                    x-apidog-orders:
                      - name
                      - payee
                      - currency
                      - type
                      - status
                      - created_at
                  status:
                    type: object
                    properties:
                      code:
                        type: string
                        title: ''
                        description: |-
                          - `00` : Success!
                          - `PTL02` : Wrong hash
                          - `PTL04` : Parameter validation required
                          - `PTL46` : Merchant not found
                          - `PTL149` : Invalid whitelist account
                          - `PTL150` : Business profile is not found
                      message:
                        type: string
                        title: ''
                        description: See the property `code` above.
                    x-apidog-orders:
                      - code
                      - message
                x-apidog-orders:
                  - data
                  - status
          headers: {}
          x-apidog-name: OK
      security: []
      x-apidog-folder: Payout
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/831852/apis/api-14530817-run
components:
  schemas: {}
  securitySchemes: {}
servers:
  - url: https://checkout-sandbox.payway.com.kh/
    description: StillZeroBug
security: []

```
