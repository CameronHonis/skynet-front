import Helpers from "../../src/services/helpers";

describe("#recursiveCompare", () => {
    test("it compares primitives correctly", () => {
        const a = 12;
        const b = 12;
        const c = 13;
        expect(Helpers.recursiveCompare(a, b)).toBeTruthy();
        expect(Helpers.recursiveCompare(a,c)).toBeFalsy();
    });

    test("it compares null values correctly", () => {
       expect(Helpers.recursiveCompare(null, null)).toBeTruthy();
       expect(Helpers.recursiveCompare(null, undefined)).toBeFalsy();
       expect(Helpers.recursiveCompare({}, null)).toBeFalsy();
    });

    describe("when comparing shallow arrays", () => {
        test("it finds a match between congruent shallow arrays", () => {
            const a = [1,2,3];
            const b = [1,2,3];
            expect(Helpers.recursiveCompare(a, b)).toBeTruthy();
        });

        test("it finds no match between different shallow arrays", () => {
            const a = [1,2,3];
            const b = [1,2,4];
            const c = [1,2,3,4];
            expect(Helpers.recursiveCompare(a, b)).toBeFalsy();
            expect(Helpers.recursiveCompare(a, c)).toBeFalsy();
            expect(Helpers.recursiveCompare(b, c)).toBeFalsy();
        });
    });

    describe("when comparing shallow dicts", () => {
        test("it finds a match between congruent shallow dicts", () => {
            const a = {a: 1, b: 2, c: 3};
            const b = {a: 1, b: 2, c: 3};
            expect(Helpers.recursiveCompare(a, b)).toBeTruthy();
        });

        test("it does not find a match between different shallow dicts", () => {
            const a = {a: 1, b: 2, c: 3};
            const b = {a: 1, b: 2, c: 2};
            const c = {a: 1, b: 2, c: 3, d: 4};
            expect(Helpers.recursiveCompare(a, b)).toBeFalsy();
            expect(Helpers.recursiveCompare(a, c)).toBeFalsy();
            expect(Helpers.recursiveCompare(b, c)).toBeFalsy();
        });
    });

    describe("when comparing deep arrays", () => {
        test("it finds a match between congruent deep arrays", () => {
            const a = [[1,2], [3, 4]];
            const b = [[1, 2], [3, 4]];
            expect(Helpers.recursiveCompare(a, b)).toBeTruthy();
        });

        test("it finds no match between different deep arrays", () => {
            const a = [[1,2], [3, 4]];
            const b = [[1, 3], [3, 4]];
            const c = [[1, 2, 3], [3, 4]];
            expect(Helpers.recursiveCompare(a, b)).toBeFalsy();
            expect(Helpers.recursiveCompare(a, c)).toBeFalsy();
            expect(Helpers.recursiveCompare(b, c)).toBeFalsy();
        });
    });

    describe("when comparing deep dicts", () => {
        test("it finds a match between congruent deep dicts", () => {
            const a = {a: {a0: 1}, b: {b0: 2}};
            const b = {a: {a0: 1}, b: {b0: 2}};
            expect(Helpers.recursiveCompare(a, b)).toBeTruthy();
        });

        test("it does not find a match between different deep dicts", () => {
            const a = {a: {a0: 1, a1: -1}, b: {b0: 2, b1: 3}};
            const b = {a: {a0: 1}, b: {b0: 2}};
            const c = {a: {a0: 1, a1: -2}, b: {b0: 2, b1: 3}};
            expect(Helpers.recursiveCompare(a, b)).toBeFalsy();
            expect(Helpers.recursiveCompare(a, c)).toBeFalsy();
        });
    });
});