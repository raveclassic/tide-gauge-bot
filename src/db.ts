import { migrate } from 'postgres-migrations'
import { env } from './env'
import path from 'path'
import { Client } from 'pg'

const MIGRATIONS_DIR = path.resolve(__dirname, './migrations')

const log = (...args: unknown[]) => console.log('[DB]:', ...args)

export const getClient = async (): Promise<Client> => {
	log('Opening...')
	const client = new Client(env.DATABASE_URL)
	await client.connect()
	log('Running migrations...')
	await migrate({ client }, MIGRATIONS_DIR)
	log('Done')
	return client
}

export const addChat = async (id: number, client: Client): Promise<void> => {
	log('Inserting chat...', id)
	await client.query(`INSERT INTO chats(id) VALUES(${id}) ON CONFLICT (id) DO NOTHING;`)
	log('Done')
}

export const deleteChat = async (id: number, client: Client): Promise<void> => {
	log('Delete chat...', id)
	await client.query(`DELETE FROM chats WHERE id = ${id};`)
	log('Done')
}

export interface Chat {
	readonly id: number
}

export const getAllChats = async (client: Client): Promise<readonly Chat[]> => {
	log('Getting chats...')
	const result = await client.query<Chat>(`SELECT id FROM chats;`)
	log('Done')
	return result.rows
}
