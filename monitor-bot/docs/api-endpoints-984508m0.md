# API Endpoints

## Overview

PayWay has separate domains for **Production** and **Sandbox** environments. You need to use the correct URL depending on whether you're working in a test (sandbox) or live (production) environment.

The `base URLs` for each environment are as follows:

### Sandbox Environment (Testing) URL

```js
https://checkout-sandbox.payway.com.kh/
```

### Production Environment URL
```js
https://checkout.payway.com.kh/
```

## Important Notes

**Whitelisted Domains/IPs:** 
    - You can only access the API from a domain or IP address that has been whitelisted by PayWay. Contact the PayWay Integration team to whitelist your domain or IP before you start using the API.

**Error Handling:**
   - If you try to call the API from a non-whitelisted domain, you'll get this error:`6: wrong domain`.

    - If you try to call the API from the browser address bar or use the GET method, you'll get this error: `405 Method Not Allowed`.

**Parameter Requirements:**

    - The developer must pass all necessary parameters related to the transaction.

    - Include a **hash** of the parameters to successfully post the transaction to PayWay.

    - The hash **must** include all the parameters being posted to PayWay. Developers may skip optional parameters that are not relevant to their use case.


