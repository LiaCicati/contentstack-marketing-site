/**
 * Edge Middleware — Contentstack Personalize
 * ──────────────────────────────────────────────────────────
 * Runs at the edge before every page request. Initialises the
 * Personalize SDK, resolves the visitor's variant assignment
 * and forwards it as a query parameter so page components can
 * fetch the correct entry variant.
 */

import { NextRequest, NextResponse } from "next/server";
import Personalize from "@contentstack/personalize-edge-sdk";

/** Paths we never need to personalise */
const IGNORED_PREFIXES = ["/_next", "/api", "/favicon.ico"];

export default async function middleware(req: NextRequest) {
  // Skip static assets / API routes
  if (IGNORED_PREFIXES.some((p) => req.nextUrl.pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const projectUid = process.env.NEXT_PUBLIC_PERSONALIZE_PROJECT_UID;
  if (!projectUid) {
    // Personalize not configured — pass through
    return NextResponse.next();
  }

  // Set the regional Edge API URL (EU stack)
  if (process.env.CONTENTSTACK_PERSONALIZE_EDGE_API_URL) {
    Personalize.setEdgeApiUrl(process.env.CONTENTSTACK_PERSONALIZE_EDGE_API_URL);
  }

  try {
    const personalizeSdk = await Personalize.init(projectUid, {
      request: req,
    });

    const variantParam = personalizeSdk.getVariantParam();
    const parsedUrl = new URL(req.url);

    // Attach the variant aliases so pages can read them
    if (variantParam) {
      parsedUrl.searchParams.set(
        personalizeSdk.VARIANT_QUERY_PARAM,
        variantParam,
      );
    }

    const response = NextResponse.rewrite(parsedUrl);

    // Persist the user UID + manifest state in cookies
    personalizeSdk.addStateToResponse(response);

    return response;
  } catch (err) {
    console.error("[Personalize middleware]", err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon\\.ico).*)",
  ],
};
