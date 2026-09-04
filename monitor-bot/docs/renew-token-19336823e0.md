# Renew Token

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/payment-credential/v3/token-management/renew-expired-account-token:
    post:
      summary: Renew Token
      deprecated: false
      description: >-
        Account tokens linked with the `CITI_FLEX` or `CITO_FLEX` flags will
        expire 90 days after their initial linking, renewal, or the last
        successful transaction—whichever is most recent. There are several ways
        for customers to renew the token:


        - **ABA Mobile App**: Users can view expired tokens in the ABA Mobile
        app and initiate the renewal directly from there.


        - **Your Website/Application**: Your platform shall provide a feature
        that allows customers to renew their tokens.




        :::info[Imporant Note]

        - This API is used to renew account tokens only and does not apply to
        card tokens.

        - The token can be renewed even if it is still active. Once the customer
        approves the request, the validity period will be extended for another
        90 days, while all other token details remain unchanged.

        :::


        <Tabs>
          <Tab title="Via Your Website/Application">
        <Frame caption="User renew from your website/applicaiton">



        ![Renew
        token.png](https://api.apidog.com/api/v1/projects/831852/resources/374090/image-preview)


        </Frame>
            :::tip[]
        You should receive the callback result within 3 minutes. If you do not
        receive the callback, we recommend using the [Get token
        details](https://developer.payway.com.kh/get-token-details-19336824e0.md)
        API to retrieve the token information. 

        :::

         
          </Tab>
          <Tab title="Via ABA Mobile App">
         <Frame caption="User renew account token from ABA Mobile">


        ![Renew token from ABA
        Mobile.png](https://api.apidog.com/api/v1/projects/831852/resources/374091/image-preview)
            
        </Frame>
            
          </Tab>

        </Tabs>








        PayWay utilizes the `callback_url` defined in your Merchant Portal under
        Outlet Profile > Services > Card on File (CoF). This endpoint acts as
        the primary listener for asynchronous token info. Below is a sample
        payload of the callback data received once a user approves the request
        within the ABA Mobile app.


        ```

        {
            "payment_credential": {
                "ctid": "SIDARA",
                "amount_limit_per_tran": 0,
                "token_flag": "CITI_FLEX",
                "source_of_fund": "*****1481",
                "subscribed_amount": 0.0,
                "currency": "USD",
                "expired_at": "2026-06-07T15:47:38.8884292+07:00",
                "pwt": "6451397B0BC9...E807",
                "type": "ABA ACCOUNT",
                "status": 1,
                "frequency": ""
            },
            "request_id": "6547709733"
        }

        ```
      operationId: renew-expired-account-token
      tags:
        - Credentials on File
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
                  description: Request date and time in UTC format as YYYYMMDDHHmmss.
                hash:
                  type: string
                  description: >-
                    **PHP Sample Code**

                    ```js

                    // public key provided by ABA Bank

                    $api_key = "API KEY PROVIDED BY ABA BANK";


                    // Prepare the data to be hashed

                    $b4hash = $ctid . $request_time . $pwt . $merchant_id .
                    $request_id;


                    // Generate the HMAC Hash using SHA-512 and encode it in
                    Base64 

                    $hash = base64_encode(hash_hmac('sha512', $b4hash, $api_key,
                    true));

                    ```
                merchant_id:
                  type: string
                  description: A unique merchant key which provided by ABA Bank.
                  maxLength: 20
                request_id:
                  type: string
                  description: >-
                    Your request id. The request id shall be unique from your
                    side. This id will be use to obtain the token details in the
                    future. We only return the last record. Length from 5 to 24
                    characters long, consisting only of letters (uppercase and
                    lowercase) and numbers, with no special characters or spaces
                    allowed.
                ctid:
                  type: string
                  title: ''
                  description: >-
                    This is your consumer identification number, which is a
                    unique code used to identify you in the system. The string
                    must be between 5 and 24 characters long and can only
                    contain letters and numbers — no spaces or special
                    characters.
                pwt:
                  type: string
                  title: ''
                  description: >-
                    PWT (PayWay Token) is a unique token automatically generated
                    by the PayWay system and is used to complete the purchase.
              required:
                - ctid
                - hash
                - merchant_id
                - pwt
                - request_id
                - request_time
              x-apidog-orders:
                - request_time
                - merchant_id
                - request_id
                - ctid
                - pwt
                - hash
            examples: {}
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
                        description: '`00` - Success'
                      message:
                        type: string
                        description: >-
                          Please see the property reponse `code` for the
                          details.
                      trace_id:
                        type: string
                        x-apidog-mock: '{{$string.uuid}}'
                        description: >-
                          A log ID is generated by the PayWay system for
                          debugging purposes.
                    x-apidog-orders:
                      - code
                      - message
                      - trace_id
                    required:
                      - trace_id
                      - message
                      - code
                x-apidog-orders:
                  - status
                required:
                  - status
              examples:
                '1':
                  summary: Example 1
                  value:
                    status:
                      code: '00'
                      tran_id: '175576524786847'
                      message: Success
                '2':
                  summary: Example 1
                  value:
                    status:
                      code: '4'
                      message: The given data was invalid.
                      trace_id: 30a1b46c37.....6aad589ffaff8
                      errors:
                        additionalProp1:
                          - string
                        additionalProp2:
                          - string
                        additionalProp3:
                          - string
                '3':
                  summary: Example 1
                  value:
                    status:
                      code: '1'
                      message: Wrong Hash.
                      trace_id: 228c0ae0ca.....f088bc280fe09
          headers: {}
          x-apidog-name: OK
        '400':
          description: The given data was invalid
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
                        description: '`04` - The given data was invalid.'
                      message:
                        type: string
                        description: >-
                          Please see the property reponse `errors` for the
                          details.
                      trace_id:
                        type: string
                        description: >-
                          A log ID is generated by the PayWay system for
                          debugging purposes.
                      errors:
                        type: object
                        properties: {}
                        x-apidog-orders: []
                        additionalProperties:
                          type: array
                          items:
                            type: string
                        description: |-
                          Error details:
                          **Sample**
                          ```js
                          "errors": {
                              "property1": [
                                  "string"
                              ],
                              "property2": [
                                  "string"
                              ]
                          }
                          ```
                    x-apidog-orders:
                      - code
                      - message
                      - trace_id
                      - errors
                    required:
                      - code
                      - message
                      - trace_id
                      - errors
                x-apidog-orders:
                  - status
                required:
                  - status
          headers: {}
          x-apidog-name: Bad Request
        '403':
          description: Logical validation failed
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
                        description: |-
                          - `01` - Wrong hash.
                          - `98` - Merchant id not found.
                          - `105` - Invalid payment credential token.
                      message:
                        type: string
                        description: >-
                          Please see the property reponse `code` for the
                          details.
                      trace_id:
                        type: string
                        x-apidog-mock: '{{$string.uuid}}'
                        description: >-
                          A log ID is generated by the PayWay system for
                          debugging purposes.
                    x-apidog-orders:
                      - code
                      - message
                      - trace_id
                    required:
                      - code
                      - message
                      - trace_id
                x-apidog-orders:
                  - status
                required:
                  - status
          headers: {}
          x-apidog-name: Forbidden
      security: []
      x-apidog-folder: Credentials on File
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/831852/apis/api-19336823-run
components:
  schemas: {}
  securitySchemes: {}
servers:
  - url: https://checkout-sandbox.payway.com.kh/
    description: StillZeroBug
security: []

```
