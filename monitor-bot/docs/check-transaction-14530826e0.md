# Check transaction

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/payment-gateway/v1/payments/check-transaction-2:
    post:
      summary: Check transaction
      deprecated: false
      description: >
        This API allow you to get the transaction status of a transaction, you
        can only check the transaction that created within 7 days only. To get a
        details of a transaction which is older than 7 days please use [Get a
        transaction
        details](https://developer.payway.com.kh/get-a-transaction-details-14530824e0.md)
        API.


        :::highlight orange 💡

        Request limit 600 reqeusts/second

        :::
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
                req_time:
                  type: string
                  title: ''
                  description: Request date and time in UTC format as YYYYMMDDHHmmss.
                merchant_id:
                  type: string
                  title: ''
                  description: A unique merchant key which provided by ABA Bank.
                tran_id:
                  type: string
                  title: ''
                  description: Your purchase transaction id.
                hash:
                  type: string
                  title: ''
                  description: >-
                    Base64 encode of hash hmac sha512 encryption of concatenates
                    values `merchant_id`, and `tran_id` with `public_key`.


                    **PHP Sample Code**


                    ```php

                    // public key provided by ABA Bank

                    $api_key = "API KEY PROVIDED BY ABA BANK";

                    // Prepare the data to be hashed

                    $b4hash = $req_time . $merchant_id . $tran_id;

                    // Generate the HMAC hash using SHA-512 and encode it in
                    Base64 

                    $hash = base64_encode(hash_hmac('sha512', $b4hash, $api_key,
                    true));

                    ```
              required:
                - req_time
                - merchant_id
                - tran_id
                - hash
              x-apidog-orders:
                - req_time
                - merchant_id
                - tran_id
                - hash
            example:
              req_time: '20250213065545'
              merchant_id: ec000002
              tran_id: '17394277693'
              hash: 4slqXzgVig09Hf...2vgALgdENA==
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
                      payment_status_code:
                        type: integer
                        description: |-
                          Transaction status code:
                          - `0` : APPROVED, PRE-AUTH
                          - `2` : PENDING
                          - `3` : DECLINDED
                          - `4` : REFUNDED
                          - `7` : CANCELLED
                      total_amount:
                        type: number
                        description: Amount that customer suppose to pay after discount.
                      original_amount:
                        type: number
                        description: Original purchase amount
                      refund_amount:
                        type: number
                        description: Total of all refunded amount.
                      discount_amount:
                        type: number
                        description: >-
                          Discounted amount and its currency follow the original
                          transaction currency.
                      payment_amount:
                        type: number
                        description: The amount that customer has paid.
                      payment_currency:
                        type: string
                        description: The payment currency that the customer has paid.
                      apv:
                        type: string
                        description: Transaction approval code
                      payment_status:
                        type: string
                        description: >-
                          Possible values:

                          - `APPROVED` : Transaction successfully completed with
                          the full purchase amount.

                          - `PRE-AUTH` : Transaction successfully processed with
                          a pre-authorization hold on funds pending final
                          capture.

                          - `REFUNDED` : Transaction has been fully or partially
                          refunded.

                          - `PENDING` : Transaction is awaiting payment
                          completion by the payer.

                          - `DECLINED` : Transaction has been declined.

                          - `CANCELLED` : Merchant canceled the
                          pre-authorization or closed the transaction.
                      transaction_date:
                        type: string
                        description: >-
                          Date and time of the transaction created in payment
                          gateway.
                      status:
                        type: object
                        properties:
                          code:
                            type: string
                            title: ''
                            description: |-
                              - `00` : Success!
                              - `5` : Invalid hash
                              - `6` : Transaction not found
                              - `8` : Invalid merchant profile
                              - `11` : Internal server error
                              - `429` : Reach request limit
                          message:
                            type: string
                            title: ''
                            description: >-
                              Please see the property reponse `code` for the
                              details.
                          tran_id:
                            type: string
                            title: ''
                            description: >-
                              Unique request id auto nenerated by payment
                              gateway.
                        x-apidog-orders:
                          - code
                          - message
                          - tran_id
                    x-apidog-orders:
                      - payment_status_code
                      - total_amount
                      - original_amount
                      - refund_amount
                      - discount_amount
                      - payment_amount
                      - payment_currency
                      - apv
                      - payment_status
                      - transaction_date
                      - status
                x-apidog-orders:
                  - data
          headers: {}
          x-apidog-name: OK
      security: []
      x-apidog-folder: Ecommerce Checkout
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/831852/apis/api-14530826-run
components:
  schemas: {}
  securitySchemes: {}
servers:
  - url: https://checkout-sandbox.payway.com.kh/
    description: StillZeroBug
security: []

```
