import { ChalkInstance } from "chalk";
import wcswidth from "@topcli/wcwidth";
export const Box = (message: string, colorChalk: ChalkInstance) => {
  const messageLength = wcswidth(message);
  const boxBar = new Array(messageLength).fill("━").join("");

  console.log(colorChalk(`\n┏━${boxBar}━┓`));
  console.log(`${colorChalk("┃")} ${message} ${colorChalk("┃")}`);
  console.log(colorChalk(`┗━${boxBar}━┛\n`));
};
