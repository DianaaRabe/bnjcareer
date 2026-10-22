/** Below this, the paste is a title or a teaser — not enough to score anything. */
export const MIN_DESCRIPTION_LENGTH = 100

/**
 * Upper bound for the pasted offer. The prompt sends the description in full, so this is
 * also the prompt budget: raising it here raises the token cost of every analysis.
 */
export const MAX_DESCRIPTION_LENGTH = 15000
