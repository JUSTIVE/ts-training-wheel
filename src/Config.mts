import * as Step from './Step.mjs'

export type t = {
  steps: Step.t[];
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
export const create = async()=>{
  
}

export const load = async(): Promise<t> => {
  //read file

  //if file not exists, make file and return gathered info
  return ({
    steps: [],
    unSafeBranchList: ["main", "master"],
    sourceDir: ["./src"]
  })
}