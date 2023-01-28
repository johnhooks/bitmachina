module.exports = {
	"**/*.(ts|tsx)": () => "pnpm check",
	"**/*.(js|jsx|cjs|mjs|ts|tsx)": (filenames) => [
		`eslint --ext .js,.jsx,.cjs,.mjs,.ts,.tsx --fix ${filenames.join(" ")}`,
		`prettier --write ${filenames.join(" ")}`,
	],
};
