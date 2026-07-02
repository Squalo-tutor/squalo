const KEY = "squalo_pending_registration";

type PhotoData = { name: string; type: string; base64: string };

export type PendingRegistration =
  | {
      userType: "studente";
      fullName: string;
      phone: string;
      photo?: PhotoData;
    }
  | {
      userType: "tutor";
      fullName: string;
      whatsapp: string;
      photo?: PhotoData;
      subjects: string[];
      address: string;
      latitude: number | null;
      longitude: number | null;
      days: string[];
      timeSlots: string[];
      price: string;
      bio: string;
    };

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function base64ToFile(base64: string, name: string, type: string): File {
  const bstr = atob(base64.split(",")[1]);
  const u8arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
  return new File([u8arr], name, { type });
}

export function savePendingRegistration(data: PendingRegistration) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function loadPendingRegistration(): PendingRegistration | null {
  const raw = localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as PendingRegistration) : null;
}

export function clearPendingRegistration() {
  localStorage.removeItem(KEY);
}
