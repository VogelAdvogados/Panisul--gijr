import { describe, it, expect } from "@jest/globals";

// Isolated test of the total value aggregation logic
function calcTotal(items: Array<{ quantity: number; price: number }>) {
	return items.reduce((sum, it) => sum + it.quantity * it.price, 0);
}

describe("calcTotal", () => {
	it("sums quantity*price", () => {
		const total = calcTotal([
			{ quantity: 2, price: 10 },
			{ quantity: 1, price: 5 }
		]);
		expect(total).toBe(25);
	});
});