import * as Stat from "./Stat.mts";
export type t = {
    stagedFileList: string[];
    TSFilesList: string[];
    ProductTSFilesList: string[];
    stat: Stat.t;
    sourceDir: string[];
    env?: string;
};
export declare const EnvSet: t;
