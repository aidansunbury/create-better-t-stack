import path from "node:path";
import { log, spinner } from "@clack/prompts";
import pc from "picocolors";
import type { Database, ProjectConfig } from "../../types";
import {
	addEnvVariablesToFile,
	type EnvVariable,
} from "../project-generation/env-setup";

export async function setupDockerCompose(config: ProjectConfig): Promise<void> {
	const { database, projectDir, projectName } = config;

	if (database === "none") {
		return;
	}

	const s = spinner();
	s.start("Setting up Docker Compose for local development...");

	try {
		await writeEnvFile(projectDir, database, projectName);
		s.stop(pc.green("Docker Compose setup completed"));
	} catch (error) {
		s.stop(pc.red("Failed to setup Docker Compose"));
		if (error instanceof Error) {
			log.error(pc.red(`Error: ${error.message}`));
		}
	}
}

async function writeEnvFile(projectDir: string, database: Database, projectName: string) {
	const envPath = path.join(projectDir, "apps/server", ".env");
	const variables: EnvVariable[] = [
		{
			key: "DATABASE_URL",
			value: getDatabaseUrl(database, projectName),
			condition: true,
		},
	];
	await addEnvVariablesToFile(envPath, variables);
}

function getDatabaseUrl(database: Database, projectName: string): string {
	switch (database) {
		case "postgres":
			return `postgresql://postgres:password@localhost:5432/${projectName}`;
		case "mysql":
			return `mysql://user:password@localhost:3306/${projectName}`;
		case "mongodb":
			return `mongodb://root:password@localhost:27017/${projectName}?authSource=admin`;
		default:
			return "";
	}
}
