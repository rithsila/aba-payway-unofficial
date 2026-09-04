🚀 **កំណែថ្មី v1.2.1 នៃ ABA PayWay SDK Unofficial**

 **aba-payway-sdk-unofficial** ត្រូវបានដាក់ឱ្យដំណើរការជាផ្លូវការនូវជំនាន់ថ្មី **v1.2.1** ជាមួយនឹងការកែប្រែ និងមុខងារសំខាន់ៗដូចខាងក្រោម៖

### 🌟 ចំណុចថ្មីៗ និងការកែសម្រួលក្នុងជំនាន់ v1.2.1៖

1. **គាំទ្រ Hosted Card Checkout (ការទូទាត់តាមកាត)**៖
  - បន្ថែម `paymentGate` និង `viewType` នៅក្នុង `PurchaseRequest` ដើម្បីអាចទូទាត់តាមកាត (Visa / Mastercard) និងទទួលបាន `checkoutUrl`។
2. **កែសម្រួលប្រព័ន្ធ Webhook Pushback (`verifyWebhook`) ឱ្យត្រូវស្តង់ដារពិតរបស់ ABA**៖
  - ការផ្ទៀងផ្ទាត់ហត្ថលេខា (Signature) តាមក្បួនពិតប្រាកដរបស់ ABA PayWay ដោយប្រើ HMAC-SHA512។
  - លែងមានបញ្ហា Error នៅពេលទទួល Webhook Callback ពី ABA ទៀតហើយ។
3. **បន្ថែមឧបករណ៍ជំនួយក្នុងការតេស្ត Sandbox**៖
  - `npm run pay:sandbox`៖ បង្កើតប្រតិបត្តិការកាតតេស្ត និងបើកផ្ទាំង Checkout ដោយស្វ័យប្រវត្តិដើម្បីសាកល្បងការទូទាត់។
  - `npm run report:sandbox`៖ ដំណើរការតេស្តគ្រប់មុខងារទាំងអស់ និងទាញចេញជារបាយការណ៍ (Report) សម្រាប់យកទៅស្នើសុំបើកដំណើរការ Production (Go-Live)។
4. **ជួសជុលបញ្ហា Checkout Redirect**៖
  - កែសម្រួល `createPurchase` មិនឱ្យច្រឡំកូដ Redirect ថាជាបញ្ហាខុស Merchant ID ឬ API Key ទៀតឡើយ។

---

📦 **របៀបដំឡើង ឬ Update ទៅកាន់ជំនាន់ចុងក្រោយ៖**

```bash
npm install aba-payway-sdk-unofficial@latest
```

🔗 **ប្រភពឯកសារ និងសហគមន៍៖**

- GitHub: [https://github.com/rithsila/aba-payway-unofficial](https://github.com/rithsila/aba-payway-unofficial)
- NPM: [https://www.npmjs.com/package/aba-payway-sdk-unofficial](https://www.npmjs.com/package/aba-payway-sdk-unofficial)
- Telegram Channel: [https://t.me/abapaywayunofficial](https://t.me/abapaywayunofficial)
- Telegram Group: [https://t.me/abaunofficialintegrate](https://t.me/abaunofficialintegrate)

