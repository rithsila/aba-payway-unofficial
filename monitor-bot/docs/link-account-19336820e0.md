# Link Account

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/payment-credential/v3/aof/link-account:
    post:
      summary: Link Account
      deprecated: false
      description: >-
        The API returns a QR code or an ABA Mobile deeplink, enabling users to
        either scan the QR code or use the deeplink to  automatically launches
        the ABA Mobile app and prompts the customer to select an ABA account to
        link to your platform. Once the user finished linking, PayWay will send
        pushback account details and token to the merchant through the
        `callback_url`.



        <Frame caption="Link ABA Account Flow">



        ![Link
        Account.png](https://api.apidog.com/api/v1/projects/831852/resources/374086/image-preview)


        </Frame>



        Refer to the step-by-step integration guide 
        [here](https://developer.payway.com.kh/credentials-on-file-4395178f0.md)
        for detailed instructions.
      operationId: link-account
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
                  x-apidog-mock: '{{$date.timestamp}}'
                hash:
                  type: string
                  description: >-
                    Base64 encode of hash hmac sha512 encryption.


                    **PHP Sample Code**

                    ```js

                    // public key provided by ABA Bank

                    $api_key = "API KEY PROVIDED BY ABA BANK";


                    // Prepare the data to be hashed

                    $b4hash = $merchant_id . $request_time . $ctid .
                    $return_deeplink . $callback_url . $request_id . $token_flag
                    . $currency;


                    // Generate the HMAC hash using SHA-512 and encode it in
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
                    future. We only return the last record.  Length from 5 to 24
                    characters long, consisting only of letters (uppercase and
                    lowercase) and numbers, with no special characters or spaces
                    allowed.
                  x-apidog-mock: '{{$string.uuid}}'
                ctid:
                  type: string
                  description: >-
                    This is your consumer identification number, which is a
                    unique code used to identify you in the system. The string
                    must be between 5 and 24 characters long and can only
                    contain letters and numbers — no spaces or special
                    characters.
                  x-apidog-mock: '{{$string.uuid}}'
                return_deeplink:
                  type: string
                  description: >-
                    After the user links their account on ABA Mobile, they will
                    see a success screen with a **Done** button. Your return
                    deep link will be embedded in this button. When the user
                    taps **Done**, they will be redirected to your app. The
                    return deeplink must be encode with Base64.


                    **PHP Sample Code**


                    ```js

                    $deeplink_format = array(
                      "ios_scheme" => "{YOUR IOS DEEPLINK URL}",
                      "android_scheme" => "{YOUR ANDROID DEEPLINK URL}",
                    );

                    $return_deeplink =
                    base64_encode(json_encode($deeplink_format));

                    ```
                  nullable: true
                callback_url:
                  type: string
                  description: >-
                    Once the user links their account, the token details and
                    other important information will be sent to the URL
                    specified here. This field is optional. If left empty or you
                    don't pass the value, the system will use the `pushback_url`
                    defined in your profile by default. If you choose to provide
                    a custom URL, please ensure that the domain is whitelisted
                    in your merchant profile.  Must be base64-encoded.
                  nullable: true
                token_flag:
                  type: string
                  description: Possible value `CITI_FLEX` and `CITO_FLEX`.
                currency:
                  type: string
                  description: >-
                    Transaction currency, the value is based on merchant
                    profile. Possible value `KHR` and `USD`.
              required:
                - ctid
                - currency
                - hash
                - merchant_id
                - request_id
                - request_time
                - token_flag
              x-apidog-orders:
                - request_id
                - request_time
                - merchant_id
                - ctid
                - return_deeplink
                - token_flag
                - currency
                - callback_url
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
                        title: ''
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
                  data:
                    type: object
                    properties:
                      deeplink:
                        type: string
                        description: >-
                          If your integration is on a mobile app, either Android
                          or iOS, you can open this deep link to redirect the
                          user to ABA Mobile and complete the account linking
                          process.
                      qr_string:
                        type: string
                        description: >-
                          If your integration is on a web browser, you can
                          render this QR code so that users can scan and
                          complete the linking process.
                      expire_in:
                        type: integer
                        description: >-
                          The `deeplink` and `qr_string` will expire 10 minutes
                          after your request.
                        format: int32
                    x-apidog-orders:
                      - deeplink
                      - qr_string
                      - expire_in
                    required:
                      - deeplink
                      - qr_string
                      - expire_in
                x-apidog-orders:
                  - status
                  - data
                required:
                  - status
                  - data
              examples:
                '1':
                  summary: Example 1
                  value:
                    status:
                      code: '00'
                      message: Success
                      trace_id: bce9c83c-922e-4672-87f5-7f92cd15047c
                    data:
                      deeplink: >-
                        abamobilebank://ababank.com?type=account_on_file&qrcode=ABA...gFses
                      qr_string: ABAAOF+hEGxkym...6SbF19enqLB2xU46jTzVY
                      expire_in: 1627113926
                '2':
                  summary: Example 1
                  value:
                    status:
                      code: '04'
                      message: The given data was invalid.
                      trace_id: 30a1b46c37.....6aad589ffaff8
                      errors:
                        amount:
                          - Amount is required
                          - Message 2
                        currency:
                          - Currency is required
                          - Message 2
                '3':
                  summary: Example 1
                  value:
                    status:
                      code: '01'
                      message: Wrong hash
                      trace_id: 1234567890-3445343222
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
                        description: '`04` - The given data was invalid'
                      message:
                        type: string
                        description: >-
                          Please see the property reponse `errors` for the
                          details.
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
                      trace_id:
                        type: string
                        title: ''
                        description: >-
                          A log ID is generated by the PayWay system for
                          debugging purposes.
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
                          - `01` - Wrong Hash.
                          - `98` - Merchant id not found
                          - `104` - Merchant not enabled token flag
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
      x-run-in-apidog: https://app.apidog.com/web/project/831852/apis/api-19336820-run
components:
  schemas: {}
  securitySchemes: {}
servers:
  - url: https://checkout-sandbox.payway.com.kh/
    description: StillZeroBug
security: []

```
