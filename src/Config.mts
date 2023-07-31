import {  readFileSync } from 'fs';
import { STEPS_VARIANT } from './Step.Preset.mjs';
import { Effect, pipe } from 'effect';

export type t = {
  steps: STEPS_VARIANT[];
  unSafeBranchList:string[],
  sourceDir:string[],
  verbose:boolean
}
// {
//   try{
//     execSync(`git rev-parse --abbrev-ref HEAD | grep -E "${unSafeBranchList.join("|")}"`)
//     return Effect.succeed(0)
//   }
//   catch{
//     return Effect.succeed(1)
//   }
// }
export const create = async():Promise<t>=>{
  return ({
    steps:[],
    unSafeBranchList:["main","master"],
    sourceDir:["./src"],
    verbose:true
  })
}

class ConfigLoadError {
  readonly _tag = "ConfigLoadError"
}

export const load = async(): Promise<t> => {
  try{
    //read file "tstw.config.json"
    //if file not exists, make file and return gathered info
    
    const configFromFile = () => 
      Effect.try({
        try: () => pipe(readFileSync('./tstw.config.json').toString(),JSON.parse),
        catch: () => new ConfigLoadError()
      })
    


    return ({
      steps: [],
      unSafeBranchList: ["main", "master"],
      sourceDir: ["./src"],
      verbose:true
    })
  }
  catch{
    return await create()
  }
}