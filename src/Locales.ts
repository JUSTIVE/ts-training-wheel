import { O, pipe } from '@mobily/ts-belt';
import { osLocale } from 'os-locale';
import { match } from 'ts-pattern';

export type Locales = 
  | "en-US"
  | "ko-KR"
  | "ja-JP"

export const makeLocale = (value:string):O.Option<Locales>=>
  match(value)
  .with("en-US", O.Some)
  .with("ko-KR", O.Some)
  .with("ja-JP", O.Some)
  .otherwise(()=>O.None)

export const getLocale = async ():Promise<Locales>=>{
  //detect nodejs locale
  return pipe(
    await osLocale(),
    O.fromNullable,
    O.flatMap(makeLocale),
    O.getWithDefault<Locales>("en-US"),
  )
}