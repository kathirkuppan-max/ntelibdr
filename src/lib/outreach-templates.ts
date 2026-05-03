// DEPRECATED — content has moved into per-product config in products.ts.
// Kept as a thin re-export shim so existing imports keep working until
// every caller switches to PRODUCTS[productId].personas / pickPersonaForProduct.

import { PRODUCTS, pickPersonaForProduct, type OutreachTemplate } from './products'

export type { OutreachTemplate }

// Recapture personas (the original list).
export const PERSONAS: OutreachTemplate[] = PRODUCTS.recapture.personas

// Default Recapture persona match — same signature as before.
export function pickPersona(contactTitle: string): OutreachTemplate {
  return pickPersonaForProduct('recapture', contactTitle)
}
