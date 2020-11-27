import express from 'express'
import path from 'path'

export const runDummyServer = () =>
	express()
		.use(express.static(path.join(__dirname, 'public')))
		.listen(process.env.PORT, () => console.log(`[DUMMY SERVER]: Listening on ${process.env.PORT}`))
