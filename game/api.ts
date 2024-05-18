import * as Http from '@effect/platform/HttpClient'
import { Effect } from 'effect'
import { Collect, Login } from './models.ts'

const UA = `Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`

export const login = (tgWebAppData: string) =>
	Http.request.post('https://bot.lumacoin.org/api/').pipe(
		Http.request.setHeader('User-Agent', UA),
		Http.request.setHeader('Content-Type', 'application/json'),
		Http.request.jsonBody({
			action: 'init',
			initData: tgWebAppData,
		}),
		Effect.andThen(Http.client.fetchOk),
		Effect.andThen(Http.response.schemaBodyJson(Login)),
		Effect.scoped
	)

export const collect = (tgWebAppData: string) =>
	Http.request.post('https://bot.lumacoin.org/api/').pipe(
		Http.request.setHeader('User-Agent', UA),
		Http.request.setHeader('Content-Type', 'application/json'),
		Http.request.jsonBody({
			action: 'get_coins',
			initData: tgWebAppData,
		}),
		Effect.andThen(Http.client.fetch),
		Effect.andThen(Http.response.schemaBodyJson(Collect)),
		Effect.scoped
	)
