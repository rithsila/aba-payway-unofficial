# FILE: -2113617m0.md

#  

<Frame>
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/376566/image-preview)
</Frame>


## 1. Introduction

The ABA PayWay Odoo eCommerce Plugin lets you easily integrate ABA PayWay into your Odoo Website store. This provide a secure online checkout experience while offering multiple popular payment methods, including:

- Local: **ABA KHQR**
- International: **Card (Visa, Mastercard, UnionPay), WeChat Pay, Alipay**

## 2. How it Works

<Frame>
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/376351/image-preview)
</Frame>

**Full Purchase** — Payment is charged immediately when the customer completes the payment. Supports all payment methods — ABA KHQR, Card, WeChat Pay, and Alipay.

1. Shopper adds items to cart and proceeds to checkout.
2. Shopper selects an ABA PayWay payment method — **ABA KHQR**, **Card**, **WeChat Pay**, or **Alipay**.
3. A **PayWay-hosted payment popup** opens with the correct order amount.
4. Shopper completes payment inside the secure PayWay popup.
5. Upon successful payment, the shopper is redirected to a **thank you page** and the order is **automatically marked as Paid**.

**Authorize then Capture (Card and ABA KHQR only)**
Payment is authorized and a hold is placed on the payer's account — no charge until the Merchant successfully fufiles the order.

1. Shopper adds items to cart and proceeds to checkout.
2. Shopper selects **Card** or **ABA KHQR** as the payment method.
3. A **PayWay-hosted payment popup** opens — shopper authorizes the payment.
4. The amount is **reserved** on the shopper's account — not yet charged.
5. Merchant reviews and **captures** the payment manually from the Odoo backend — full or partial amount.

## 3. Integration Steps

### 3.1 Setup

Follow the steps below to integrate ABA PayWay into your Odoo Website store.

:::info[]
**Prerequisites**

Before integrating ABA PayWay into your Odoo eCommerce store, ensure you have the following:

- A **PayWay Sandbox Account**: **[Register here](https://sandbox.payway.com.kh/register-sandbox/)** to receive your testing Merchant ID and API Key via email.
- An **Odoo 18 instance** with the **Website module active**, hosted on-premise or Odoo.sh. Odoo.com cloud is not supported.
- **Odoo Admin access** — required to install apps and configure payment settings on your Odoo instance.
:::

**Step 1: Download and Install the Plugin**

<Steps>
  <Step title="Download the Plugin">

Go to [apps.odoo.com](https://apps.odoo.com) and search for **ABA PayWay for Odoo eCommerce**. Download the module — you will receive one file: `payment_aba_payway.zip`.



:::highlight yellow 
This plugin is built for **Odoo 18** and is not compatible with earlier versions.
:::
  </Step>
  <Step title="Install the Plugin on Your Server">

      
<AccordionGroup>
  <Accordion title="Using Odoo On-Premise" defaultOpen>
    Unzip the file and copy the extracted folder into your Odoo `addons` directory on the server.

            **Configurations:** 
In `/etc/odoo.conf`, set `addons_path` to include the folder containing the ABA PayWay modules:

```
addons_path = /mnt/extra-addons
```
      
If using Docker Compose, mount your addons folder into the container — map your local `./addons` to `/mnt/extra-addons` in the volume config. Then restart the service:

```bash
sudo docker compose up
```

 
  </Accordion>
  <Accordion title="Using Odoo.sh">
    Module deployment is handled via your GitHub repository — skip the server configuration below and continue the step below.
  </Accordion>
  
</AccordionGroup>


In Odoo:

- Go to **Settings › General Settings** and activate **Developer Mode**
- Go to **Apps › Update Apps List** to sync new modules
- Search for **ABA PayWay for Odoo eCommerce** and click **Install**

<Frame>
![ecommerce.png](https://api.apidog.com/api/v1/projects/831852/resources/379428/image-preview)
</Frame>


:::tip[]
After install, **ABA PayWay** appears as a separate entry under **Website › Configuration › Payment Providers**.
:::

  </Step>
</Steps>

**Step 2: Configure the ABA PayWay Plugin**

<Steps>
  <Step title="Enter Credentials">

Go to **Website › Configuration › Payment Providers** and click on **ABA PayWay**.

<Frame>  
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/376352/image-preview)
</Frame>

Enable **Test Mode**, select the **Sandbox** environment, and enter your credentials. Your Merchant ID and API Keys are in the email you received after sandbox registration.

<Frame>
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/376323/image-preview)
</Frame>

<Frame>
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/376325/image-preview)
</Frame>


**Configuration Fields**

---

**Environment** `mandatory`
Toggle between `Sandbox` (for testing) and `Production` (for live payments). Always start in Sandbox mode to ensure payment is tested properly.

---
**Merchant ID (Sandbox/Production)** `mandatory`
Enter your unique ABA PayWay Merchant ID. You can find it in the email registered for your PayWay Sandbox account. When you're ready to go live, replace it with your production Merchant ID.

---

**API Key (Sandbox/Production)** `mandatory`
Enter your ABA PayWay Sandbox API Key for testing. You can find it in the email registered for your PayWay Sandbox account.

---

**RSA Private Key (Sandbox/Production)** `mandatory`
Used for request signing and response verification.

---

Click **Save** to store your credentials.

  </Step>
  <Step title="Set Capture Mode (optional)">

The capture mode controls whether payment is charged immediately or held and captured later. This applies to all transactions on this provider.

Go to **Website › Configuration › Payment Providers › ABA PayWay** and locate the **Capture Mode** field.

| Mode | Description |
|---|---|
| Full Purchase *(default)* | Payment is captured immediately when the shopper completes the payment popup |
| Authorize then Capture | Payment is authorized and reserved — merchant captures manually from the backend. Supports **Card and ABA KHQR only** |

<Frame> 
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/376340/image-preview)
</Frame>

Click **Save**.

  </Step>
  <Step title="Enable Payment Methods">

Go to **Website › Configuration › Payment Providers › ABA PayWay** and locate the **Payment Methods** section. Enable the methods relevant to your store.

| Method | Type |
|---|---|
| ABA KHQR | Local — ABA Mobile and any KHQR-compatible app |
| Card (Visa, Mastercard, UnionPay) | International debit/credit card |
| WeChat Pay | International — WeChat users |
| Alipay | International — Alipay users |

:::tip[]
For production: only enable payment methods confirmed with the ABA PayWay sales team during onboarding.
:::



<Frame>
 
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/376327/image-preview)
</Frame>
Only the methods enabled here will appear at checkout.
  </Step>
</Steps>

### 3.2 Testing

**Step 1: Test & Verify the Setup**

To confirm a successful setup, preview your Odoo Website store and test the payment flow to ensure everything works as expected.

**Verification Checklist:**

Go to your store, add a product to the cart, and proceed to checkout.

Verify that the configured ABA PayWay payment methods appear on the payment step:

- ABA KHQR
- Card (Visa, Mastercard, UnionPay)
- WeChat Pay
- Alipay


:::info[]
**All payment methods are available for testing in sandbox mode.** 

For live payments, only the options you've agreed upon with the ABA PayWay sales team will be available.
:::
<Frame>
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/376329/image-preview)
</Frame>

**Step 2: Test Transactions in Sandbox Mode**

<Tabs>
  <Tab title="Full Purchase">

Select a payment method at checkout. A loading state appears briefly, then the **PayWay payment popup** opens with the correct order amount.

**Step 2: Test Transactions in Sandbox Mode**

<AccordionGroup>
  <Accordion title="Credit/Debit Card">
    <Frame>
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/379435/image-preview)
</Frame>

Use the test cards below to simulate the payment, then select "**Pay ...USD**".
    
<div class="table-code overflow-y-auto">
  <table class="text-base text-center whitespace-nowrap" style="border-collapse: collapse; width: 100%;">
    <tbody>
      <tr style="background-color: #f5f5f5;">
        <th style="padding: 8px;">Card Status</th>
        <th style="padding: 8px;">Card Type</th>
        <th style="padding: 8px;">Card Number</th>
        <th style="padding: 8px;">Exp</th>
        <th style="padding: 8px;">CVV</th>
        <th style="padding: 8px;">3DS Enrolled</th>
      </tr>
      <tr>
        <td rowspan="2" style="padding: 8px;"> **Success** </td>
        <td style="padding: 8px;">Master Card</td>
        <td style="padding: 8px;">5156 8399 3770 6777</td>
        <td style="padding: 8px;">01/30</td>
        <td style="padding: 8px;">993</td>
        <td style="padding: 8px;">No</td>
      </tr>
      <tr>
        <td style="padding: 8px;">Visa Card</td>
        <td style="padding: 8px;">4286 0900 0000 0206</td>
        <td style="padding: 8px;">04/30</td>
        <td style="padding: 8px;">777</td>
        <td style="padding: 8px;">Yes</td>
      </tr>
      <tr>
        <td rowspan="2" style="padding: 8px;"> **Declined** </td>
         <td style="padding: 8px;">Master Card</td>
        <td style="padding: 8px;">5156 8302 7256 1029</td>
        <td style="padding: 8px;">04/30</td>
        <td style="padding: 8px;">777</td>
        <td style="padding: 8px;">Yes</td>
        
      </tr>
      <tr>
        <td style="padding: 8px;">Visa Card</td>
        <td style="padding: 8px;">4156 8399 3770 6777</td>
        <td style="padding: 8px;">01/30</td>
        <td style="padding: 8px;">993</td>
        <td style="padding: 8px;">No</td>
      </tr>
    </tbody>
  </table>
</div>



  </Accordion>
  <Accordion title="ABA KHQR">
    Select the ABA KHQR payment method to generate a test QR code.
    **For visual reference only
 <Frame>

![image.png](https://api.apidog.com/api/v1/projects/831852/resources/379433/image-preview)
</Frame>
 </Accordion>
  <Accordion title="WeChat Pay">
    Select the WeChat payment method to generate a test QR code.
    **For visual reference only
<Frame>

![image.png](https://api.apidog.com/api/v1/projects/831852/resources/379429/image-preview)
</Frame>
  </Accordion>
   <Accordion title="Alipay">
    Select the Alipay payment method to generate a test QR code.
    **For visual reference only
    <Frame>


![image.png](https://api.apidog.com/api/v1/projects/831852/resources/379432/image-preview)
</Frame>
  </Accordion>
</AccordionGroup>
Complete the payment inside the popup. After successful payment:

- Shopper is redirected to the **thank you page** with order number and status
- Order is marked as **Paid** in Odoo

<Frame>  
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/376336/image-preview)
</Frame>

  </Tab>
  <Tab title="Authorize then Capture">

Ensure **Capture Mode** is set to `Authorize then Capture` before testing.

Select **ABA KHQR** or **Card** at checkout and complete the payment as usual.
    
<Frame>
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/379449/image-preview)
</Frame>


- On the success screen, your customer will sees: **"Your payment has been authorised"** with the order number
- The amount is **blocked** on the shopper's card or ABA account — they will not be charged yet until the transaction has been captured.
 
    
<Frame>
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/376339/image-preview)
</Frame>

**To capture the payment:**

Go to **Website › Orders**, locate the transaction number with status **authorized**.
<Frame>
![Screenshot 2026-07-14 at 5.48.20 in the afternoon.png](https://api.apidog.com/api/v1/projects/831852/resources/379450/image-preview)
</Frame>

Click **Capture Transaction**. Enter the amount to capture — full or partial.

<Frame>
  
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/376341/image-preview)
</Frame>

- **Full capture** — full amount is charged to the shopper
- **Partial capture** — partial amount charged, remaining reserved amount is released back to the shopper

<Frame>
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/376342/image-preview)
</Frame>

After capture, the transaction status updates from **Authorised** to **Confirmed**.

<Frame>
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/376343/image-preview)
</Frame>

  </Tab>
</Tabs>

**Step 3: Confirm Order Status**

After payment, confirm the response status updates correctly.

**✅ Success Status** — order is automatically marked as **Paid** and the shopper is redirected to the thank you page.

<Frame>
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/379445/image-preview)
</Frame>

**❌ Cancelled / Payment failed** — Order stays pending — no charge made.

<Frame>
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/379446/image-preview)
</Frame>

**Step 4: Verify Transactions**

**On ABA PayWay Sandbox Portal**

You can track transaction details inside the **PayWay Sandbox Portal › Transactions** — **[Sign in here](https://sandbox.payway.com.kh/login)**.

<Frame>
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/376344/image-preview)
</Frame>

**On Odoo**

Go to **Website › Configuration › Payment Transactions** to see full transaction details, including status, amount, payment method, and capture mode.

<Frame>
![Screenshot 2026-07-14 at 5.25.37 in the afternoon.png](https://api.apidog.com/api/v1/projects/831852/resources/379448/image-preview)
</Frame>

**Step 5: Test a Refund**

ABA PayWay supports both **full and partial refunds** for eCommerce orders. Refunds are initiated from the Odoo backend — the plugin calls the ABA PayWay refund API automatically and the refund is reflected in both Odoo and the ABA PayWay Merchant Portal.

Go to **Website › Orders**, select the paid order and click **Refund**.

<Frame>
  
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/376345/image-preview)
</Frame>
<Frame >

![image.png](https://api.apidog.com/api/v1/projects/831852/resources/376346/image-preview)
</Frame>
<Frame>
  
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/376347/image-preview)
</Frame>
- For a **full refund** — keep the full amount
- For a **partial refund** — enter the amount you'd like to refund your customer

<Frame>
  

![image.png](https://api.apidog.com/api/v1/projects/831852/resources/376348/image-preview)
</Frame>

Click **Refund** to process. The refund is applied immediately.

:::tip[]
The refund is automatically reflected in:
- **Odoo** — order status updates and refund record created
- **ABA PayWay Merchant Portal** — transaction appears under your refund history. 
    Note: Transaction refunded using the Merchant Portal does not reflect the transaction status on Odoo. 
:::

## 4. Going Live

**Great job!** You've completed the sandbox testing, and your store is ready to go live.

**Let's make it official!** Follow these steps to start accepting real payments:

<Steps>
  <Step title="Reach out to ABA PayWay to activate your account">

To start accepting real payments, you'll need a production ABA Merchant Account.

If you don't have one yet, please contact our E-Merchant Acquisition team at **[paywaysales@ababank.com](mailto:paywaysales@ababank.com)** to get started today!

  </Step>
  <Step title="Switch to Production Mode">

After finalizing your agreement with our team, you'll receive your production credentials.

Go to **Website › Configuration › Payment Providers › ABA PayWay**.

- Replace your **Sandbox API Key** and **Merchant ID** with your **production credentials**
- Add your **RSA Private Key** issued by the ABA PayWay sales team
- Switch the **Environment** toggle to `Production`

<Frame>

![image.png](https://api.apidog.com/api/v1/projects/831852/resources/376349/image-preview)
</Frame>

Click **Save** to apply your production credentials.

  </Step>
  <Step title="Do a Quick Test">

Make a small live payment on your store to ensure the transaction settles to your ABA merchant account.

  </Step>
  <Step title="Success!">

You did it! Your Odoo Website store is officially live and ready to accept real payments with ABA PayWay.

  </Step>
</Steps>

💡 **Note**

For troubleshooting or if you have any questions, please contact [digitalsupport@ababank.com](mailto:digitalsupport@ababank.com).


# FILE: -871485m0.md

#  

<Frame>
<img style = "pointer-events:none;" src="https://api.apidog.com/api/v1/projects/831852/resources/351997/image-preview"></img>
</Frame>


## 1. Introduction
The ABA PayWay PrestaShop Plugin lets you easily integrate ABA PayWay into your PrestaShop store.

Provide a smooth checkout experience while offering multiple popular payment methods, including:

- Local: **ABA PAY, KHQR**
- International: **Visa, Mastercard, UnionPay, JCB, Alipay, WeChat Pay**

## 2. How it works

<Frame caption="ABA PayWay Credit/Debit Card checkout experience on Woocommerce

">
![Group 1171277558.png](https://api.apidog.com/api/v1/projects/831852/resources/352052/image-preview)
</Frame>




1. The customer adds products to their cart and **proceeds to checkout**.
2. The customer selects **ABA KHQR** as their payment method.
3. The customer **scans the QR code with their ABA Mobile app** or any KHQR-supported app to complete payment. 
4. Upon successful payment, a **success page** will be shown on the screen.



## 3. Integration Steps
### 3.1 Integration Steps

Follow the steps below to integrate the ABA PayWay Payment Gateway with your Prestashop store.

:::info[]
**Prerequisites** 

Before integrating PayWay into your PrestaShop store, ensure you have the following:

- A **PayWay Sandbox Account**: **[Register here](https://sandbox.payway.com.kh/login/)** to receive your testing Merchant ID and API Key via email.
:::

**Step 1: Download and Install the Plugin**

- Download the PayWay Prestashop Plugin Package **[here](https://www.payway.com.kh/prestashop-v1.7.zip)**.


:::highlight orange 💡
This plugin has been deprecated.  However, you are welcome to modify the source code to fit your specific configuration.
:::

- Log in to your PrestaShop Admin Panel > Modules.
- Click on Upload a Module
<Frame>
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/352110/image-preview)
</Frame>

- **Upload** the **ABA PayWay Prestashop plugin** file to install the module.

<Frame>
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/352111/image-preview)
</Frame>

- Once the installation is complete, click on **Configure**.
<Frame>

![image.png](https://api.apidog.com/api/v1/projects/831852/resources/352112/image-preview)
</Frame>

**Step 2: Configure the ABA PayWay Plugin**

In the configuration settings:
- Set **Sandbox Mode** to **Yes** for testing.
- In the **Merchant ID and API Key section**, input your sandbox credentials, which you can find in the email registered for your PayWay Sandbox account.

<Frame>
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/352129/image-preview)
</Frame>



**Configuration Option**

<Frame>
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/352128/image-preview)
</Frame>

---

**Sandbox Mode** `mandatory`
Enable this option to connect your integration to the PayWay sandbox account for testing. If unchecked, it will connect to the PayWay production environment.

---

**Merchant ID** `mandatory`
Enter your unique PayWay merchant ID in this field. You can find it in the email registered for your PayWay Sandbox account. When you're ready to go live, replace it with your production merchant ID.

---

**API Key** `mandatory`
Enter your unique PayWay API Key in this field. You can find it in the email registered for your PayWay Sandbox account. When you're ready to go live, replace it with your production API Key.

---

**Payment Methods** `mandatory`
Choose the payment methods you want to offer customers at checkout. Test any of these methods in the sandbox environment. To go live, you may enable only those agreed upon with the PayWay sales team.

To select multiple options, hold **Command (⌘)** on Mac or **Ctrl** on Windows, then click the payment methods you want to accept (e.g., Credit/Debit Cards, ABA KHQR).

---

**Hide/Show Close Button** `mandatory`
In the modal popup checkout, you can decide to show or hide the close button. Displaying it lets customers cancel their payment during the payment step.

---

**Success URL for Web Continuation**
This is the URL where you want to redirect customers after payment completion.

---

**Success URL for Mobile Continuation**
This is the URL where you want to redirect customers after payment completion.

---

**Logo Size**
Adjust the size of your logo displayed during the checkout process to ensure it fits well without compromising visibility.

---

**Background Color**
Set the background color of the checkout interface to align with your website's theme and branding.

---

**Include jQuery**
To enhance functionality on your site, you may include jQuery here. Ensure compatibility with existing scripts.

---

- Click **Save** to apply your settings.
<Frame>
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/352116/image-preview)
</Frame>


### 3.2 Testing
**Step 1: Test & Verify the Setup**

To confirm successful setup, preview your Prestashop store and test the transaction flow to ensure everything works as expected.

**Success Connection Checklist:**
- Go to your PrestaShop store, **add a product to the cart**, then select **Checkout.**
<Frame>
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/351980/image-preview)
</Frame>
<Frame>
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/351981/image-preview)
</Frame>

- Fill in all required customer details.
<Frame>
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/351982/image-preview)
</Frame>

- Check if the selected payment method appears on the checkout page, showing options such as:
    - Credit/Debit Cards (VISA, Mastercard, UnionPay, JCB)
    - ABA KHQR
    - Alipay
    - Wechat

:::tip[]
**All payment methods are available for testing in sandbox mode.** For live payments, only the options you’ve agreed upon with our sales team will be available.
:::
<Frame>

![image.png](https://api.apidog.com/api/v1/projects/831852/resources/351971/image-preview)
</Frame>
**Step 2: Test Transactions in Sandbox Mode**

<AccordionGroup>
  <Accordion title="Credit/Debit Card" Icon icon="remix-bank-card-2-line">
- Select the **credit/debit card** option.
- Agree to the terms of service, and click "**Place Order**"         
<Frame>         
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/351984/image-preview)
</Frame>
<Frame>      
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/351985/image-preview)
</Frame>  
<div class="table-code overflow-y-auto">
  <table class="text-base text-center whitespace-nowrap" style="border-collapse: collapse; width: 100%;">
    <tbody>
      <tr style="background-color: #f5f5f5;">
        <th style="padding: 8px;">Card Status</th>
        <th style="padding: 8px;">Card Type</th>
        <th style="padding: 8px;">Card Number</th>
        <th style="padding: 8px;">Exp</th>
        <th style="padding: 8px;">CVV</th>
        <th style="padding: 8px;">3DS Enrolled</th>
      </tr>
      <tr>
        <td rowspan="2" style="padding: 8px;"> **Success** </td>
        <td style="padding: 8px;">Master Card</td>
        <td style="padding: 8px;">5156 8399 3770 6777</td>
        <td style="padding: 8px;">01/30</td>
        <td style="padding: 8px;">993</td>
        <td style="padding: 8px;">No</td>
      </tr>
      <tr>
        <td style="padding: 8px;">Visa Card</td>
        <td style="padding: 8px;">4286 0900 0000 0206</td>
        <td style="padding: 8px;">04/30</td>
        <td style="padding: 8px;">777</td>
        <td style="padding: 8px;">Yes</td>
      </tr>
      <tr>
        <td rowspan="2" style="padding: 8px;"> **Declined** </td>
        <td style="padding: 8px;">Visa Card</td>
        <td style="padding: 8px;">4156 8399 3770 6777</td>
        <td style="padding: 8px;">01/30</td>
        <td style="padding: 8px;">993</td>
        <td style="padding: 8px;">No</td>
      </tr>
      <tr>
        <td style="padding: 8px;">Master Card</td>
        <td style="padding: 8px;">5156 8302 7256 1029</td>
        <td style="padding: 8px;">04/30</td>
        <td style="padding: 8px;">777</td>
        <td style="padding: 8px;">Yes</td>
      </tr>
    </tbody>
  </table>
</div>


  </Accordion>
  <Accordion title="🔴 ABA KHQR">
    Select the ABA KHQR payment method to generate a test QR code.
    **For visual reference only
 <Frame> 
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/351987/image-preview)
</Frame>
 </Accordion>
  <Accordion title="WeChat Pay"Icon icon="remix-wechat-pay-line">
    Select the WeChat payment method to generate a test QR code.
    **For visual reference only
<Frame>
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/351988/image-preview)
</Frame>
  </Accordion>
   <Accordion title="Alipay" Icon icon="remix-alipay-line">
    Select the Alipay payment method to generate a test QR code.
    **For visual reference only
    <Frame>
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/351989/image-preview)
</Frame>
  </Accordion>
</AccordionGroup>



**Step 3: Confirm the following response status**
Make sure the response status updates accordingly.

- **✅ Success Status**
<Frame>
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/351990/image-preview)
</Frame>

- **❌ Declined Status**
<Frame>
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/351991/image-preview)
</Frame>


**Step 4: Verifying Transactions**

**On PayWay Sandbox Portal <Icon icon="ph-fill-codesandbox-logo"/>**
- You can track the transaction details inside the **PayWay Sandbox Portal > Transactions Page** – **[Sign In here](https://sandbox.payway.com.kh/login)**.

<Frame>
  ![image.png](https://api.apidog.com/api/v1/projects/831852/resources/351955/image-preview)
  </Frame>
  <Frame>
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/351956/image-preview)
</Frame>

**On PrestaShop**
- Go to **Prestashop > Orders** to see order and payment transactions details.

 <Frame>
 
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/351992/image-preview)
</Frame>
## 4. Going Live

**Great job!** You’ve completed the sandbox testing, and your website is ready to go live.

**Let's make it official!** Follow these simple steps to go live and start accepting real payments effortlessly:

**Step 1: Reach out to ABA Bank to activate your account for real payments**

To start accepting real payments, you’ll need an ABA Merchant Account set up for live transactions.

:::tip[]
If you don't have an ABA Merchant Account yet, please contact our E-Merchant Acquisition team at **paywaysales@ababank.com** to get started today!
:::

**Step 2: Switch to Live Mode**
After finalizing your agreement with our team, you’ll receive your credentials for the live payment environment.
- **Replace** your Sandbox (testing) Merchant ID and API Key with the **Live Merchant ID and API Key** provided.
<Frame >
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/351993/image-preview)
</Frame>
- Set the Sandbox Mode to **“No”**, and click **Save Changes**.
<Frame >
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/351994/image-preview)
</Frame>

- Click **Save** to activate your live payments environment.

<Frame >
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/351995/image-preview)
</Frame>

**Step 3: Do a Quick Test**
Make a small live payment on your store to ensure the transaction is settled to your account.

**Step 4: Success!**
You did it! Your website is officially live and ready to accept real payments with ABA PayWay.


:::highlight yellow 💡
**Note**
- Refunds issued on the **ABA Merchant Portal (Production Env)** will not be reflected in the WooCommerce store transaction records.
- For troubleshooting or if you have any questions or concerns, please contact digitalsupport@ababank.com.
:::



# FILE: -873826m0.md

#  

<Frame>
<img style = "pointer-events:none;" src="https://api.apidog.com/api/v1/projects/831852/resources/351996/image-preview"></img>
</Frame>


## 1. Introduction
The ABA PayWay WooCommerce Plugin lets you easily integrate ABA PayWay into your WordPress store.



Provide a smooth checkout experience while offering multiple popular payment methods, including:

- Local: **ABA PAY, KHQR**
- International: **Visa, Mastercard, UnionPay, JCB, Alipay, WeChat Pay**

## 2. How it works


<Frame caption="ABA PayWay Credit/Debit Card checkout experience on Woocommerce">
  ![card2.png](https://api.apidog.com/api/v1/projects/831852/resources/352053/image-preview)
</Frame>
1. Customers browse your WooCommerce store and add products to their cart.
2. At **checkout**, they select a payment method.
3. A secure payment popup appears for them to complete the payment.
4. After payment, they are redirected to the confirmation page, and the order status updates automatically.

## 3. Integration Steps
### 3.1 Integration Steps

Follow the steps below to integrate the ABA PayWay Payment Gateway into your WordPress store.

:::info[]
**Prerequisites** 

Before integrating PayWay with your WooCommerce store, ensure you have:

- A **PayWay Sandbox Account**: **[Register here](https://sandbox.payway.com.kh/login/)** to receive your testing Merchant ID and API Key via email.
- A **WordPress site and WooCommerce store**, both within the *latest 3 versions*, set up with products/services ready to sell.
:::

**Step 1: Find and Install the Plugin**

- Log in to your **WordPress admin panel**.
- Navigate to the **Plugins** section and click **Add New Plugin**.

<Frame>
  ![1 (1).webp](https://api.apidog.com/api/v1/projects/831852/resources/351899/image-preview)
</Frame>

- Search for "**ABA PayWay**".
<Frame>
 ![2.webp](https://api.apidog.com/api/v1/projects/831852/resources/351900/image-preview)
</Frame>

- Click **Install Now** on the plugin.
<Frame>
![3.webp](https://api.apidog.com/api/v1/projects/831852/resources/351901/image-preview)
</Frame>

- Then, click **Activate**.
<Frame>
![4.webp](https://api.apidog.com/api/v1/projects/831852/resources/351902/image-preview)
</Frame>

**Step 2: Configure the ABA PayWay Plugin**

- Upon activation, you will be redirected to the Installed Plugin Page.
- Click on **Settings**, which will redirect you to **Woocommerce Payment Settings**.
<Frame>
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/351965/image-preview)
</Frame>

- Then click **Manage** to access the gateway configuration page.
<Frame>
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/351966/image-preview)
</Frame>

- In the configuration settings, locate the **Merchant ID & API Key** field and fill in your sandbox credentials:
***These credentials should be in the **email** you’ve registered for a PayWay Sandbox account.*


- Ensure you've checked the **Sandbox Mode** to enable testing.

<Frame>
![WooCommerce-settings-‹-pw-wordpres-php8-0-—-WordPress-03-14-2025_10_46_AM.png](https://api.apidog.com/api/v1/projects/831852/resources/352081/image-preview)
</Frame>

---

**Merchant ID** `mandatory`
Enter your unique PayWay merchant ID in this field. You can find it in the email registered for your PayWay Sandbox account. When you're ready to go live, replace it with your production merchant ID.

---

**API Key** `mandatory`
Enter your unique PayWay API Key in this field. You can find it in the email registered for your PayWay Sandbox account. When you're ready to go live, replace it with your production API Key.

---

**Sandbox Mode**
Enable this option to connect your integration to the PayWay sandbox account for testing. If unchecked, it will connect to the PayWay production environment.

---

**Payment Methods** `mandatory`
Choose the payment methods you want to offer customers at checkout. Test any of these methods in the sandbox environment. To go live, you may enable only those agreed upon with the Payway sales team.

To select multiple options, hold **Command (⌘)** on Mac or **Ctrl** on Windows, then click the payment methods you want to accept (e.g., Credit/Debit Cards, ABA KHQR).

---

**Payment Method Icon Color**
Some websites might have background colors that make the payment method icon hard to see. To fix this, our plugin provides two icon options: **Color Background** and **White Background**.

---

**Hide/Unhide Close Button**
In the modal popup checkout, you can decide to show or hide the close button. Displaying it lets customers cancel their payment during the payment step.

---
**Success URL for Web Continuation**
This is the URL where you want to redirect customers after payment completion.

---
**Success URL for Mobile Continuation**
This is the URL where you want to redirect customers after payment completion.


---

**Pushback URL**
PayWay will send the URL after payment completion. If the default pushback URL doesn't work, use this URL instead: https://pw-wordpress.ababank.com/?aba_payway_pushback=1.

---

**Mini App Integration JS**
To use your website as a mini app on ABA Mobile, you need to add a JavaScript script here. This script will be provided after you complete the onboarding process for the mini app.

---

**Custom CSS**
Your website may use themes or plugins with conflicting CSS. Add your custom CSS here to override these styles and ensure proper display.

---


### 3.2 Testing
**Step 1: Test & Verify the Setup**

To confirm a successful setup, preview your website and test the transaction flow to ensure everything works as expected.

**Success Connection Checklist:**
- Go to your **web store**, add a product to the cart, and **proceed to checkout**.
<Frame>
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/351970/image-preview)
</Frame>

- Fill in all required customer details.
- Check if the selected payment method appears on the checkout page, showing options such as:
    - Credit/Debit Cards (VISA, Mastercard, UnionPay, JCB)
    - ABA KHQR
    - Alipay
    - WeChat Pay


:::tip[]
**All payment methods are available for testing in sandbox mode.** For live payments, only the options you’ve agreed upon with our sales team will be available.
:::

<Frame>
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/351971/image-preview)
</Frame>
**Step 2: Test Transactions in Sandbox Mode**

<AccordionGroup>
  <Accordion title="Credit/Debit Card">
    <Frame>
![12.webp](https://api.apidog.com/api/v1/projects/831852/resources/351949/image-preview)
</Frame>

Use the test cards below to simulate the payment, then select "**Pay ...USD**".
    
<div class="table-code overflow-y-auto">
  <table class="text-base text-center whitespace-nowrap" style="border-collapse: collapse; width: 100%;">
    <tbody>
      <tr style="background-color: #f5f5f5;">
        <th style="padding: 8px;">Card Status</th>
        <th style="padding: 8px;">Card Type</th>
        <th style="padding: 8px;">Card Number</th>
        <th style="padding: 8px;">Exp</th>
        <th style="padding: 8px;">CVV</th>
        <th style="padding: 8px;">3DS Enrolled</th>
      </tr>
      <tr>
        <td rowspan="2" style="padding: 8px;"> **Success** </td>
        <td style="padding: 8px;">Master Card</td>
        <td style="padding: 8px;">5156 8399 3770 6777</td>
        <td style="padding: 8px;">01/30</td>
        <td style="padding: 8px;">993</td>
        <td style="padding: 8px;">No</td>
      </tr>
      <tr>
        <td style="padding: 8px;">Visa Card</td>
        <td style="padding: 8px;">4286 0900 0000 0206</td>
        <td style="padding: 8px;">04/30</td>
        <td style="padding: 8px;">777</td>
        <td style="padding: 8px;">Yes</td>
      </tr>
      <tr>
        <td rowspan="2" style="padding: 8px;"> **Declined** </td>
         <td style="padding: 8px;">Master Card</td>
        <td style="padding: 8px;">5156 8302 7256 1029</td>
        <td style="padding: 8px;">04/30</td>
        <td style="padding: 8px;">777</td>
        <td style="padding: 8px;">Yes</td>
        
      </tr>
      <tr>
        <td style="padding: 8px;">Visa Card</td>
        <td style="padding: 8px;">4156 8399 3770 6777</td>
        <td style="padding: 8px;">01/30</td>
        <td style="padding: 8px;">993</td>
        <td style="padding: 8px;">No</td>
      </tr>
    </tbody>
  </table>
</div>



  </Accordion>
  <Accordion title="ABA KHQR">
    Select the ABA KHQR payment method to generate a test QR code.
    **For visual reference only
 <Frame>
![13.webp](https://api.apidog.com/api/v1/projects/831852/resources/351950/image-preview)
</Frame>
 </Accordion>
  <Accordion title="WeChat Pay">
    Select the WeChat payment method to generate a test QR code.
    **For visual reference only
<Frame>
![14.webp](https://api.apidog.com/api/v1/projects/831852/resources/351951/image-preview)
</Frame>
  </Accordion>
   <Accordion title="Alipay">
    Select the Alipay payment method to generate a test QR code.
    **For visual reference only
    <Frame>
![15.webp](https://api.apidog.com/api/v1/projects/831852/resources/351952/image-preview)
</Frame>
  </Accordion>
</AccordionGroup>

**Step 3: Confirm the following response status**
Make sure the response status updates accordingly.

- **✅ Success Status**
<Frame>
![17.webp](https://api.apidog.com/api/v1/projects/831852/resources/351953/image-preview)
</Frame>

- **❌ Declined Status**
<Frame>
![18.webp](https://api.apidog.com/api/v1/projects/831852/resources/351954/image-preview)
</Frame>

**Step 4: Verifying Transactions**

**On PayWay Sandbox Portal <Icon icon="ph-fill-codesandbox-logo"/>**
- You can track the transaction details inside the **PayWay Sandbox Portal > Transactions Page** – **[Sign In here](https://sandbox.payway.com.kh/login)**.

<Frame>
  ![image.png](https://api.apidog.com/api/v1/projects/831852/resources/351955/image-preview)
  </Frame>
  <Frame>
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/351956/image-preview)
</Frame>

**On WordPress <Icon icon="remix-wordpress-fill"/>**
- Go to **Woocommerce > Orders** to see payment transactions details.

 <Frame>
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/351958/image-preview)
</Frame>
## 4. Going Live

**Great job!** You’ve completed the sandbox testing, and your website is ready to go live.

**Let's make it official!** Follow these simple steps to go live and start accepting real payments effortlessly:

**Step 1: Reach out to ABA Bank to activate your account for real payments**

To start accepting real payments, you’ll need an ABA Merchant Account set up for live transactions.

:::tip[]
If you don't have an ABA Merchant Account yet, please contact our E-Merchant Acquisition team at **paywaysales@ababank.com** to get started today!
:::

**Step 2: Switch to Live Mode**
After finalizing your agreement with our team, you’ll receive your credentials for the live payment environment.
- Replace your Sandbox (testing) Merchant ID and API Key with the Live Merchant ID and API Key provided.
- Uncheck the Sandbox Mode.

<Frame >
  ![image.png](https://api.apidog.com/api/v1/projects/831852/resources/351959/image-preview)
</Frame>

- Click **Save Changes** to activate your live payments environment.

<Frame >
![image.png](https://api.apidog.com/api/v1/projects/831852/resources/351960/image-preview)
</Frame>

**Step 3: Do a Quick Test**
Make a small live payment on your store to ensure the transaction is settled to your account.

**Step 4: Success!**
You did it! Your website is officially live and ready to accept real payments with ABA PayWay.


:::highlight yellow 💡
**Note**
- Refunds issued on the **ABA Merchant Portal (Production Env)** will not be reflected in the WooCommerce store transaction records.
- For troubleshooting or if you have any questions or concerns, please contact digitalsupport@ababank.com.
:::





# FILE: -902970m0.md

#  

<Frame>
<img style = "pointer-events:none;" src="https://api.apidog.com/api/v1/projects/831852/resources/362784/image-preview"></img>
</Frame>

## 1. Introduction
The ABA PayWay Shopify Payment App simplifies payment acceptance, offering a quick, secure checkout experience for both local Cambodian and international customers.

With ABA PayWay, you can offer multiple payment options, including:

- Local: **ABA PAY, KHQR**
- International: **Visa, Mastercard, UnionPay, JCB, WeChat Pay**

## 2. How it works


<Frame caption="ABA PayWay Credit/Debit Card checkout experience on Shopify">
  
![slide image.png](https://api.apidog.com/api/v1/projects/831852/resources/362785/image-preview)
</Frame>
1. The customer visits your Shopify store and adds products to their cart.
2. At checkout, they fill in shipping and billing details as per usual.
3. On the payment page, the customer chooses **ABA PayWay** as their payment method and selects **"Pay Now"**.
4. They are redirected to **ABA PayWay’s secure payment page** to complete the transaction.
5. After payment, the customer returns to your Shopify store’s order confirmation page.
6. The customer and store admin receive order confirmation notifications.

## 3. Integration Steps
### 3.1 Installation and Setup


:::caution[]
**Prerequisites** 

Before you start, make sure you have the following:

- You own **Shopify store**, already set up with products ready to be sold. (Register or log in  https://www.shopify.com/)

- An active **ABA Merchant Portal Account** (username and password)

**Note:** Shopify allows testing transactions directly in your live store environment via Test Mode — **no Sandbox account or API keys required**. Your username and password are all you need to complete the integration.

If you don't have an ABA Merchant Portal Account yet, please contact our Merchant Acquisition team at paywaysales@ababank.com to get started today!
:::

### How to Install and set up the ABA PayWay Plugin 

Follow the steps below to integrate the ABA PayWay Payment Gateway with your Shopify store.



**Step 1: Install the Payment App**

- Open the Shopify App Store and search for “ABA PayWay”. Alternatively, press this link to begin [ABA PayWay on Shopify App Store](https://apps.shopify.com/aba-payway).
- Click **Install**.


<Frame>

![ABA-PayWay-Official-ABA-PayWay-Plugin-Cambodia-Shopify-App-Store-09-29-2025_11_05_PM.png](https://api.apidog.com/api/v1/projects/831852/resources/362767/image-preview)
</Frame>

**Step 2: Connect your ABA Merchant Credentials with your Shopify Store**

- Input your **admin credentials**, including username and password, to authorise the connection.
- Then, click **Sign In**
<Frame>
![Screen 1- activation login.png](https://api.apidog.com/api/v1/projects/831852/resources/362768/image-preview)
</Frame>

**Step 3 (if applicable): Select a Business Profile**
- If you have one business profile, skip this step and continue to Step 4.
- If you have multiple business profiles or outlets, choose the outlet you want to connect with your Shopify store. And then click Next.


:::info[]
Note: Connecting your Shopify store to the correct outlet in your ABA Merchant Account ensures all transactions settle into the right bank account and are properly tracked for reporting and reconciliation.
:::

<Frame>

![Select businesses.png](https://api.apidog.com/api/v1/projects/831852/resources/362787/image-preview)
</Frame>

**Step 4: Agree to Terms and Conditions**
- **Review and agree** to the ABA PayWay Shopify integration terms and conditions.
- Press **Confirm** to successfully connect your Merchant account with your Shopify store.
<Frame>

![Agreed T&C with multiple agreements.png](https://api.apidog.com/api/v1/projects/831852/resources/362788/image-preview)
</Frame>
<Frame>

![Connected.png](https://api.apidog.com/api/v1/projects/831852/resources/362789/image-preview)
</Frame>

### 4. After Connecting with Shopify
**Step 1: Activate Payment Methods displays**

- After confirming the connection, you’ll be redirected back to the Shopify platform. 
- In the ABA PayWay plugin settings, toggle on the payment methods you're offering in your store (as agreed with the Merchant Acquisition team).
    - QR: ABA PAY, KHQR, WeChat Pay
    - Cards: Visa, Mastercard, UnionPay, JCB

:::info[]
These enabled payment methods will appear on the shopify checkout screen for your customers.
:::

<Frame>
![payway-paymentapp-·-Payments-·-ABA-PayWay-·-Shopify-09-29-2025_11_36_PM.png](https://api.apidog.com/api/v1/projects/831852/resources/362773/image-preview)
</Frame>

Then, click **Activate** to complete the setup.


**Step 2: Test & Verify the Setup**

Before going live, it's crucial to test the integration to ensure everything functions correctly.

- **Enable test mode** and click **Save**.
<Frame>
![payway-paymentapp-·-Payments-·-ABA-PayWay-·-Shopify-09-29-2025_11_39_PM.png](https://api.apidog.com/api/v1/projects/831852/resources/362774/image-preview)
</Frame>

- Perform a Test Transaction by previewing your Shopify store, add an item to the cart and proceed to Checkout.
<Frame>
![Your-Shopping-Cart-–-payway-paymentapp-09-29-2025_04_32_PM.png](https://api.apidog.com/api/v1/projects/831852/resources/362775/image-preview)
</Frame>
- Fill in test customer information as per usual and select **Continue to Payment**.
<Frame>
![Shipping-payway-paymentapp-Checkout-09-29-2025_05_41_PM.png](https://api.apidog.com/api/v1/projects/831852/resources/362776/image-preview)
</Frame>

- On the Payment page, select **Pay with ABA PayWay** as the payment method, then select **Pay Now**. 
- Verify that the enabled payment methods you've previously enabled in settings is accurately shown here. 
<Frame>
![Payment-payway-paymentapp-Checkout-09-29-2025_05_38_PM.png](https://api.apidog.com/api/v1/projects/831852/resources/362777/image-preview)
</Frame>
- You will be redirected to the ABA PayWay Checkout screen to complete the payment.


**Step 3: Confirm the following response status**

You may test this payment using the **Credit/Debit Card** option.
<Frame>
![image 2249.png](https://api.apidog.com/api/v1/projects/831852/resources/362778/image-preview)
</Frame>

- Select a test card provided to **simulate success or decline cases**.
- Select **Confirm** to submit the transactions.
<Frame>

![image 2250.png](https://api.apidog.com/api/v1/projects/831852/resources/362779/image-preview)
</Frame>

- Confirm that the order status updates appropriately.

**✅ Success Payment**
<Frame>
![Thank-you-for-your-purchase-payway-paymentapp-Checkout-09-29-2025_06_15_PM.png](https://api.apidog.com/api/v1/projects/831852/resources/362780/image-preview)
</Frame>

**❌ Declined Status**
<Frame>
![image 2251.png](https://api.apidog.com/api/v1/projects/831852/resources/362782/image-preview)
</Frame>


:::info[]
Note:
- The test transaction are **simulated**, and do not involve real money.
- The transaction record will appear as a **test order** your Shopify orders.
- The transaction record will not appear on the ABA Merchant Portal as it is not a real payment.
:::

## 5. Go Live

**Ready to go live?** Follow the steps below to start accepting real payments:

**Step 1: Turn off Test Mode**
- Once you're done testing, return to your **Shopify Settings > Payments > Payment Method**.
- Select **ABA PayWay**.
- Turn off the **Test Mode**, then click **Save**.

<Frame>
![payway-paymentapp-·-Payments-·-ABA-PayWay-·-Shopify-09-29-2025_11_58_PM.png](https://api.apidog.com/api/v1/projects/831852/resources/362783/image-preview)
</Frame>

**Step 2: Do a Quick Test**

- Make a small live payment on your Shopify store to check that everything works smoothly, and verify the funds are settled to your **ABA Bank account**.
- **Check your Shopify orders in the admin panel** to confirm the payment status is set to **"Paid"** correctly. 


:::info[]
**Settlement & Refunds**

- **ABA PAY & KHQR**: typically instant into your ABA account.
- **Cards & wallets**: timing may vary by processor and standard settlement schedule agreed with the ABA Merchant acquisition team.
- **To perform refunds for customers**, log in to the [ABA PayWay Merchant Portal](https://merchant.payway.com.kh/login/), find the transaction and process the refund directly. Remember, refunds won't sync automatically with Shopify, so you'll need to manually update the order status in your Shopify dashboard.
:::


**Success! Your Shopify store is now ready to accept real payments using ABA PayWay.**

## Need Support? 
Get help with your ABA PayWay Shopify integration:

:::highlight yellow
<Icon icon="material-filled-auto_awesome"/>  **Chat with Navi**
Visit www.payway.com.kh and click **"Ask Navi"** to chat with our virtual assistant for instant answers.

<Icon icon="material-filled-alternate_email"/> **Email Our Team**
Contact digitalsupport@ababank.com if you need any technical support and integration assistance.
:::



# FILE: aba-qr-api-3158158f0.md

# ABA QR API

## 1. Introduction
The **ABA QR API** is a payment solution that allows businesses to generate dynamic QR codes for customers to scan and pay using **ABA KHQR**, **WeChat Pay**, or **Alipay**.
It enables fast and cashless transactions across multiple digital wallets and banking apps.





<div style="display:flex;gap:16px;overflow-x:auto;padding-bottom:12px;">
<div style="flex:0 0 260px;width:260px;border:1px solid #e2e8f0;border-radius:12px;background:#fff;display:flex;flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="height:148px;position:relative;flex-shrink:0;overflow:hidden;">
    
  
![retail-store.svg](https://api.apidog.com/api/v1/projects/831852/resources/377007/image-preview)

      
    <span style="position:absolute;top:10px;left:10px;font-size:10px;font-weight:600;padding:3px 8px;border-radius:5px;letter-spacing:.04em;text-transform:uppercase;background:#bfdbfe;color:#0c447c;">In-store API</span>
  </div>
  <div style="padding:14px 16px;display:flex;flex-direction:column;gap:8px;flex:1;">
    <p style="margin:0;font-size:13px;font-weight:600;color:#0f172a;line-height:1.3;">Retail store solutions</p>
    <p style="margin:0;color:#475569;font-size:12px;line-height:1.5;flex:1;">Generate face-to-face payment codes at counters to link cashier systems with customer mobile wallets in real time.</p>
    <a href="/qr-api-14530840e0" style="display:inline-block;font-size:11px;font-weight:600;text-decoration:none;padding:4px 10px;border-radius:6px;border:1px solid #185fa5;color:#185fa5;width:fit-content;">View API docs &rarr;</a>
   
      
  </div>
</div>
<div style="flex:0 0 260px;width:260px;border:1px solid #e2e8f0;border-radius:12px;background:#fff;display:flex;flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="height:148px;position:relative;flex-shrink:0;overflow:hidden;">
   
![self-kiosk.svg](https://api.apidog.com/api/v1/projects/831852/resources/377008/image-preview)
    <span style="position:absolute;top:10px;left:10px;font-size:10px;font-weight:600;padding:3px 8px;border-radius:5px;letter-spacing:.04em;text-transform:uppercase;background:#ddd6fe;color:#3c3489;">Unattended UI</span>
  </div>
  <div style="padding:14px 16px;display:flex;flex-direction:column;gap:8px;flex:1;">
    <p style="margin:0;font-size:13px;font-weight:600;color:#0f172a;line-height:1.3;">Self kiosk service</p>
    <p style="margin:0;color:#475569;font-size:12px;line-height:1.5;flex:1;">Power autonomous ticketing and food ordering terminals with dynamic QR codes and real-time webhook callbacks.</p>
    <a href="/qr-api-14530840e0" style="display:inline-block;font-size:11px;font-weight:600;text-decoration:none;padding:4px 10px;border-radius:6px;border:1px solid #534ab7;color:#534ab7;width:fit-content;">View API docs &rarr;</a>
  </div>
</div>
<div style="flex:0 0 260px;width:260px;border:1px solid #e2e8f0;border-radius:12px;background:#fff;display:flex;flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="height:148px;position:relative;flex-shrink:0;overflow:hidden;">
    
![parking-system.svg](https://api.apidog.com/api/v1/projects/831852/resources/377009/image-preview)
    <span style="position:absolute;top:10px;left:10px;font-size:10px;font-weight:600;padding:3px 8px;border-radius:5px;letter-spacing:.04em;text-transform:uppercase;background:#e2e8f0;color:#334155;">IoT hardware</span>
  </div>
  <div style="padding:14px 16px;display:flex;flex-direction:column;gap:8px;flex:1;">
    <p style="margin:0;font-size:13px;font-weight:600;color:#0f172a;line-height:1.3;">Parking systems</p>
    <p style="margin:0;color:#475569;font-size:12px;line-height:1.5;flex:1;">Integrate boom barriers with timestamp-based fee calculations and hardware relay triggers on payment success.</p>
    <a href="/qr-api-14530840e0" style="display:inline-block;font-size:11px;font-weight:600;text-decoration:none;padding:4px 10px;border-radius:6px;border:1px solid #475569;color:#475569;width:fit-content;">View API docs &rarr;</a>
  </div>
</div>
<div style="flex:0 0 260px;width:260px;border:1px solid #e2e8f0;border-radius:12px;background:#fff;display:flex;flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="height:148px;position:relative;flex-shrink:0;overflow:hidden;">
   
![massage-chair.svg](https://api.apidog.com/api/v1/projects/831852/resources/377010/image-preview)
    <span style="position:absolute;top:10px;left:10px;font-size:10px;font-weight:600;padding:3px 8px;border-radius:5px;letter-spacing:.04em;text-transform:uppercase;background:#fed7aa;color:#9a3412;">Micro-transactions</span>
  </div>
  <div style="padding:14px 16px;display:flex;flex-direction:column;gap:8px;flex:1;">
    <p style="margin:0;font-size:13px;font-weight:600;color:#0f172a;line-height:1.3;">Massage chair nodes</p>
    <p style="margin:0;color:#475569;font-size:12px;line-height:1.5;flex:1;">Enable micro-payments with low-latency firmware callbacks that activate mechanical timers on payment confirmation.</p>
    <a href="/qr-api-14530840e0" style="display:inline-block;font-size:11px;font-weight:600;text-decoration:none;padding:4px 10px;border-radius:6px;border:1px solid #854f0b;color:#854f0b;width:fit-content;">View API docs &rarr;</a>
  </div>
</div>
<div style="flex:0 0 260px;width:260px;border:1px solid #e2e8f0;border-radius:12px;background:#fff;display:flex;flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="height:148px;position:relative;flex-shrink:0;overflow:hidden;">
   
![smart-vending.svg](https://api.apidog.com/api/v1/projects/831852/resources/377011/image-preview)
    <span style="position:absolute;top:10px;left:10px;font-size:10px;font-weight:600;padding:3px 8px;border-radius:5px;letter-spacing:.04em;text-transform:uppercase;background:#bbf7d0;color:#14532d;">Instant dispense</span>
  </div>
  <div style="padding:14px 16px;display:flex;flex-direction:column;gap:8px;flex:1;">
    <p style="margin:0;font-size:13px;font-weight:600;color:#0f172a;line-height:1.3;">Smart vending slots</p>
    <p style="margin:0;color:#475569;font-size:12px;line-height:1.5;flex:1;">Map inventory units to payment intents and trigger product release via slot allocation callbacks on checkout.</p>
    <a href="#vending" style="display:inline-block;font-size:11px;font-weight:600;text-decoration:none;padding:4px 10px;border-radius:6px;border:1px solid #3b6d11;color:#3b6d11;width:fit-content;">View API docs &rarr;</a>
  </div>
</div>
<div style="flex:0 0 260px;width:260px;border:1px solid #e2e8f0;border-radius:12px;background:#fff;display:flex;flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="height:148px;position:relative;flex-shrink:0;overflow:hidden;">
    
![self-laundry.svg](https://api.apidog.com/api/v1/projects/831852/resources/377012/image-preview)
    <span style="position:absolute;top:10px;left:10px;font-size:10px;font-weight:600;padding:3px 8px;border-radius:5px;letter-spacing:.04em;text-transform:uppercase;background:#99f6e4;color:#134e4a;">App & hardware</span>
  </div>
  <div style="padding:14px 16px;display:flex;flex-direction:column;gap:8px;flex:1;">
    <p style="margin:0;font-size:13px;font-weight:600;color:#0f172a;line-height:1.3;">Self laundry service</p>
    <p style="margin:0;color:#475569;font-size:12px;line-height:1.5;flex:1;">Deploy automated laundromats — scan a hub QR to authenticate and activate a specific washer via digital triggers.</p>
    <a href="/qr-api-14530840e0" style="display:inline-block;font-size:11px;font-weight:600;text-decoration:none;padding:4px 10px;border-radius:6px;border:1px solid #0f6e56;color:#0f6e56;width:fit-content;">View API docs &rarr;</a>
  </div>
</div>
</div>

## 2. Set up your QR display UI
To ensure a smooth payment experience, your platform **must** include a UI to accommodate QR payment acceptance. This includes:
- A screen for customers to choose the payment options you offer (ABA PAY, WeChat or Alipay).
- An area to display the generated QR code for payment
- A confirmation/success screen after the payment is completed.

:::caution[]
You **must** follow **[PayWay QR payment display guidelines](https://www.figma.com/design/5AJmZJwZha5QFfpIKmREBr/Displaying-Payment-QR-Code---Integration-Guideline?node-id=0-320&t=xB5i9Lf49UCKU6t7-4)** to ensure proper QR placement. 
:::

## 3. Integration steps

:::tip[]
Before you start, make sure you have the following:
-  PayWay Sandbox Account – **[Register here](https://sandbox.payway.com.kh/register-sandbox/)** to test transactions.
-  Sandbox Merchant ID & API Key – You will receive these via email after registering for the sandbox.
:::


To integrate QR on Display, follow these steps:


<Steps>
  <Step title="Generate a QR Code (QR Payment API)">
Use the **[QR Payment API](https://developer.payway.com.kh/qr-api-14530840e0.md)** to generate a payment QR code and display it where customers can scan and pay. 
      
      Upon a successful request, the API will respond with a JSON object containing all necessary information, which you can display in your preferred payment interface.

**Sample Response**
      
```json
{
  "qrString": "000201010212...9",
  "qrImage": "data:image/png;base64, ---REMOVED DATA---",
  "abapay_deeplink": "abamobilebank://ababank.com?...63041A49",
  "app_store": "https://itunes.apple.com/a...0649?mt=8",
  "play_store": "https://play.google.com/...com.paygo24.ibank",
  "amount": 0.01,
  "currency": "USD",
  "status": {
    "code": "0",
    "message": "Success.",
    "trace_id": "65bdc1fde8eea8254a437e51b606b328"
  }
}
```
#### **Customize QR Image Template (Optional)**
      
      The `qrImage` comes with various options to suit your needs. Please check API document ([QR API](https://developer.payway.com.kh/qr-api-14530840e0.md)) on how to customize the `qrImage`.
    

      :::warning[]
      
      The QR images included with the templates are high-resolution and can be up to 0.5 MB in size, which may cause network issues during download.

If  your production environments has  internet constraints or if network optimization is needed, we recommend using the QR string to generate the QR code on your end. Use the KHQR frame template as a static frame for display.

:::
      
      
![template1.png](https://api.apidog.com/api/v1/projects/831852/resources/363894/image-preview)

![template2.png](https://api.apidog.com/api/v1/projects/831852/resources/363897/image-preview)

![template3.png](https://api.apidog.com/api/v1/projects/831852/resources/363896/image-preview)
      
![template4.png](https://api.apidog.com/api/v1/projects/831852/resources/363899/image-preview)

![template5.png](https://api.apidog.com/api/v1/projects/831852/resources/363895/image-preview)


![template6.jpg](https://api.apidog.com/api/v1/projects/831852/resources/368430/image-preview)



      

  </Step>
  <Step title="Handle Callback URL for payment status updates">
      
      Once a payment is made using the QR code, the payment gateway will send a payment notification to your `callback_url`.
      
       Your `callback_url` must accept HTTP `POST` method.
      
      Here is the sample response of pushback notification:
      ```json
{
    "tran_id": "5426254593",
    "apv": "502809",
    "status": "0",
    "return_params": "eyJvcmRlcl9pZCI6IjEyMyIsImFtb3VudCI6MTAwLCJjbGllbnRfaWQiOiIxMjM0NTY3ODkwIn0=",
    "merchant_ref": ""
  } 
      ```
      ------
      tran_id  `string` 
      Payment transaction ID generated by the payment gateway.
      `Max. Lenght: 20`
      
      -----
      apv `int`
      Transaction approval code.
      `Length: 6`
      
      ---
      status `string`
      Request status `00`
      
      ---
      merchant_ref_no `string`
      Your payment link reference number.
      
      ---
   

      
  </Step>
    <Step title="Verify Payment Status">
        
        In addition to verifying the payment status via `callback_url`, you must also use the **[Check transaction API](https://developer.payway.com.kh/check-transaction-14530826e0.md)** to ensure the payment is successfully marked as `PAID` and was processed correctly.


  </Step>
</Steps>






# FILE: add-a-beneficiary-to-whitelist-14530818e0.md

# Add a beneficiary to whitelist

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/merchant-portal/merchant-access/whitelist-account/add-whitelist-payout:
    post:
      summary: Add a beneficiary to whitelist
      deprecated: false
      description: >-
        Use this API to whitelist accounts that you intend to split payment and
        payout. You'll first have to whitelist the accounts before you can use
        those accounts to request on payout request.
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
                  description: Request date and time in UTC format as YYYYMMDDHHmmss.
                merchant_id:
                  type: string
                  description: A unique merchant key which provided by ABA Bank.
                  title: ''
                  maxLength: 20
                merchant_auth:
                  type: string
                  description: >
                    The JSON-encoded object containing `mc_id`, `payee`
                    encrypted using RSA public key encryption in chunks. The
                    resulting encrypted data is then concatenated and encoded in
                    Base64 format.



                    ---

                    **mc_id** `string` `mandatory`

                    A unique merchant key which provided by ABA Bank. Same value
                    as `merchant_id`


                    ---

                    **payee** `string` `mandatory`

                    Beneficiary identifier: It can be either a MID or an ABA
                    account.


                    ---


                    **PHP Sample Code**
                     
                      ```php
                    // Prepare data to be encrypted

                    $data_object = json_encode([
                        'mc_id' => 'ec000002', // merchant_id
                        'payee' => '318111358120004', // Meneficiary indentifier. It can be MID or Account
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
                  description: >-
                    Base64 encode of hash hmac sha512 encryption of concatenates
                    values `request_time` and `merchant_auth` with
                    `public_key`..


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
                - hash
                - merchant_auth
                - merchant_id
              x-apidog-orders:
                - request_time
                - merchant_id
                - merchant_auth
                - hash
            example:
              request_time: '20200728093403'
              merchant_id: ec000002
              merchant_auth: 39aaa43...c00a
              hash: EVDFA21....t+sWw==
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
                        maxLength: 255
                      payee:
                        type: string
                        description: >-
                          This value represent the destination beneficiary it
                          can be MID or ABA Account number
                        title: ''
                        maxLength: 250
                      currency:
                        type: string
                        description: >-
                          If payee is MID, the value here will be merchant's
                          currency and  if the payee is an ABA Account holder it
                          will return account currency.
                        title: ''
                        maxLength: 10
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
                        description: >-
                          - `PTL02` : Wrong hash

                          - `PTL04` : Parameter validation required

                          - `PTL25` : Invalid account class

                          - `PTL99` : Merchant invalid currency

                          - `PTL134` : Account not found

                          - `PTL146` : Payee is invalid

                          - `PTL147` : Currency of the payee does not the same
                          as merchant currency

                          - `PTL148` : Payee already exist

                          - `PTL150` : Business profile is not found

                          - `PTL151` : Failed to whitelist account
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
      x-run-in-apidog: https://app.apidog.com/web/project/831852/apis/api-14530818-run
components:
  schemas: {}
  securitySchemes: {}
servers:
  - url: https://checkout-sandbox.payway.com.kh/
    description: StillZeroBug
security: []

```


# FILE: api-endpoints-984508m0.md

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




# FILE: cancel-pre-purchase-transaction-14530836e0.md

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


# FILE: check-transaction-14530826e0.md

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


# FILE: close-transaction-14530822e0.md

# Close transaction

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/payment-gateway/v1/payments/close-transaction:
    post:
      summary: Close transaction
      deprecated: false
      description: >-
        If your business handles transactions that may require cancellation—such
        as flash sales, hotel bookings, or ticket sales—you can use the Close
        Transaction API to cancel a transaction before payment completes. Once a
        transaction is closed, it will no longer accept payment: any incoming
        payment will be rejected or reversed, and no payment notification
        (callback) will be sent to the merchant.
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
                  description: A unique merchant key which provided by ABA Bank.
                  title: ''
                  maxLength: 20
                tran_id:
                  type: string
                  description: >-
                    Original purchase transaction id that you want to
                    close/cancel.
                  title: ''
                  maxLength: 20
                hash:
                  type: string
                  title: ''
                  description: >-
                    A Base64-encoded HMAC SHA-512 hash generated by
                    concatenating `req_time`, `merchant_id`, and `tran_id` ,
                    encrypted using your `public_key`.


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
              req_time: '20241022053608'
              merchant_id: lavacafe
              tran_id: '1729573626'
              hash: ln9Td4JiGPc...R6y2tmUoF2NERNaQ==
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
                          Response code of the reqeust.
                          - `00` : Success
                          - `1` : Wrong Hash
                          - `5` : Transaction not found
                          - `26` : Invalid merchant profile
                      message:
                        type: string
                        title: ''
                        description: >-
                          Please see the property reponse `code` for the
                          details.
                      tran_id:
                        type: string
                        title: ''
                        description: Purchase transaction id that has been cancelled.
                    required:
                      - code
                      - message
                      - tran_id
                    x-apidog-orders:
                      - code
                      - message
                      - tran_id
                required:
                  - status
                x-apidog-orders:
                  - status
              examples:
                '1':
                  summary: Success
                  value:
                    status:
                      code: '00'
                      message: Success!
                      tran_id: '1729573626'
                '2':
                  summary: Exception
                  value:
                    status:
                      code: '1'
                      message: Wrong hash
          headers: {}
          x-apidog-name: OK
      security: []
      x-apidog-folder: Ecommerce Checkout
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/831852/apis/api-14530822-run
components:
  schemas: {}
  securitySchemes: {}
servers:
  - url: https://checkout-sandbox.payway.com.kh/
    description: StillZeroBug
security: []

```


# FILE: complete-pre-auh-transaction-with-payout-14666701e0.md

# Complete pre-auh transaction with payout

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
      summary: Complete pre-auh transaction with payout
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
                    `tran_id`, and `complete_amount`, and `payout` which are
                    encrypted using RSA public key encryption in chunks.



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

                    **payout** `string` `mandatory`

                    Payout instruction


                    ---



                    **PHP Sample Code**


                    ```php

                    // Prepare data to be encrypted for complete pre auth with
                    payout

                    $data_object = json_encode([
                        'mc_id' => $merchant_id,
                        'tran_id' => $tran_id,
                        'complete_amount' => $complete_amount,
                        'payout' => [
                            [
                                'acc' => $aba_account,
                                'amt' => $amount
                             ], [
                                'acc' => $mid,
                                'amt' => $amount
                            ],
                            .....
                         ]
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
      x-run-in-apidog: https://app.apidog.com/web/project/831852/apis/api-14666701-run
components:
  schemas: {}
  securitySchemes: {}
servers:
  - url: https://checkout-sandbox.payway.com.kh/
    description: StillZeroBug
security: []

```


# FILE: complete-pre-auth-transactions-14530835e0.md

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


# FILE: create-payment-link-14530837e0.md

# Create payment link

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/merchant-portal/merchant-access/payment-link/create:
    post:
      summary: Create payment link
      deprecated: false
      description: This API allows you to create a payment link from your application.
      tags:
        - Payment Link
      parameters:
        - name: Content-Type
          in: header
          description: ''
          required: true
          example: multipart/form-data
          schema:
            type: string
      requestBody:
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                request_time:
                  description: Request date and time in UTC format as YYYYMMDDHHmmss.
                  example: ''
                  type: string
                merchant_id:
                  description: A unique merchant key provided by ABA Bank.
                  example: ''
                  type: string
                merchant_auth:
                  description: >-
                    A JSON string representing a JSON object, encrypted using
                    OpenSSL with an RSA public key.


                    ---

                    **mc_id** `string` `mandatory`

                    The same value as merchant_id 


                    ---

                    **title** `string` `mandatory`

                    Title of the payment link. Max. Lenght 250. 


                    ---

                    **amount** `string` `mandatory`
                     Payment link amount. Must be at least 100 KHR or 0.01 USD. Cannot be null or zero.

                    ---

                    **currency** `string` `mandatory`

                    Transaction currency code (Mandatory). Supported values:
                    `KHR` or `USD`.


                    ---

                    **description** `string` 

                    Description of the payment link. Optional. Max. Lenght 250


                    ---

                    **payment_limit** `string` 

                    Maximum number of transactions allowed for this payment link
                    (Optional). If left blank, there is no limit..


                    ---

                    **expired_date** `string` `mandatory`

                    Expiration date of the payment link. A null value means no
                    expiry date.


                    ---

                    **return_url** `string` `mandatory`

                    Once a payment is made on the payment link, the payment
                    gateway will call this URL to send the payment details. This
                    URL must be encrypted in Base64.


                    ---

                    **merchant_ref_no** `string ` `optional`

                    Your payment link ID. We suggest using a unique ID. PayWay
                    does not validate duplicates. This ID will be included in
                    the callback when the payment is completed. Max length: 50.


                    ---

                    **payout** `string`  `optional`

                    Payout instruction of the payment link.  Total payout amount
                    must equal to payment link amount.


                    ---


                    **PHP Sample Code**

                    ```php

                    function opensslEncryption($source, $publicKey)

                    {
                        $maxlength = 117;
                        $output = '';
                        while (!empty($source)) {
                            $input = substr($source, 0, $maxlength);
                            openssl_public_encrypt($input, $encrypted, $publicKey);
                            $output .= $encrypted;
                            $source = substr($source, $maxlength);
                        }
                        return base64_encode($output);
                    }


                    $rsa_public_key = "RSA PUBLIC KEY PROVIDED BY ABA BANK";


                    $data = json_encode([
                        'mc_id' => $merchant_id, 
                        'title' => 'Test curl 001', 
                        'amount' => 0.03,
                        'currency' => 'USD',
                        'description' => 'Payment link created from curl',
                        'payment_limit' => 5, 
                        'expired_date' => time(), 
                        'return_url' => base64_encode('https://domain.com'), 
                        'merchant_ref_no' => 'ref00001',
                        'payout' => '[
                            {"acc":"122092016015926","amt":0.01},
                            {"acc":"122091511120425","amt":0.02}
                        ]',
                    ]);

                    $merchant_auth = opensslEncryption($data, $rsa_public_key);

                    ```
                  example: ''
                  type: string
                image:
                  format: binary
                  type: string
                  description: |-
                    An image associated with the payment link
                    - Maximum file size: 3MB
                    - Supported file formats: JPG, JPEG, PNG
                  example: ''
                hash:
                  description: >-
                    Base64-encoded HMAC SHA-512 hash of the concatenated values:
                    `request_time`,  `merchant_id`, and  `merchant_auth` with
                    `public_key`.


                    **PHP Sample Code**


                    ```php

                    // public key provided by ABA Bank

                    $api_key = "API KEY PROVIDED BY ABA BANK";

                    // Prepare the data to be hashed

                    $b4hash = $request_time . $merchant_id . $merchant_auth;

                    // Generate the HMAC hash using SHA-512 and encode it in
                    Base64

                    $hash = base64_encode(hash_hmac('sha512', $b4hash, $api_key,
                    true));

                    ```
                  example: ''
                  type: string
              required:
                - request_time
                - merchant_id
                - merchant_auth
                - hash
            example: ''
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
                      id:
                        type: string
                        description: >-
                          A unique payment link ID generated by the payment
                          gateway.
                      title:
                        type: string
                        description: The title of your payment link.
                      image:
                        type: object
                        properties:
                          image:
                            type: string
                            description: Full URL of the image
                          filename:
                            type: string
                            description: >-
                              The filename of the image, including its
                              extension.
                          size:
                            type: number
                            description: Image size in KB
                        x-apidog-orders:
                          - image
                          - filename
                          - size
                        description: Image associated with the payment link
                      amount:
                        type: number
                        format: double
                        description: Payment link amount.
                      currency:
                        type: string
                        description: 'Payment link currency. Supported values: `KHR`, `USD`.'
                        minLength: 3
                        maxLength: 3
                      status:
                        type: string
                        description: Once the payment link is created, its status is "OPEN"
                      description:
                        type: string
                        description: A description of your payment link.
                      payment_limit:
                        type: number
                        description: >-
                          The maximum number of transactions allowed for this
                          payment link.
                      total_amount:
                        type: number
                        description: ' Total amount after refund.'
                      total_trxn:
                        type: number
                        description: >-
                          The total number of completed payment transactions. A
                          newly created payment link will have a value of 0
                      created_at:
                        type: string
                        description: >-
                          Date and time when the payment link was created in the
                          payment gateway.
                      updated_at:
                        type: string
                        description: The last updated date and time of the payment link.
                      expired_date:
                        type: number
                        description: The expiration timestamp for this payment link.
                      payment_link:
                        type: string
                        description: Full URL of the payment link
                      return_url:
                        type: string
                        description: >-
                          The URL that the payment gateway will call to send
                          payment status updates.
                      total_amount_org:
                        type: string
                        description: Total payment amount before refund.
                      total_refund:
                        type: number
                        description: Total refunded amount.
                      merchant_ref_no:
                        type: string
                        description: The payment link reference number.
                      outlet_id:
                        type: string
                        description: A unique outlet identifier
                      outlet_name:
                        type: string
                        description: The outlet name.
                    x-apidog-orders:
                      - id
                      - title
                      - image
                      - amount
                      - currency
                      - status
                      - description
                      - payment_limit
                      - total_amount_org
                      - total_amount
                      - total_refund
                      - total_trxn
                      - created_at
                      - updated_at
                      - expired_date
                      - return_url
                      - merchant_ref_no
                      - outlet_id
                      - outlet_name
                      - payment_link
                  status:
                    type: object
                    properties:
                      code:
                        type: string
                        description: |-
                          - `PTL02` : Wrong Hash 
                          - `PTL05` : Parameter Invalid Format
                          - `PTL99` : Merchant invalid currency.
                          - `PTL132` : Invalid payment link.
                      message:
                        type: string
                        description: Please see the property response `code` for details.
                    x-apidog-orders:
                      - code
                      - message
                  tran_id:
                    type: string
                    description: A unique log ID generated by the payment gateway.
                  payout:
                    type: array
                    items:
                      type: object
                      properties:
                        acc:
                          type: string
                          description: The ABA account number or MID of the beneficiary
                        amt:
                          type: number
                          description: >-
                            The payout amount. The currency will follow the
                            payment link currency.
                        acc_name:
                          type: string
                          description: >-
                            The name of the beneficiary. If the beneficiary is
                            an ABA account number, it will show the account
                            holder's name. If the beneficiary is a MID (ABA
                            Merchant), it will show the outlet name associated
                            with that MID.
                      x-apidog-orders:
                        - acc
                        - amt
                        - acc_name
                    description: Payout instructions for the payment link
                x-apidog-orders:
                  - data
                  - payout
                  - status
                  - tran_id
          headers:
            Content-Type:
              example: application/json
              required: false
              description: ''
              schema:
                type: string
          x-apidog-name: Success
      security: []
      x-apidog-folder: Payment Link
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/831852/apis/api-14530837-run
components:
  schemas: {}
  securitySchemes: {}
servers:
  - url: https://checkout-sandbox.payway.com.kh/
    description: StillZeroBug
security: []

```


# FILE: credentials-on-file-4395178f0.md

# Credentials on File

## Introduction

Credentials on File (CoF) is an innovative solution that allows businesses to securely store customer payment details for on-demand or automatic future payments.

Customers save their **ABA account** or their **credit/debit card** once, and they can make future payments without re-entering their card details or scanning a QR code using their Banking or Wallet app. It turns a multi-step checkout into a seamless, one-click experience.

## Here are some sample business cases


<Tabs>
  <Tab title="Uncheduled Payment">
      <CardGroup cols={2}>
  <Card title="Click Ride-Hailing">
      
    Before booking a trip (e.g., PassApp), the user selects their linked ABA account. Once the trip ends, the saved method is charged.
      
`Customer Initiate Transaction`
  </Card>
  <Card title="Food Delivery Checkout">
    A hungry customer (e.g., Grab) completes their order by selecting their stored Visa card at the final checkout screen.
      
      `Customer Initiate Transaction`
  </Card>
  <Card title="Instant Wallet Top-up">
    A user manually triggers a balance refill within a gaming or loyalty app by "pulling" funds from their linked ABA account.
      
      `Customer Initiate Transaction`
  </Card>
  <Card title="Parking Auto-Pay">
    When you leave a parking lot, the system automatically charges the parking fee to your saved payment method, so you don’t need to pay manually.
      
      `Merchant Initiate Transaction`
  </Card>
     <Card title="ISP & Utility Overages">
    An internet provider charges for extra data usage or "Add-on" packs at the end of a billing cycle based on the customer’s pre-authorized link.
         
         `Merchant Initiate Transaction`
  </Card>
     <Card title="Booking No-Show Fees">
    A boutique hotel in Siem Reap triggers a penalty charge if a guest fails to show up for a booking they secured with their "Account on File."
         
         `Merchant Initiate Transaction`
  </Card>
</CardGroup>
      
      Getting started [Unschedule Payment](https://developer.payway.com.kh/unschedule-payment-2038908m0.md)
    
  </Tab>
  <Tab title="Scheduled Payment">
    
<CardGroup cols={2}>
  <Card title="ISP Subscriptions">
    Automatically charge a fixed monthly fee (e.g., $25) for home internet. The service stays active without the customer needing to scan a QR code every month.
  </Card>
  <Card title="Gym Memberships">
    Phnom Penh fitness centers can collect monthly dues on a set date. Members authorize the link once, ensuring their access never expires.
  </Card>
  <Card title="Borey Maintenance Fees">
    Management offices can automate the collection of monthly security and trash fees from residents, reducing manual cash handling and office visits.
  </Card>
  <Card title="SaaS & Media Plans">
    Local digital platforms can pull a fixed "Pro Plan" fee (e.g., $5/month) from a linked account, providing a seamless "Netflix-style" experience in Cambodia.
  </Card>
    <Card title="School Tuition Installments">
    Private schools can split annual tuition into 10 equal monthly payments. Parents authorize the schedule once at the start of the academic year.
  </Card>
  <Card title="Flat-Rate Utilities">
    Fixed-rate service providers, like private waste collection, can trigger a set monthly charge to ensure timely payments and avoid service interruptions.
  </Card>
</CardGroup>
      
      Getting started [Schedule Payment](https://developer.payway.com.kh/schedule-payment-2038907m0.md)
  </Tab>
</Tabs>




# FILE: ecommerce-checkout-3158159f0.md

# Ecommerce Checkout 

## 1. Introduction

With PayWay eCommerce Checkout, you can easily **accept payments on your website or mobile app**. This solution lets your customers pay quickly and securely using **Credit/Debit Cards**, **ABA Pay & KHQR** (via ABA Mobile or other KHQR-supported banking apps), **WeChat Pay** or **Alipay**  — to give them a seamless and secure checkout experience.

**Common Use Cases**
- **Online shopping** – Accept payments for products and services.
- **Wallet top-ups & digital services** – Let users add funds or pay for digital services.
- **Subscriptions & bills** – As a checkout to process recurring payments and utility bills.
- **On-demand services** – Handle payments for food delivery, ride-hailing, and more.
- **Event bookings** – Enable seamless ticket and reservation payments

## 2. How it works   

1. The **customer selects a product or service** and clicks **"Pay"**.  
2. They **choose a payment method**, and a **checkout modal appears**.  
3. The **customer completes payment** with their chosen method (credit/debit cards, ABA Pay, KHQR, WeChat Pay, Alipay, or Google Pay). 
4. Once the payment is processed, **your system receives a pushback notification** with the payment status.  
5. Your system **verifies the payment** and confirms the order.  






:::info[]
Selling on an eCommerce platform? See our [eCommerce Checkout Plugins](https://developer.payway.com.kh/plugins-3186291f0.md) instead!
:::

## 3. Set up your payment selection UI

To ensure a smooth payment experience, your platform **must** include UI to accommodate the online payment acceptance. This includes:

- A section where **customers can choose a payment options** they want to pay with. 
- A **"We Accept..."** area that shows the payment options you offer.

:::caution[]
You **must** follows PayWay eCommerce checkout guidelines to ensure seamless customer payments.

<CardGroup cols={2}>
  <Card title="Web UI Guidelines" icon="material-outline-web_asset"href="https://www.figma.com/design/xS8d19OkA9jMh4gGsxUZPe/-External-Use--Merchant-Integration-Guideline---2.11?node-id=18242-3423&t=LHfI2NGGuNrUoeJS-4" >
    To accept payments on your website
  </Card>
  <Card title="Mobile UI Guidelines" icon="material-outline-smartphone"href="https://www.figma.com/design/xS8d19OkA9jMh4gGsxUZPe/-External-Use--Merchant-Integration-Guideline---2.11?node-id=18242-3756&t=evjdsIrE2bpqJ9wW-4">
To accept payments on your app or web app
  </Card>
  
</CardGroup>
:::

## 4. Integration Steps


:::tip[]
Before you start, make sure you have the following:
- PayWay Sandbox Account – **[Register here](https://sandbox.payway.com.kh/register-sandbox/)** to test transactions.
- Sandbox Merchant ID & API Key—You’ll receive these via email after registering for the sandbox.
:::

To integrate online payments on your website or mobile app, follow these steps:


<Steps>
  <Step title="Create a Payment Transaction">
    When the customer selects "Pay" and **chooses a payment method**, call the **[Create Transaction API](https://developer.payway.com.kh/purchase-14530820e0.md)** to generate a transaction and display it on your platform. 

      **Sample Request** 
```
<html lang="en">
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
      
    <!-- Remove PayWay Plugin JS if you prefer Hosted view mode. This URL is valid for both Sanbdbox and Production -->
    <script src="https://checkout.payway.com.kh/plugins/checkout2-0.js" defer></script>
      
  </head>
  <body>
    <form method="POST" target="aba_webservice" id="aba_merchant_request"
      action="https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase" >
      <input type="hidden" name="hash" value="D8SaUWAA/AhxNro00wAykb4ibeo9kM3if7ioN7cnBfihXP/38anLGwGUxHK+J6HvaiUEV8Ho+nz5nkQrzowm7g==" />
      <input id="tran_id" type="hidden" name="tran_id" value="17536691884" /><br />
      <input type="hidden" name="amount" value="0.10" />
      <input type="hidden" name="merchant_id" value="ec000002" />
      <input type="hidden" name="req_time" value="20250728022056" />

      <input type="hidden" id="payment_option" name="payment_option" value="" />

      <input type="hidden" name="currency" value="" />

      <input type="hidden" name="firstname" value="sina" />
      <input type="hidden" name="lastname" value="chhum" />
      <input type="hidden" name="phone" value="093939399" />
      <input type="submit" value="submit" />
    </form>

    <script>
      var form = document.getElementById('aba_merchant_request')
      form.addEventListener('submit', function (event) {
        event.preventDefault()
        AbaPayway.checkout() // Use it with PayWay Plugin JS to display as a bottom sheet on mobile or a modal popup on desktop // document.getElementById(form_id).submit() // Use it to display as Hosted view mode
      })
    </script>
  </body>
</html>
      
```
      
      
PayWay will respond with a **HTML response** that contains the checkout interface, which you must render on your website/platform for the customer to complete the payment.  
        
<Tabs>
  <Tab title="Web">
      
**Sample Response (Varies Based on Payment Method):**      

```html
<!DOCTYPE html>
<html data-capo="">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalab
<title>PayWay - Checkout</title>
...
</head>
<body>
...
</body>
</html>
```
  <Accordion title="Payment method responses" defaultOpen={false} icon="material-rounded-payments">
       | Payment Options |Checkout UI  |
| --- | --- |
| `cards` | <img src="https://api.apidog.com/api/v1/projects/831852/resources/351796/image-preview" width="300" />   |
| `abapay` | <img src="https://api.apidog.com/api/v1/projects/831852/resources/351795/image-preview" width="300" />  |
    | `bakong` | <img src="https://api.apidog.com/api/v1/projects/831852/resources/351794/image-preview" width="300" /> |
    | `alipay` | <img src="https://api.apidog.com/api/v1/projects/831852/resources/351793/image-preview" width="300" />  |
    | `wechat` | <img src="https://api.apidog.com/api/v1/projects/831852/resources/351791/image-preview" width="300" /> |
   
  </Accordion>



  </Tab>
  <Tab title="WAP/Mobile">

For a better user experience on mobile apps or webview, ensure you use the following parameters when you call **[Create Transaction API](https://developer.payway.com.kh/purchase-14530820e0.md)** :

- `view_type=hosted` → To respond the hosted checkout page on mobile.
- `return_deeplink` → Handles redirection for native iOS and hybrid apps, so your customers can return to your platform after making a payment in ABA Mobile.
      
**Sample Response (Varies Based on Payment Method):**    
                         
```html
<!DOCTYPE html>
<html data-capo="">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalab
<title>PayWay - Checkout</title>
...
</head>
<body>
...
</body>
</html>
```
    
    
    
  <Accordion title="Payment method responses">
       | Payment Options |Checkout UI  |
| --- | --- |
| `cards` | <img src="https://api.apidog.com/api/v1/projects/831852/resources/351729/image-preview" width="250" />   |
| `abapay` | <img src="https://api.apidog.com/api/v1/projects/831852/resources/351729/image-preview" width="250" />  |
    | `bakong` | <img src="https://api.apidog.com/api/v1/projects/831852/resources/351729/image-preview" width="250" /> |
    | `alipay` | <img src="https://api.apidog.com/api/v1/projects/831852/resources/351729/image-preview" width="250" />  |
    | `wechat` | <img src="https://api.apidog.com/api/v1/projects/831852/resources/351729/image-preview" width="250" /> |
    | `google_pay` | <img src="https://api.apidog.com/api/v1/projects/831852/resources/351729/image-preview" width="250" />  |
  </Accordion>
  
    
    </Tab>
</Tabs>      
      
      
  </Step>
  
      <Step title="Verify Payment Status">
      
Use the Check Transaction API to confirm whether a payment was successful.
After you create a payment, call the API with the transaction ID to check its status. Please respect the rate limit of 600 requests per second and stop checking once a result is returned.
For response details and error explanations, see the API guide here:
      **[Check transaction API](https://developer.payway.com.kh/check-transaction-14530826e0.md)**


  </Step>
  <Step title="(Optional) Handle Callback URL for payment status updates">
    
    Once the customer completes the payment, PayWay will send the transaction details and other important information to the `return_url`.

- If return_url is not provided in the request, PayWay will use the default return_url configured in the API Settings.
- If you provide a custom return_url, make sure the domain is whitelisted in your merchant profile.

Your return_url endpoint must:

- Accept the HTTP POST method

- Accept Content-Type: application/json
 

    
:::highlight red 💡
We highly recommend securing this URL to ensure that only ABA PayWay has access to it.
:::
  

**Sample Pushback Data**
      
```
{
    "tran_id": "9e55c7c4b4d9488a96db",
    "apv": "832865",
    "status": "0",
    "return_params": "{\"order_id\":\"123\",\"amount\":100,\"client_id\":\"1234567890\"}",
    "merchant_ref": ""
  }    
```


---
    **tran_id** `string`
    Transaction ID sent during the initial payment process.
    
    ---
    **apv** `string`
    Transaction approval code.
    
    ---
    **status** `string`
    Payment status
    
    ---
    **return_params** `string`
    Extra information sent to the payment gateway during the payment initiation request.
    
    ---
    
    **Verify Callback Signature**
    
    For security purposes, PayWay includes a hash signature in the request header.
You should verify this signature to confirm that the callback was sent by PayWay and that the data has not been modified.

Below is an example in PHP demonstrating how to:

1. Read the callback data

2. Generate the signature

3. Compare it with the signature received in the header

PHP Example
    
   ```
    // Read request body
$response = json_decode(file_get_contents('php://input'), true);

$secretKey = "YOUR_SECRET_KEY";

// 1. Sort fields by key (ascending)
ksort($response);

// 2. Concatenate all values
$b4hash = '';
foreach ($response as $value) {
    if (is_array($value)) {
        $value = json_encode($value);
    }
    $b4hash .= $value;
}

// 3. Generate HMAC-SHA512 signature
$signature = base64_encode(
    hash_hmac('sha512', $b4hash, $secretKey, true)
);

// 4. Get signature from request header
$receivedSignature = $_SERVER['HTTP_X_PAYWAY_HMAC_SHA512'] ?? '';

// 5. Compare signatures
if (hash_equals($signature, $receivedSignature)) {
    // Valid request – process the notification
} else {
    // Invalid request
    http_response_code(401);
    exit('Invalid signature');
}
    ```
   
    
  </Step>

</Steps>
                          





    

    
    
    
 


# FILE: exchange-rate-14530823e0.md

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


# FILE: get-a-transaction-details-14530824e0.md

# Get a transaction details

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/payment-gateway/v1/payments/transaction-detail:
    post:
      summary: Get a transaction details
      deprecated: false
      description: >-
        This API allows you to retrieve details of a purchase transaction,
        including its history and related operations, for both online and
        in-store payments.



        :::highlight orange 🚨
         Note: This API does not support real-time payment status checks during payment processing.
        :::


        - You can retrieve details for any past transaction.

        - Limited to 10 requests per minute. This limit cannot be increased.
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
                  description: A unique merchant key provided by ABA Bank.
                  title: ''
                  maxLength: 20
                tran_id:
                  type: string
                  description: The purcahse transaction ID.
                  title: ''
                  maxLength: 20
                hash:
                  type: string
                  title: ''
                  description: >-
                    A Base64-encoded HMAC SHA-512 hash generated by
                    concatenating `req_time`, `merchant_id`, and `tran_id`,
                    encrypted using your `public_key`.



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
              req_time: '20250213084236'
              merchant_id: ec000002
              tran_id: '17394277693'
              hash: QskVi2gEctW...j7Td6kEi/KLPvGcK3ZiA==
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
                      transaction_id:
                        type: string
                        description: Your `tran_id`.
                      payment_status_code:
                        type: number
                        description: |-
                          Supported values:
                          - `0` - APPROVED, PRE-AUTH
                          - `2` - PENDING
                          - `3` - DECLINDED
                          - `4` - REFUNDED
                          - `7` - CANCELLED
                      payment_status:
                        type: string
                        description: >-
                          The transaction status. Possible values:


                          - `APPROVED` – Payment was completed successfully or
                          captured.

                          - `PRE-AUTH` – Payment is held under
                          pre-authorization, pending capture.

                          - `PENDING` – Awaiting completion from the payer.

                          - `DECLINED` – The payment was declined.


                          - `REFUNDED` – The payment has been refunded fully or
                          partially.

                          - `CANCELLED` – The transaction or pre-authorization
                          was cancelled.
                      original_amount:
                        type: number
                        description: Original transaction amount before discount.
                      original_currency:
                        type: string
                        description: Original transaction currency.
                      payment_amount:
                        type: number
                        description: Amount that the customer has paid.
                      payment_currency:
                        type: string
                        description: Payment currency that the customer used to pay.
                      total_amount:
                        type: number
                        description: Amount that customer suppose to pay after discount.
                      refund_amount:
                        type: number
                        description: 'Total refunded amount. '
                      discount_amount:
                        type: number
                        description: >-
                          Discounted amount and its currency follow original
                          curency.
                      apv:
                        type: string
                        description: Transaction appoval code.
                      transaction_date:
                        type: string
                        description: >-
                          Created date of the transaction in payment gateway
                          database.
                      first_name:
                        type: string
                        description: Payer's first name.
                      last_name:
                        type: string
                        description: Payer's last name.
                      email:
                        type: string
                        description: Payer's email.
                      phone:
                        type: string
                        description: Payer's phone number.
                      bank_ref:
                        type: string
                        description: >-
                          Unique booking entry reference number from ABA Core
                          banking system
                      payment_type:
                        type: string
                        description: >-
                          Payment method that the customer used to make payment.
                          Possible values:

                          - `ABA Pay` : Transaction made with ABA Account (ABA
                          Mobile)

                          - `Alipay` : Transaction made with Alipay.

                          - `Wechat` : Transaction made with WeChat pay.

                          - `KHQR` : Trnasaction made with KHQR.

                          - `VISA` : Transaction made with Visa card.

                          - `MC` : Transacion made with Mastercard.

                          - `JCB` : Transaction made with JCB card

                          - `CUP` : Transaction made with UPI card.
                      payer_account:
                        type: string
                        description: >-
                          Masked ABA Account Number or Masked Card PAN. For
                          other payment options, it will be blank.
                      bank_name:
                        type: string
                        description: >-
                          If payment is made with ABA PAY, it will show ABA Bank
                          and if payment made using KHQR it will show issuer
                          bank name.
                      card_source:
                        type: string
                        description: >-
                          Possible values:

                          - `ONUS` : Transaction is made with ABA bank card.

                          - `OFFUS_DOMESTIC` : Transaction is made with other
                          local bank card.

                          - `OFFUS_INTERNATIONAL` : Transaction is made with
                          other international bank card
                      transaction_operations:
                        type: array
                        items:
                          type: object
                          properties:
                            status:
                              type: string
                              description: >-
                                Payment operation status. Possible values:

                                - `Completed` : Full purchase

                                - `Pre-Auth` : Purchase with pre-auth

                                - `Completed Pre-Auth` : Indicates a
                                pre-authorization was completed.

                                - `Cancelled Pre-Auth` :  Indicates a
                                pre-authorization was cancelled.

                                - `Refunded` : Refund operation
                            amount:
                              type: number
                              description: Amount based on operation type.
                            transaction_date:
                              type: string
                              description: Operation date and time.
                            bank_ref:
                              type: string
                              description: >-
                                Unique booking entry id from ABA core banking
                                (only for ABA PAY). Other payment options, this
                                field will be empty.
                          x-apidog-orders:
                            - status
                            - amount
                            - transaction_date
                            - bank_ref
                        description: History of the payments
                      status:
                        type: object
                        properties:
                          code:
                            type: string
                            title: ''
                            description: |-
                              Possible  response code:
                              - `00` : Success!
                              - `5` : Wrong hash
                              - `6` : Transaction not found
                              - `8` : Invalid merchant profile
                              - `11` : Internal server error
                              - `429` : Rate limit exceeded
                          message:
                            type: string
                            title: ''
                            description: >-
                              See the `code` field for a detailed error
                              explanation.
                          tran_id:
                            type: string
                            title: ''
                            description: Request reference generated by payment gateway.
                        x-apidog-orders:
                          - code
                          - message
                          - tran_id
                    x-apidog-orders:
                      - transaction_id
                      - payment_status_code
                      - payment_status
                      - original_amount
                      - original_currency
                      - payment_amount
                      - payment_currency
                      - total_amount
                      - refund_amount
                      - discount_amount
                      - apv
                      - transaction_date
                      - first_name
                      - last_name
                      - email
                      - phone
                      - bank_ref
                      - payment_type
                      - payer_account
                      - bank_name
                      - card_source
                      - transaction_operations
                      - status
                x-apidog-orders:
                  - data
          headers: {}
          x-apidog-name: OK
      security: []
      x-apidog-folder: Ecommerce Checkout
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/831852/apis/api-14530824-run
components:
  schemas: {}
  securitySchemes: {}
servers:
  - url: https://checkout-sandbox.payway.com.kh/
    description: StillZeroBug
security: []

```


# FILE: get-payment-link-details-14530838e0.md

# Get payment link details

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/merchant-portal/merchant-access/payment-link/detail:
    post:
      summary: Get payment link details
      deprecated: false
      description: >-
        This API allows you to retrieve the details of a payment link that has
        already been created.
      tags:
        - Payment Link
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
                merchant_id:
                  type: string
                  description: A unique merchant key provided by ABA Bank.
                merchant_auth:
                  type: string
                  description: >-
                    A JSON string representing a JSON object, encrypted using
                    OpenSSL with an RSA public key.


                    **PHP Sample Code**


                    ```php

                    function opensslEncryption($source, $publicKey)

                    {
                        $maxlength = 117;
                        $output = '';
                        while (!empty($source)) {
                            $input = substr($source, 0, $maxlength);
                            openssl_public_encrypt($input, $encrypted, $publicKey);
                            $output .= $encrypted;
                            $source = substr($source, $maxlength);
                        }
                        return base64_encode($output);
                    }

                    $merchantAuth = json_encode([
                        "mc_id" => $merchant_id,
                        "id":"hEbr4***xQbpGQ=="
                    ]);

                    $rsaPublicKey = "RSA PUBLIC KEY PROVIDED BY ABA BANK";

                    $merchantAuthEnc = opensslEncryption($merchantAuth,
                    $rsaPublicKey);

                    ```
                hash:
                  type: string
                  description: >-
                    Base64-encoded HMAC SHA-512 hash of the concatenated values:
                    `request_time`,  `merchant_id`, and  `merchant_auth` with
                    `public_key`.


                    **PHP Sample Code**


                    ```php

                    // public key provided by ABA Bank

                    $api_key = "API KEY PROVIDED BY ABA BANK";


                    // Prepare the data for hashing

                    $b4hash = $request_time . $merchant_id . $merchant_auth;


                    // Generate the HMAC hash using SHA-512 and encode it in
                    Base64

                    $hash = base64_encode(hash_hmac('sha512', $b4hash, $api_key,
                    true));

                    ```
              x-apidog-orders:
                - request_time
                - merchant_id
                - merchant_auth
                - hash
              required:
                - request_time
                - merchant_id
                - merchant_auth
                - hash
            example:
              request_time: '20200728093403'
              merchant_id: ec000002
              merchant_auth: 39aaa43e6929a752.....08cdb29ab498d9604600101d8dc00a
              hash: EVDFA2118UD0...fbMa2b5q9CCt+sWw==
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
                      id:
                        type: string
                        description: >-
                          A unique payment link ID generated by the payment
                          gateway.
                      title:
                        type: string
                        description: The title of your payment link.
                      image:
                        type: object
                        properties:
                          image:
                            type: string
                            description: Full URL of the image
                          filename:
                            type: string
                            description: >-
                              The filename of the image, including its
                              extension.
                          size:
                            type: number
                            description: Image size in KB
                        x-apidog-orders:
                          - image
                          - filename
                          - size
                        description: Image associated with the payment link
                      amount:
                        type: number
                        description: Payment link amount.
                      currency:
                        type: string
                        description: 'Payment link currency. Supported values: `KHR`, `USD`.'
                        maxLength: 3
                        minLength: 3
                      status:
                        type: string
                        description: >-
                          Status of the payment link:


                          - **`OPEN`**: The status remains open when
                          `payment_limit` is greater than `total_trxn`, meaning
                          payments can still be made.  

                          - **`PAID`**: The status changes to paid once
                          `payment_limit` equals `total_trxn`. At this point,
                          the user can no longer make payments using the
                          **`PAID`** payment link.
                      payment_limit:
                        type: number
                        description: >-
                          The maximum number of transactions allowed for this
                          payment link.
                      total_amount:
                        type: number
                        description: Total amount after refund.
                      total_trxn:
                        type: number
                        description: >-
                          The total number of completed payment transactions. A
                          newly created payment link will have a value of 0
                      created_at:
                        type: string
                        description: >-
                          Date and time when the payment link was created in the
                          payment gateway.
                      updated_at:
                        type: string
                        description: The last updated date and time of the payment link.
                      expired_date:
                        type: number
                        description: The expiration timestamp for this payment link.
                      pushback_url:
                        type: string
                        description: >-
                          The URL that the payment gateway will call to send
                          payment status updates.
                      payment_link:
                        type: string
                        description: >-
                          A unique payment link url generated by the payment
                          gateway.
                      description:
                        type: string
                        description: A description of your payment link.
                      total_amount_org:
                        type: string
                        description: Total payment amount before refund.
                      total_refund:
                        type: string
                        description: >-
                          Total of refund amount of all lated transaction of the
                          payment link.
                    x-apidog-orders:
                      - id
                      - title
                      - image
                      - amount
                      - currency
                      - status
                      - description
                      - payment_limit
                      - total_amount_org
                      - total_refund
                      - total_amount
                      - total_trxn
                      - created_at
                      - updated_at
                      - expired_date
                      - pushback_url
                      - payment_link
                    required:
                      - id
                      - amount
                      - updated_at
                      - created_at
                      - total_trxn
                      - total_amount
                      - payment_limit
                      - status
                      - currency
                      - expired_date
                      - description
                      - total_amount_org
                      - total_refund
                  status:
                    type: object
                    properties:
                      code:
                        type: string
                        description: |-
                          - `PTL02` : Wrong hash
                          - `PTL132` :  Invalid payment link
                      message:
                        type: string
                        description: >-
                          Please see the property reponse `code` for the
                          details.
                    x-apidog-orders:
                      - code
                      - message
                    required:
                      - code
                      - message
                  tran_id:
                    type: string
                    description: A unique log ID generated by the payment gateway.
                x-apidog-orders:
                  - data
                  - status
                  - tran_id
                required:
                  - data
                  - status
                  - tran_id
          headers: {}
          x-apidog-name: Success
      security: []
      x-apidog-folder: Payment Link
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/831852/apis/api-14530838-run
components:
  schemas: {}
  securitySchemes: {}
servers:
  - url: https://checkout-sandbox.payway.com.kh/
    description: StillZeroBug
security: []

```


# FILE: get-token-details-19336824e0.md

# Get token details

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/payment-credential/v3/token-management/get-token-details:
    post:
      summary: Get token details
      deprecated: false
      description: >-
        If you encounter issues with the callback and do not receive the details
        during **link account**, **link card**, or **token renewal**, you can
        manually retrieve the linked account or card information.
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

                    $b4hash = $merchant_id . $request_time . $request_id;


                    // Generate the HMAC hash using SHA-512 and encode it in
                    Base64 

                    $hash = base64_encode(hash_hmac('sha512', $b4hash, $api_key,
                    true));

                    ```
                merchant_id:
                  type: string
                  description: A unique merchant key provided by ABA Bank.
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
              required:
                - hash
                - merchant_id
                - request_id
                - request_time
              x-apidog-orders:
                - request_time
                - request_id
                - merchant_id
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
                  data:
                    type: object
                    properties:
                      source_of_fund:
                        type: string
                        description: >-
                          This field displays either the card number or the ABA
                          account number, depending on the payer's selected
                          payment method. For security reasons, the number is
                          masked and only the last 4 digits are shown.
                        x-apidog-mock: '*1234'
                      type:
                        type: string
                        description: |-
                          Possible values 
                          - `Visa` - Visa card
                          - `MC` - Mastercard
                          - `CUP` - UnionPay card
                          - `JCB` - JCB card
                          - `ABA ACCOUNT` - ABA Account
                      status:
                        type: integer
                        format: int32
                        description: |-
                          - `0` -  Token has been removed.
                          - `1` - Token is active.
                          - `2` - Token has been frozen.
                      expired_at:
                        type: string
                        description: Expiry date of the token.
                        format: date-time
                      token_flag:
                        type: string
                        description: >-
                          Possible values: `CITI_FLEX`, `CITO_FLEX`, and
                          `CITR_FIX`.
                      frequency:
                        type: string
                        description: >-
                          This field will be empty if the token flag is
                          `CITI_FLEX` or `CITO_FLEX`. If the token flag is
                          `CITR_FIX`, the possible values are:

                          - `1W` – Weekly

                          - `1M` – Monthly

                          - `2M` – Every 2 months
                        nullable: true
                      amount_limit_per_tran:
                        type: number
                        description: >-
                          Token payment amount limit per transaction. If token
                          flag is `CITR_FIX` this value is equal to value of
                          `subscribed_amount`.
                        format: double
                      ctid:
                        type: string
                        title: ''
                        description: >-
                          This is your consumer identification number, which is
                          a unique code used to identify you in the system. The
                          string must be between 5 and 24 characters long and
                          can only contain letters and numbers — no spaces or
                          special characters.
                      pwt:
                        type: string
                        title: ''
                        description: >-
                          PWT (PayWay Token) is a unique token automatically
                          generated by the PayWay system and is used to complete
                          the purchase.
                      subscribed_amount:
                        type: number
                        description: >-
                          Refers to the fixed amount of money that the customer
                          agrees to pay regularly as part of a subscription or
                          recurring payment. 0 if token flag is `CITI_FLEX` or
                          `CITO_FLEX`.
                        format: double
                        x-apidog-mock: '{{$finance.amount}}'
                      currency:
                        type: string
                        description: Token currency.
                    x-apidog-orders:
                      - ctid
                      - pwt
                      - source_of_fund
                      - type
                      - status
                      - expired_at
                      - token_flag
                      - frequency
                      - subscribed_amount
                      - amount_limit_per_tran
                      - currency
                    required:
                      - subscribed_amount
                      - ctid
                      - pwt
                      - source_of_fund
                      - type
                      - token_flag
                      - status
                      - expired_at
                      - amount_limit_per_tran
                      - currency
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
                      trace_id: '175576519295871'
                    data:
                      ctid: 64513556cc930062e8cb3ae59eee8fbf459c53e
                      pwt: 6451355C97035CDE21FB13..E0945C21007136F3D423A1B
                      source_of_fund: '*****5312'
                      type: ABA ACCOUNT
                      status: 0
                      expired_at: '2019-08-24T14:15:22Z'
                      token_flag: CITI_FLEX
                      frequency: ''
                      subscribed_amount: 0
                      amount_limit_per_tran: 200
                      currency: USD
                '2':
                  summary: Example 1
                  value:
                    status:
                      code: '04'
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
                        nullable: true
                      message:
                        type: string
                        description: >-
                          Please see the property reponse `errors` for the
                          details.
                        nullable: true
                      trace_id:
                        type: string
                        description: >-
                          A log ID is generated by the system for debugging
                          purposes.
                        nullable: true
                      errors:
                        type: object
                        additionalProperties:
                          type: array
                          items:
                            type: string
                        properties: {}
                        x-apidog-orders: []
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
                        nullable: true
                    x-apidog-orders:
                      - code
                      - message
                      - trace_id
                      - errors
                x-apidog-orders:
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
                          - `104` - Data not found.
                        nullable: true
                      message:
                        type: string
                        description: >-
                          Please see the property reponse `code` for the
                          details.
                        nullable: true
                      trace_id:
                        type: string
                        x-apidog-mock: '{{$string.uuid}}'
                        description: >-
                          A log ID is generated by the system for debugging
                          purposes.
                        nullable: true
                    x-apidog-orders:
                      - code
                      - message
                      - trace_id
                x-apidog-orders:
                  - status
          headers: {}
          x-apidog-name: Forbidden
      security: []
      x-apidog-folder: Credentials on File
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/831852/apis/api-19336824-run
components:
  schemas: {}
  securitySchemes: {}
servers:
  - url: https://checkout-sandbox.payway.com.kh/
    description: StillZeroBug
security: []

```


# FILE: get-transaction-list-14530825e0.md

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


# FILE: get-transactions-22366268e0.md

# Get transactions

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/payment-gateway/v1/payments/get-transactions-by-mc-ref:
    post:
      summary: Get transactions
      deprecated: false
      description: >-
        This API allows you to retrieve  purchase transactions using
        `merchant_ref` number, for both online and in-store payments.


        - You can retrieve details for any past transaction and we response only
        the last 50 transactions.

        - Limited to 10 requests per minute. This limit cannot be increased.
      tags:
        - KHQR Guideline
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
                hash:
                  type: string
                  title: ''
                  description: >-
                    A Base64-encoded HMAC SHA-512 hash generated by
                    concatenating `req_time`, `merchant_id`, and `merchant_ref`,
                    encrypted using your `public_key`.



                    **PHP Sample Code**


                    ```php

                    // public key provided by ABA Bank

                    $api_key = "API KEY PROVIDED BY ABA BANK";

                    // Prepare the data to be hashed

                    $b4hash = $req_time . $merchant_id . $merchant_ref;

                    // Generate the HMAC hash using SHA-512 and encode it in
                    Base64 

                    $hash = base64_encode(hash_hmac('sha512', $b4hash, $api_key,
                    true));

                    ```
                merchant_id:
                  type: string
                  description: A unique merchant key provided by ABA Bank.
                  title: ''
                  maxLength: 20
                merchant_ref:
                  type: string
                  description: 'Merchant reference #.'
                  title: ''
                  maxLength: 20
              required:
                - req_time
                - merchant_id
                - merchant_ref
                - hash
              x-apidog-orders:
                - req_time
                - merchant_id
                - merchant_ref
                - hash
            example:
              req_time: '20250213084236'
              merchant_id: ec000002
              merchant_ref: '17394277693'
              hash: QskVi2gEctW...j7Td6kEi/KLPvGcK3ZiA==
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

                            - `REFUNDED` : Transaction has been fully or
                            partially refunded.
                        payment_status_code:
                          type: integer
                          description: |-
                            - `0` : APPROVED
                            - `4` : REFUNDED
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
                        bank_ref:
                          type: string
                          description: >-
                            Unique booking entry id from ABA core banking. This
                            value only exist in the API response if configure on
                            profile.
                        payer_account:
                          type: string
                          description: 'Masked acccount #'
                        bank_name:
                          type: string
                          description: >-
                            If payment is made with ABA Pay, it will show ABA
                            Bank or If payment made using KHQR it will show
                            issuer bank name.
                        payment_type:
                          type: string
                          description: >-
                            Payment method that the customer use to make
                            payment. This value only exist in the API response
                            if configure on profile. Possible values:

                            - `ABA Pay` : Transaction made with ABA Account (ABA
                            Mobile)

                            - `KHQR` : Trnasaction made with KHQR.
                        merchant_ref:
                          type: string
                          description: >-
                            Your reference number that you embed  in tag
                            `62.01`.
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
                        - bank_ref
                        - payment_type
                        - payer_account
                        - bank_name
                        - merchant_ref
                      required:
                        - merchant_ref
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
                      merchant_ref:
                        type: string
                        title: ''
                        description: 'Merchant reference #'
                    x-apidog-orders:
                      - code
                      - message
                      - merchant_ref
                x-apidog-orders:
                  - data
                  - status
          headers: {}
          x-apidog-name: OK
      security: []
      x-apidog-folder: KHQR Guideline
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/831852/apis/api-22366268-run
components:
  schemas: {}
  securitySchemes: {}
servers:
  - url: https://checkout-sandbox.payway.com.kh/
    description: StillZeroBug
security: []

```


# FILE: khqr-guideline-3192101f0.md

# KHQR Guideline

## What is ABA KHQR?
A standardized QR code payment system overseen by the National Bank of Cambodia. It facilitates cashless transactions by allowing consumers and businesses to make and receive payments seamlessly using mobile banking apps or e-wallets. The system promotes digital payments, enhances financial inclusion, and ensures interoperability among different banks and payment service providers, making financial transactions more efficient and accessible across the country.

:::highlight red 📌
Merchants who implement KHQR are required to make adjustments or changes upon request by ABA or in compliance with the National Bank of Cambodia's requirements. Failure to do so may result in the suspension or termination of the service.
:::


## Benefits of KHQR

### For Customers:
- No more confusion with multiple QR codes at checkout—just scan a single KHQR code.  
- Simply look for the **KHQR label** when making payments.  
- Use your preferred payment app, including the **Bakong App**, to pay at any location that supports KHQR.  

### For Merchants:
- **Save counter space**—display just one KHQR stand instead of multiple QR labels.  
- **Simple, fast, and secure** payment solution.  
- Accept payments from **anyone and any bank app** without the need for multiple bilateral contracts with different acquirers.


## How to Implement
### Notations Convention
| Abbreviation| Description |
|-------------|-----------------------------------------|
| ans         | Alphanumeric Special. The Alphanumeric Special alphabet includes ninety-six (96) characters in total and includes the numeric alphabet and punctuation. |
| C          | Conditional |
| CDCVM      | Consumer Device Cardholder Verification Method |
| CRC        | Cyclic Redundancy Check |
| ECI        | Extended Channel Interpretation |
| ID         | Identifier of the data object |
| ISO        | International Standards Organization |
| M          | Mandatory |
| N          | Numeric. Values that can be represented by all digits, from "0" to "9". |
| QR Code    | Quick Response Code |
| RFU        | Reserved for Future Use |
| S          | String. Values represented by any precomposed character(s) defined in [Unicode]. |
| Var.       | Variable |
### Data Object
#### Data Objects Under the Root of a QR Code
| Name | ID | Format | Length | Presence | Comment |
|---|---|---|---|---|---|
| Payload Format Indicator | "00" | N | "02" | M |01  |
| Point of Initial Method | "01" | N | "02" | M | - `11` for Static QR (without amount) <br> - `12` for Dynamic QR (with amount) |
| Merchant Account Information | "30" | N | var. up to "99" | M | Provide By ABA |
| Merchant Category Code | "52" | ans |  var. up to "99" | M | At least one Merchant Account Information data object shall be present. |
| Transaction Currency | "53" | N | "03" | M | `116` for KHR, `840` for USD |
| Transaction Amount | "54" | ans | var. up to "13" | C | Do not use decimal places for `KHR` amounts.|
| Country Code | "58" | ans | "02" | M |  |
| Merchant Name | "59" | ans | var. up to "25" | M |The display name shown when a mobile banking app scans the QR. Please ensure it matches the name on your ABA registered profile.  |
| Merchant City | "60" | ans | var. up to "15" | M |Available `Battambang`, `BMC` short cut for *Banteay MeanChey*, `Kampong Cham`, `Kampong Chhnang`, `Kampong Speu`, `Kampong Thom`, `Kandal`, `Kep`, `Koh Kong`, `Kratie`, `Mondolkiri`, `Oddor Meanchey`, `Pailin`, `Pady Paet`, `Phnom Penh`, `Preah Vihear`, `Prey Veng`, `Pursat`, `Ratanakiri`, `Siem Reap`, `Sihanouk Ville`, `Steung Treng`, `Svay Rieng`, `Takeo`, `Tboung Khmum`.
 |
| Additional Data Field Template | "62" | S | var. up to "99" | M | The Additional Data Field Template includes information that may be provided by the Merchant. |
| Additional Data Field | "99" | S | var. up to "99" | M | Additional info used by Bakong.  |
| CRC | "63" | ans | "04" | M | Cyclic Redundancy Check |
#### Data Objects for Additional Data Field Template (ID "62") 
| Name | ID | Format | Length | Presence | Comment |
|---|---|---|---|---|---|
| Merchant Reference Number | "01" | ans | var. up to "25" | M |  |
| PayWay Data Field Template | "68" | S | var. up to "99" | M | Provide By ABA |
### Example
```
00020101021230510016abaakhppxxx@abaa01151250212145328460208ABA Bank52045987530311654031005802KH5925OLD ME 25 CHAR WINNER IP26010Phnom Penh62570115MC-REF-KH-1500068340010PAYWAY@ABA0208104514230604A2279934001317598053453370113175980552533763049FBD

```
#### Data Objects Under the Root of a QR Code

| ID |Sub Tag   | Length |Value                    | Descripiton                    |
| -- | ---------| -------|-------------------------| ------------------------------ |
| 00 |          |02      |01                       | Verstion 1                     |
| 01 |          |02      |12                       | Indicate it's dynamic QR       |
| 30 |          |51      |                         | Merchant info                  |
|    | 00       |16      |abaakhppxxx@abaa         | Acquiring Bakong ID.           |
|    | 01       |15      |125021214532846          | Your MID provided by ABA Bank  |
|    | 02       |08      |ABA Bank                 | Name of acquiring Bank         |
| 52 |          |04      |5987                     | Merchant Category Code         |
| 53 |          |03      |116                      | `KHR` transaction Currency     |
| 54 |          |03      |100                      | Transaction Amount             |
| 58 |          |02      |KH                       | Country Code                   |
| 59 |          |25      |OLD ME 25 CHAR WINNER IP2| Merchant Name                  |
| 60 |          |10      |PHNOM PENH               | Merchant City                  |
| 62 |          |57      |                         | Additional data.               |
|    |01        |15      |MC-REF-KH-15000          | Merchant reference #           |
|    |68        |34      |0010PAYWAY@ABA0208104514230604A227|Provide by ABA Bank    |
| 99 |          |34      |                         | Additional data use by Bakong  |
|    |00        |13      |1759805345337            | Creation timestamp             |
|    |01        |13      |1759805345337            | Expriry timestamp              |
| 63 |          |04      |9FBD                     | CRC                            |



:::highlight red 📌
QR can be paid multiple times.
:::


### Receiving Payment Notification via Webhook
Merchant have to provide the webhook url to PayWay to receive payment notification once the payment is successful paid by the customer. Below is the sample data that will be posted to the webhook.
```json
{
   "transaction_id":"3309DCD5BCB94CBD820046CE9",
   "transaction_date":"2025-10-10 16:03:26",
   "original_currency":"KHR",
   "original_amount":100,
   "bank_ref":"100FT30153179430",
   "apv":"341136",
   "payment_status_code":0,
   "payment_status":"APPROVED",
   "payment_currency":"KHR",
   "payment_amount":100.0,
   "payment_type":"ABA Pay",
   "payer_account":"*898",
   "bank_name":"ABA Bank",
   "merchant_ref":"3309DCD5BCB94CBD820046CE9"
}
```

| Name              | Description                                        |
|-------------------|----------------------------------------------------|
| transaction_id           | Unique transaction ID that generate by PayWay.     |
| merchant_ref      | Information from QR subtag 62.01. |
| datetime          | Date and time of the transaction. |
| bank_ref          | Core banking booking entry |
| status            | `0` represent the success payment |
| description       | Payment status description in word. |
| apv               | Approval code. It has 6 digits length |
| original_amount   | The amount that merchant received |
| original_currency | Merchant currency |
| payment_amount    | Payer payment amount. |
| payment_currency  | Payer payment currency. It can be `KHR` or `USD`. |
| payment_type      | `ABA PAY` or `KHQR` |
| payer_account     | Mask account number of the payer. |
| payer_name        | Payer name. |
| bank_name         | Issuer bank name |


Webhook must use `POST` method, `HTTPS` encryption. 



# FILE: link-account-19336820e0.md

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


# FILE: link-card-19336819e0.md

# Link Card

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/payment-credential/v3/cof/link-card:
    post:
      summary: Link Card
      deprecated: false
      description: >+
        The API returns **HTML**, allowing users to enter their credit/debit
        card details (**Visa, Mastercard, JCB, and UPI**) to link their card to
        your platform. Once the user has completed the linking process,
        **PayWay** will send the account details and token to the merchant via
        the **`callback_url`**.



        <Frame caption="Link Card Flow">
          

        ![Link
        Card.png](https://api.apidog.com/api/v1/projects/831852/resources/374087/image-preview)


        </Frame>




        Refer to the step-by-step integration guide 
        [here](https://developer.payway.com.kh/credentials-on-file-4395178f0.md)
        for detailed instructions.



      tags:
        - Credentials on File
      parameters:
        - name: Content-Type
          in: header
          description: ''
          required: true
          example: multipart/form-data
          schema:
            type: string
      requestBody:
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                request_id:
                  type: string
                  description: >-
                    Your request id. The request id shall be unique from your
                    side. This id will be use to obtain the token details in the
                    future. We only return the last record.  Length from 5 to 24
                    characters long, consisting only of letters (uppercase and
                    lowercase) and numbers, with no special characters or spaces
                    allowed.
                  example: ''
                request_time:
                  type: string
                  description: Request date and time in UTC format as YYYYMMDDHHmmss.
                  example: ''
                merchant_id:
                  type: string
                  description: A unique merchant key which provided by ABA Bank.
                  maxLength: 20
                  example: ''
                ctid:
                  type: string
                  description: >-
                    This is your consumer identification number, which is a
                    unique code used to identify you in the system. The string
                    must be between 5 and 24 characters long and can only
                    contain letters and numbers — no spaces or special
                    characters.
                  example: ''
                token_flag:
                  type: string
                  description: >-
                    Possible value `CITI_FLEX`, `CITO_FLEX`. Make sue the flag
                    is enable on your profile
                  example: ''
                currency:
                  type: string
                  description: >-
                    Transaction currency, the value is based on merchant
                    profile. Possible value `KHR` and `USD`.
                  example: ''
                callback_url:
                  type: string
                  description: >-
                    Once the user links their card, the token details and other
                    important information will be sent to the URL specified
                    here. This field is optional. If left empty, the system will
                    use the `pushback_url` defined in your profile by default.
                    If you choose to provide a custom URL, please ensure that
                    the domain is whitelisted in your merchant profile. Must be
                    base64-encoded.
                  example: ''
                continue_success_url:
                  description: >
                    After linking their card, the user will see a success screen
                    with a **Done** button. Your `continue_success_url` will be
                    embedded in this button. When the user taps **Done**, they
                    will be redirected to your platform.


                    Please ensure that the `continue_success_url` is
                    **base64-encoded**.
                  example: ''
                  type: string
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
                    $callback_url . $request_id . $token_flag . $frequency .
                    $amount . $currency . $continue_success_url ;


                    // Generate the HMAC hash using SHA-512 and encode it in
                    Base64 

                    $hash = base64_encode(hash_hmac('sha512', $b4hash, $api_key,
                    true));

                    ```
                  example: ''
              required:
                - request_id
                - request_time
                - merchant_id
                - ctid
                - token_flag
                - currency
                - hash
            examples: {}
      responses:
        '200':
          description: >-
            Regardless of whether the request is successful or results in an
            error, PayWay will respond with an HTML page. This page can be
            rendered in an iFrame and displayed to the user. If there is an
            error, the user will see a clear error message. If the transaction
            is successful, the page will display a saved card screen, allowing
            customers to securely enter their card details directly on the
            PayWay-hosted screen.
          content:
            text/html:
              schema:
                type: object
                properties: {}
          headers: {}
          x-apidog-name: OK
      security: []
      x-apidog-folder: Credentials on File
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/831852/apis/api-19336819-run
components:
  schemas: {}
  securitySchemes: {}
servers:
  - url: https://checkout-sandbox.payway.com.kh/
    description: StillZeroBug
security: []

```


# FILE: overview-865678m0.md

# Overview

Your go-to place for integrating PayWay APIs into your platform.
Explore detailed guides and references to help you accept secure online payments on your platform with ease.

<h3>Integration Cases </h3>

Before you start integrating, explore these guides to learn how to build common use cases of ABA PayWay.
<Tabs>
  <Tab title="Accept payments">
:::highlight blue 💡
Accept payments for your business with PayWay’s simple and flexible payment solutions
:::
      
      <CardGroup cols={3} >
         
           <Card href="folder-3158159">
<img style = "pointer-events:none;" src="https://api.apidog.com/api/v1/projects/831852/resources/364447/image-preview"></img>

      **Accept online payments on website and mobile app**

Give your customers a fast, secure way to pay online with ABA KHQR, credit/debit cards, WeChat Pay and Alipay
  </Card>
  <Card href="folder-3158158" > 
<img style = "pointer-events:none;" src="https://api.apidog.com/api/v1/projects/831852/resources/352549/image-preview"></img>
      
      
**Display dynamic QR to receive payments on any screen**

Let your customer pay with QR codes by displaying or printing it via third-party systems.
  </Card>
           <Card href="folder-3158157"> 

<img style = "pointer-events:none;" src="https://api.apidog.com/api/v1/projects/831852/resources/352550/image-preview"></img>
**Generate and send payment links using API**

    Get paid faster by creating and sharing payment links from your existing system.

  </Card>
  
</CardGroup>
    
    </Tab>
  <Tab title="Auto-payments">
      
:::highlight blue 💡
Collect payment automatically by storing your customers' ABA accounts or card details for future use.
:::
<CardGroup cols={3}>
      
<Card href="folder-3158155"> 
<img style = "pointer-events:none;" src="https://api.apidog.com/api/v1/projects/831852/resources/352551/image-preview"></img>
**Auto-charge customers for recurring payments**

Automatically charge customers fixed amounts for subscriptions or recurring payments using their stored payment details.
  </Card>

    
<Card href="folder-3158155"> 
<img style = "pointer-events:none;" src="https://api.apidog.com/api/v1/projects/831852/resources/352552/image-preview"></img>               
**Link customer's ABA account or Cards for future payments**

Allow customers to save their ABA accounts or credit/debit cards on your platform for faster checkout in the future.
  </Card>
    
     <Card href="folder-3158155">
<img style = "pointer-events:none;" src="https://api.apidog.com/api/v1/projects/831852/resources/352553/image-preview"></img>    

**Charge your customer automatically at any time**

Easily charge customers on demand at any time with their stored cards or ABA accounts.
  </Card>
</CardGroup>

  </Tab>
     <Tab title="Hold payments">                 
:::highlight blue 💡
Temporarily hold customers' funds and release them later to ensure flexible and secure transactions.
:::
<CardGroup cols={3}>
  <Card href="https://developer.payway.com.kh/3158155f0.md">

<img style = "pointer-events:none;" src="https://api.apidog.com/api/v1/projects/831852/resources/352554/image-preview"></img>       
**Hold customer's payments and charge later**
   
      Keep payments on hold and charge customers when the services are completed.

  </Card>
  <Card href="https://developer.payway.com.kh/pre-auth-3158156f0.md">
<img style = "pointer-events:none;" src="https://api.apidog.com/api/v1/projects/831852/resources/352555/image-preview"></img>        

      **Hold customers' payments, charge later, and payout**
  
      Hold your customer’s payment, settle it, then distribute it among stakeholders
    </Card>
</CardGroup>
  </Tab>
    
    <Tab title="Multi-party payouts">      
:::highlight blue 💡
Automatically split and distribute payments to multiple accounts in real-time.
:::
          <CardGroup cols={3}>
           <Card href="folder-3158153">               
<img style = "pointer-events:none;" src="https://api.apidog.com/api/v1/projects/831852/resources/352556/image-preview"></img>                 
**Initiate payouts at your convenience**

               Send payments to beneficiaries in real-time.
  </Card>             
      <Card href="folder-3158153"> 
<img style = "pointer-events:none;" src="https://api.apidog.com/api/v1/projects/831852/resources/352557/image-preview"></img>               
**Automatically split payments and initiate payouts**
          
Collect a payment and split it among multiple beneficiaries in real-time.
  </Card>              
</CardGroup>

  </Tab>
</Tabs>


<h2>How to start</h2>

<Steps>
  <Step title="Create a sandbox account">
Sign up to get your sandbox account and API keys to test your integration in a secure environment.
**[Sign up](https://sandbox.payway.com.kh/register-sandbox/)** <Icon icon="material-outline-north_east"/>
  </Step>
  <Step title="Start your integration"> 
Use the sandbox API keys sent to your email to begin integrating PayWay into your system. 
      Follow our step-by-step **[integration guides](https://developer.payway.com.kh/overview-865678m0.md)** or try our **[no-code plugins](https://developer.payway.com.kh/plugins-3186291f0.md)** to begin.
  </Step>
  <Step title="Test & go live">
Once you finish the integration, make a test payment on your system to see the result on the sandbox transaction list.
When you're ready to accept real payments, simply **replace your sandbox keys with production keys**.     
      
:::info[]
**Need production credentials?** Please contact our Merchant Acquisition team at paywaysales@ababank.com to get started.
:::
  </Step>
</Steps>



# FILE: payment-19336821e0.md

# Payment

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/payment-gateway/v3/purchase/payment-credential:
    post:
      summary: Payment
      deprecated: false
      description: >+
        This Payment API allows you to initiate transactions using a token. It
        supports the following token types: `CITI_FLEX`, `CITO_FLEX`, and
        `CITR_FIX`.


        <Tabs>
          <Tab title="Unscheduled Payment">
            
        <Frame caption="Unschedule payment flow">



        ![Unscheduled payment with 3DS challenge Flow
        (1).png](https://api.apidog.com/api/v1/projects/831852/resources/374675/image-preview)
              
        </Frame>

          </Tab>
          <Tab title="Schedule Payment">

        <Frame caption="Schedule payment flow">

            
        ![Scheduled
        payment.png](https://api.apidog.com/api/v1/projects/831852/resources/374089/image-preview)

        </Frame>

          </Tab>
         
        </Tabs>






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
                merchant_id:
                  type: string
                  description: A unique merchant key which provided by ABA Bank.
                  maxLength: 20
                  x-apidog-mock: '{{merchant_id}}'
                ctid:
                  type: string
                  description: Your consumer identification number.
                  x-apidog-mock: '{{$string.uuid}}'
                  maxLength: 24
                first_name:
                  type: string
                  description: Buyer's first name.
                  x-apidog-mock: '{{$person.firstName}}'
                  maxLength: 20
                  nullable: true
                last_name:
                  type: string
                  description: Buyer's last name.
                  x-apidog-mock: '{{$person.lastName}}'
                  maxLength: 20
                  nullable: true
                email:
                  type: string
                  description: Buyer's email address.
                  x-apidog-mock: '{{$internet.email}}'
                  maxLength: 50
                  nullable: true
                phone:
                  maxLength: 20
                  type: string
                  description: 'Buyer''s phone #.'
                  x-apidog-mock: '{{$phone.number}}'
                  nullable: true
                amount:
                  type: number
                  description: >-
                    Total purchase amount (excluding shipping fee). For KHR, the
                    amount must be at least 100. For USD, the amount must be at
                    least 0.01.
                  x-apidog-mock: '{{$finance.amount}}'
                  format: double
                currency:
                  type: string
                  description: >-
                    The transaction currency for the payment. Supported values
                    are `KHR` or `USD`. Please ensure that your merchant profile
                    has these currencies enabled.
                  x-apidog-mock: USD
                token_flag:
                  type: string
                  description: >-
                    Supported value `CITU_FLEX`, `MITU_FLEX` and `MITR_FIX`.
                    Make sure your merchant profile enable to support your
                    business cases.
                  x-apidog-mock: CITU_FLEX
                purchase_type:
                  type: string
                  description: >-
                    The type of transaction. The default value is `purchase`.
                    Supported values:

                    - pre-auth : Pre-authorization (for pre-purchase).

                    - purchase : Full purchase transaction.
                  x-apidog-mock: purchase
                  nullable: true
                items:
                  maxLength: 500
                  type: string
                  description: >-
                    A base64-encoded JSON array listing the items included in
                    the transaction.


                    **PHP Sample Code**


                    ```js

                    $item = base64_encode(json_encode([
                        ["name" => "product 1","quantity" => 1,"price" => 1.00], 
                        ["name" => "product 2","quantity" => 2, "price" => 4.00]
                    ]));

                    ```
                  nullable: true
                return_params:
                  maxLength: 500
                  type: string
                  description: >-
                    If you want to include extra data to associate with the
                    transaction and receive it back after payment, you can use
                    the field parameter. Once the payment is completed, this
                    data will be returned in the response.
                  nullable: true
                payout:
                  maxLength: 500
                  type: string
                  description: |
                    Base64-encoded JSON string representing payout details

                    **PHP Sample Code**

                    ```js
                    $payout = base64_encode(json_encode([
                        ["acc" => "000133879","amt"=> 1], 
                        ["acc" => "000133880","amt" => 1]
                    ]));
                    ```
                  nullable: true
                custom_fields:
                  maxLength: 500
                  type: string
                  description: >-
                    Additional information you want to attach to the
                    transaction.

                    This information appears in transaction details, lists, and
                    export reports.

                    Must be base64-encoded JSON.
                  nullable: true
                hash:
                  type: string
                  description: >-
                    **PHP Sample Code**

                    ```js

                    // public key provided by ABA Bank

                    $api_key = "API KEY PROVIDED BY ABA BANK";


                    // Prepare the data to be hashed

                    $b4hash = $request_time . $merchant_id . $tran_id . $amount
                    . $currency . $items . $ctid . $pwt . $first_name .
                    $last_name . $email . $phone . $purchase_type .
                    $callback_url . $custom_fields . $return_params . $payout .
                    $token_flag . $shipping_fee;


                    // Generate the HMAC hash using SHA-512 and encode it in
                    Base64 

                    $hash = base64_encode(hash_hmac('sha512', $b4hash, $api_key,
                    true));

                    ```
                pwt:
                  type: string
                  title: ''
                  description: >-
                    PWT (PayWay Token) is a unique token automatically generated
                    by the PayWay system and is used to complete the purchase.
                tran_id:
                  type: string
                  description: A unique transaction identifier for the payment.
                  x-apidog-mock: '{{$string.uuid}}'
                  maxLength: 20
                shipping_fee:
                  type: number
                  format: double
                  x-apidog-mock: '{{$finance.amount}}'
                  description: Shipping fee. Can be any amount.
                callback_url:
                  type: string
                  description: >-
                    URL to receive callbacks upon payment completion, encrypted
                    with Base64.
              required:
                - amount
                - ctid
                - currency
                - hash
                - merchant_id
                - pwt
                - request_time
                - token_flag
                - tran_id
              x-apidog-orders:
                - request_time
                - merchant_id
                - tran_id
                - ctid
                - pwt
                - first_name
                - last_name
                - email
                - phone
                - amount
                - shipping_fee
                - currency
                - token_flag
                - purchase_type
                - callback_url
                - items
                - return_params
                - payout
                - custom_fields
                - hash
            example:
              purchase_type: purchase
              amount: 0.02
              shipping_fee: 0.02
              ctid: SIDARA
              return_params: eyJBdXRvbWF0aW9uX3JldHVybnBhcmFtIjoiU0lEQVJBIEtIUVIifQ==
              custom_fields: eyJpZF9jYXJ0IjoyMzkxNzMzOSwiQ09NUEFOWSI6IkFVVE9NQVRFUiJ9
              return_deeplink: >-
                IHsiYW5kcm9pZF9zY2hlbWUiOiJ0aWt0b2s6Ly8iLCJpb3Nfc2NoZW1lIjoidGlrdG9rOi8vIn0=
              payout: ''
              last_name: Bora
              tran_id: '5399119569'
              merchant_id: automate_online
              pwt: >-
                6451397B0BC9B09CADBDA8DA17EC11BB87B46185F657272245F8727CC5EA8936C94E807
              request_time: '20250725103323'
              token_flag: CITU_FLEX
              phone: '010417430'
              currency: USD
              items: >-
                W3sibmFtZSI6IkFuZ2tvciBQdXJvIiwicXVhbnRpdHkiOjMsInByaWNlIjoxMDAuMDF9XQ==
              first_name: Thol
              hash: >-
                2QSqdjva5Q+kzPpsKKp2bNCpWeVmUebpLnBjFlYEFoi5gs9vdPUs79FWe9/MnmWNdNQvjrT6aaoUhSJzmikmzQ==
              email: Thol.unreal@ababank.com
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
                        description: '`00` - Success'
                      message:
                        type: string
                        title: ''
                        description: >-
                          Please see the property reponse `code` for the
                          details.
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
                    required:
                      - code
                      - message
                      - trace_id
                x-apidog-orders:
                  - status
              examples:
                '1':
                  summary: Example 1
                  value:
                    status:
                      code: '00'
                      message: Success.
                      trace_id: d79f472376737a997f6ea66d0d8eb045
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
                        description: '`04` - The given data was invalid'
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
          description: ''
          content:
            application/json:
              schema:
                title: ''
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
      x-run-in-apidog: https://app.apidog.com/web/project/831852/apis/api-19336821-run
components:
  schemas: {}
  securitySchemes: {}
servers:
  - url: https://checkout-sandbox.payway.com.kh/
    description: StillZeroBug
security: []

```


# FILE: payment-link-3158157f0.md

# Payment Link

## 1. Introduction
You can manually create a payment link through the ABA PayWay Merchant Portal or the ABA Merchant App. However, we also offer flexibility by allowing you to generate payment links via API, enabling seamless integration with your existing system.

<h3>Why is this beneficial for you?</h3>

Imagine you own an online streaming shop, where customers purchase items during a live stream. Your system automatically responds to customers and requests payment by asking them to transfer funds to your bank account. This manual process can lead to several issues:

1. **Incorrect Account Number**: Buyers might enter the wrong bank account number.
2. **Incorrect Payment Amount**: Buyers may mistakenly transfer the wrong amount.
3. **Manual Verification**: As a merchant, you must carefully verify transactions before shipping products.
4. **Time-Consuming & Inefficient**: The back-and-forth communication delays order processing.

<h3> How does the Payment Link API solve these pain points?</h3>

- You can generate a payment link with the exact amount and automatically share it with the buyer.
- Once the buyer completes the payment, PayWay will notify your system, allowing you to automate the rest of the process effortlessly.


## 2. Integration Steps
:::tip[]
Before you start, make sure you have the following:
- PayWay Sandbox Account – **[Register here](https://sandbox.payway.com.kh/register-sandbox/)** to test transactions.
- Sandbox Merchant ID & API Key—You’ll receive these via email after registering for the sandbox.
:::

<Steps>
  <Step title="Create a payment link">
   To create payment link via API, please refer to this API specification [Create payment link](https://developer.payway.com.kh/create-payment-link-14530837e0.md). Once the payment link is successfully created, it will respond back as a JSON object, and there is a propery `payment_link` represent the full link of the url which you can share with your customer.
      
      **Sample response** 
  ```json
  {
      "data": {
        "id": "UD/8Hl***Ht1xQdhlw==",
        "title": "Test curl 001",
        "image": {
          "image": "",
          "filename": "",
          "size": 0
        },
        "amount": "0.03",
        "currency": "USD",
        "status": "OPEN",
        "description": "Payment link created from curl",
        "payment_limit": 5,
        "total_amount_org": 0,
        "total_refund": 0,
        "total_amount": 0,
        "total_trxn": 0,
        "created_at": "2023-04-13 03:43:30",
        "updated_at": "2023-04-13 03:43:30",
        "expired_date": 1681357409,
        "return_url": "https://domain.com",
        "merchant_ref_no": "ref00001",
        "outlet_id": "xknY***QfbOCJA==",
        "outlet_name": "Book Store",
        "payout": [],
        "payment_link": "https://dpayment-euat.payway.com.kh/JT4630l"
      },
      "status": {
        "code": "00",
        "message": "Success!"
      },
      "tran_id": 1681357410
}
  ```

  </Step>
  <Step title="Handle the payment notification">
   Once a successful payment is made on the payment link, PayWay will send a payment notification through your `return_url`. Your `return_url` shall accept `POST` method and `Content-Type` as `application/json`.
      
      **Sample pushback notification response**
      ```json
      {
          "tran_id": "123456789",
          "status": "00",
          "merchant_ref_no": "ref0001"
      }
      ```
      ------
      **tran_id**  `string` 
      Payment transaction ID generated by the payment gateway.
      
      ---
      **status** `string`
      Status of the request.
      
      ---
      **merchant_ref_no** `string`
      Your payment link reference number.
      
      ---
      
     
To get the details of the payment, use [Check transaction](https://developer.payway.com.kh/check-transaction-14530826e0.md) with the `tran_id` value from the response above.

  </Step>
</Steps>



# FILE: payout-14530816e0.md

# Payout

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/payment-gateway/v2/direct-payment/merchant/payout:
    post:
      summary: Payout
      deprecated: false
      description: >+
        The ABA PayWay Funds Route API provides a seamless solution for
        splitting and distributing payments to third parties, sellers, service
        providers, or your ABA bank accounts.

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
                merchant_id:
                  type: string
                  description: A unique merchant key which provided by ABA Bank.
                  maxLength: 255
                tran_id:
                  type: string
                  description: Unique transaction id
                  maxLength: 20
                beneficiaries:
                  type: string
                  description: >-
                    Payout instruction contains information of the beneficiary.


                    **PHP Sample Code**

                    ```php

                    function opensslEncryption($source, $publicKey)

                    {
                        //Assumes 1024 bit key and encrypts in chunks.
                        $maxlength = 117;
                        $output = '';
                        while ($source) {
                            $input = substr($source, 0, $maxlength);
                            $source = substr($source, $maxlength);
                            openssl_public_encrypt($input, $encrypted, $publicKey);
                            $output .= $encrypted;
                        }
                        return base64_encode($output);
                    }

                    // You can use mixed MID and Account in beneficiary, make
                    sure all of them has the same currency as transaction
                    currency.

                    $beneficiaries_info = json_encode([
                        ['account' => '200030000', 'amount' => 100],
                        ['account' => '012538302', 'amount' => 200],
                    ]);

                    $rsaPublicKey = 'USE YOUR RSA PUBLIC KEY PROVIDED BY ABA';


                    $beneficiaries = opensslEncryption($beneficiaries_info,
                    $rsaPublicKey);

                    ```
                  maxLength: 1000
                amount:
                  type: number
                  description: >-
                    Total payout amount (sum of all beneficiary amount).

                    - `KHR` : The amount must be greater than or equal to 100KHR

                    - `USD` : The amount must be greater than or equal to
                    0.01USD
                  format: float
                currency:
                  type: string
                  description: Transaction currency. Either `KHR` or `USD`.
                  title: ''
                  maxLength: 3
                  minLength: 3
                custom_fields:
                  type: string
                  description: >-
                    An additional field information as JSON string. This
                    information will be associate with the payment transaction.


                    **PHP Sample Code**


                    ```php

                    $custom_fields = json_encode([
                       "Invoice_ID" => "INV-1234",
                       "Province" => "Phnom Penh"
                    ]);

                    ```
                  maxLength: 255
                hash:
                  type: string
                  description: >-
                    Hash hmac sha512 encryption of concatenates values
                    `merchant_id`, `tran_id`, `beneficiaries`, `amount`,
                    `custom_fields` and `currency` with `public_key`.


                    **Here is an example code in PHP**


                    ```php

                    // public key provided by ABA Bank

                    $api_key = "API KEY PROVIDED BY ABA BANK";


                    // Prepare the data to be hashed

                    $b4Hash = $merchant_id . $tran_id . $beneficiaries . $amount
                    . $custom_fields . $currency;


                    // Generate the HMAC hash using SHA-512 

                    $hash = hash_hmac('sha512', $b4Hash, $api_key);

                    ```
                  title: ''
                  maxLength: 512
              required:
                - merchant_id
                - tran_id
                - beneficiaries
                - amount
                - currency
                - hash
              x-apidog-orders:
                - merchant_id
                - tran_id
                - beneficiaries
                - amount
                - currency
                - custom_fields
                - hash
            example:
              merchant_id: EC0001
              tran_id: A17259584044451
              beneficiaries: ElKjECTZK7ym...NX0Dt2dz...
              amount: 3.44
              currency: USD
              custom_fields: >-
                {"timestamp":"2024-08-23
                10:35:55.437","traceId":"63f9645fa3bd8678907ed4c038357385"}
              hash: 3c70c551a...d1092f6e22228a7686c51bc1162a...
      responses:
        '200':
          description: ''
          content:
            application/json:
              schema:
                type: object
                properties:
                  transaction_id:
                    type: string
                    description: Unique transaction id pass from merchant
                  transaction_date:
                    type: string
                    description: The approved date and time of the transaction
                  external_reference:
                    type: string
                    description: >-
                      This is a unique reference booking entry number from core
                      banking system.
                  apv:
                    type: string
                    description: A random 6 digit number generated by payment gateway.
                  transaction_amount:
                    type: number
                    description: Total transaction amount
                    format: double
                  transaction_currency:
                    type: string
                    description: Transaction currencies
                  beneficiaries:
                    type: array
                    items:
                      type: object
                      properties:
                        payout_id:
                          type: string
                          description: A unique id generated by payment gateway.
                        name:
                          type: string
                          description: Beneficiary name
                        mid_acccount:
                          type: string
                          description: >-
                            Indentifier of the beneficiary, it can be either MID
                            represent a merchant or ABA account #.
                        amount:
                          type: number
                          description: Payout amount
                          format: double
                        currency:
                          type: string
                          description: Payout currency. Follow the transaction currency
                      description: Beneficiary object
                      x-apidog-orders:
                        - payout_id
                        - name
                        - mid_acccount
                        - amount
                        - currency
                    description: Array of beneficiary
                  status:
                    type: object
                    properties:
                      code:
                        type: string
                        title: ''
                        description: >-
                          - `0` : Success

                          - `4` : Duplicated Transaction ID

                          - `11` : Something went wrong. Try again or contact
                          the merchant for help

                          - `24` : Can not decrypt data

                          - `25` : Allow maximum 10 beneficiaries per requests

                          - `26` : Invalid Merchant Profile

                          - `36` : Payout account or amount is invalid

                          - `37` : Payout accounts are not in whitelist

                          - `44` : Purchase amount has reached transaction limit

                          - `48` : Something went wrong with requested
                          parameters. Please try again or contact the merchant
                          for help

                          - `70` : Total purchase amount has reached daily
                          limit. Please use difference account

                          - `79` : Payment Rejected!

                          - `80` : Custom fields invalid

                          - `81` : The total amount must be greater than 0.
                          Please double check and try again.

                          - `82` : Invalid transaction currency. We only support
                          USD or KHR. Please double check and try again.

                          - `83` : Transaction is duplicated.

                          - `84` : Unable to access the merchant's account
                          details. Please verify that your settlement account is
                          still active.

                          - `85` : Transaction currency does not match the
                          merchant's currency. Please review your details.

                          - `86` : Unable to debit the merchant's account.

                          - `87` : Unable to retrieve the beneficiary's account
                          details.

                          - `88` : Unable to retrieve the beneficiary's MID
                          details.

                          - `89` : Unable to retrieve the beneficiary's account
                          details.

                          - `90` : The currencies for the merchant and
                          beneficiary do not align. Please review your details.

                          - `91` : Unable to credit the beneficiary's account.

                          - `92` : The total payout amount does not match the
                          total transaction amount. Please review your details.

                          - `93` : Insufficient balance.

                          - `400` : Bad request

                          - `LAM01 ` : Total purchase amount has reached daily
                          limit. Please use difference account

                          - `LAM02 ` : Total purchase amount has reached monthly
                          limit. Please use difference account
                      message:
                        type: string
                        title: ''
                        description: >-
                          The message that associate with the code. Please above
                          code for the details.
                      tran_id:
                        type: string
                        title: ''
                        description: Unique transaction id pass from merchant
                      trace_id:
                        type: string
                        description: >-
                          A unique id generated by payment gateway, we can use
                          this number to trace issue when there is an error.
                    x-apidog-orders:
                      - code
                      - message
                      - tran_id
                      - trace_id
                x-apidog-orders:
                  - transaction_id
                  - transaction_date
                  - external_reference
                  - apv
                  - transaction_amount
                  - transaction_currency
                  - beneficiaries
                  - status
              examples:
                '1':
                  summary: Success
                  value:
                    transaction_id: '172595840773178'
                    transaction_date: '2024-09-10T15:53:27.2157019+07:00'
                    external_reference: 100FT30147412155
                    apv: '328097'
                    transaction_amount: 3.44
                    transaction_currency: USD
                    beneficiaries:
                      - payout_id: '172595842687056'
                        name: ''
                        mid_acccount: '200030000'
                        amount: 1.72
                        currency: USD
                      - payout_id: '172595842679750'
                        name: ''
                        mid_acccount: '012538302'
                        amount: 1.72
                        currency: USD
                    status:
                      code: '0'
                      message: Success!
                      tran_id: '172595840773178'
                      trace_id: e728bf3e95e32e3c97286fc9f8aef82d
                '2':
                  summary: Exception
                  value:
                    status:
                      code: '83'
                      message: Transaction is duplicated
                      tran_id: '172595840773178'
                      trace_id: e728bf3e95e32e3c97286fc9f8aef82d
          headers: {}
          x-apidog-name: OK
      security: []
      x-apidog-folder: Payout
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/831852/apis/api-14530816-run
components:
  schemas: {}
  securitySchemes: {}
servers:
  - url: https://checkout-sandbox.payway.com.kh/
    description: StillZeroBug
security: []

```


# FILE: payout-3158153f0.md

# Payout


## 1. Introduction

A payout refers to the distribution of funds from a business, platform, or payment system to a recipient, such as a vendor, freelancer, or customer. It typically occurs when a company disburses earnings, refunds, commissions, or withdrawals.

PayWay provides two different types of payout services:
1. **Payout**: Distribute fund from your settlement account to recipients.
2. **Split & Payout** : Collect, split and distribute funds of a purchase transaction to  recipients. Split and Payout is available for the following PayWay products:
    1. Checkout
    2. Account on File and Card on file
    3. Payment Link (API Integration Only)
    4. ABA QR API
    5. Pre-auth

## 2. How it works   

### Beneficiary List
Before making a payout to a beneficiary or recipient, you must first add them to your beneficiary list. This ensures that the recipient is registered and eligible to receive payments.  

To add a beneficiary to the list, follow the [Add a beneficiary to whitelist](https://developer.payway.com.kh/add-a-beneficiary-to-whitelist-14530818e0.md) API specification. Once the beneficiary is added, it is automatically **enabled** and can start receiving the payments.  


When using **Payout** or **Split & Payout**, you must include the beneficiary details along with the payout amount in the `payout` instruction parameter. This step ensures that the payment is directed to the correct beneficiary with the specified amount.


If you want to **disable** the beneficiary, follow the [Update a beneficiary status](https://developer.payway.com.kh/update-a-beneficiary-status-14530817e0.md) API specification.


:::tip[]
The beneficiary must be either an **ABA Account holder** or **ABA Merchant**. For ABA account holders, you just need to have their **ABA Account** and for **ABA Merchant**, you need to have their **MID**.
:::


<Tabs>
  <Tab title="Payout">
To distribute funds from your settlement account to beneficiaries, please follow [Payout](https://developer.payway.com.kh/payout-14530816e0.md) API specification.
  </Tab>
  <Tab title="Split and Payout">
    #### **Checkout**
To use payout with a one-time checkout, you need to include the `payout` instruction in the request parameters. Please refer to the [Purchase](https://developer.payway.com.kh/purchase-14530820e0.md) API specification for details. 

#### **Account on File & Card on File**
To use payout with an account on file or card on file, you need to include the `payout` instruction in the request parameters. Please refer to the [Puchase using token](https://developer.payway.com.kh/14530833e0.md) API specification for details.  

#### **Payment Link**
Create a payment link with a `payout` instruction in the request parameters. Please refer to the [Create payment link](https://developer.payway.com.kh/create-payment-link-14530837e0.md) API specification for details.  

Once the customer makes a payment using the payment link, the funds will be split according to the instructions provided during the payment link creation.
    
    
#### **ABA QR API**

To create a QR with a payout, you need to include the `payout` instruction in the request parameters. Please refer to the [QR API](https://developer.payway.com.kh/qr-api-14530840e0.md) specification for details.  

Once the customer makes a payment using the QR, the funds will be split according to the instructions provided during the QR creation.


#### **Pre-auth**
When creating a pre-auth, you don't need to include the `payout` instruction parameter. However, you must include the payout instruction when completing the pre-auth. Please refer to the [complete pre-auth transaction with payout](https://developer.payway.com.kh/complete-pre-auh-transaction-with-payout-14666701e0.md) API specification for details.


  </Tab>
</Tabs>




# FILE: plugins-3186291f0.md

# Checkout Plugins


<CardGroup cols={3}>
       <Card href="doc-902970">
           <img style = "pointer-events:none;" src="https://api.apidog.com/api/v1/projects/831852/resources/361908/image-preview"></img>   
    
    **Shopify**

   Let customers pay directly on your Shopify store.
  </Card>
     <Card href="doc-873826"> 
<img style = "pointer-events:none;" src="https://api.apidog.com/api/v1/projects/831852/resources/379527/image-preview"></img>     
         **Woocommerce**

Let customers pay directly on your Wordpress store.
  </Card>
     <Card href="doc-871485">
<img style = "pointer-events:none;" src="https://api.apidog.com/api/v1/projects/831852/resources/351849/image-preview"></img>      
   
         **Prestashop**

   Let customers pay directly on your Prestashop store.

<TipInfo>
    Deprecated
</TipInfo>

</Card>

     <Card href="odoo-ecommerce-2113617m0">
<img style = "pointer-events:none;" src="https://api.apidog.com/api/v1/projects/831852/resources/379526/image-preview"></img>      
   

         **Odoo eCommerce**

   Let your customers pay directly on your Odoo eCommerce store.
  </Card>
</CardGroup>




# FILE: pre-auth-3158156f0.md

# Pre-auth

## 1. Introduction

Pre-auth (**pre-authorization**) is a **temporary hold** placed on a customer’s funds to confirm they have enough money for a transaction. The money is **not immediately deducted**, but it is reserved for potential payment. Later, the merchant can either **capture** the amount (finalize the charge) or **release** it (cancel the hold).  

It’s commonly used in **hotels, car rentals, gas stations, and online payments** where the final amount may change before the transaction is completed.  

**Think of it like a security deposit**—the money is set aside but not actually spent until the final charge is confirmed.

## 2. Integration Steps
:::tip[]
Before you start, make sure you have the following:
- PayWay Sandbox Account – **[Register here](https://sandbox.payway.com.kh/register-sandbox/)** to test transactions.
- Sandbox Merchant ID & API Key—You’ll receive these via email after registering for the sandbox.
:::
<Steps>
  <Step title="Create pre-auth transaction">
      
<Tabs>
  <Tab title="Checkout API">
     Please follow [Purchase](https://developer.payway.com.kh/purchase-14530820e0.md) API specification. 
      - Set `type` of the requst to `pre-auth`
      - Supported payment methods: ABA PAY, KHQR, Credit/Debit Card (Vsia, Mastercard, JCB, UPI)
  </Tab>
  <Tab title="Purchase with AoC/CoF Token">
    Please follow [Puchase using token](https://developer.payway.com.kh/14530833e0.md) API specification
  </Tab>

</Tabs>

      
      
   
  </Step>
  <Step title="Complete pre-auth">
      
      
<Tabs>
  <Tab title="Without payout">
      To complete pre-auth **without payout** please follow [Complete pre-purchase transaction](https://developer.payway.com.kh/complete-pre-auth-transactions-14530835e0.md) API specification.
  </Tab>
  <Tab title="With payout">
      To complete pre-auth **with payout** please follow [Complete pre-auh transaction with payout](https://developer.payway.com.kh/complete-pre-auh-transaction-with-payout-14666701e0.md)  API specification.
  </Tab>
</Tabs>

  
  </Step>
  <Step title="Cancel pre-auth">
    To cancel pre-auth please follow [Cancel pre-purchase transaction](https://developer.payway.com.kh/cancel-pre-purchase-transaction-14530836e0.md) API specification.
  </Step>
</Steps>



:::caution[]
If don't cancel or complete pre-auth transaction within 30 days (default value), the transaction will automatically cancel. The fund will be return back to the payer.
:::




# FILE: purchase-14530820e0.md

# Purchase

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/payment-gateway/v1/payments/purchase:
    post:
      summary: Purchase
      deprecated: false
      description: >-
        The Purchase API is used to initiate a payment transaction between a
        customer and a merchant through PayWay. It allows merchants to request a
        payment by providing transaction details such as the amount, currency,
        item list, and other relevant data.


        Once the API is called, the customer is redirected to PayWay’s hosted
        checkout page, bottom sheet, or modal popup—depending on your
        integration option—where they can complete the payment using the
        available methods (e.g., card, ABA PAY, KHQR, digital wallets). After
        the transaction is completed, PayWay will return the transaction result
        to the merchant via the configured return URL or callback.
      tags:
        - Ecommerce Checkout
      parameters:
        - name: Content-Type
          in: header
          description: ''
          required: true
          example: multipart/form-data
          schema:
            type: string
      requestBody:
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                req_time:
                  description: Request date and time in UTC format as YYYYMMDDHHmmss.
                  example: ''
                  type: string
                merchant_id:
                  type: string
                  maxLength: 30
                  description: A unique merchant key which provided by ABA Bank.
                  example: ''
                tran_id:
                  type: string
                  maxLength: 20
                  description: A unique transaction identifier for the payment.
                  example: ''
                firstname:
                  type: string
                  maxLength: 100
                  description: Buyer's first name.
                  example: ''
                lastname:
                  type: string
                  maxLength: 100
                  description: Buyer's last name.
                  example: ''
                email:
                  type: string
                  maxLength: 50
                  description: Buyer's email.
                  example: ''
                phone:
                  type: string
                  maxLength: 20
                  description: Buyer's phone.
                  example: ''
                type:
                  type: string
                  maxLength: 20
                  description: >-
                    Type of the transaction, default value is `purchase`.
                    Supported value:

                    - `pre-auth` : for pre purchase

                    - `purchase` : for full purchase


                    Note: pre-auth only support ABA PAY, KHQR and Card Payment.
                  example: ''
                payment_option:
                  type: string
                  maxLength: 20
                  description: >-
                    **Payment Methods for Transactions:**  


                    - **`cards`**: For card payments.  

                    - **`abapay_khqr`**: QR payment that can be scanned and paid
                    using ABA PAY and other KHQR member banks.

                    - **`abapay_khqr_deeplink`**: Allows customers to pay using
                    **ABA PAY** and other **KHQR member banks**. The payment
                    gateway will respond with a JSON object containing
                    `qr_string`, `abapay_deeplink`, and `checkout_qr_url`. See
                    the sample response in the response section below.  

                    - **`alipay`**: Allows customers to pay using **Alipay
                    Wallet**.  

                    - **`wechat`**: Allows customers to pay using **WeChat
                    Wallet**.  

                    - **`google_pay`**: Allows customers to pay using **Google
                    Pay Wallet**.  


                    If no value is provided, the payment gateway will
                    automatically display the supported payment options based on
                    your profile, allowing the customer to choose a preferred
                    payment method.
                  example: ''
                items:
                  type: string
                  maxLength: 500
                  description: >
                    A base64-encoded JSON array describing the items being
                    purchased.


                    **Note: This is only description/remark.  The price or
                    quantity in this info will not be used for calculation or
                    any validation purposes**


                    **PHP Sample Code**


                    ```php

                    $item = base64_encode(json_encode([
                        ["name" => "product 1","quantity" => 1,"price" => 1.00], 
                        ["name" => "product 2","quantity" => 2, "price" => 4.00]
                    ]));

                    ```
                  example: ''
                shipping:
                  type: number
                  description: Shipping fee.
                  example: 0
                amount:
                  type: number
                  description: Purchase amount.
                  example: 0
                currency:
                  description: >-
                    Transaction currency of the payment. If you don't pass any
                    value, it will take default value from your merchant profile
                    (the first account's the currency of the first account you
                    registered). Supported values are `KHR` or `USD`.
                  example: ''
                  type: string
                return_url:
                  description: >-
                    URL to receive callbacks upon payment completion, encrypted
                    with Base64.
                  example: ''
                  type: string
                cancel_url:
                  description: >-
                    The URL to redirect to after the user closes the payment
                    dialog or when user cancel the payment.
                  example: ''
                  type: string
                skip_success_page:
                  type: integer
                  description: >-
                    Skip success page can be configure on checkout service
                    level. We also provide option via the API for you to
                    override the setting too. If you don't pass this param, it
                    will follow the configuration on the profile level.
                    Supported value:

                    - `0` : Don't skip success pages

                    -  `1`: Skip success page.


                    Once you skipe success page, `continue_success_url` on
                    profile level will be used to redirect user to the specific
                    location if you don't pass value of continue_success_url in
                    the request.
                  example: 0
                continue_success_url:
                  description: The URL to redirect to after a successful payment.
                  example: ''
                  type: string
                return_deeplink:
                  description: >-
                    The deep link for redirecting to the app after a successful
                    payment from ABA Mobile. Must be base64-encoded and include
                    both iOS and Android schemes. This field is mandatory for
                    mobile integration.


                    **PHP Sample Code**


                    ```php

                    $return_deeplink =base64_encode(json_encode([
                        "ios_scheme" => "DEEPLINK TO RETURN TO YOUR IOS APP",
                        "android_scheme" => "DEEPLINK TO RETURN TO YOUR ANDROID APP"
                    ]));

                    ```
                  example: ''
                  type: string
                custom_fields:
                  description: >
                    Additional information that you want to attach to the
                    transaction. This information will appear in the transaction
                    list, transaction details and export report. It's
                    base64-encoded JSON info.


                    **PHP Sample Code**


                    ```php

                    $custom_field = base64_encode(json_encode([
                        "field1" => "myvalue1",
                        "field2" => "myvalue2"
                    ]));

                    ```
                  example: ''
                  type: string
                return_params:
                  description: >-
                    Information to include when PayWay calls your return URL
                    after a successful payment.
                  example: ''
                  type: string
                view_type:
                  description: >-
                    Defines the view type for the payment page.

                    - `hosted_view` : redirect payer to a new tab

                    - `popup` : Display as a **bottom sheet** on mobile web
                    browsers and as a **modal popup** on desktop web browsers.
                  example: ''
                  type: string
                payment_gate:
                  type: integer
                  description: >-
                    If your merchant profile also supports the **QR Payment
                    API** service, please set this parameter to `0` to use the
                    Checkout service.
                  example: 0
                payout:
                  description: |-
                    Base64-encoded JSON string representing payout details.

                    **PHP Sample Code**
                    ```php
                    $payout = base64_encode(json_encode([
                        ["acc" => "000133879","amt"=> 1], 
                        ["acc" => "000133880","amt" => 1]
                    ]));
                    ```
                  example: ''
                  type: string
                additional_params:
                  description: >-
                    Currently, we support WeChat Mini Program. These are the
                    values key `wechat sub_appid` and `wechat_sub_openid`.


                    **PHP Sample Code**


                    ```php

                    $additional_params = base64_encode(json_encode([
                        'wechat_sub_appid' => 'YOUR WECHAT APP ID',
                        'wechat_sub_openid' => 'YOUR WECHAT OPEN ID'
                    ]));

                    ```
                  example: ''
                  type: string
                lifetime:
                  type: integer
                  description: >-
                    The payment's lifetime in minutes, once it exceeds customer
                    will not allow to make payment.  Default value is 30 days.

                    - Min: 3 mins

                    - Max: 30 days


                    - For ABA PAY or Card: Transaction will not go throught.

                    - KHQR: In case payment happen after exceed life time,
                    PayWay will also reject. Fund will be reverse back to payer.

                    - WeChat & Alipay: No reversal.
                  example: 0
                google_pay_token:
                  description: >-
                    This field is required if `payment_option` is set to
                    `google_pay` and the payment selection is managed by the
                    merchant. For detailed instructions, please refer to the
                    [Google Pay](https://developer.payway.com.kh/878723m0.md)
                    integration guidelines.
                  example: ''
                  type: string
                hash:
                  description: >-
                    Base64 encode of hash hmac sha512 encryption of concatenates
                    values below values.


                    **PHP Sample Code**

                    ```php

                    // public key provided by ABA Bank

                    $api_key = "API KEY PROVIDED BY ABA BANK";


                    // Prepare the data to be hashed

                    $b4hash = $req_time . $merchant_id . $tran_id . $amount .
                    $items . $shipping . $firstname . $lastname . $email .
                    $phone . $type . $payment_option . $return_url . $cancel_url
                    . $continue_success_url . $return_deeplink . $currency .
                    $custom_fields . $return_params . $payout . $lifetime .
                    $additional_params . $google_pay_token .$skip_success_page;



                    // Generate the HMAC hash using SHA-512 and encode it in
                    Base64 

                    $hash = base64_encode(hash_hmac('sha512', $b4hash, $api_key,
                    true));

                    ```
                  example: ''
                  type: string
              required:
                - req_time
                - merchant_id
                - tran_id
                - amount
                - hash
            examples: {}
      responses:
        '200':
          description: ''
          content:
            '*/*':
              schema:
                type: object
                properties:
                  01JME5PQCH7BA4JH9V9C51N1FV:
                    type: string
                x-apidog-orders:
                  - 01JME5PQCH7BA4JH9V9C51N1FV
                required:
                  - 01JME5PQCH7BA4JH9V9C51N1FV
              examples:
                '1':
                  summary: Success
                  value: >-
                    <!DOCTYPE html>

                    <html data-capo="">

                    <head>

                    <meta charset="utf-8">

                    <meta name="viewport" content="width=device-width,
                    initial-scale=1.0, maximum-scale=1.0, user-scalab

                    <title>PayWay - Checkout</title>

                    ...

                    </head>

                    <body>

                    ...

                    </body>

                    </html>
                '2':
                  summary: Success
                  value: |-
                    {
                        "status": {
                            "code": "00",
                            "message": "Success!",
                            "tran_id": "trx-20201019130949"
                        },
                        "qr_string": "00020101021230510016abaakhppxxx@abaa01153250212100849350208ABA Bank520410165...",
                        "abapay_deeplink": "abamobilebank://ababank.com?type=payway&qrcode=00020101021230510016...",
                        "checkout_qr_url": "https://checkout-uat.payway.com.kh/eyJzdGF0dXMiOnsiY29kZSI6IjAwIiw..."
                    }
          headers: {}
          x-apidog-name: Success
        x-200:OK:
          description: ''
          content:
            application/json:
              schema:
                title: ''
                type: object
                properties:
                  status:
                    type: object
                    properties:
                      code:
                        type: string
                      message:
                        type: string
                      tran_id:
                        type: string
                    x-apidog-orders:
                      - code
                      - message
                      - tran_id
                    description: status
                    required:
                      - code
                      - message
                      - tran_id
                  qr_string:
                    type: string
                  abapay_deeplink:
                    type: string
                  checkout_qr_url:
                    type: string
                x-apidog-orders:
                  - status
                  - qr_string
                  - abapay_deeplink
                  - checkout_qr_url
                required:
                  - status
                  - qr_string
                  - abapay_deeplink
                  - checkout_qr_url
          headers: {}
          x-apidog-name: OK
        'x-200:Exception ':
          description: ''
          content:
            application/json:
              schema:
                title: ''
                type: object
                properties:
                  status:
                    type: object
                    properties:
                      code:
                        type: integer
                        description: >
                          - `0` : Success  

                          - `1` : Wrong hash  

                          - `2` : Invalid transaction ID  

                          - `3` : Invalid transaction amount  

                          - `4` : Duplicated transaction ID  

                          - `5` : Transaction not found  

                          - `6` : Requested domain is not in whitelist  

                          - `7` : Wrong return param  

                          - `8` : Something went wrong while saving data. Please
                          try again later or contact merchant for help.  

                          - `10` : Wrong shipping price  

                          - `11` : Something went wrong. Try again or contact
                          the merchant for help.  

                          - `12` : Payment currency is not allowed  

                          - `13` : Invalid items  

                          - `14` : Invalid credit multi acc  

                          - `15` : Invalid or missing channel values from smart
                          merchant  

                          - `16` : Invalid first name. It must not contain
                          numbers or special characters or not more than 100
                          characters.  

                          - `17` : Invalid last name. It must not contain
                          numbers or special characters or not more than 100
                          characters.  

                          - `18` : Invalid phone number  

                          - `19` : Invalid email  

                          - `20` : Something went wrong. Please contact
                          merchant.  

                          - `21` : End of API lifetime  

                          - `22` : Pre-auth transaction is not enabled  

                          - `23` : Selected payment option is not enabled for
                          this merchant profile  

                          - `24` : Cannot decrypt data  

                          - `25` : Allow maximum 10 payout per requests  

                          - `26` : Invalid merchant profile  

                          - `27` : Invalid ctid  

                          - `28` : Invalid pwt  

                          - `29` : Invalid pwt or ctid  

                          - `30` : Merchant is not enabled COF  

                          - `31` : Unsecure 3Ds page  

                          - `33` : Cannot identify cardOrigin  

                          - `34` : Exchange rate data is invalid  

                          - `35` : Payout info is invalid  

                          - `36` : Payout account or amount is invalid  

                          - `37` : Payout accounts are not in whitelist  

                          - `38` : Payout contain invalid transaction ID  

                          - `39` : Payout contain duplicated account  

                          - `40` : Payout contain duplicated transaction ID  

                          - `41` : Payout info contain mid not link with any
                          merchant profile  

                          - `42` : Payout info contain account invalid status  

                          - `43` : Merchant profile's MID is missing. Please try
                          again or contact merchant for help.  

                          - `44` : Purchase amount has reached transaction
                          limit  

                          - `45` : Purchase with zero amount is not allowed  

                          - `46` : Purchase amount for KHR currency could not
                          contain decimal place  

                          - `47` : KHR amount must be greater than 100 KHR  

                          - `48` : Something went wrong with requested
                          parameters. Please try again or contact merchant for
                          help.  

                          - `49` : Invalid start date  

                          - `50` : Invalid end date  

                          - `51` : Invalid date range  

                          - `52` : Maximum date range is allowed only 3 days  

                          - `53` : Invalid amount range  

                          - `54` : Transaction is expired. Please try again or
                          contact the merchant for help.  

                          - `55` : We are unable to request QR from Wechat
                          system. Please try again or contact merchant for
                          help.  

                          - `56` : We are unable to validate your transaction
                          with Wechat system. Please try again or contact
                          merchant for help.  

                          - `57` : We are unable to validate your card source.
                          Please try again or contact merchant for help.  

                          - `58` : Provide invalid card number  

                          - `59` : Payout info can not be fixed with MID and ABA
                          account  

                          - `60` : Something went wrong with QR String. Please
                          try again or contact merchant for help.  

                          - `61` : Something went wrong. Please try again or
                          contact merchant for help.  

                          - `62` : QR is already in used  

                          - `63` : Transaction is already exist in core banking.
                          Please perform new transaction or contact merchant for
                          help.  

                          - `64` : Payer's account is same as merchant profile's
                          account. Please choose different account.  

                          - `65` : Merchant profile's MID is not found in core
                          banking. Please try again or contact merchant for
                          help.  

                          - `66` : Something went wrong. Please try again or
                          contact merchant for help.  

                          - `67` : QR on invoice is currently not available for
                          this merchant profile.  

                          - `68` : Transaction is expired. Please re-initiate
                          the transaction.  

                          - `69` : Transaction lifetime can not be less than 3
                          minutes.  

                          - `70` : Total purchase amount has reached daily
                          limit. Please use difference account.  

                          - `71` : Payout for card payment is not allowed to ABA
                          account.  

                          - `72` : The merchant profile cannot accept payment
                          because its settlement account is closed.  

                          - `73` : Invalid transaction status  

                          - `74` : Invalid tran_id or merchant_id  

                          - `75` : tran_id not found  

                          - `76` : Invalid additional parameters  

                          - `77` : Merchant transactions do not support
                          transaction fees  

                          - `78` : Card payout transactions are not compatible
                          with the discount program.  

                          - `79` : Payment token missing in Google Pay  

                          - `80` : Failed to decrypt the payment token provided
                          by Google Pay  

                          - `81` : The return URL is not in the whitelist  

                          - `82` : The payout has exceeded the maximum allowable
                          amount per transaction  

                          - `83` : Payment credential is disabled  

                          - `84` : Payment credential is expired  

                          - `85` : Purchase reach limit amount per transaction  

                          - `86` : Unsupported merchant purchase mode  

                          - `87` : Payment credential is removed  

                          - `200` : Payment was canceled  

                          - `201` : Payment was declined  

                          - `401` : Unauthorized access  

                          - `403` : Something went wrong. Try again or contact
                          the merchant for help.  

                          - `429` : Too many request, please try again in
                          1min.  

                          - `503` : System under maintenance  
                      message:
                        type: string
                        description: refer to `code` for response message
                    x-apidog-orders:
                      - code
                      - message
                    description: status
                    required:
                      - code
                      - message
                x-apidog-orders:
                  - status
                required:
                  - status
          headers: {}
          x-apidog-name: 'Exception '
      security: []
      x-apidog-folder: Ecommerce Checkout
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/831852/apis/api-14530820-run
components:
  schemas: {}
  securitySchemes: {}
servers:
  - url: https://checkout-sandbox.payway.com.kh/
    description: StillZeroBug
security: []

```


# FILE: qr-api-14530840e0.md

# QR API

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/payment-gateway/v1/payments/generate-qr:
    post:
      summary: QR API
      deprecated: false
      description: |-
        - Support both online/instore merchant
        - Supported payment options
            - Transaction currency KHR: ABA PAY, KHQR
            - Transaction curency USD: ABA PAY, KHQR, WeChat and Alipay
      tags:
        - ABA QR API
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
                  description: Request date and time in UTC format as YYYYMMDDHHmmss.
                merchant_id:
                  type: string
                  description: A unique merchant key which provided by ABA Bank.
                  maxLength: 30
                  x-apidog-mock: keng.dara.online
                tran_id:
                  type: string
                  description: >-
                    This is the unique transaction ID that identifies the
                    transaction. 
                  maxLength: 20
                first_name:
                  type: string
                  description: Payer's first name.
                  maxLength: 20
                last_name:
                  type: string
                  description: Payer's last name.
                  maxLength: 20
                email:
                  type: string
                  description: Payer's email address.
                  maxLength: 50
                phone:
                  type: string
                  description: Payer's phone number.
                  maxLength: 20
                amount:
                  type: number
                  description: >-
                    The total transaction amount must be at least **100 KHR** or
                    **0.01 USD** and cannot be null.
                  x-apidog-mock: '0.01'
                currency:
                  type: string
                  description: >-
                    Supported transaction currencies: `KHR` and `USD`. Not
                    case-sensitive.
                  maxLength: 3
                purchase_type:
                  type: string
                  maxLength: 20
                  description: >-
                    Supported values: `pre-auth` and `purchase`. If the merchant
                    does not provide a value, the default will be `purchase`.


                    Note: Alipay & WeChat do not support pre-auth.
                payment_option:
                  type: string
                  maxLength: 20
                  description: >
                    Supported  payment options:

                    - `abapay_khqr` : Payway will response ABA KHQR.

                    - `wechat` : PayWay will respond with a WeChat QR (only for
                    USD transactions).

                    - `alipay` : PayWay will respond with an Alipay QR (only for
                    USD transactions).
                  x-apidog-mock: abapay_khqr
                items:
                  type: string
                  maxLength: 500
                  description: >+
                    Item list description in Base64-encoded JSON format. Maximum
                    of 10 items.


                    **Note: This is only description/remark. The price or
                    quantity in this info will not be used for calculation or
                    any validation purposes**


                    **PHP Sample Code**

                    ```php

                    $items = base64_encode('[
                        {"name":"Item 1","quantity":1,"price":1.00},
                        {"name":"Item 2","quantity":1,"price":4.00}
                    ]');

                    ```

                  x-apidog-mock: >-
                    W3sibmFtZSI6IicgVU5JT04gU0VMRUNUIG51bGwsIHZlcnNpb24oKSwgbnVsbCAtLSIsInF1YW50aXR5IjozLCJwcmljZSI6MTAwLjAxfV0=
                callback_url:
                  type: string
                  maxLength: 255
                  description: >-
                    URL to receive callbacks upon payment completion, encrypted
                    with Base64.


                    **PHP Sample Code**


                    ```php

                    $callback_url = base64_encode('YOUR CALL BACK URL');

                    ```
                return_deeplink:
                  type: string
                  maxLength: 255
                  description: >-
                    **PHP Sample Code**


                    ```php

                    $return_deeplink = base64_encode('{"android_scheme": "{YOUR
                    ANDROID SCHEME}", "ios_scheme":"{YOUR IOS SCHEME}"}');

                    ```
                  x-apidog-mock: >-
                    IHsiYW5kcm9pZF9zY2hlbWUiOiJ0aWt0b2s6Ly8iLCJpb3Nfc2NoZW1lIjoidGlrdG9rOi8vIn0=
                custom_fields:
                  type: string
                  maxLength: 255
                  description: >-
                    Additional custom fields to attach to the QR, encrypted with
                    Base64.


                    **PHP Sample Code**


                    ```php

                    $custom_fields = base64_encode('{"Province":"ABC",
                    "Province": "Male" }');

                    ```
                  x-apidog-mock: eyJpZF9jYXJ0IjoyMzkxNzMzOX0=
                return_params:
                  type: string
                  description: >-
                    Additional information to include in the pushback once the
                    payment is completed.


                    **PHP Sample Code**


                    ```php

                    $return_params = '{"key_1": "Value 1","key_2": "Value 2"}';

                    ```
                  x-apidog-mock: eyJBdXRvbWF0aW9uX3JldHVybnBhcmFtIjoiU0lEQVJBIEtIUVIifQ==
                payout:
                  type: string
                  maxLength: 255
                  description: |
                    Payout instructions in a Base64-encoded JSON string.

                    **PHP Sample Code**

                    ```php
                    $payout = base64_encode('[
                        {"account":"201030101","amount":1.72},
                        {"account":"012538302","amount":1.72}
                    ]');
                    ```
                lifetime:
                  type: integer
                  description: |-
                    Transaction lifetime in minutes. Default: 30 days. 
                    - Minimum: 3 mins
                    - Maximum: 120 days
                qr_image_template:
                  type: string
                  description: >-
                    The QR image comes with various options to suit your needs.
                    Please refer to the link below for details
                    **[templates](https://developer.payway.com.kh/aba-qr-api-3158158f0.md#3-integration-steps)**.
                  maxLength: 20
                  x-apidog-mock: template3_color
                hash:
                  type: string
                  description: >-
                    Base64 encode of hash hmac sha512 encryption of concatenated
                    values
                    `req_time`,`merchant_id`,`tran_id`,`amount`,`items`,`first_name`,`last_name`,`email`,`phone`,`purchase_type`,`payment_option`,`callback_url`,`return_deeplink`,`currency`,`custom_fields`,`return_params`,`payout`,`lifetime`,
                    and `qr_image_template`



                    **PHP Sample Code**


                    ```php

                    // public key provided by ABA Bank

                    $api_key = 'API KEY PROVIDED BY ABA BANK';


                    // Prepare the data to be hashed

                    $b4hash = $req_time . $merchant_id . $tran_id . $amount .
                    $items . $first_name . $last_name+ email

                    . $phone . $purchase_type . $payment_option . $callback_url
                    . $return_deeplink . $currency .

                    $custom_fields . $return_params . $payout . $lifetime .
                    $qr_image_template;


                    // Generate the HMAC hash using SHA-512 and encode it in
                    Base64 

                    $hash = base64_encode(hash_hmac('sha512', $b4hash, $api_key,
                    true));

                    ```
              x-apidog-orders:
                - req_time
                - merchant_id
                - tran_id
                - first_name
                - last_name
                - email
                - phone
                - amount
                - currency
                - purchase_type
                - payment_option
                - items
                - callback_url
                - return_deeplink
                - custom_fields
                - return_params
                - payout
                - lifetime
                - qr_image_template
                - hash
              required:
                - req_time
                - merchant_id
                - tran_id
                - payment_option
                - amount
                - lifetime
                - qr_image_template
                - hash
                - currency
            example:
              req_time: '20250312095439'
              merchant_id: keng.dara.online
              tran_id: '20250311033231'
              first_name: ABA
              last_name: Bank
              email: aba.bank@gmail.com
              phone: '012345678'
              amount: 0.01
              purchase_type: purchase
              payment_option: abapay_khqr
              items: >-
                W3sibmFtZSI6IicgVU5JT04gU0VMRUNUIG51bGwsIHZlcnNpb24oKSwgbnVsbCAtLSIsInF1YW50aXR5IjozLCJwcmljZSI6MTAwLjAxfV0=
              currency: USD
              callback_url: aHR0cHM6Ly9hcGkuY2FsbGJhY2suY29tL25vdGlmeQ==
              return_deeplink: null
              custom_fields: null
              return_params: null
              payout: null
              lifetime: 6
              qr_image_template: template3_color
              hash: ZyDmMe/kznbY2e...ZB6tMnqv57V06T13du8807dcbPTg==
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
                        description: >
                          Possible response codes:


                          - `0` : Success.

                          - `1` : Wrong Hash.

                          - `6` : Requested Domain is not in whitelist.

                          - `8` : Something went wrong. Please reach out to our
                          digital support team for assistance

                          - `12` : Payment currency is not allowed.

                          - `16` : Invalid First Name. It must not contain
                          numbers or special characters or not more than 100
                          characters.

                          - `17` : Invalid Last Name. It must not contain
                          numbers or special characters or not more than 100
                          characters.

                          - `18` : Invalid Phone Number.

                          - `19` : Invalid Email.

                          - `21` : End of API lifetime.

                          - `23` : Selected Payment Option is not enabled for
                          this Merchant Profile.

                          - `32` : Service is not enable.

                          - `35` : Payout Info is invalid.

                          - `44` : Purchase amount has reached transaction
                          limit.

                          - `47` : KHR Amount must be greater than 100 KHR.

                          - `48` : Something went wrong with requested
                          parameters. Please try again or contact the merchant
                          for help.

                          - `96` : Invalid merchant data

                          - `102` : The URL is not in the whitelist.

                          - `403` : Duplicated Transaction ID

                          - `429` : You've reached the maximum attempt limit.
                          Please try again in (min)
                      message:
                        type: string
                        description: >-
                          Please see the property reponse `code` for the
                          details.
                      trace_id:
                        type: string
                        description: >-
                          A unique identifier assigned to a request to help
                          track its journey through a system
                    x-apidog-orders:
                      - code
                      - message
                      - trace_id
                    required:
                      - code
                      - message
                      - trace_id
                  amount:
                    type: number
                    description: Transaction amount.
                  abapay_deeplink:
                    type: string
                    description: >-
                      ABA Mobile Deeplink. You can use this deeplink to
                      automatically open ABA Mobile so that customer can confim
                      payment.
                  app_store:
                    type: string
                    description: >-
                      If you try to open `abapay_deeplink` and the payer does
                      not have ABA Mobile installed, you can redirect the user
                      to the app store to download ABA Mobile.
                  play_store:
                    type: string
                    description: >-
                      If you try to open `abapay_deeplink` and the payer does
                      not have ABA Mobile installed, you can redirect the user
                      to the play store to download ABA Mobile.
                  currency:
                    type: string
                    description: Transaction currency.
                  qrString:
                    type: string
                    description: QR conent as string
                  qrImage:
                    type: string
                    description: QR as base64 image.
                x-apidog-orders:
                  - qrString
                  - qrImage
                  - abapay_deeplink
                  - app_store
                  - play_store
                  - amount
                  - currency
                  - status
                required:
                  - status
                  - amount
                  - qrString
                  - qrImage
                  - abapay_deeplink
                  - app_store
                  - play_store
                  - currency
              example:
                qrString: >-
                  00020101021230510016abaakhppxxx@abaa01151250212145328460208ABA
                  Bank52048249530384054040.015802KH5925OLD ME 25 CHAR WINNER IP
                qrImage: >-
                  data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAACgCAYAAACLz2ctAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAOC0lEQVR4nO2deahV1RfHl6ZlaaZ
                abapay_deeplink: >-
                  abamobilebank://ababank.com?type=payway&qrcode=00020101021230510016abaakhppxxx%40abaa01151250212145328460208ABA+Bank5
                app_store: >-
                  https://itunes.apple.com/al/app/aba-mobile-bank/id968860649?mt=8
                play_store: >-
                  https://play.google.com/store/apps/details?id=com.paygo24.ibank
                amount: 0.01
                currency: USD
                status:
                  code: '0'
                  message: Success.
                  trace_id: b9f93f45b49f08e26dfcfb8c2da396c6
          headers: {}
          x-apidog-name: Success
      security: []
      x-apidog-folder: ABA QR API
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/831852/apis/api-14530840-run
components:
  schemas: {}
  securitySchemes: {}
servers:
  - url: https://checkout-sandbox.payway.com.kh/
    description: StillZeroBug
security: []

```


# FILE: refund-api-14530821e0.md

# Refund API

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/merchant-portal/merchant-access/online-transaction/refund:
    post:
      summary: Refund API
      deprecated: false
      description: >+
        You can use the Refund API to issue full or partial refunds within 30
        days after the transaction was created. ABA PAY and KHQR refunds is
        immediate, while Card, WeChat, and Alipay refunds follow your agreement
        with PayWay. This API works both for instore transaction and online
        transaction.

        <p>


        - **Eligible Transactions**: Only transactions with a status of
        COMPLETED can be refunded.

        - **Time Frame**: Refunds must be requested within 30 days of the
        payment created date.

        - **Pending Settlements**: Refunds can be issued even if the settlement
        is still pending (Alipay, WeChat, Card).

        - **Partial Refunds**: Multiple partial refunds can be issued until the
        total amount paid is refunded.

        - **Rate limit**: Request limit 500 reqeusts/second.

        - **Refund Enablement**: The outlet/terminal must have the refund
        feature enabled to allow refunds.


        </p>

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
                    The JSON-encoded object containing `mc_id`, `tran_id`, and
                    `refund_amount` using RSA public key encryption in chunks.
                    The encrypted data is then concatenated and encoded in
                    Base64 format.


                    ---

                    **mc_id** `string` `mandatory`

                    A unique merchant key which provided by ABA Bank. Same value
                    as `merchant_id`


                    ---

                    **tran_id** `string` `mandatory`

                    Purcahse transaction id to refund.


                    ---

                    **refund_amount** `decimal` `mandatory`

                    Amount to refund back to payer.


                    ---

                    **PHP Sample Code**


                    ```php

                    // Prepare data to be encrypted

                    $data_object = json_encode([
                        'mc_id' => $merchant_id, // same value as merchant_id
                        'tran_id' => $tran_id,
                        'refund_amount' => $amount
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
                    Base64 encode of hash hmac sha512 encryption of concatenates
                    values `request_time`, `merchant_id` and `merchant_auth`
                    with `public_key`.


                    **PHP Sample Code**


                    ```php

                    // public key provided by ABA Bank

                    $api_key = "API KEY PROVIDED BY ABA BANK";

                    // Prepare the data to be hashed

                    $b4hash = $request_time . $merchant_id . $merchant_auth;

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
              merchant_auth: 884113079983a...2c3e460be35f2a3
              hash: 3nd/2Z4g45...wnA2WA/M/Qg==
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
                    description: >-
                      Example: A customer pays 20USD by card. A 2USD discount is
                      applied, so the final amount is 18USD.
                    format: double
                  total_refunded:
                    type: number
                    description: >-
                      Total of refunded amount. If the purchase transactions has
                      refunded 3 times, and each time was 1USD, to
                      total_refunded = 3USD.
                    format: double
                  currency:
                    type: string
                    title: ''
                    description: Original currency of the transaction.
                  transaction_status:
                    type: string
                    description: >-
                      Either it's full refund or partial refund the status here
                      is `REFUNDED`
                  status:
                    type: object
                    properties:
                      code:
                        type: string
                        title: ''
                        description: >-
                          - `00` : Success

                          - `PTL02` : Invalid hash

                          - `PTL04` : Parameter validation required

                          - `PTL05` : Parameter invalid format

                          - `PTL06` : The `request_time` value is missing or
                          incorrectly formatted.

                          - `PTL37` : Refund amount cannot exceed the original
                          purchase amount.

                          - `PTL57` : Unable to refund

                          - `PTL58` : Fail to refund

                          - `PTL62` : Invalid merchant information

                          - `PTL63` : Merchant have no security config file

                          - `PTL168` : Concurrent requests are not allowed for
                          this operation. Please try again in a few seconds

                          - `PTL169` : The merchant profile cannot accept
                          payment because its settlement account is closed

                          - `PTL181` : The available balance is not enough to
                          refund the customer

                          - `PTL186` : Invalid amount format

                          - `PTL187` : Amount is below the minimum allowed
                      message:
                        type: string
                        title: ''
                        description: >-
                          Please see the property reponse `code` for the
                          details.
                    x-apidog-orders:
                      - code
                      - message
                x-apidog-orders:
                  - grand_total
                  - total_refunded
                  - currency
                  - transaction_status
                  - status
              examples:
                '1':
                  summary: Success
                  value:
                    grand_total: 1.5
                    total_refunded: 0.09
                    currency: USD
                    transaction_status: REFUNDED
                    status:
                      code: '00'
                      message: Success!
                '2':
                  summary: Exception
                  value:
                    status:
                      code: PTL02
                      message: Wrong Hash
          headers: {}
          x-apidog-name: OK
      security: []
      x-apidog-folder: Ecommerce Checkout
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/831852/apis/api-14530821-run
components:
  schemas: {}
  securitySchemes: {}
servers:
  - url: https://checkout-sandbox.payway.com.kh/
    description: StillZeroBug
security: []

```


# FILE: remove-token-19336822e0.md

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


# FILE: renew-token-19336823e0.md

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


# FILE: resources-3305682f0.md

# Resources

## Test Cards

Test your Integration with different payment methods, before going live.

You cannot use real card information in the ABA PayWay sandbox environment. Instead, use any of the following test card numbers and respective Expiry and CV2/CVV to test a payment transaction.

<div class="table-code overflow-y-auto">
  <table class="text-base text-center whitespace-nowrap" style="border-collapse: collapse; width: 100%;">
    <tbody>
  
        <th style="padding: 8px;">Card Status</th>
        <th style="padding: 8px;">Card Type</th>
        <th style="padding: 8px;">Card Number</th>
        <th style="padding: 8px;">Exp</th>
        <th style="padding: 8px;">CVV</th>
        <th style="padding: 8px;">3DS Enrolled</th>

      <tr>
        <td rowspan="2" style="padding: 8px;"> **Success** </td>
        <td style="padding: 8px;">Master Card</td>
        <td style="padding: 8px;">5156 8399 3770 6777</td>
        <td style="padding: 8px;">01/30</td>
        <td style="padding: 8px;">993</td>
        <td style="padding: 8px;">No</td>
      </tr>
      <tr>
        <td style="padding: 8px;">Visa Card</td>
        <td style="padding: 8px;">4286 0900 0000 0206</td>
        <td style="padding: 8px;">04/30</td>
        <td style="padding: 8px;">777</td>
        <td style="padding: 8px;">Yes</td>
      </tr>
      <tr>
        <td rowspan="2" style="padding: 8px;"> **Declined** </td>
         <td style="padding: 8px;">Master Card</td>
        <td style="padding: 8px;">5156 8302 7256 1029</td>
        <td style="padding: 8px;">04/30</td>
        <td style="padding: 8px;">777</td>
        <td style="padding: 8px;">Yes</td>
        
      </tr>
      <tr>
        <td style="padding: 8px;">Visa Card</td>
        <td style="padding: 8px;">4156 8399 3770 6777</td>
        <td style="padding: 8px;">01/30</td>
        <td style="padding: 8px;">993</td>
        <td style="padding: 8px;">No</td>
      </tr>
    </tbody>
  </table>
</div>


A Note on 3D Secured Test Card numbers OTP pin for verifying 3D secure will be sent to your registered email address. Please reach out to your point of contact to assist you in testing with ABA PAY.


# FILE: schedule-payment-2038907m0.md

# Schedule Payment

## Introduction
A **scheduled payment** is a payment that happens automatically at a fixed time and for a fixed amount based on a predefined agreement. It starts with a **customer initiated transaction (CITR – Customer Initiated Transaction for Registration)**, where the customer subscribes their payment method and gives consent. After that, the next payments are **merchant initiated transactions (MITR – Merchant Initiated Transaction Recurring)**, where the merchant automatically charges the customer at the agreed time and amount (for example, a monthly subscription). In this case, both the timing and the amount are fixed, and no action is needed from the customer after the initial setup.




## Understanding Token Flags

To classify the type of the transaction, PayWay uses the `token_flag` parameter to define the Transaction Context. 


| Flag      | Full name        | Amount   | Use case                                                                                  |API Endpoint |
|-----------|------------------|----------|-------------------------------------------------------------------------------------------|-----|
| `CITR_FIX` | CIT Recurring        | Fixed | Registration: The customer starts a subscription and authorizes the fixed amount/frequency (e.g., signing up for a $20 gym plan).     | [Subscription](https://developer.payway.com.kh/subscription-21402227e0.md) |
| `MITR_FIX` | MIT Recurring  | Fixed | Subsequent Billing: The merchant's server automatically charges the agreed fixed amount at the scheduled interval (e.g., the monthly $20 gym fee).  | [Payment](https://developer.payway.com.kh/payment-19336821e0.md) |


## How it works 


<Tabs>
  <Tab title="ABA Account">
    **Subscribe using ABA Account**
      
      
<Frame caption="Subscripiton flow with ABA Account">




![Subscribe with ABA Account (1).png](https://api.apidog.com/api/v1/projects/831852/resources/374501/image-preview)
      
</Frame>

  </Tab>
  <Tab title="Credit/Debit Card">
    **Subscribe using Card**
    
    
<Frame caption="Subscripiton flow with Credit/Debit Card">
 

![Subscribe with Card.png](https://api.apidog.com/api/v1/projects/831852/resources/374084/image-preview)
    
</Frame>

  </Tab>

</Tabs>


**Subsequent Transaction**
<Frame caption="This flow is for Merchant-Initiated scheduled transactions.">


![Scheduled payment.png](https://api.apidog.com/api/v1/projects/831852/resources/374085/image-preview)
</Frame>



1. **Batch Identification**: Every day, the Merchant Server runs a scheduled job to identify all active subscriptions due for billing.

2. **Execution**: For every identified record, the server calls the PayWay Purchase API using the stored payment token.

3. **Confirmation**: PayWay processes the payment and sends an asynchronous Payment Notification (Webhook) to the merchant's server.

4. **Verification**: In the event of a missing callback, the Merchant Server performs a Transaction Status Query to ensure the database stays synchronized with the actual payment state.





## Set up your UI

Before integrating the API, build a section in your app where customers can:

- **Subscribe** – allow customers to link their payment method and give consent for future scheduled or recurring payments.
- **View subscription** – allow customers to see all active subscriptions, including details like merchant name, amount, and billing frequency.
- **Unsubscribe** – allow customers to cancel an existing subscription so no future payments will be charged.

:::caution[]
You **must** follow PayWay Credential on file guidelines to ensure proper customer card/account storage.
<CardGroup cols={2}>
  <Card title="Web UI Guideline" icon="material-outline-web_asset" href="https://www.figma.com/design/ML0Io9zCYnEq6PEZvdEqtJ/AOF---COF-Scheduled-Payments?node-id=4010-5664&t=iIQrPXiqXdyqL3q3-0">
    To store ABA accounts or cards securely on your website
  </Card>
  <Card title="Mobile UI Guideline" icon="material-outline-smartphone"href="https://www.figma.com/design/ML0Io9zCYnEq6PEZvdEqtJ/AOF---COF-Scheduled-Payments?node-id=4010-3237&t=iIQrPXiqXdyqL3q3-0">
    To store ABA accounts or cards securely on your mobile apps
  </Card>
  
</CardGroup>
:::


## Integration Steps



<Steps>
  <Step title="Subscribe">
  
      
      Initiate the subscription by calling the [subscription](https://developer.payway.com.kh/subscription-21402227e0.md) API after the customer selects a plan (with predefined amount and frequency). This step is a CITR (Customer Initiated Transaction for Registration) where the customer provides consent and links their payment method.
      
       **Sample Request** 
```
<html lang="en">
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
      
    <!-- Remove PayWay Plugin JS if you prefer Hosted view mode. This URL is valid for both Sanbdbox and Production -->
    <script src="https://checkout.payway.com.kh/plugins/checkout2-0.js" defer></script>
      
  </head>
  <body>
    <form method="POST" target="aba_webservice" id="aba_merchant_request"
      action="https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase" >
      <input type="hidden" name="hash" value="D8SaUWAA/AhxNro00wAykb4ibeo9kM3if7ioN7cnBfihXP/38anLGwGUxHK+J6HvaiUEV8Ho+nz5nkQrzowm7g==" />
      <input id="tran_id" type="hidden" name="tran_id" value="17536691884" /><br />
      <input type="hidden" name="amount" value="0.10" />
      <input type="hidden" name="merchant_id" value="ec000002" />
      <input type="hidden" name="req_time" value="20250728022056" />
        
        <input type="hidden" name="ctid" value="your_unique_reference" />
        <input type="hidden" name="token_flag" value="CITR_FIX" />
        <input type="hidden" name="frequency" value="1W" />

      <input type="hidden" id="payment_option" name="payment_option" value="abapay" />

      <input type="hidden" name="currency" value="USD" />

      <input type="hidden" name="firstname" value="sina" />
      <input type="hidden" name="lastname" value="chhum" />
      <input type="hidden" name="phone" value="093939399" />
      <input type="submit" value="submit" />
    </form>

    <script>
      var form = document.getElementById('aba_merchant_request')
      form.addEventListener('submit', function (event) {
        event.preventDefault()
        AbaPayway.checkout() // Use it with PayWay Plugin JS to display as a bottom sheet on mobile or a modal popup on desktop // document.getElementById(form_id).submit() // Use it to display as Hosted view mode
      })
    </script>
  </body>
</html>
      
```
      
     PayWay will respond with a HTML response that contains the checkout interface, which you must render on your website/platform for the customer to complete the payment.

  </Step>
  <Step title="Handle Callback">
      
      Once the customer completes the payment, PayWay will send two callback notification to merchant.
      
       Your `callback_url` endpoint must:

- Accept the HTTP POST method
- Accept Content-Type: application/json

:::highlight red 💡
We highly recommend securing this URL to ensure that only PayWay has access to it.
:::
      
      
    **1) Payment completion callback notification**
      
     Upon completion of the customer’s payment, PayWay transmits the transaction details and critical metadata to the callback_url specified in your request parameters. If no parameter is provided, PayWay defaults to the callback_url configured within your API Settings.
      
      
:::highlight red 💡
If you provide a custom `callback_url` in your API request, ensure the domain is whitelisted within your merchant profile to allow PayWay to communicate securely with your server.
:::



  

**Sample Pushback Data**
      
```
{
    "tran_id": "17425401324",
    "apv": "619195",
    "status": "0", 
    "return_params": "xxxxxxxxxx"
}    
```


---
    **tran_id** `string`
    Transaction ID sent during the initial payment process.
    
    ---
    **apv** `string`
    Transaction approval code.
    
    ---
    **status** `string`
    Payment status
    
    ---
    **return_params** `string`
    Extra information sent to the payment gateway during the payment initiation request.
    
    ---
    
    **Verify Callback Signature**
    
    For security purposes, PayWay includes a hash signature in the request header.
You should verify this signature to confirm that the callback was sent by PayWay and that the data has not been modified.

Below is an example in PHP demonstrating how to:

1. Read the callback data

2. Generate the signature

3. Compare it with the signature received in the header

PHP Example
    
   ```
    // Read request body
$response = json_decode(file_get_contents('php://input'), true);

$secretKey = "YOUR_SECRET_KEY";

// 1. Sort fields by key (ascending)
ksort($response);

// 2. Concatenate all values
$b4hash = '';
foreach ($response as $value) {
    if (is_array($value)) {
        $value = json_encode($value);
    }
    $b4hash .= $value;
}

// 3. Generate HMAC-SHA512 signature
$signature = base64_encode(
    hash_hmac('sha512', $b4hash, $secretKey, true)
);

// 4. Get signature from request header
$receivedSignature = $_SERVER['HTTP_X_PAYWAY_HMAC_SHA512'] ?? '';

// 5. Compare signatures
if (hash_equals($signature, $receivedSignature)) {
    // Valid request – process the notification
} else {
    // Invalid request
    http_response_code(401);
    exit('Invalid signature');
}
    ```
      
      
      **2) Token callback**
      
      PayWay will use `callback_url` configured within your Outlet Profile > Services > Credential on File to delivery the token information.
      
      **Sample Callback Data**
      
      ```json
      {
          "request_id": "175317626731593",
          "payment_credential": {
            "ctid": "64513556cc930062e8cb3ae59eee8fbf459c53e",
            "pwt": "6451355C97035CDE21FB13..E0945C21007136F3D423A1B",
            "source_of_fund": "*****5312",
            "type": "ABA ACCOUNT",
            "status": 1,
            "expired_at": "2025-10-20T08:20:03",
            "token_flag": "CITR_FIX",
            "frequency": "1W",
            "subscribed_amount": 100.00,
            "amount_limit_per_tran": 100.00,
            "currency": "USD",
          }
        }
      ```
      
      ---
      **request_id** **`string`**
      Your original requst ID.
      
      ---
      **payment_credential** **`object`**
      
      - **ctid** **`string`**
     Your consumer identification number.
      
      - **pwt** **`string`**
     PWT (PayWay Token) is a unique token automatically generated by the PayWay system and is used to complete the purchase..
       - **source_of_fund** **`string`**
      This field displays either the card number or the ABA account number, depending on the payer's selected payment method. For security reasons, the number is masked and only the last 4 digits are shown.
       - **type** **`string`**
            - `Visa` - Visa card
            - `MC` - Mastercard
            - `CUP` - UnionPay card
            - `JCB` - JCB card
            - `ABA ACCOUNT` - ABA Account
       - **status** **`number`**
      
            - `0` - Token has been removed.
            - `1` - Token is active.
            - `2` - Token has been frozen.
       - **expired_at** **`string`**
      Expiry date of the token.
      - **token_flag** **`string`**
      Possible values: `CITR_FIX`.
      - **frequency** **`string`**
      Possible value are `1W` - Weekly, `1M` - Monthly, `2M` - Every 2 months.
      
      - **subscribed_amount** **`number`**
      The `subscribed_amount` is the fixed monetary value authorized by the customer during the registration phase (`CITR_FIX`)
      - **amount_limit_per_tran** **`number`**
      For scheduled payments, the `amount_limit_per_tran` is automatically locked to the subscribed_amount. Users are restricted from adjusting this limit in their ABA Mobile app, guaranteeing that the authorized payment can always be processed.
      - **currency** **`string`**
       Payment amount limit transaction currency. Possible value `KHR` or `USD`.
      
      
  </Step>
  <Step title="Subsequent Transactions">
    Once the subscription is done, all future payments are automatically triggered by the merchant as MITR (Merchant Initiated Transaction Recurring). These transactions follow the fixed schedule and fixed amount defined during the subscription setup, without requiring further customer action.
      
 
      
      Please use the [Payment](https://developer.payway.com.kh/payment-19336821e0.md) API to trigger each subsequent transaction.
  </Step>
</Steps>

## Frequently Asked Questions (FAQs)

<AccordionGroup>
  <Accordion title="Can a transaction be initiated using an expired token?" >
  No, expired tokens cannot be used to process payments. If an expired ABA Account or ABA Card token is used, the transaction will be declined. The user will receive a notification on their ABA Mobile stating that the payment method is no longer valid. To resume seamless payments, the user must renew the token by re-authorizing through the ABA Mobile app or via your platform's **"Manage Payment Methods"** section.
  </Accordion>
  <Accordion title="Can a transaction be initiated using a frozen token?">
    Frozen tokens are temporarily disabled and cannot be used to process payments. If a frozen ABA Account or ABA Card token is used for a transaction, the request will be declined. The user will receive a notification on their ABA Mobile informing them that the selected payment method is currently inactive or frozen. To resume seamless payments, the user must unfreeze the token through the ABA Mobile app.
  </Accordion>
  <Accordion title="Can a token initiated as CITI_FLEX be used for MITU_FLEX transactions?">
    **No**. Tokens are restricted by the Initiation Type defined during the linking process.
      
          
`CITI_FLEX` Tokens: These are authorized specifically for Customer-Initiated Transactions (CIT). They can only be used when the customer is actively present and triggers the payment (e.g., a one-click checkout).

`CITO_FLEX` Tokens: To perform Merchant-Initiated Transactions (MIT)—such as automated subscriptions or unscheduled utility billings—the merchant must initiate the linking process as `CITO_FLEX`. This ensures the user has explicitly consented to the merchant triggering future payments on their behalf.
  
  </Accordion>
    
      <Accordion title="Can a buyer change the token amount limit from ABA Mobile after subscribing to a plan?">
          **No**, buyer is not allowed to update the token limit after subscription.
        
  
  </Accordion>
</AccordionGroup>












# FILE: subscription-21402227e0.md

# Subscription

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /api/payment-gateway/v1/payments/purchase:
    post:
      summary: Subscription
      deprecated: false
      description: >
        This API allows a merchant to make a purchase transaction while at the
        same time linking the customer’s card and ABA account to the merchant’s
        system. Once the purchase is successfully completed, the API will push a
        token back to the merchant, which can be used for future payments or
        account verification.



        <Tabs>
          <Tab title="ABA PAY">
              
        <Frame caption="Subscription flow with ABA Account">



        ![Subscribe with ABA Account
        (1).png](https://api.apidog.com/api/v1/projects/831852/resources/374502/image-preview)
              
        </Frame>

           

          </Tab>
          <Tab title="Credit/Debit Card">
            
            
        <Frame caption="Subscripiton flow with Credit/Debit Card">
         ![Subscribe with Card.png](https://api.apidog.com/api/v1/projects/831852/resources/374024/image-preview)
        </Frame>

            
            


          </Tab>
          
        </Tabs>
      tags:
        - Credentials on File
      parameters:
        - name: Content-Type
          in: header
          description: ''
          required: true
          example: multipart/form-data
          schema:
            type: string
      requestBody:
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                req_time:
                  description: Request date and time in UTC format as YYYYMMDDHHmmss.
                  example: ''
                  type: string
                merchant_id:
                  type: string
                  maxLength: 30
                  description: A unique merchant key which provided by ABA Bank.
                  example: ''
                tran_id:
                  type: string
                  maxLength: 20
                  description: A unique transaction identifier for the payment.
                  example: ''
                firstname:
                  type: string
                  maxLength: 20
                  description: Buyer's first name.
                  example: ''
                lastname:
                  type: string
                  maxLength: 20
                  description: Buyer's last name.
                  example: ''
                email:
                  type: string
                  maxLength: 50
                  description: Buyer's email.
                  example: ''
                phone:
                  type: string
                  maxLength: 20
                  description: Buyer's phone.
                  example: ''
                type:
                  type: string
                  maxLength: 20
                  description: '- `purchase` : for full purchase'
                  example: ''
                payment_option:
                  type: string
                  maxLength: 20
                  description: >
                    **Payment Methods for Transactions:**  


                    - **`cards`**: For card payments.  

                    - **`abapay`**: QR payment that can be scanned and paid
                    using ABA PAY.

                    - **`abapay_deeplink`**: Allows customers to pay using **ABA
                    PAY**. The payment gateway will respond with a JSON object
                    containing `qr_string`, `abapay_deeplink`, and
                    `checkout_qr_url`. See the sample response in the response
                    section below.  
                  example: ''
                items:
                  type: string
                  maxLength: 500
                  description: >-
                    A base64-encoded JSON array describing the items being
                    purchased.


                    **PHP Sample Code**


                    ```php

                    $item = base64_encode(json_encode([
                        ["name" => "product 1","quantity" => 1,"price" => 1.00], 
                        ["name" => "product 2","quantity" => 2, "price" => 4.00]
                    ]));

                    ```

                    **Note: This is only description/remark.  The price or
                    quantity in this info will not be used for calculation or
                    any validation purposes**
                  example: ''
                shipping:
                  type: number
                  description: Shipping fee.
                  example: 0
                amount:
                  type: number
                  description: Purchase amount.
                  example: 0
                currency:
                  description: >-
                    Transaction currency of the payment. If you don't pass any
                    value, it will take default value from your merchant profile
                    (the first account's the currency of the first account you
                    registered). Supported values are `KHR` or `USD`.
                  example: ''
                  type: string
                return_url:
                  description: >-
                    The URL to which PayWay will send the payment notification
                    upon success. 
                  example: ''
                  type: string
                cancel_url:
                  description: >-
                    The URL to redirect to after the user closes the payment
                    dialog or when user cancel the payment.
                  example: ''
                  type: string
                skip_success_page:
                  type: integer
                  description: >-
                    Skip success page can be configure on checkout service
                    level. We also provide option via the API for you to
                    override the setting too. If you don't pass this param, it
                    will follow the configuration on the profile level.
                    Supported value:

                    - `0` : Don't skip success pages

                    -  `1`: Skip success page.


                    Once you skipe success page, `continue_success_url` on
                    profile level will be used to redirect user to the specific
                    location if you don't pass value of continue_success_url in
                    the request.
                  example: 0
                continue_success_url:
                  description: The URL to redirect to after a successful payment.
                  example: ''
                  type: string
                return_deeplink:
                  description: >-
                    The deep link for redirecting to the app after a successful
                    payment from ABA Mobile. Must be base64-encoded and include
                    both iOS and Android schemes. This field is mandatory for
                    mobile integration.


                    **PHP Sample Code**


                    ```php

                    $return_deeplink =base64_encode(json_encode([
                        "ios_scheme" => "DEEPLINK TO RETURN TO YOUR IOS APP",
                        "android_scheme" => "DEEPLINK TO RETURN TO YOUR ANDROID APP"
                    ]));

                    ```
                  example: ''
                  type: string
                custom_fields:
                  description: >
                    Additional information that you want to attach to the
                    transaction. This information will appear in the transaction
                    list, transaction details and export report. It's
                    base64-encoded JSON info.


                    **PHP Sample Code**


                    ```php

                    $custom_field = base64_encode(json_encode([
                        "field1" => "myvalue1",
                        "field2" => "myvalue2"
                    ]));

                    ```
                  example: ''
                  type: string
                return_params:
                  description: >-
                    Information to include when PayWay calls your return URL
                    after a successful payment.
                  example: ''
                  type: string
                view_type:
                  description: >-
                    Defines the view type for the payment page.

                    - `hosted_view` : redirect payer to a new tab

                    - `popup` : Display as a **bottom sheet** on mobile web
                    browsers and as a **modal popup** on desktop web browsers.
                  example: ''
                  type: string
                payment_gate:
                  type: integer
                  description: >-
                    If your merchant profile also supports the **QR Payment
                    API** service, please set this parameter to `0` to use the
                    Checkout service.
                  example: 0
                payout:
                  description: |-
                    Base64-encoded JSON string representing payout details.

                    **PHP Sample Code**
                    ```php
                    $payout = base64_encode(json_encode([
                        ["acc" => "000133879","amt"=> 1], 
                        ["acc" => "000133880","amt" => 1]
                    ]));
                    ```
                  example: ''
                  type: string
                lifetime:
                  type: integer
                  description: >-
                    The payment's lifetime in minutes, once it exceeds customer
                    will not allow to make payment.  Default value is 30 days.

                    - Min: 3 mins

                    - Max: 30 days
                  example: 0
                ctid:
                  example: ''
                  type: string
                token_flag:
                  description: Supported token flag `CITR_FIX`.
                  example: ''
                  type: string
                frequency:
                  description: >-
                    The field is require when the token flag is `CITR_FIX`. The
                    possible values are:

                    - `1W` – Weekly

                    - `1M` – Monthly

                    - `2M` – Every 2 months
                  example: ''
                  type: string
                hash:
                  description: >-
                    Base64 encode of hash hmac sha512 encryption of concatenates
                    values
                    `req_time`,`merchant_id`,`tran_id`,`amount`,`items`,`shipping`,`firstname`,`lastname`,`email`,`phone`,`type`,`payment_option`,`return_url`,`cancel_url`,`continue_success_url`,`return_deeplink`,`currency`,`custom_fields`,`return_params`,`payout`,`lifetime`,`additional_params`,
                    `skip_success_page`, `token_flag` and `frequency` with
                    `public_key`.




                    **PHP Sample Code**

                    ```php

                    // public key provided by ABA Bank

                    $api_key = "API KEY PROVIDED BY ABA BANK";


                    // Prepare the data to be hashed

                    $b4hash = $req_time . $merchant_id . $tran_id . $amount .
                    $items . $shipping . $firstname . $lastname . $email .
                    $phone . $type . $payment_option . $return_url . $cancel_url
                    . $continue_success_url . $return_deeplink . $currency .
                    $custom_fields . $return_params . $payout . $lifetime .
                    $additional_params .$skip_success_page .$token_flag .
                    $frequency;



                    // Generate the HMAC hash using SHA-512 and encode it in
                    Base64 

                    $hash = base64_encode(hash_hmac('sha512', $b4hash, $api_key,
                    true));

                    ```
                  example: ''
                  type: string
              required:
                - req_time
                - merchant_id
                - tran_id
                - payment_option
                - amount
                - ctid
                - hash
            examples: {}
      responses:
        '200':
          description: ''
          content:
            '*/*':
              schema:
                type: object
                properties:
                  01JME5PQCH7BA4JH9V9C51N1FV:
                    type: string
                x-apidog-orders:
                  - 01JME5PQCH7BA4JH9V9C51N1FV
                required:
                  - 01JME5PQCH7BA4JH9V9C51N1FV
              examples:
                '1':
                  summary: Success
                  value: >-
                    <!DOCTYPE html>

                    <html data-capo="">

                    <head>

                    <meta charset="utf-8">

                    <meta name="viewport" content="width=device-width,
                    initial-scale=1.0, maximum-scale=1.0, user-scalab

                    <title>PayWay - Checkout</title>

                    ...

                    </head>

                    <body>

                    ...

                    </body>

                    </html>
                '2':
                  summary: Success
                  value: |-
                    {
                        "status": {
                            "code": "00",
                            "message": "Success!",
                            "tran_id": "trx-20201019130949"
                        },
                        "qr_string": "00020101021230510016abaakhppxxx@abaa01153250212100849350208ABA Bank520410165...",
                        "abapay_deeplink": "abamobilebank://ababank.com?type=payway&qrcode=00020101021230510016...",
                        "checkout_qr_url": "https://checkout-uat.payway.com.kh/eyJzdGF0dXMiOnsiY29kZSI6IjAwIiw..."
                    }
          headers: {}
          x-apidog-name: Success
        x-200:OK:
          description: ''
          content:
            application/json:
              schema:
                title: ''
                type: object
                properties:
                  status:
                    type: object
                    properties:
                      code:
                        type: string
                      message:
                        type: string
                      tran_id:
                        type: string
                    x-apidog-orders:
                      - code
                      - message
                      - tran_id
                    description: status
                    required:
                      - code
                      - message
                      - tran_id
                  qr_string:
                    type: string
                  abapay_deeplink:
                    type: string
                  checkout_qr_url:
                    type: string
                x-apidog-orders:
                  - status
                  - qr_string
                  - abapay_deeplink
                  - checkout_qr_url
                required:
                  - status
                  - qr_string
                  - abapay_deeplink
                  - checkout_qr_url
          headers: {}
          x-apidog-name: OK
        'x-200:Exception ':
          description: ''
          content:
            application/json:
              schema:
                title: ''
                type: object
                properties:
                  status:
                    type: object
                    properties:
                      code:
                        type: integer
                        description: >
                          - `0` : Success  

                          - `1` : Wrong hash  

                          - `2` : Invalid transaction ID  

                          - `3` : Invalid transaction amount  

                          - `4` : Duplicated transaction ID  

                          - `5` : Transaction not found  

                          - `6` : Requested domain is not in whitelist  

                          - `7` : Wrong return param  

                          - `8` : Something went wrong while saving data. Please
                          try again later or contact merchant for help.  

                          - `10` : Wrong shipping price  

                          - `11` : Something went wrong. Try again or contact
                          the merchant for help.  

                          - `12` : Payment currency is not allowed  

                          - `13` : Invalid items  

                          - `14` : Invalid credit multi acc  

                          - `15` : Invalid or missing channel values from smart
                          merchant  

                          - `16` : Invalid first name. It must not contain
                          numbers or special characters or not more than 100
                          characters.  

                          - `17` : Invalid last name. It must not contain
                          numbers or special characters or not more than 100
                          characters.  

                          - `18` : Invalid phone number  

                          - `19` : Invalid email  

                          - `20` : Something went wrong. Please contact
                          merchant.  

                          - `21` : End of API lifetime  

                          - `23` : Selected payment option is not enabled for
                          this merchant profile  

                          - `24` : Cannot decrypt data  

                          - `25` : Allow maximum 10 payout per requests  

                          - `26` : Invalid merchant profile  

                          - `27` : Invalid ctid  

                          - `28` : Invalid pwt  

                          - `29` : Invalid pwt or ctid  

                          - `30` : Merchant is not enabled COF  

                          - `31` : Unsecure 3Ds page  

                          - `33` : Cannot identify cardOrigin  

                          - `34` : Exchange rate data is invalid  

                          - `35` : Payout info is invalid  

                          - `36` : Payout account or amount is invalid  

                          - `37` : Payout accounts are not in whitelist  

                          - `38` : Payout contain invalid transaction ID  

                          - `39` : Payout contain duplicated account  

                          - `40` : Payout contain duplicated transaction ID  

                          - `41` : Payout info contain mid not link with any
                          merchant profile  

                          - `42` : Payout info contain account invalid status  

                          - `43` : Merchant profile's MID is missing. Please try
                          again or contact merchant for help.  

                          - `44` : Purchase amount has reached transaction
                          limit  

                          - `45` : Purchase with zero amount is not allowed  

                          - `46` : Purchase amount for KHR currency could not
                          contain decimal place  

                          - `47` : KHR amount must be greater than 100 KHR  

                          - `48` : Something went wrong with requested
                          parameters. Please try again or contact merchant for
                          help.  

                          - `49` : Invalid start date  

                          - `50` : Invalid end date  

                          - `51` : Invalid date range  

                          - `52` : Maximum date range is allowed only 3 days  

                          - `53` : Invalid amount range  

                          - `54` : Transaction is expired. Please try again or
                          contact the merchant for help.  

                          - `55` : We are unable to request QR from Wechat
                          system. Please try again or contact merchant for
                          help.  

                          - `56` : We are unable to validate your transaction
                          with Wechat system. Please try again or contact
                          merchant for help.  

                          - `57` : We are unable to validate your card source.
                          Please try again or contact merchant for help.  

                          - `58` : Provide invalid card number  

                          - `59` : Payout info can not be fixed with MID and ABA
                          account  

                          - `60` : Something went wrong with QR String. Please
                          try again or contact merchant for help.  

                          - `61` : Something went wrong. Please try again or
                          contact merchant for help.  

                          - `62` : QR is already in used  

                          - `63` : Transaction is already exist in core banking.
                          Please perform new transaction or contact merchant for
                          help.  

                          - `64` : Payer's account is same as merchant profile's
                          account. Please choose different account.  

                          - `65` : Merchant profile's MID is not found in core
                          banking. Please try again or contact merchant for
                          help.  

                          - `66` : Something went wrong. Please try again or
                          contact merchant for help.  

                          - `67` : QR on invoice is currently not available for
                          this merchant profile.  

                          - `68` : Transaction is expired. Please re-initiate
                          the transaction.  

                          - `69` : Transaction lifetime can not be less than 3
                          minutes.  

                          - `70` : Total purchase amount has reached daily
                          limit. Please use difference account.  

                          - `71` : Payout for card payment is not allowed to ABA
                          account.  

                          - `72` : The merchant profile cannot accept payment
                          because its settlement account is closed.  

                          - `73` : Invalid transaction status  

                          - `74` : Invalid tran_id or merchant_id  

                          - `75` : tran_id not found  

                          - `76` : Invalid additional parameters  

                          - `77` : Merchant transactions do not support
                          transaction fees  

                          - `78` : Card payout transactions are not compatible
                          with the discount program.  

                          - `79` : Payment token missing in Google Pay  

                          - `80` : Failed to decrypt the payment token provided
                          by Google Pay  

                          - `81` : The return URL is not in the whitelist  

                          - `82` : The payout has exceeded the maximum allowable
                          amount per transaction  

                          - `83` : Payment credential is disabled  

                          - `84` : Payment credential is expired  

                          - `85` : Purchase reach limit amount per transaction  

                          - `86` : Unsupported merchant purchase mode  

                          - `87` : Payment credential is removed  

                          - `200` : Payment was canceled  

                          - `201` : Payment was declined  

                          - `401` : Unauthorized access  

                          - `403` : Something went wrong. Try again or contact
                          the merchant for help.  

                          - `429` : Too many request, please try again in
                          1min.  

                          - `503` : System under maintenance  
                      message:
                        type: string
                        description: refer to `code` for response message
                    x-apidog-orders:
                      - code
                      - message
                    description: status
                    required:
                      - code
                      - message
                x-apidog-orders:
                  - status
                required:
                  - status
          headers: {}
          x-apidog-name: 'Exception '
      security: []
      x-apidog-folder: Credentials on File
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/831852/apis/api-21402227-run
components:
  schemas: {}
  securitySchemes: {}
servers:
  - url: https://checkout-sandbox.payway.com.kh/
    description: StillZeroBug
security: []

```


# FILE: unschedule-payment-2038908m0.md

# Unschedule Payment

## Introduction

An **unscheduled payment** is a payment that happens anytime, not on a fixed schedule. It can be started either by the **customer** or the **merchant**. When the **customer initiates the transaction (CIT / CITU – Customer Initiated Transaction)**, it means the customer actively makes the payment themselves (for example, during checkout, booking a taxi, or ordering food from a delivery service). When the **merchant initiates the transaction (MIT / MITU – Merchant Initiated Transaction)**, it means the business triggers the payment (for example, charging for an extra service or an additional fee). In both cases, the payment is not automatic or recurring—it only happens when it is triggered.


## Understanding Token 
### Token Flags

To classify the type of the transaction, PayWay uses the `token_flag` parameter to define the Transaction Context. This tells our system who is triggering the payment and whether the billing amount is fixed or variable.

### Customer-Initiated Transactions (CIT)
The customer triggers each payment from your app or website.

| Flag       | Full name          | Amount   | Use case                                                                 | API Endpoint
|------------|-------------------|----------|--------------------------------------------------------------------------| --------|
| `CITI_FLEX`  | CIT Initial       | Variable | Customer saves their method for future purchases with varying amounts.   | [Link Account](https://developer.payway.com.kh/link-account-19336820e0.md), [Link Card](https://developer.payway.com.kh/link-card-19336819e0.md)|
| `CITU_FLEX`  | CIT Unscheduled   | Variable | Customer makes a one-time payment using a previously saved method.       |[Payment](https://developer.payway.com.kh/payment-19336821e0.md) |

### Merchant-Initiated Transactions (MIT)
Your server charges the customer without their direct interaction at the time of payment.



| Flag      | Full name        | Amount   | Use case                                                                                  | API Endpoint |
|-----------|------------------|----------|-------------------------------------------------------------------------------------------|------|
| `CITO_FLEX` | CIT Other        | Variable | Customer authorizes the merchant to charge variable amounts later (e.g. toll setup).     | [Link Account](https://developer.payway.com.kh/link-account-19336820e0.md), [Link Card](https://developer.payway.com.kh/link-card-19336819e0.md) |
| `MITU_FLEX` | MIT Unscheduled  | Variable | Merchant charges on-demand with no fixed schedule (e.g. auto-recharge for a toll card).  | [Payment](https://developer.payway.com.kh/payment-19336821e0.md) |

### Token lifecycle


<Frame caption="Token lifecycle">


![Token lifecycle (2).png](https://api.apidog.com/api/v1/projects/831852/resources/374500/image-preview)
</Frame>




## How it works   
<Tabs>
  <Tab title="ABA Account">


**Link Account** 
<Frame caption="Link Account Flow">

      
![Link Account.png](https://api.apidog.com/api/v1/projects/831852/resources/374078/image-preview)
      
</Frame>
    

1. **Initiation**: The customer selects "Link ABA Account" on your platform.

2. **Request**: Your server sends a request to PayWay to initiate the account linking process.

3. **Response**: PayWay returns a QR string or an ABA Mobile deep link.

4. **Display**:
    * Web: Convert the QR string into a QR code image for the user to scan.
    * Mobile: Use the deep link to automatically launch the ABA Mobile app.

5. **Authorization**: Once redirected or after scanning, the user selects their preferred ABA account and authorizes the link within the app.

6. **Tokenization**: PayWay generates a secure payment token and sends it to your server via the callback_url.

7. **Storage**: Store this token securely to enable seamless, one-click purchases in the future.

 
 

  </Tab>
  <Tab title="Credit/Debit card">
    **Link Card**
<Frame caption="Link Card Flow">
    
![Link Card.png](https://api.apidog.com/api/v1/projects/831852/resources/374079/image-preview)
    
</Frame>

1. **Initiation**: The customer selects **"Add/Link New Card"** on your platform.

2. **Request**: Your client-side app sends a request to your server to initiate the card linking process.

3. **API Call**: Your server calls the PayWay **Link Card API**.

4. **Form Generation**: PayWay provides a secure, hosted Card Form (or a URL to one).

5. **Data Entry**: You display the secure form to the user. The user enters their sensitive card details (Card Number, Expiry, CVV) **directly into the PayWay-hosted interface**.

6. **Secure Processing**: PayWay processes the card details and generates a **unique Payment Token**.

7. **Callback**: PayWay sends the token and masked card details (e.g., **** **** **** 1234) back to your server via the `callback_url`.

8. **Persistence**: Your server stores the token securely for future transactions, and the user receives a "Success" notification.


:::info[Important Note]
Once your merchant profile has Card on File (CoF) enabled, a 'Save Card for Future Use' checkbox will appear on the e-commerce checkout screen. When a user selects this option, PayWay securely processes the transaction and simultaneously generates a unique Payment Token. This token is delivered to your server via the `callback_url`. Please ensure your system is configured to capture and store this callback data correctly to enable one-click checkouts for returning customers.

:::
    



  </Tab>

</Tabs>





**Subsequent Transaction**
<Frame caption="This flow supports both Customer-Initiated and Merchant-Initiated unscheduled transactions.">

![Unscheduled payment without 3DS challenge.png](https://api.apidog.com/api/v1/projects/831852/resources/374081/image-preview)

</Frame>



    
1. **Selection**: The customer chooses the "Linked ABA Account/Card" as their payment method during checkout.

2. **One-Click Initiation**: The customer clicks "Place Order" or "Pay Now" to trigger the transaction.

3. **Payment Request**: Your server sends a **Payment API** request to PayWay using the previously stored Token.

4. **Processing**: PayWay securely processes the transaction without requiring the user to open the ABA Mobile app or scan a QR code or entering card details.

5. **Status Update**: PayWay returns the real-time Payment Status (Success/Fail) to your server.

6. **Notification**: PayWay sends a detailed transaction confirmation to your registered `callback_url`.

7. **Completion**: You display the final Order Confirmation to the customer on your platform.


## Set up your UI
Before integrating the API, build a payment methods section in your app where customers can:

- **Add** - Link an ABA account or credit/debit card
- **View** - See all their saved payment methods
- **Remove** - Unlink a payment method when needed
- **Renew** - Allow customer to renew the expired token.
- **Set default token** - Allow customer to set a default token (in case user has multiple tokens) that will be used for checkout.

:::caution[]
You **must** follow PayWay Credential on file guidelines to ensure proper customer card/account storage.
<CardGroup cols={2}>
  <Card title="Web UI Guideline" icon="material-outline-web_asset" href="https://www.figma.com/design/i6pWxR6XLMBCvh1ihhAnvy/Account---Card-on-File-flows?node-id=0-1&p=f&t=eQFWXjR6h7gCk7ez-0">
    To store ABA accounts or cards securely on your website
  </Card>
  <Card title="Mobile UI Guideline" icon="material-outline-smartphone"href="https://www.figma.com/design/i6pWxR6XLMBCvh1ihhAnvy/Account---Card-on-File-flows?node-id=0-1&p=f&t=eQFWXjR6h7gCk7ez-0">
    To store ABA accounts or cards securely on your mobile apps
  </Card>
  
</CardGroup>
:::


## Integration Steps


 <Steps>
      <Step title="Linking Process">
          
          
<Tabs>
  <Tab title="Link ABA Account">
To allow your customers to link their ABA account on your platform, use the [Link Account](https://developer.payway.com.kh/link-account-19336820e0.md) API. Below is a sample of a successful API response:
          
```json
{
    "status": {
        "code": "00",
        "message": "Success",
        "trace_id": "bce9c83c-922e-4672-87f5-7f92cd15047c"
    },
    "data": {
        "deeplink": "abamobilebank://ababank.com?type=account_on_file&qrcode=ABA...gFses",
        "qr_string": "ABAAOF+hEGxkym...6SbF19enqLB2xU46jTzVY",
        "expire_in": 1627113926
    }
}
```
          
          
<Tabs>
  <Tab title="Web Browser">
Display a QR code using `qr_string` for customers to scan with ABA Mobile and authorise the account linking.
  </Tab>
  <Tab title="Mobile Browser">

      
Use the `deeplink` to launch ABA Mobile automatically, where customers can select which account to link to your platform.

Here's a JavaScript code snippet to open it:
      
      
      ```js
  const data = {DATA RESPONSE FROM LINK ACCOUNT API}

if (isAndroid) {
        window.location = `intent://ababank.com?type=account_on_file&qrcode=${encodeURIComponent(
    data.qr_string
  )}#Intent;scheme=abamobilebank;end;`
} else {
        window.location = data.deeplink
}
      ```
  </Tab>
  <Tab title="Android">
Use the `deeplink` to launch ABA Mobile automatically, where customers can select which account to link to your platform.
      
      Here is a sample Android code snippet to open it:
      ```js
      private fun openDeepLink(qrString: String) {
          try {
              val url = "${ABA_SCHEME}://${ABA_DOMAIN}?type=payway&qrcode=${qrString}" 
              // value from "abapay_deeplink"
              val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
              startActivity(intent)
          } catch (ex: Exception) {
              val intent = Intent(Intent.ACTION_VIEW).apply {
              intent.data = Uri.parse("market://details?id=com.paygo24.ibank")
              startActivity(intent)
          }
      }
      
     companion object {
        const val ABA_SCHEME = "abamobilebank"
        const val ABA_DOMAIN = "ababank.com"
}
      
      
      ```
  </Tab>
  <Tab title="iOS">
Use the `deeplink` to launch ABA Mobile automatically, where customers can select which account to link to your platform.
      
      Here is a sample iOS code snippet to open it:
      ```js
      let deeplink = response.deeplink
      let appStore = "https://apps.apple.com/us/app/aba-mobile-bank/id968860649"
      
      guard
      let deeplinkURL = URL(string: deeplink),
      let appStoreURL = URL(string: appStore) else {
        //Something went wrong, check url respond from API.
        return
      }
      UIApplication.shared.open(deeplinkURL, options: [:]) { success in if !success
              // Open app store
              UIApplication.shared.open(appStoreURL, options: [:]) 
          } 
      }
      ```
  </Tab>
   
</Tabs>
      
    
      
 
      
      
      
     
      
  </Tab>
  <Tab title="Link Credit/Debit Card">
      

      
     To integrate this, use the [Link Card](https://developer.payway.com.kh/link-card-19336819e0.md) API. 
      
      
      
      
      PayWay will respond with a saved card web page that you can render in an iFrame, allowing customers to securely enter their card details directly on the PayWay screen.
      
      
      **Sample Code**

Place this code snippet to your project and point `action` of the form to the correct url environment.

```html

<!doctype html>
<html lang="en">
   <head> 
      <meta charset="utf-8"> 
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
      <meta name="description" content="">
      <meta name="author" content="PayWay">
      <title>PayWay Add Card Sample</title>
 
      <link rel="stylesheet" href="{payway based url}/checkout-popup.html?file=css"/>
      <style type="text/css">
         /* Your css style*/
      </style>
   
      <script src="{payway based url}/checkout-popup.html?file=js"></script>
      <script>
        $(document).ready(function () {
        $('#add_card_button').click(function () {
        AbaPayway.addCard(); 
        }); 
      });
      </script>
   </head> 
   <body> 
      <div class="container">
        <a href="#" id="add_card_button" class="btn btn-primary add-to-card">Add New Card</a>
      </div>
      <!-- The Modal -->
      <div id="aba_main_modal" class="aba-modal">
         <!-- Modal content --> 
         <div class="aba-modal-content add-card"> 
            <form method="POST" target="aba_webservice" id="aba_merchant_add_card"  action="{payway based url}/api/payment-credential/v3/cof/link-card">
              
              <input type="hidden" name="ctid" value="{YOUR CTID VALUE}"/>
              <input type="hidden" name="merchant_id" value="{YOUR MERCHANT ID/KEY}"/>
              <input type="hidden" name="return_param" value="{YOUR RETURN PARAM}"/>
              <input type="hidden" name="hash" value="{HASH VALUE FROM YOUR SERVER}"/>
            </form>
         </div>
      </div>
   </body>
</html>

```
      
     

          
  </Tab>

</Tabs>
          
          
      ### Callback handling    
            
     When a user successfully links their ABA Account or Card, PayWay issues an asynchronous notification to your server via the `callback_url`. This allows your system to capture the linking status and store the necessary tokens for future transactions.
          
PayWay prioritizes the `callback_url` passed dynamically as a request parameter; however, if this parameter is absent, the system defaults to the `callback_url` configured within your Outlet Profile > Services > Credential on File.
          
**Connection Requirements**
To ensure a successful handshake between PayWay and your server, your endpoint must adhere to the following specifications:

- HTTP Method: Must accept POST requests.
- Content Type: application/json.
- Network Security: Your domain and origin IP addresses must be whitelisted by ABA Bank.

**Sample Callback Data**
      
      ```json
      {
          "request_id": "175317626731593",
          "payment_credential": {
            "ctid": "64513556cc930062e8cb3ae59eee8fbf459c53e",
            "pwt": "6451355C97035CDE21FB13..E0945C21007136F3D423A1B",
            "source_of_fund": "*****5312",
            "type": "ABA ACCOUNT",
            "status": 1,
            "expired_at": "2025-10-20T08:20:03",
            "token_flag": "CITI_FLEX",
            "frequency": "",
            "subscribed_amount": 0.0,
            "amount_limit_per_tran": 0.0,
            "currency": "USD",
          
          }
        }
      ```
      
      ---
      **request_id** **`string`**
      Your original requst ID.
      
      ---
      **payment_credential** **`object`**
      
      - **ctid** **`string`**
     Your consumer identification number.
      
      - **pwt** **`string`**
     PWT (PayWay Token) is a unique token automatically generated by the PayWay system and is used to complete the purchase..
       - **source_of_fund** **`string`**
      This field displays either the card number or the ABA account number, depending on the payer's selected payment method. For security reasons, the number is masked and only the last 4 digits are shown.
       - **type** **`string`**
            - `Visa` - Visa card
            - `MC` - Mastercard
            - `CUP` - UnionPay card
            - `JCB` - JCB card
            - `ABA ACCOUNT` - ABA Account
       - **status** **`number`**
      
            - `0` - Token has been removed.
            - `1` - Token is active.
            - `2` - Token has been frozen.
       - **expired_at** **`string`**
      Expiry date of the token.
      - **token_flag** **`string`**
      Possible values: `CITI_FLEX`, `CITO_FLEX`.
      - **frequency** **`string`**
      Always return empty string for token flag is `CITI_FLEX` or `CITO_FLEX`.
      
      - **subscribed_amount** **`number`**
      Always return `0` for token flag `CITI_FLEX` or `CITO_FLEX`.
      - **amount_limit_per_tran** **`number`**
      Token payment amount limit per transaction. 
      - **currency** **`string`**
       Payment amount limit transaction currency. Possible value `KHR` or `USD`. 
     
      
      If you encounter issues with the pushback notification and do not receive the details, you can manually retrieve the linked account information using the [Get token details](https://developer.payway.com.kh/get-token-details-19336824e0.md) API.
          
          

:::tip[Important Note]
ABA Mobile users have the autonomy to **freeze**, **unfreeze**, **renew**, or **remove** a linked token directly within their app. Through the Credentials on File configuration, merchants can opt-in to receive real-time callback notifications whenever a user initiates these actions. Once enabled, PayWay will trigger a callback to the merchant for every status change, utilizing the same standardized data format previously specified to ensure consistent integration.
:::
   

          
      </Step>

<Step title="Purchase using token">
       To perform purchase using the token, please follow the specification of [Payment](https://developer.payway.com.kh/payment-19336821e0.md) API.
            

   Once the customer completes the payment, PayWay will send the transaction details and other important information to the `callback_url`.

- If `callback_url` is not provided in the request, PayWay will use the default `callback_url` configured in the API Settings.
- If you provide a custom `callback_url`, make sure the domain is whitelisted in your merchant profile.

Your `callback_url` endpoint must:

- Accept the HTTP POST method

- Accept Content-Type: application/json
 

    
:::highlight red 💡
We highly recommend securing this URL to ensure that only PayWay has access to it.
:::
  

**Sample Pushback Data**
      
```
{
  "tran_id": "6605586317",
  "apv": "541181",
  "status": 0
}
```


---
    **tran_id** `string`
    Transaction ID sent during the initial payment process.
    
    ---
    **apv** `string`
    Transaction approval code.
    
    ---
    **status** `number`
    Payment status
    
    ---

    
    ### Verify Callback Signature
    
    For security purposes, PayWay includes a hash signature in the request header.
You should verify this signature to confirm that the callback was sent by PayWay and that the data has not been modified.

Below is an example in PHP demonstrating how to:

1. Read the callback data

2. Generate the signature

3. Compare it with the signature received in the header

PHP Example
    
   ```
    // Read request body
$response = json_decode(file_get_contents('php://input'), true);

$secretKey = "YOUR_SECRET_KEY";

// 1. Sort fields by key (ascending)
ksort($response);

// 2. Concatenate all values
$b4hash = '';
foreach ($response as $value) {
    if (is_array($value)) {
        $value = json_encode($value);
    }
    $b4hash .= $value;
}

// 3. Generate HMAC-SHA512 signature
$signature = base64_encode(
    hash_hmac('sha512', $b4hash, $secretKey, true)
);

// 4. Get signature from request header
$receivedSignature = $_SERVER['HTTP_X_PAYWAY_HMAC_SHA512'] ?? '';

// 5. Compare signatures
if (hash_equals($signature, $receivedSignature)) {
    // Valid request – process the notification
} else {
    // Invalid request
    http_response_code(401);
    exit('Invalid signature');
}
    ```
            
            
            

            :::tip[]
You should receive a real-time callback response within 3 seconds. If you do not receive a response, we recommend using the [Check transaction](https://developer.payway.com.kh/check-transaction-14530826e0.md) API to verify the payment status.
:::    
      </Step>
    </Steps>    
## Frequently Asked Questions (FAQs)

<AccordionGroup>
  <Accordion title="Can a transaction be initiated using an expired token?" >
  No, expired tokens cannot be used to process payments. If an expired ABA Account or ABA Card token is used, the transaction will be declined. The user will receive a notification on their ABA Mobile stating that the payment method is no longer valid. To resume seamless payments, the user must renew the token by re-authorizing through the ABA Mobile app or via your platform's **"Manage Payment Methods"** section.
  </Accordion>
  <Accordion title="Can a transaction be initiated using a frozen token?">
    Frozen tokens are temporarily disabled and cannot be used to process payments. If a frozen ABA Account or ABA Card token is used for a transaction, the request will be declined. The user will receive a notification on their ABA Mobile informing them that the selected payment method is currently inactive or frozen. To resume seamless payments, the user must unfreeze the token through the ABA Mobile app.
  </Accordion>
  <Accordion title="Can a token initiated as CITI_FLEX be used for MITU_FLEX transactions?">
    **No**. Tokens are restricted by the Initiation Type defined during the linking process.
      
          
`CITI_FLEX` Tokens: These are authorized specifically for Customer-Initiated Transactions (CIT). They can only be used when the customer is actively present and triggers the payment (e.g., a one-click checkout).

`CITO_FLEX` Tokens: To perform Merchant-Initiated Transactions (MIT)—such as automated subscriptions or unscheduled utility billings—the merchant must initiate the linking process as `CITO_FLEX`. This ensures the user has explicitly consented to the merchant triggering future payments on their behalf.
  
  </Accordion>
    
      <Accordion title="Can a customer link the same ABA account multiple times?">
          **No**. To prevent duplicate tokens and ensure security, a customer (identified by a unique `ctid`) cannot link the same ABA account multiple times if an Active or Frozen token already exists for that account. During the linking process, the ABA Mobile app automatically filters out previously linked accounts, ensuring the user cannot select them for a duplicate enrollment.
  
  </Accordion>
</AccordionGroup>




# FILE: update-a-beneficiary-status-14530817e0.md

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