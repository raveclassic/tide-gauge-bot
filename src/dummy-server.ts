import express from 'express'

export const runDummyServer = () =>
	express().listen(process.env.PORT, () => console.log(`[DUMMY SERVER]: Listening on ${process.env.PORT}`))
