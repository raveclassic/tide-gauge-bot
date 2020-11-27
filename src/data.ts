import { parse } from 'node-html-parser'
import fetch from 'node-fetch'
import { NumberFromString } from 'io-ts-types/NumberFromString'
import { either } from 'fp-ts'

const TIDE_GAUGE_URL = 'http://tidegauge.ru/tide-gauge/auth/login'
const RND_HEADER = 'Ростов-на-Дону'

const callTideGauge = async () => {
	const response = await fetch(TIDE_GAUGE_URL)
	return response.text()
}

export const getValue = async (): Promise<number | undefined> => {
	const data = await callTideGauge()
	const dom = parse(data)
	const table = dom.querySelectorAll('h1').find((element) => element.innerText === RND_HEADER)?.nextElementSibling

	const cells = table
		?.querySelectorAll('tr')
		.find((row) => row.parentNode === table)
		?.querySelectorAll('td')
	const value = cells?.[1]?.innerText
	const decoded = NumberFromString.decode(value)
	return either.isLeft(decoded) ? undefined : decoded.right
}
