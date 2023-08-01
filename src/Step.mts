import * as SkipCondition from "./SkipCondition.mjs";
import * as PostAction from "./PostAction.mjs";
import * as EnvSet from "./EnvSet.mjs";
import { STEP_PRESET } from './Step.Preset.mjs';
import { Spinner } from '@topcli/spinner';
import chalk from 'chalk';
import { exec } from 'child_process';

export type t = {
  emoji?: string;
  name: string;
  skipCondition?: SkipCondition.t[];
  command: (envSet: EnvSet.t) => string;
  recommendedAction?: (envSet: EnvSet.t) => string;
  errorMessage?: string;
  expectedExitCode?: number;
  postAction?: PostAction.t;
};

export type StepResult = "SUCCESS" | "FAIL" | "SKIP";

export const STEPS: t[] = [
	STEP_PRESET.BRANCH_CHECKING,
	STEP_PRESET.FORMAT_TYPESCRIPT_FILES,
	STEP_PRESET.ESLINT_CHECKING,
	STEP_PRESET.TYPE_CHECKING,
	STEP_PRESET.BUILD,
];

export const getName = ({ emoji, name }: t) => `${emoji??'  '} ${name}`;
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

export const runner = async (step: t, envSet: EnvSet.t): Promise<StepResult> => {
	const name = getName(step);
	return new Promise((resolve, reject) => {
		const spinner = new Spinner().start(`${chalk.bgGray("    ")} ${name}`);

		if (getSkipCondition(envSet, step)) {
			spinner.succeed(`${chalk.bgYellow("SKIP")} ${chalk.yellow(name)}`);
			resolve("SKIP");
			return;
		}

		const command = exec(getCommand(envSet, step));

		command.on("exit", (code) => {
			if (code !== (step.expectedExitCode ?? 0)) {
				const errorMessage = getErrorMessage(envSet, step);

				spinner.failed(
					`${chalk.bold.bgRed("FAIL")} ${chalk.red(
						`${name} 에 실패했습니다`
					)} > ${chalk.gray(errorMessage)}`
				);
				reject("FAIL");
				return;
			} else {
				spinner.succeed(`${chalk.bold.bgGreen("DONE")} ${chalk.green(`${name} `)}`);
				if (step.postAction) {
					step.postAction(envSet);
				}
				resolve("SUCCESS");
				return;
			}
		});
	});
};