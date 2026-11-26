import { test } from "node:test";
import assert from "node:assert/strict";
import { Maintainer } from "../src/domain/Maintainer.js";
import { ValidationError } from "../src/domain/errors.js";

const valid = { name: "Max", email: "max@uni.lu", passwordHash: "hash" };

test("maintainer has the MAINTAINER role", () => {
    assert.equal(new Maintainer(valid).role, "MAINTAINER");
});

test("maintainer can always log in", () => {
    assert.equal(new Maintainer(valid).canLogIn(), true);
});

test("maintainer still gets Account's validation", () => {
    assert.throws(() => new Maintainer({ ...valid, name: "" }), ValidationError);
});
