import { config } from 'dotenv'
import { strict, string, Type } from 'io-ts'
import { isLeft } from 'fp-ts/Either'
import { NumberFromString } from 'io-ts-types/NumberFromString'

export interface Env {
	readonly BOT_TOKEN: string
	readonly DATABASE_URL: string
	readonly UPDATE_INTERVAL: number
	readonly PORT: number
}

const envCodec: Type<Env, unknown> = strict({
	BOT_TOKEN: string,
	DATABASE_URL: string,
	UPDATE_INTERVAL: NumberFromString,
	PORT: NumberFromString,
})

const local = envCodec.decode({ ...process.env, ...config().parsed })
if (isLeft(local)) {
	throw local.left
}
export const env: Env = local.right
