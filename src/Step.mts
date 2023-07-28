import * as SkipCondition from "./SkipCondition.mjs";
import * as PostAction from "./PostAction.mjs";
import * as EnvSet from "./EnvSet.mjs";
import { STEP_PRESET } from './Step.Preset.mjs';


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



export const STEPS: t[] = [
	STEP_PRESET.BRANCH_CHECKING,
	STEP_PRESET.FORMAT_TYPESCRIPT_FILES,
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
		command: () => "pnpm tsc -p . --noEmit",
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
