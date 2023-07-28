import { exec } from "child_process";
import chalk from "chalk";
import * as EnvSet from "./EnvSet.mjs";
import * as Step from "./Step.mjs";
import { Spinner } from "@topcli/spinner";
import * as Stat from "./Stat.mjs";
import * as Decorator from "./Decorator.mjs";
import { pipe } from 'effect';
import * as Config from './Config.mjs'


type Running = EnvSet.t
type Exit = number 
type Program = 
	| Running
	| Exit

const flatMap = (f:(prev:Running)=>Program)=>(prevResult:Program)=>{
	return (typeof prevResult === 'number')
		?	prevResult
		: f(prevResult)
}

const get = (program:Program):EnvSet.t=>{
	return (typeof program ==="number")
		? process.exit(program)
		:	program
}

const exitWhenNoStagedFiles = (envSet: EnvSet.t):Program => {
	if (envSet.stagedFileList.length === 0) {
		Decorator.Box("스테이징된 파일이 없어 종료합니다.", chalk.cyan);
		return 0
	}
	return envSet
};

const notifyNoTSFiles = (envSet: EnvSet.t):Program => {
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
	return envSet
};

const runSteps = async(steps:Step.t[])=> async (envSet: EnvSet.t) => {
	const promises = steps.filter(
		(step) => !(envSet.safeBranch && step.name === "빌드 검사")
	);
	const results = await Promise.allSettled(
		promises.map((step) => Step.runner(step, envSet))
	);

	Spinner.reset();
	return results;
};

const runStep = (step: Step.t, envSet: EnvSet.t) => {
	return new Promise((resolve) => {
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
	steps: Step.t[],
	envSet: EnvSet.t,
	results: PromiseSettledResult<Step.StepResult>[]
) => {
	Decorator.Box(
		"실패한 첫 번째 명령어를 다시 실행합니다",
		chalk.hex("#FF7900")
	);
	const failedIndex = results.findIndex(
		(result) => result.status === "rejected"
	);
	return await runStep(steps[failedIndex], envSet);
};

// const program = Effect.promise<number>(
// 	(envSet:EnvSet)=>{

// 	}
// )

const program= async (steps:Step.t[])=>async(envSet: EnvSet.t) =>{
	Stat.Log(envSet.stat);
	const results = await pipe(
		envSet,
		exitWhenNoStagedFiles,
		flatMap(notifyNoTSFiles),
		get,
		await runSteps(steps)
	)
		
	const COMMITABLE_STATE = results.filter(({status})=>status === "rejected").length === 0 ? "Commitable" : "NotCommitable";

	if (COMMITABLE_STATE === "NotCommitable") {
		Decorator.Box("커밋할 수 없습니다", chalk.red);
		await runFirstFailedStep(steps,envSet, results);
		process.exit(1);
	} else {
		Decorator.Box("커밋할 수 있습니다", chalk.green);
		process.exit(0);
	}
}

await pipe(
	await EnvSet.make((await Config.load())),
	await program(Step.STEPS)
)

