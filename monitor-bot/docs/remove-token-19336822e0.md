# Remove token

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/payment-credential/v3/token-management/remove-token:
    post:
      summary: Remove token
      deprecated: false
      description: >
        This API allows you to remove a customer’s linked account or card token
        from your merchant profile. Once removed, the action is irreversible,
        and the token will no longer be valid for any future transactions.


        If a removed token is used for a payment attempt, the transaction will
        be declined. A failure response will be returned to the merchant, and a
        notification will also be sent to the ABA Mobile user for both ABA
        Account and ABA Card tokens.Customers can remove their tokens through
        the following channels:

        - **ABA Mobile App**: Users can view and remove their tokens directly
        within the ABA Mobile app.

        - **Your Website/Application**: Your platform should provide
        functionality that allows customers to remove their tokens.




        <Tabs>
          <Tab title="Via Your Website/Application">
              
              <Frame caption="On Merchant Website/Application offer remove token functionality for user">

              

        ![Remove token from merchant application or
        website.png](https://api.apidog.com/api/v1/projects/831852/resources/374092/image-preview)

        </Frame>
         
          </Tab>
          <Tab title="Via ABA Mobile App">
              
              
        <Frame caption="ABA Mobile user remove token via ABA Mobile">


        ![Remove token from ABA
        Mobile.png](https://api.apidog.com/api/v1/projects/831852/resources/374093/image-preview)

        </Frame>


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


          </Tab>
         
        </Tabs>
      operationId: remove-token
      tags:
        - Credentials on File
        - TokenManagement
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

                    $b4hash = $merchant_id . $ctid . $request_time . $pwt;


                    // Generate the HMAC hash using SHA-512 and encode it in
                    Base64 

                    $hash = base64_encode(hash_hmac('sha512', $b4hash, $api_key,
                    true));

                    ```
                merchant_id:
                  type: string
                  description: A unique merchant key provided by ABA Bank.
                  maxLength: 20
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
                - request_time
              x-apidog-orders:
                - request_time
                - merchant_id
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
                          A log ID is generated by the system for debugging
                          purposes.
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
              examples:
                '1':
                  summary: Example 1
                  value:
                    status:
                      code: '00'
                      message: Success
                      trace_id: a07481d6e19.....ca201f8200a
                '2':
                  summary: Example 1
                  value:
                    status:
                      code: '04'
                      message: The given data was invalid.
                      trace_id: 30a1b46c37.....6aad589ffaff8
                      errors:
                        property1:
                          - message
                        property2:
                          - message
                        property3:
                          - message
                '3':
                  summary: Example 1
                  value:
                    status:
                      code: '98'
                      message: Merchant id not found
                      trace_id: a07481d6e19.....ca201f8200a
          headers: {}
          x-apidog-name: OK
        '400':
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
                        description: '`04` - The given data was invalid.'
                      message:
                        type: string
                        description: >-
                          Please see the property reponse `errors` for the
                          details.
                      trace_id:
                        type: string
                        description: >-
                          A log ID is generated by the system for debugging
                          purposes.
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
                        description: |-
                          - `01` - Wrong hash.
                          - `98` - Merchant id not found.
                      message:
                        type: string
                        description: >-
                          Please see the property reponse `code` for the
                          details.
                      trace_id:
                        type: string
                        description: >-
                          A log ID is generated by the system for debugging
                          purposes.
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
      x-run-in-apidog: https://app.apidog.com/web/project/831852/apis/api-19336822-run
components:
  schemas: {}
  securitySchemes: {}
servers:
  - url: https://checkout-sandbox.payway.com.kh/
    description: StillZeroBug
security: []

```
