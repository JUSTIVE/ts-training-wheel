import * as Stat from "./Stat.mjs";
import * as Config from "./Config.mjs"
import * as PackageManager from "./PackageManager.mjs";
import { execSync } from 'child_process';
import { osLocale } from 'os-locale';
import { pipe}  from 'effect';

export type t = {
	packageManager: PackageManager.t;
  stagedFileList: string[];
  TSFilesList: string[];
  ProductTSFilesList: string[];
  stat: Stat.t;
  sourceDir: string[];
  unSafeBranchList: string[];
	safeBranch: boolean
  locale?: string;
  verbose:boolean;
};

type StagedFile = string
type StagedFileList = StagedFile[]

const getStagedFileList = async ():Promise<StagedFileList> => {
	return execSync("git diff --cached --name-only --diff-filter=d")
		.toString()
		.split("\n")
		.slice(0, -1)
		.map((filename) => (filename.includes(" ") ? `"${filename}"` : filename));
};

const getStagedTSFileList = (stagedFileList: StagedFileList):StagedFileList =>
	stagedFileList.filter((filename) =>
		[".ts", ".tsx", ".mts", ".mtsx"].some((ext) => filename.endsWith(ext))
	);

const getProductTSFileList = (TSFilesList: string[]) =>
	TSFilesList.filter((filename) => !filename.includes("husky"));

const stagedFileList = await getStagedFileList();
const TSFilesList = getStagedTSFileList(stagedFileList);
const ProductTSFilesList = getProductTSFileList(TSFilesList);

export const determineSafeBranch = (unSafeBranchList:string[]):boolean=> 
{
  try{
    execSync(`git rev-parse --abbrev-ref HEAD | grep -E "${unSafeBranchList.join("|")}"`); 
    return false
  }
  catch{
    return true
  }
}

export const make = async ({sourceDir,unSafeBranchList,verbose}:Config.t): Promise<t> => {
  return ({
    packageManager: await PackageManager.get(verbose),
    stagedFileList,
    TSFilesList,
    ProductTSFilesList,
    stat: Stat.getStat(),
    sourceDir,
    unSafeBranchList,
    safeBranch: pipe(unSafeBranchList,determineSafeBranch),
    locale: await osLocale(),
    verbose
  })
}