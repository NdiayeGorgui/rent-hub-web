import { loadStripe } from "@stripe/stripe-js";


const stripePromise = loadStripe("pk_test_51TXjIjQaWL0C4PvN4RI3bc64LFKfzevr70JI1LAUaSykVSFcSfzvJKccMg8azKrfDwf2Am2J0pqmBG6Wz9AAZyL400KCjjQiZs");

export const handleWebPayment = async (clientSecret: string) => {
  const stripe = await stripePromise;

  if (!stripe) {
    throw new Error("Stripe non initialisé");
  }

  const { error, paymentIntent } = await stripe.confirmCardPayment(
    clientSecret,
    {
      payment_method: "pm_card_visa",
    }
  );

  if (error) {
    console.error("Stripe error:", error);
    throw new Error(error.message);
  }

  if (paymentIntent?.status !== "succeeded") {
    throw new Error("Paiement non validé");
  }

  return paymentIntent;
};