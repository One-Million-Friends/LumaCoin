import {BunRuntime} from "@effect/platform-bun";
import chalk from "chalk";
import {ConfigProvider, Effect, pipe, Schedule} from "effect";
import {constVoid} from "effect/Function"
import {fmt} from "./game/fmt.ts";
import {Telegram} from "./telegram/client.ts";
import {collect, login} from "./game/api.ts";

const miner = Effect.gen(function* (_) {
    const client = yield* _(Telegram);
    const peerId = yield* _(client.getPeerId('lumacoinbot'));

    const webViewResultUrl = yield* _(client.requestWebView({
        url: 'https://bot.lumacoin.org/app',
        bot: peerId,
        peer: peerId
    }));

    const tgWebAppData = webViewResultUrl.searchParams.get('tgWebAppData')!
    if (!tgWebAppData) {
        return Effect.none
    }

    let state = yield* login(tgWebAppData)

    const mine = Effect.gen(function* (_) {
        state = yield* collect(tgWebAppData)

        console.log(
            chalk.bold.gray(fmt(state.user_data.balance)),
            chalk.bold[state.result ? "green" : "red"](state.app_data.reward_formatted), "🪙"
        )
    })

    yield* Effect.repeat(mine, Schedule.addDelay(Schedule.forever, () => `${state.app_data.delay + 1} seconds`))
})

const policy = Schedule.addDelay(Schedule.forever, () => "30 minutes")

const program = Effect.match(miner, {
    onSuccess: constVoid,
    onFailure: (err) => {
        console.error("‼️FAILED:", err)
    },
})

pipe(
    Effect.repeat(program, policy),
    Effect.provide(Telegram.live),
    Effect.withConfigProvider(ConfigProvider.fromEnv()),
    BunRuntime.runMain
)