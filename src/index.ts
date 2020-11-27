import { runBot } from './bot'
import { runDummyServer } from './dummy-server'

runDummyServer()
void runBot().catch((e) => console.error(e))
