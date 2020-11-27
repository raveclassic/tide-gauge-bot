import { Telegraf } from 'telegraf'
import { env } from './env'
import { getValue } from './data'
import { addChat, deleteChat, getAllChats, getClient } from './db'

const UPDATE_INTERVAL = 1000 * 60 * 5 // 5 minutes

const log = (...args: unknown[]) => console.log('[BOT]:', ...args)

export const newBot = async () => {
	const client = await getClient()
	let lastValue: string | undefined = undefined

	const bot = new Telegraf(env.BOT_TOKEN)

	bot.start(async (ctx) => {
		log('Starting...')
		if (ctx.chat) {
			await addChat(ctx.chat.id, client)
		}

		const value = await getValue()

		if (value !== undefined) {
			lastValue = value
			log('Sending...', value)
			await ctx.reply(value)
		}
		log('Done')
	})

	bot.command('stop', async (ctx) => {
		log('Stopping...')
		if (ctx.chat) {
			await deleteChat(ctx.chat.id, client)
		}
		await ctx.reply('Ок')
		log('Done')
	})

	bot.command('check', async (ctx) => {
		log('Checking...')
		const value = await getValue()
		if (value !== undefined) {
			lastValue = value
			log('Sending...', value)
			await ctx.reply(value)
		}
		log('Done')
	})

	await bot.launch()

	const loop = async () => {
		const value = await getValue()
		if (value !== undefined && value !== lastValue) {
			lastValue = value
			log('Sending...', value)
			for (const chat of await getAllChats(client)) {
				await bot.telegram.sendMessage(chat.id, value)
			}
			log('Done')
		}
	}

	setInterval(() => void loop(), UPDATE_INTERVAL)
}
