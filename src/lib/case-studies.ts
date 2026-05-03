// DEPRECATED — content has moved into per-product config in products.ts.
// Kept as a thin re-export shim so existing imports keep working.
// Defaults to the Recapture case studies. New consumers should read
// PRODUCTS[productId].caseStudies directly.

import { PRODUCTS } from './products'

export const CASE_STUDY_KB: Record<string, string> = PRODUCTS.recapture.caseStudies
