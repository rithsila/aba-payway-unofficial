# Exchange rate

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/payment-gateway/v1/exchange-rate:
    post:
      summary: Exchange rate
      deprecated: false
      description: "With the Exchange rate API you can fetch the latest exchange rate from ABA bank, the exchange rates are exactly like the prices you will find on\_https://www.ababank.com/en/forex-exchange"
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
                hash:
                  type: string
                  title: ''
                  description: >-
                    Base64 encode of hash hmac sha512 encryption of concatenates
                    values `req_time`, and `merchant_id` with `public_key`.


                    ```php

                    // public key provided by ABA Bank

                    $api_key = "API KEY PROVIDED BY ABA BANK";

                    // Prepare the data to be hashed

                    $b4hash = $req_time . $merchant_id;

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
                - hash
            example:
              req_time: '20250212104216'
              merchant_id: ec000002
              hash: 2P+5NrSb5g2XyITaxttsnjW...JVKguqghoQrq4y4C3tbUiA==
      responses:
        '200':
          description: ''
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: object
                    properties:
                      code:
                        type: string
                        title: ''
                        description: |-
                          - `00` : Success
                          - `1` : Wrong hash
                          - `26` : Invalid merchant profile
                      message:
                        type: string
                        title: ''
                        description: >-
                          Please see the property reponse `code` for the
                          details.
                    required:
                      - code
                      - message
                    x-apidog-orders:
                      - code
                      - message
                  exchange_rates:
                    type: object
                    properties:
                      aud:
                        type: object
                        properties:
                          sell:
                            type: string
                            description: Sell rate
                          buy:
                            type: string
                            description: Buy rate
                        x-apidog-orders:
                          - sell
                          - buy
                        required:
                          - sell
                          - buy
                        description: Australia dollar
                      sgd:
                        type: object
                        properties:
                          sell:
                            type: string
                            description: Sell rate
                          buy:
                            type: string
                            description: Buy rate
                        x-apidog-orders:
                          - sell
                          - buy
                        required:
                          - sell
                          - buy
                        description: Singapore dollar
                    x-apidog-orders:
                      - aud
                      - sgd
                    required:
                      - aud
                      - sgd
                  eur:
                    type: object
                    properties:
                      sell:
                        type: string
                        description: Sell rate
                      buy:
                        type: string
                        description: Buy rate
                    x-apidog-orders:
                      - sell
                      - buy
                    required:
                      - sell
                      - buy
                    description: Euro
                  gbp:
                    type: object
                    properties:
                      sell:
                        type: string
                        description: Sell rate
                      buy:
                        type: string
                        description: Buy rate
                    x-apidog-orders:
                      - sell
                      - buy
                    required:
                      - sell
                      - buy
                    description: Pound sterling
                  myr:
                    type: object
                    properties:
                      sell:
                        type: string
                        description: Sell rate
                      buy:
                        type: string
                        description: Buy rate
                    x-apidog-orders:
                      - sell
                      - buy
                    required:
                      - sell
                      - buy
                    description: Malaysian Ringgit
                  thb:
                    type: object
                    properties:
                      sell:
                        type: string
                        description: Sell rate
                      buy:
                        type: string
                        description: Buy rate
                    x-apidog-orders:
                      - sell
                      - buy
                    required:
                      - sell
                      - buy
                    description: Thai Baht
                  hkd:
                    type: object
                    properties:
                      sell:
                        type: string
                        description: Sell rate
                      buy:
                        type: string
                        description: Buy rate
                    x-apidog-orders:
                      - sell
                      - buy
                    required:
                      - sell
                      - buy
                    description: Hong Kong Dollar
                  cny:
                    type: object
                    properties:
                      sell:
                        type: string
                        description: Sell rate
                      buy:
                        type: string
                        description: Buy rate
                    x-apidog-orders:
                      - sell
                      - buy
                    required:
                      - sell
                      - buy
                    description: Chinese Yuan
                  cad:
                    type: object
                    properties:
                      sell:
                        type: string
                        description: Sell rate
                      buy:
                        type: string
                        description: Buy rate
                    x-apidog-orders:
                      - sell
                      - buy
                    required:
                      - sell
                      - buy
                    description: Canadian Dollar
                  krw:
                    type: object
                    properties:
                      sell:
                        type: string
                        description: Sell rate
                      buy:
                        type: string
                        description: Buy rate
                    x-apidog-orders:
                      - sell
                      - buy
                    required:
                      - sell
                      - buy
                    description: South Korean won
                  jpy:
                    type: object
                    properties:
                      sell:
                        type: string
                        description: Sell rate
                      buy:
                        type: string
                        description: Buy rate
                    x-apidog-orders:
                      - sell
                      - buy
                    required:
                      - sell
                      - buy
                    description: Japanese Yen
                  vnd:
                    type: object
                    properties:
                      sell:
                        type: string
                        description: Sell rate
                      buy:
                        type: string
                        description: Buy rate
                    x-apidog-orders:
                      - sell
                      - buy
                    required:
                      - sell
                      - buy
                    description: Vietnamese dong
                required:
                  - status
                  - exchange_rates
                  - cny
                  - hkd
                  - thb
                  - myr
                  - gbp
                  - eur
                  - vnd
                  - jpy
                  - krw
                  - cad
                x-apidog-orders:
                  - status
                  - exchange_rates
                  - eur
                  - gbp
                  - myr
                  - thb
                  - hkd
                  - cny
                  - cad
                  - krw
                  - jpy
                  - vnd
          headers: {}
          x-apidog-name: OK
      security: []
      x-apidog-folder: Ecommerce Checkout
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/831852/apis/api-14530823-run
components:
  schemas: {}
  securitySchemes: {}
servers:
  - url: https://checkout-sandbox.payway.com.kh/
    description: StillZeroBug
security: []

```
