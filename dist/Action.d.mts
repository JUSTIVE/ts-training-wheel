import * as SkipCondition from "./SkipCondition.mts";
import * as PostAction from "./PostAction.mts";
import * as EnvSet from "./EnvSet.mts";
export type t = {
    emoji: string;
    name: string;
    command: (envSet: EnvSet.t) => string;
    expectedExitCode?: number;
    recommendedAction?: (envSet: EnvSet.t) => string;
    skipCondition?: SkipCondition.t;
    postAction?: PostAction.t;
};
export declare const ACTIONS: t[];
export declare const getName: ({ emoji, name }: t) => string;
