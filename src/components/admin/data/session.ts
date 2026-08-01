import type { AdminService } from '@/components/admin/data/mock';

const SERVICE_KEY = 'vanguard-admin-service-draft';

export function stashServiceDraft(service: AdminService) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SERVICE_KEY, JSON.stringify(service));
}

export function readServiceDraft(id?: string): AdminService | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(SERVICE_KEY);
  if (!raw) return null;
  try {
    const service = JSON.parse(raw) as AdminService;
    if (id && service.id !== id) return null;
    return service;
  } catch {
    return null;
  }
}
