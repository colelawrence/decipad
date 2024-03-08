export interface SubscriptionPlan {
  credits?: number | null;
  queries?: number | null;
  seats?: number | null;
  storage?: number | null;
  description?: string | null;
  key: string;
  title?: string | null;
  price?: number | null;
  currency?: string | null;
  id?: string | null;
  pricePerSeat?: number | null;
}
