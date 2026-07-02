export type Conversation = {
  id: string;
  student_id: string;
  tutor_id: string;
  created_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export type ChatPerson = {
  id: string;
  full_name: string;
  avatar_url: string | null;
};

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
