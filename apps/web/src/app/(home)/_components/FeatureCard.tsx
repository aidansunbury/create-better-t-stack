"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type TechOption = {
	id: string;
	name: string;
	icon: string;
};

type FeatureCardProps = {
	title: string;
	description?: string;
	options: TechOption[];
	className?: string;
};

function TechIcon({
	icon,
	name,
	className,
}: {
	icon: string;
	name: string;
	className?: string;
}) {
	const [mounted, setMounted] = useState(false);
	const { theme } = useTheme();

	useEffect(() => {
		setMounted(true);
	}, []);

	if (mounted && icon.startsWith("/icon/")) {
		if (
			theme === "light" &&
			(icon.includes("drizzle") ||
				icon.includes("prisma") ||
				icon.includes("express"))
		) {
			icon = icon.replace(".svg", "-light.svg");
		}

		return (
			<Image
				src={icon}
				alt={`${name} icon`}
				width={24}
				height={24}
				className={cn("h-6 w-6 object-contain", className)}
				unoptimized
			/>
		);
	}

	return (
		<span
			className={cn(
				"flex h-6 w-6 items-center justify-center text-2xl",
				className,
			)}
		>
			{icon}
		</span>
	);
}

export default function FeatureCard({
	title,
	options,
	className,
}: FeatureCardProps) {
	return (
		<motion.div
			className={cn(
				"relative flex h-36 flex-col overflow-hidden rounded-lg border border-border bg-card p-2 shadow-sm",
				className,
			)}
			layout
		>
			<div>
				<h4 className="pb-2 text-center font-mono font-semibold text-foreground text-sm">
					{title}
				</h4>
			</div>
			<div className="flex-1 overflow-hidden">
				<ScrollArea className="h-full w-full">
					<ul className="grid grid-cols-3 gap-2 p-1">
						{options.map((option) => (
							<li
								key={option.id}
								title={option.name}
								className="flex items-center justify-center"
							>
								{/* {option.icon.startsWith("/") ? (
									<Image
										src={option.icon}
										alt={option.name}
										width={24}
										height={24}
										className="h-6 w-6 object-contain"
									/>
								) : (
									<span className="flex h-6 w-6 items-center justify-center text-2xl">
										{option.icon}
									</span>
								)} */}
								<TechIcon
									icon={option.icon}
									name={option.name}
									className="h-6 w-6 object-contain"
								/>
							</li>
						))}
					</ul>
				</ScrollArea>
			</div>
		</motion.div>
	);
}
