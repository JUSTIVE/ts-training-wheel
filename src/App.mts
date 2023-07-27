import { exec, execSync } from "child_process";
import chalk from "chalk";
import * as EnvSet from "./EnvSet.mjs";
import * as Step from "./Step.mjs";
import { Spinner } from "@topcli/spinner";
import * as Stat from "./Stat.mjs";
import * as Decorator from "./Decorator.mjs";

type COMMITABLE_STATE = "Commitable" | "NotCommitable";
type Result = "SUCCESS" | "FAIL" | "SKIP";

let COMMITABLE_STATE: COMMITABLE_STATE = "Commitable";
const IS_DEPLOYMENT_BRANCH = false;

const runner = async (step: Step.t, envSet: EnvSet.t): Promise<Result> => {
  const name = Step.getName(step);
  return new Promise((resolve, reject) => {
    const spinner = new Spinner().start(`${chalk.bgGray("    ")} ${name}`);

    if (Step.getSkipCondition(envSet, step)) {
      spinner.succeed(`${chalk.bgYellow("SKIP")} ${chalk.yellow(name)}`);
      resolve("SKIP");
      return;
    }

    const command = exec(Step.getCommand(envSet, step));

    command.on("exit", (code) => {
      if (code !== (step.expectedExitCode ?? 0)) {
        COMMITABLE_STATE = "NotCommitable";
        const errorMessage = Step.getErrorMessage(envSet, step);

        spinner.failed(
          `${chalk.bgRed(`FAIL`)} ${chalk.red(
            `${name} 에 실패했습니다`
          )} > ${chalk.gray(errorMessage)}`
        );
        reject("FAIL");
        return;
      } else {
        spinner.succeed(`${chalk.bgGreen("DONE")} ${chalk.green(`${name} `)}`);
        if (step.postAction) {
          step.postAction(EnvSet.EnvSet);
        }
        resolve("SUCCESS");
        return;
      }
    });
  });
};

const exitWhenNoStagedFiles = (envSet: EnvSet.t) => {
  if (envSet.stagedFileList.length === 0) {
    Decorator.Box("스테이징된 파일이 없어 종료합니다.", chalk.cyan);
    process.exit(0);
  }
};

const notifyNoTSFiles = (envSet: EnvSet.t) => {
  if (envSet.TSFilesList.length === 0) {
    Decorator.Box(
      "타입스크립트 파일이 없어 일부 단계를 건너뜁니다.",
      chalk.cyan
    );
  } else {
    if (envSet.ProductTSFilesList.length === 0) {
      Decorator.Box(
        "프로덕션 타입스크립트 파일이 없어 일부 단계를 건너뜁니다.",
        chalk.cyan
      );
    }
  }
};

const runSteps = async (envSet: EnvSet.t) => {
  const promises = Step.STEPS.filter(
    (step) => !(IS_DEPLOYMENT_BRANCH && step.name === "빌드 검사")
  );
  const results = await Promise.allSettled(
    promises.map((step) => runner(step, envSet))
  );

  Spinner.reset();
  return results;
};

const runStep = (step: Step.t, envSet: EnvSet.t) => {
  return new Promise((resolve, reject) => {
    const recommendedAction = Step.getRecommendedAction(envSet, step);
    const command = exec(recommendedAction, (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
    });
    command.on("exit", () => {
      resolve(null);
    });
  });
};

const runFirstFailedStep = async (
  envSet: EnvSet.t,
  results: PromiseSettledResult<Result>[]
) => {
  Decorator.Box(
    "실패한 첫 번째 명령어를 다시 실행합니다",
    chalk.hex("#FF7900")
  );
  const failedIndex = results.findIndex(
    (result) => result.status === "rejected"
  );
  return await runStep(Step.STEPS[failedIndex], envSet);
};
async function main(envSet: EnvSet.t) {
  exitWhenNoStagedFiles(envSet);
  notifyNoTSFiles(envSet);

  Stat.Log(envSet.stat);
  const results = await runSteps(envSet);

  if (COMMITABLE_STATE === "NotCommitable") {
    Decorator.Box("커밋할 수 없습니다", chalk.red);
    await runFirstFailedStep(envSet, results);
    process.exit(1);
  } else {
    Decorator.Box("커밋할 수 있습니다", chalk.green);
    process.exit(0);
  }
}

main(EnvSet.EnvSet);
