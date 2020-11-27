import express from 'express'
import path from 'path'
import { env } from './env'

export const runDummyServer = () =>
	express()
		.use(express.static(path.join(__dirname, '../public')))
		.listen(env.PORT, () => console.log(`[DUMMY SERVER]: Listening on ${env.PORT}`))
