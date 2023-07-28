import * as SkipCondition from "./SkipCondition.mjs";
import * as PostAction from "./PostAction.mjs";
import * as EnvSet from "./EnvSet.mjs";
import * as Step from "./Step.mjs";

const BRANCH_CHECKING: Step.t = {
	emoji: "🌲",
	name: "Branch Checking",
	command: ({ unsafeBranchList }) =>
		`git rev-parse --abbrev-ref HEAD | grep -E "${unsafeBranchList.join("|")}"`,
	errorMessage:
    "위험한 브랜치에 커밋을 하고 있습니다. 다른 브랜치에서 작업해 주세요",
	expectedExitCode: 1,
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

const _ALWAYS_FAILING_ONLY_FOR_TESTING: Step.t = {
	emoji: "🚨",
	name: "ALWAYS FAILING ONLY FOR TESTING",
	command: () => "echo \"error\" && exit 123",
};

export const STEP_PRESET = {
	BRANCH_CHECKING,
	FORMAT_TYPESCRIPT_FILES,
	_ALWAYS_FAILING_ONLY_FOR_TESTING
};