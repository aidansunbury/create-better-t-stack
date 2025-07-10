import os from "node:os";
import path from "node:path";
import { log, spinner } from "@clack/prompts";
import { $ } from "execa";
import pc from "picocolors";
import type { Database, ProjectConfig } from "../../types";
import { commandExists } from "../../utils/command-exists";
import {
	addEnvVariablesToFile,
	type EnvVariable,
} from "../project-generation/env-setup";

async function isDockerInstalled() {
	return commandExists("docker");
}

async function isDockerRunning() {
	try {
		await $`docker info`;
		return true;
	} catch {
		return false;
	}
}

function displayDockerInstallInstructions(
	platform: string,
	database: Database,
) {
	const isMac = platform === "darwin";
	const isWindows = platform === "win32";
	const isLinux = platform === "linux";

	let installUrl = "";
	let platformName = "";

	if (isMac) {
		installUrl = "https://docs.docker.com/desktop/setup/install/mac-install/";
		platformName = "macOS";
	} else if (isWindows) {
		installUrl =
			"https://docs.docker.com/desktop/setup/install/windows-install/";
		platformName = "Windows";
	} else if (isLinux) {
		installUrl = "https://docs.docker.com/desktop/setup/install/linux/";
		platformName = "Linux";
	}

	const databaseName =
		database === "mongodb"
			? "MongoDB"
			: database === "mysql"
				? "MySQL"
				: "PostgreSQL";

	log.info(
		`Docker required for ${databaseName}. Install for ${platformName}: ${pc.blue(installUrl)}`,
	);
}

export async function setupDockerCompose(config: ProjectConfig): Promise<void> {
	const { database, projectDir, projectName } = config;

	if (database === "none" || database === "sqlite") {
		return;
	}

	const s = spinner();
	s.start("Checking Docker availability...");

	try {
		const platform = os.platform();

		const dockerInstalled = await isDockerInstalled();

		if (!dockerInstalled) {
			s.stop(pc.red("Docker not found"));
			displayDockerInstallInstructions(platform, database);
			return;
		}

		const dockerRunning = await isDockerRunning();

		if (!dockerRunning) {
			s.stop(pc.yellow("Docker is installed but not running."));
			return;
		}

		await writeEnvFile(projectDir, database, projectName);
	} catch (error) {
		if (error instanceof Error) {
			log.error(pc.red(`Error: ${error.message}`));
		}
	}
}

async function writeEnvFile(
	projectDir: string,
	database: Database,
	projectName: string,
) {
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
