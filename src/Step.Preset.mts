import * as SkipCondition from "./SkipCondition.mjs";
import * as PostAction from "./PostAction.mjs";
import * as EnvSet from "./EnvSet.mjs";
import * as Step from "./Step.mjs";

const _ALWAYS_FAILING_ONLY_FOR_TESTING: Step.t = {
	emoji: "🚨",
	name: "ALWAYS FAILING ONLY FOR TESTING",
	command: () => "echo \"error\" && exit 123",
};

const BRANCH_CHECKING: Step.t = {
	emoji: "🌲",
	name: "Branch Checking",
	command: ({ safeBranch }) =>
		`exit ${safeBranch?0:1}`,
	errorMessage:
    "위험한 브랜치에 커밋을 하고 있습니다. 다른 브랜치에서 작업해 주세요",
	expectedExitCode: 0,
};

const FORMAT_TYPESCRIPT_FILES: Step.t = {
	emoji: "💅",
	name: "Formatting staged files",
	command: ({ TSFilesList }: EnvSet.t) =>
		`${TSFilesList} | xargs prettier --write --loglevel silent`,
	recommendedAction: ({ TSFilesList }) =>
		`${TSFilesList} | xargs prettier --write`,
	skipCondition: [SkipCondition.NO_TYPESCRIPT_FILES],
	postAction: PostAction.STAGE_TS_FILES,
};

const ESLINT_CHECKING: Step.t = {
		emoji: "📏",
		name: "Lint Checking",
		command: ({ sourceDir }) =>
			`npx eslint --ext .ts --ext .tsx --ext .mts --ext .mtsx ${sourceDir.join(
				" "
			)} --fix`,
		skipCondition: [SkipCondition.NO_PRODUCT_TYPESCRIPT_FILES],
	}

const TYPE_CHECKING:Step.t = {
	emoji: "🔍",
	name: "Type Checking",
	command: ({packageManager}) => `${packageManager} tsc -p . --noEmit`,
	skipCondition: [SkipCondition.NO_PRODUCT_TYPESCRIPT_FILES],
};

const BUILD: Step.t = {
	emoji: "🏗️ ",
	name: "Build Checking",
	command: ({packageManager}) => `${packageManager} run build`,
	skipCondition: [SkipCondition.NO_PRODUCT_TYPESCRIPT_FILES],
};

export const STEP_PRESET = {
	_ALWAYS_FAILING_ONLY_FOR_TESTING,
	BRANCH_CHECKING,
	ESLINT_CHECKING,
	FORMAT_TYPESCRIPT_FILES,
	TYPE_CHECKING,
	BUILD
};

export const STEPS_KIND = Object.keys(STEP_PRESET);
export type STEPS_VARIANT = keyof typeof STEP_PRESET;