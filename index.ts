import { BunRuntime } from '@effect/platform-bun'
import chalk from 'chalk'
import { Config, ConfigProvider, Effect, pipe, Schedule } from 'effect'
import { constVoid } from 'effect/Function'
import { collect, login } from './game/api.ts'
import { fmt } from './game/fmt.ts'
import { Telegram } from './telegram/client.ts'

type State = {
	reward: number
	balance: number
}

const miner = Effect.gen(function* (_) {
	const client = yield* _(Telegram)
	const peerId = yield* _(client.getPeerId('lumacoinbot'))

	const webViewResultUrl = yield* _(
		client.requestWebView({
			url: 'https://bot.lumacoin.org/app',
			bot: peerId,
			peer: peerId,
		})
	)

	const tgWebAppData = webViewResultUrl.searchParams.get('tgWebAppData')!
	if (!tgWebAppData) {
		return Effect.none
	}

	const state: State = {
		reward: 0,
		balance: 0,
	}

	const sync = Effect.gen(function* (_) {
		const result = yield* login(tgWebAppData)
		state.reward = result.app_data.reward
		state.balance = result.user_data.balance
	})

	const mine = Effect.gen(function* (_) {
		yield* Effect.sleep('1 seconds')
		const result = yield* collect(tgWebAppData)

		const balanceDiff = result.user_data.balance - state.balance
		state.reward = result.app_data.reward
		state.balance = result.user_data.balance

		console.log(
			chalk.bold(new Date().toLocaleTimeString()),
			'|🪙'.padEnd(4),
			chalk.bold(`${state.balance}`.padEnd(8)),
			chalk.bold[balanceDiff > 0 ? 'green' : 'red'](fmt(balanceDiff).padEnd(4))
		)
	})

	const mineInterval = yield* Config.duration('GAME_MINE_INTERVAL').pipe(Config.withDefault('6 minutes'))
	const syncInterval = yield* Config.duration('GAME_SYNC_INTERVAL').pipe(Config.withDefault('1 hour'))

	const miner = Effect.repeat(
		mine,
		Schedule.addDelay(Schedule.forever, () => mineInterval)
	)

	const syncer = Effect.repeat(
		sync,
		Schedule.addDelay(Schedule.forever, () => syncInterval)
	)

	yield* sync
	yield* Effect.all([miner, syncer], { concurrency: 'unbounded' })
})

const policy = Schedule.addDelay(Schedule.forever, () => '30 minutes')

const program = Effect.match(miner, {
	onSuccess: constVoid,
	onFailure: (err) => {
		console.error(chalk.bold(new Date().toLocaleTimeString()), '‼️FAILED:', err._tag)
	},
})

pipe(
	Effect.all([Effect.repeat(program, policy), Effect.sync(() => process.stdout.write('\u001Bc\u001B[3J'))], {
		concurrency: 'unbounded',
	}),
	Effect.provide(Telegram.live),
	Effect.withConfigProvider(ConfigProvider.fromEnv()),
	BunRuntime.runMain
)
