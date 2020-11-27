import { newBot } from './bot'
import { runDummyServer } from './dummy-server'

runDummyServer()
void newBot().catch((e) => console.error(e))
