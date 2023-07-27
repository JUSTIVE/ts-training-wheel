import * as SkipCondition from "./SkipCondition.mjs";
import * as PostAction from "./PostAction.mjs";
import * as EnvSet from "./EnvSet.mjs";

export type t = {
  emoji: string;
  name: string;
  skipCondition?: SkipCondition.t[];
  command: (envSet: EnvSet.t) => string;
  recommendedAction?: (envSet: EnvSet.t) => string;
  errorMessage?: string;
  expectedExitCode?: number;
  postAction?: PostAction.t;
};

const BRANCH_CHECKING: t = {
  emoji: "🌲",
  name: "Branch Checking",
  command: ({ unsafeBranchList }) =>
    `git rev-parse --abbrev-ref HEAD | grep -E "${unsafeBranchList.join("|")}"`,
  errorMessage:
    "위험한 브랜치에 커밋을 하고 있습니다. 다른 브랜치에서 작업해 주세요",
  expectedExitCode: 1,
};

const FORMAT_TYPESCRIPT_FILES: t = {
  emoji: "💅",
  name: "Formatting staged files",
  command: ({ TSFilesList }: EnvSet.t) =>
    `${TSFilesList} | xargs prettier --write --loglevel silent`,
  recommendedAction: ({ TSFilesList }) =>
    `${TSFilesList} | xargs prettier --write`,
  skipCondition: [SkipCondition.NO_TYPESCRIPT_FILES],
  postAction: PostAction.STAGE_TS_FILES,
};

const _ALWAYS_FAILING_ONLY_FOR_TESTING: t = {
  emoji: "🚨",
  name: "ALWAYS FAILING ONLY FOR TESTING",
  command: () => 'echo "error" && exit 123',
};

export const STEPS: t[] = [
  BRANCH_CHECKING,
  FORMAT_TYPESCRIPT_FILES,
  {
    emoji: "📏",
    name: "Lint Checking",
    command: ({ sourceDir }) =>
      `npx eslint --ext .ts --ext .tsx --ext .mts --ext .mtsx ${sourceDir.join(
        " "
      )} --fix`,
    skipCondition: [SkipCondition.NO_PRODUCT_TYPESCRIPT_FILES],
  },
  {
    emoji: "🔍",
    name: "Type Checking",
    command: () => "pnpm tsc -p .",
    skipCondition: [SkipCondition.NO_PRODUCT_TYPESCRIPT_FILES],
  },
  {
    emoji: "🏗️ ",
    name: "Build Checking",
    command: () => "pnpm run build",
    skipCondition: [SkipCondition.NO_PRODUCT_TYPESCRIPT_FILES],
  },
];

export const getName = ({ emoji, name }: t) => `${emoji} ${name}`;
export const getCommand = (envSet: EnvSet.t, { command }: t) => command(envSet);
export const getRecommendedAction = (
  envSet: EnvSet.t,
  { recommendedAction, command }: t
) => (recommendedAction ?? command)(envSet);
export const getSkipCondition = (envSet: EnvSet.t, { skipCondition }: t) =>
  skipCondition?.map((x) => x(envSet)).reduce((a, b) => a || b) ?? false;
export const getErrorMessage = (
  envSet: EnvSet.t,
  { errorMessage, recommendedAction, command }: t
) =>
  errorMessage ??
  (recommendedAction ? recommendedAction(envSet) : command(envSet));
