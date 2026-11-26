import { test } from "node:test";
import assert from "node:assert/strict";
import { Student } from "../src/domain/Student.js";
import { ValidationError } from "../src/domain/errors.js";

const valid = { name: "Anna", email: "anna@uni.lu", passwordHash: "hash" };

test("student has the STUDENT role", () => {
    assert.equal(new Student(valid).role, "STUDENT");
});

test("uni.lu and student.uni.lu emails are accepted", () => {
    assert.doesNotThrow(() => new Student(valid));
    assert.doesNotThrow(() => new Student({ ...valid, email: "anna@student.uni.lu" }));
});

test("FR-1: non-university email is refused", () => {
    assert.throws(() => new Student({ ...valid, email: "anna@gmail.com" }), ValidationError);
});

test("look-alike domains are refused", () => {
    assert.throws(() => new Student({ ...valid, email: "anna@fakeuni.lu" }), ValidationError);
    assert.throws(() => new Student({ ...valid, email: "anna@uni.lu.evil.com" }), ValidationError);
});

test("new student is not verified until verifyEmail()", () => {
    const s = new Student(valid);
    assert.equal(s.emailVerified, false);
    s.verifyEmail();
    assert.equal(s.emailVerified, true);
});

test("UC-2: unverified student cannot log in", () => {
    const s = new Student(valid);
    assert.equal(s.canLogIn(), false);
    s.verifyEmail();
    assert.equal(s.canLogIn(), true);
});

