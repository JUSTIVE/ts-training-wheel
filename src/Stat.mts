import { execSync } from "child_process";
import chalk from "chalk";
import * as Decorator from "./Decorator.mjs";

export type FileDiff = {
  added: number;
  deleted: number;
  filename: string;
};
export type t = {
  files: FileDiff[];
  total: {
    added: number;
    deleted: number;
  };
};

const getStat = (): t => {
  const files: FileDiff[] = execSync("git diff --cached --numstat")
    .toString()
    .split("\n")
    .slice(0, -1)
    .map((line) => {
      const [added, deleted, filename] = line.split("\t");
      return {
        added: Number(added),
        deleted: Number(deleted),
        filename,
      };
    });

  const total = files.reduce(
    (acc, { added, deleted }) => ({
      added: acc.added + added,
      deleted: acc.deleted + deleted,
    }),
    { added: 0, deleted: 0 }
  );

  return { files, total };
};

export const Stat = getStat();

//log with box and text in it

export const Log = ({ files, total: { added, deleted } }: t) => {
  const logFile = (value: FileDiff) => {
    const tooManyConstraint = 200;
    const tooManyAdded = value.added > tooManyConstraint;
    const added = (tooManyAdded ? chalk.yellow : chalk.green)(value.added);

    const tooMayDeleted = value.deleted > tooManyConstraint;
    const deleted = (tooMayDeleted ? chalk.yellow : chalk.red)(value.deleted);

    const manyChanged = tooManyAdded || tooMayDeleted;
    const filename = (manyChanged ? chalk.yellow : chalk.cyan)(value.filename);
    console.log(`${added}\t${deleted}\t${filename}`);
  };
  console.log(`\n${chalk.bgCyan("\nStaged Files")}`);
  console.log(`\n${chalk.cyan("added\tdeleted\tfilename")}\n`);
  files.map(logFile);
  console.log("");
  console.log(`total added: ${chalk.green(added)}`);
  console.log(`total deleted: ${chalk.red(deleted)}`);
  console.log("");

  const tooManyChanged = added + deleted > 200 || files.length > 20;
  if (tooManyChanged) {
    Decorator.Box("Too many changes!!!", chalk.yellow);
  }
};
