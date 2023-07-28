import { STEPS_VARIANT } from './Step.Preset.mjs';

export type t = {
  steps: STEPS_VARIANT[];
  unSafeBranchList:string[],
  sourceDir:string[]
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
    sourceDir:["./src"]
  })
}

export const load = async(): Promise<t> => {
  try{
    //read file

    //if file not exists, make file and return gathered info
    return ({
      steps: [],
      unSafeBranchList: ["main", "master"],
      sourceDir: ["./src"]
    })
  }
  catch{
    return await create()
  }
}