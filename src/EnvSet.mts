import { execSync } from "child_process";
import * as Stat from "./Stat.mjs";

const getStagedFileList = async () => {
	return execSync("git diff --cached --name-only --diff-filter=d")
		.toString()
		.split("\n")
		.slice(0, -1)
		.map((filename) => (filename.includes(" ") ? `"${filename}"` : filename));
};

const getStagedTSFileList = (stagedFileList: string[]) =>
	stagedFileList.filter((filename) =>
		[".ts", ".tsx", ".mts", ".mtsx"].some((ext) => filename.endsWith(ext))
	);

const getProductTSFileList = (TSFilesList: string[]) =>
	TSFilesList.filter((filename) => !filename.includes("husky"));

const stagedFileList = await getStagedFileList();
const TSFilesList = getStagedTSFileList(stagedFileList);
const ProductTSFilesList = getProductTSFileList(TSFilesList);

const getEnvLocale = (env: NodeJS.ProcessEnv) =>
	env.LC_ALL || env.LC_MESSAGES || env.LANG || env.LANGUAGE;

export type t = {
  stagedFileList: string[];
  TSFilesList: string[];
  ProductTSFilesList: string[];
  stat: Stat.t;
  sourceDir: string[];
  unsafeBranchList: string[];
  env?: string;
};

export const EnvSet: t = {
	stagedFileList,
	TSFilesList,
	ProductTSFilesList,
	stat: Stat.Stat,
	sourceDir: ["./src"],
	unsafeBranchList: ["main", "master"],
	env: getEnvLocale(process.env),
};
