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


