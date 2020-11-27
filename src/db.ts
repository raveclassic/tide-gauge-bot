import { migrate } from 'postgres-migrations'
import { env } from './env'
import path from 'path'
import { Client } from 'pg'

const MIGRATIONS_DIR = path.resolve(__dirname, '../migrations')

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
	await client.query(`INSERT INTO chats(id, value) VALUES($1, null) ON CONFLICT (id) DO NOTHING;`, [id])
	log('Done')
}

export const updateChat = async (id: number, value: number | undefined, client: Client): Promise<void> => {
	const finalValue = value === undefined ? 'NULL' : value
	log('Updating chat...', id, finalValue)
	await client.query(
		`
		INSERT INTO chats (id, value)
		VALUES ($1, $2)
		ON CONFLICT (id) DO UPDATE
			SET id = excluded.id,
				value = excluded.value;
	`,
		[id, finalValue],
	)
	log('Done')
}

export const deleteChat = async (id: number, client: Client): Promise<void> => {
	log('Delete chat...', id)
	await client.query(`DELETE FROM chats WHERE id = $1;`, [id])
	log('Done')
}

export interface Chat {
	readonly id: number
	readonly value: string | null
}

export const getAllChats = async (client: Client, value: number): Promise<readonly Chat[]> => {
	log('Getting chats...')
	const result = await client.query<Chat>(
		`
		SELECT id, value from chats
		WHERE value IS NULL OR value <= $1;
	`,
		[value],
	)
	log('Done')
	return result.rows
}
