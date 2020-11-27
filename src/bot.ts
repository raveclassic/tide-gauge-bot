import { Telegraf } from 'telegraf'
import { env } from './env'
import { getValue } from './data'
import { addChat, deleteChat, getAllChats, getClient, updateChat } from './db'

const log = (...args: unknown[]) => console.log('[BOT]:', ...args)
const error = (...args: unknown[]) => console.error('[BOT]:', ...args)

export const runBot = async () => {
	const client = await getClient()
	let lastValue: string | undefined = undefined
	let isInUpdateMode = false

	const bot = new Telegraf(env.BOT_TOKEN)

	bot.start(async (ctx) => {
		log('Starting...')
		isInUpdateMode = false
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

	bot.command('update', async (ctx) => {
		isInUpdateMode = true
		await ctx.reply('Введите значение:')
	})

	bot.command('stop', async (ctx) => {
		log('Stopping...')
		isInUpdateMode = false
		if (ctx.chat) {
			await deleteChat(ctx.chat.id, client)
		}
		await ctx.reply('Ок')
		log('Done')
	})

	bot.command('check', async (ctx) => {
		log('Checking...')
		isInUpdateMode = false
		const value = await getValue()
		if (value !== undefined) {
			lastValue = value
			log('Sending...', value)
			await ctx.reply(value)
		}
		log('Done')
	})

	bot.command('reset', async (ctx) => {
		isInUpdateMode = false
		if (ctx.chat) {
			log('Resetting...', ctx.chat.id)
			await updateChat(ctx.chat.id, undefined, client)
			await ctx.reply('Ok')
			log('Done')
		}
	})

	bot.on('text', async (ctx) => {
		if (isInUpdateMode && ctx.chat) {
			isInUpdateMode = false
			log('Updating...', ctx.chat.id, ctx.message?.text)
			await updateChat(ctx.chat.id, ctx.message?.text, client)
			await ctx.reply('Ok')
		}
	})

	await bot.launch()

	const loop = async () => {
		const value = await getValue()
		if (value !== undefined && value !== lastValue) {
			lastValue = value
			log('Sending...', value)
			for (const chat of await getAllChats(client, value)) {
				try {
					await bot.telegram.sendMessage(chat.id, value)
				} catch (e) {
					error(e)
					await deleteChat(chat.id, client)
				}
			}
			log('Done')
		}
	}

	setInterval(() => {
		try {
			void loop()
		} catch (e) {
			error(e)
		}
	}, env.UPDATE_INTERVAL)
}
