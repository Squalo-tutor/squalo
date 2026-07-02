export type TutorPublic = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  verification_status: "in_verifica" | "verificato";
  subjects: string[];
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  days: string[];
  time_slots: string[];
  price_per_hour: number;
  bio: string | null;
};
