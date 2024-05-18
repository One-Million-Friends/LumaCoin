import { Schema } from '@effect/schema'

export const User = Schema.Struct({
	balance: Schema.Number,
	next_reward: Schema.Number,
	ref_reward: Schema.Number,
	ref_count: Schema.Number,
})

export const Game = Schema.Struct({
	total_coins: Schema.Number,
	total_users: Schema.Number,
	max_coins: Schema.Number,
	reward: Schema.Number,
	delay: Schema.Number,
	coins_to_next_reward: Schema.Number,
	coins_left: Schema.Number,
	total_percent: Schema.Number,
	blocks_to_next_reward: Schema.Number,
	delay_formatted: Schema.String,
	total_percent_formatted: Schema.String,
	total_coins_formatted: Schema.String,
	total_users_formatted: Schema.String,
	max_coins_formatted: Schema.String,
	reward_formatted: Schema.String,
	blocks_to_next_reward_formatted: Schema.String,
})

export const Login = Schema.Struct({
	result: Schema.Boolean,
	app_data: Game,
	user_data: User,
})

export const Collect = Schema.Struct({
	result: Schema.Boolean,
	app_data: Game,
	user_data: User,
})
