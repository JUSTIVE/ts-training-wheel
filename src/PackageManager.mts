import * as O from 'effect/Option'
import * as F from 'effect/Function'
import {select} from '@topcli/prompts'
import {pipe} from 'effect/Function'
import fs from 'fs'
import {match} from 'ts-pattern'
import { VerboseLog } from './Decorator.mjs'

export type t = "npm" | "yarn" | "pnpm"

const determine = (): O.Option<t> => {
  return pipe(
    fs.readdirSync("./").filter((filename)=>filename.includes("lock")).at(0),
    O.fromNullable,
    O.flatMap(lockFile=>{
      return match(lockFile)
      .returnType<O.Option<t>>()
      .with("package-lock.json",F.constant(O.some("npm")))
      .with("yarn.lock",F.constant(O.some("yarn")))
      .with("pnpm-lock.yaml",F.constant(O.some("pnpm")))
      .otherwise(F.constant(O.none()))
    })
  )
}

const askPackageManager = async():Promise<t> =>{
  const response = await select("Select your package manager",{choices:[
    {value:"npm", label:"npm"},
    {value:"yarn", label:"yarn"},
    {value:"pnpm", label:"pnpm"}
  ]})
  return (response === "npm" || response === "yarn" || response === "pnpm")
    ? response
    : await askPackageManager()
}

export const get = async (verbose:boolean):Promise<t> => {
  const packageManager =  await pipe(
    determine(),
    O.getOrElse(askPackageManager)
  )
  if(verbose)
    VerboseLog(`Detected Package Manager is ${packageManager}`)

  return packageManager
}