# Get transaction list

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/payment-gateway/v1/payments/transaction-list-2:
    post:
      summary: Get transaction list
      deprecated: false
      description: >+
        This API allows merchants to retrieve a list of transactions filtered by
        specific criteria, such as transaction date, amount, payment type, and
        more. It supports pagination and is designed for both in-store and
        online profiles, providing secure and efficient access to recent
        transaction records.

        **Criteria**

        - Both instore and online profile

        - Allow only by outlet, cannot get all transaction from all outlet which
        is under one business profile

        - Can filter from any date range in the past to current day with maximum
        3 days (included today)

        - All parameters used in the hash string must follow the exact sequence
        defined in the API documentation

        - Maximum request per minute: 50 requests




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
                from_date:
                  type: string
                  description: >-
                    **Start date for filtering transactions, in the format
                    `YYYY-MM-DD HH:mm:ss`.** Default value is today at
                    `00:00:00`.
                  x-apidog-mock: '2024-02-24 00:00:00'
                to_date:
                  type: string
                  description: >-
                    **End date for filtering transactions, in the format
                    `YYYY-MM-DD HH:mm:ss`.** Default value is today at
                    `23:59:59`.
                  x-apidog-mock: '2024-02-24 23:59:59'
                from_amount:
                  type: number
                  description: Search transactiion that has purchased amount from
                  format: double
                to_amount:
                  type: number
                  description: Search transactiion that has purchased amount to
                  format: double
                status:
                  type: string
                  description: >-
                    Possible values: `APPROVED`, `PRE-AUTH`, `REFUNDED`,
                    `PENDING`, `DECLINDED`, `CANCELLED`. No case sensitive , if
                    you want to query multiple values please separate value by
                    comma.
                page:
                  type: string
                  description: 'Current page index. Default value: `1`'
                pagination:
                  type: string
                  description: >-
                    Total number of recorde per page. Default value `40`,
                    maximum value is `1000`.
                hash:
                  type: string
                  title: ''
                  description: >-
                    Base64 encode of hash hmac sha512 encryption of concatenates
                    values `req_time`, `merchant_id`, `from_date`, `to_date`,
                    `from_amount`, `to_amount`,`status`, `page` , and
                    `pagination` with `public_key`.


                    **PHP Sample Code**


                    ```php

                    // public key provided by ABA Bank

                    $api_key = "API KEY PROVIDED BY ABA BANK";

                    // Prepare the data to be hashed

                    $b4hash = $req_time . $merchant_id . $from_date . $to_date +
                    $from_amount . $to_amount . $status . $page . $pagination;

                    // Generate the HMAC hash using SHA-512 and encode it in
                    Base64 

                    $hash = base64_encode(hash_hmac('sha512', $b4hash, $api_key,
                    true));

                    ```
              required:
                - req_time
                - merchant_id
                - hash
              x-apidog-orders:
                - req_time
                - merchant_id
                - from_date
                - to_date
                - from_amount
                - to_amount
                - status
                - page
                - pagination
                - hash
            example:
              req_time: '20250213081756'
              merchant_id: ec000002
              from_date: null
              to_date: null
              from_amount: '0.01'
              to_amount: '1000'
              status: null
              page: '1'
              pagination: '40'
              hash: o1mDvIjTyzoFcN7zvm7...aUYAGXjsx4Ej0E6P2CoxtOQ==
      responses:
        '200':
          description: ''
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      type: object
                      properties:
                        transaction_id:
                          type: string
                          description: Transaction id
                        transaction_date:
                          type: string
                          description: Created date & time of the transaction.
                        apv:
                          type: string
                          description: Transaction approval code
                        payment_status:
                          type: string
                          description: >-
                            Possible values:

                            - `APPROVED` : Transaction successfully completed
                            with the full purchase amount.

                            - `PRE-AUTH` : Transaction successfully processed
                            with a pre-authorization hold on funds pending final
                            capture.

                            - `REFUNDED` : Transaction has been fully or
                            partially refunded.

                            - `PENDING` : Transaction is awaiting payment
                            completion by the payer.

                            - `DECLINED` : Transaction has been declined.

                            - `CANCELLED` : Merchant canceled the
                            pre-authorization or closed the transaction.
                        payment_status_code:
                          type: integer
                          description: |-
                            - `0` : APPROVED, PRE-AUTH
                            - `2` : PENDING
                            - `3` : DECLINDED
                            - `4` : REFUNDED
                            - `7` : CANCELLED
                        original_amount:
                          type: number
                          format: double
                          description: Original amount of the transaction (before discount)
                        original_currency:
                          type: string
                          description: |-
                            Original transaction currency.
                            - `KHR` : For Khmer Riel transaction
                            - `USD` : For US Dollar transaction
                        total_amount:
                          type: number
                          format: double
                          description: >-
                            Amount to pay after discount. Its currency follow
                            original currency.
                        discount_amount:
                          type: number
                          format: double
                          description: >-
                            Discounted amount. Its currency follow original
                            currency.
                        refund_amount:
                          type: number
                          format: double
                          description: 'Total refunded amount. '
                        payment_amount:
                          type: number
                          format: double
                          description: >-
                            The amount that the customer has paid. Example:
                            Customer supposed to pay 1$, but customer paid from
                            his KHR account then this payment amount will be
                            4,000.00.
                        payment_currency:
                          type: string
                          description: >-
                            Payment currency. Example: Customer supposed to pay
                            1$, but customer paid from his KHR account then this
                            payment currency will be KHR.
                        first_name:
                          type: string
                          description: >-
                            Payer first name. This value only exist in the API
                            response if configure on profile.
                        last_name:
                          type: string
                          description: >-
                            Payer last name. This value only exist in the API
                            response if configure on profile.
                        email:
                          type: string
                          description: >-
                            Payer email. This value only exist in the API
                            response if configure on profile.
                        phone:
                          type: string
                          description: >-
                            Payer phone. This value only exist in the API
                            response if configure on profile.
                        bank_ref:
                          type: string
                          description: >-
                            Unique booking entry id from ABA core banking. This
                            value only exist in the API response if configure on
                            profile.
                        payer_account:
                          type: string
                          description: >-
                            Masked ABA Account Number or Masked Card PAN. For
                            other payment options, it will be blank.
                        bank_name:
                          type: string
                          description: >-
                            If payment is made with ABA Pay, it will show ABA
                            Bank or If payment made using KHQR it will show
                            issuer bank name.
                        card_source:
                          type: string
                          description: >-
                            Only for payment with card:

                            - `ONUS` : Transaction made with ABA Card

                            - `OFFUS_DOMESTIC` : Transaction made with local
                            card issue by other banks

                            - `OFFUS_INTERNATIONAL` : Transaction made with
                            internal card.
                        payment_type:
                          type: string
                          description: >-
                            Payment method that the customer use to make
                            payment. This value only exist in the API response
                            if configure on profile. Possible values:

                            - `N/A`: Those pending for payment.

                            - `ABA Pay` : Transaction made with ABA Account (ABA
                            Mobile)

                            - `Alipay` : Transaction made with Alipay.

                            - `Wechat` : Transaction made with WeChat pay.

                            - `KHQR` : Trnasaction made with KHQR.

                            - `VISA` : Transaction made with Visa card.

                            - `MC` : Transacion made with Mastercard.

                            - `JCB` : Transaction made with JCB card

                            - `CUP` : Transaction made with UPI card.
                      x-apidog-orders:
                        - transaction_id
                        - transaction_date
                        - apv
                        - payment_status
                        - payment_status_code
                        - original_amount
                        - original_currency
                        - total_amount
                        - discount_amount
                        - refund_amount
                        - payment_amount
                        - payment_currency
                        - first_name
                        - last_name
                        - email
                        - phone
                        - bank_ref
                        - payment_type
                        - payer_account
                        - bank_name
                        - card_source
                  page:
                    type: string
                    description: Current page index.
                  pagination:
                    type: string
                    description: >-
                      Total number of records per page. Default: `40` and
                      maximum of `1000`.
                  status:
                    type: object
                    properties:
                      code:
                        anyOf:
                          - type: string
                          - type: integer
                        description: |-
                          - `00` : Success!
                          - `1` : Wrong hash
                          - `8` : Invalid merchant profile
                          - `11` : Internal server error
                          - `429` : Rate limit exceeded.
                      message:
                        type: string
                        title: ''
                        description: >-
                          Please see the property reponse `code` for the
                          details.
                      tran_id:
                        type: string
                        title: ''
                        description: Request reference generated by payment gateway.
                    x-apidog-orders:
                      - code
                      - message
                      - tran_id
                x-apidog-orders:
                  - data
                  - page
                  - pagination
                  - status
          headers: {}
          x-apidog-name: OK
      security: []
      x-apidog-folder: Ecommerce Checkout
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/831852/apis/api-14530825-run
components:
  schemas: {}
  securitySchemes: {}
servers:
  - url: https://checkout-sandbox.payway.com.kh/
    description: StillZeroBug
security: []

```
