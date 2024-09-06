import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
	"/agency/sign-in(.*)",
	"/agency/sign-up(.*)",
	"/site",
	"/api/uploadthing",
]);

export default clerkMiddleware((auth, req) => {
	// Enforce authentication for non-public routes
	if (!isPublicRoute(req)) {
		auth().protect();
	}

	// Extract URL and search parameters
	const url = req.nextUrl;
	const searchParams = url.searchParams.toString();
	let hostname = req.headers;
	console.log("hostname", hostname);

	// Construct the full path with search parameters
	const pathWithSearchParams = `${url.pathname}${
		searchParams.length > 0 ? `?${searchParams}` : ""
	}`;

	// Check for subdomains
	const customSubDomain = hostname
		.get("host")
		?.split(`${process.env.NEXT_PUBLIC_DOMAIN}`)
		.filter(Boolean)[0];

	// Rewrite URL if a subdomain exists
	if (customSubDomain) {
		return NextResponse.rewrite(
			new URL(`/${customSubDomain}${pathWithSearchParams}`, req.url)
		);
	}

	// Redirect specific paths
	if (url.pathname === "/sign-in" || url.pathname === "/sign-up") {
		return NextResponse.redirect(new URL(`/agency/sign-in`, req.url));
	}

	// Rewrite root and site paths
	if (
		url.pathname === "/" ||
		(url.pathname === "/site" &&
			url.host === process.env.NEXT_PUBLIC_DOMAIN)
	) {
		return NextResponse.rewrite(new URL("/site", req.url));
	}

	// Rewrite paths starting with /agency or /subaccount
	if (
		url.pathname.startsWith("/agency") ||
		url.pathname.startsWith("/subaccount")
	) {
		return NextResponse.rewrite(
			new URL(`${pathWithSearchParams}`, req.url)
		);
	}
});

export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		// Always run for API routes
		"/(api|trpc)(.*)",
	],
};
