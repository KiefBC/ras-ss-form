export type Site = { id: string; name: string; address: string | null };

// Placeholder until the form reads active rows from public.sites.
export const PLACEHOLDER_SITES: Site[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    name: "Kakariko Village",
    address: "Hyrule",
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    name: "Pallet Town",
    address: "Kanto",
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    name: "Rapture",
    address: "North Atlantic Ocean",
  },
  {
    id: "00000000-0000-4000-8000-000000000004",
    name: "Vault 101",
    address: "Capital Wasteland",
  },
];
