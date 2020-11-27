import { parse } from 'node-html-parser'
import fetch from 'node-fetch'

const TIDE_GAUGE_URL = 'http://tidegauge.ru/tide-gauge/auth/login'
const RND_HEADER = 'Ростов-на-Дону'

const callTideGauge = async () => {
	const response = await fetch(TIDE_GAUGE_URL)
	return response.text()
}

export const getValue = async (): Promise<string | undefined> => {
	const data = await callTideGauge()
	const dom = parse(data)
	const table = dom.querySelectorAll('h1').find((element) => element.innerText === RND_HEADER)?.nextElementSibling

	const cells = table
		?.querySelectorAll('tr')
		.find((row) => row.parentNode === table)
		?.querySelectorAll('td')
	return cells?.[1]?.innerText
}
