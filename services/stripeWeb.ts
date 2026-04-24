import { loadStripe } from "@stripe/stripe-js";


const stripePromise = loadStripe("pk_test_51T4saEL13XKhsSvAVRTgYoPiSsR9otLFgBzR9OfgobHqZbjKN7YyugeJRRVkSP2frn0HzvXpD5mzj2Zqmepeh3xq00Vh1cDmSW");

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