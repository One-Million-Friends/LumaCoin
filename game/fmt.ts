const numberFormatter = new Intl.NumberFormat('en-EN', {
	notation: 'compact',
	signDisplay: 'always',
	compactDisplay: 'long',
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
})

export const fmt = numberFormatter.format.bind(numberFormatter)
