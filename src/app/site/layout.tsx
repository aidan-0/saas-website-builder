import Navigation from "@/components/site/navigation";
import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

const layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<ClerkProvider appearance={{ baseTheme: dark }}>
			<main>
			<Navigation />
			{children}
		</main>
		</ClerkProvider>
	);
};

export default layout;

