import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Account } from '../src/domain/Account.js';
import { ValidationError } from '../src/domain/errors.js';

class TestAccount extends Account {
    get role() { return 'TEST'; }
}
class NoRoleAccount extends Account {}

const valid = { name: 'Anna', email: 'anna@uni.lu', passwordHash: 'hash' };

test('Account cannot be created directly', () => {
    assert.throws(() => new Account(valid), TypeError);
});

test('a subclass can be created and keeps its data', () => {
    const a = new TestAccount({ ...valid, accountID: 7 });
    assert.equal(a.accountID, 7);
    assert.equal(a.name, 'Anna');
    assert.equal(a.role, 'TEST');
});

test('new account has no ID yet', () => {
    assert.equal(new TestAccount(valid).accountID, null);
});

test('email is trimmed and lowercased', () => {
    const a = new TestAccount({ ...valid, email: '  Anna@Uni.LU ' });
    assert.equal(a.email, 'anna@uni.lu');
});

test('all missing fields are reported at once', () => {
    assert.throws(
        () => new TestAccount({ name: ' ', email: '', passwordHash: '' }),
        (err) => err instanceof ValidationError
              && err.fields.join() === 'name,email,passwordHash'
    );
});

test('badly formatted email is refused', () => {
    assert.throws(() => new TestAccount({ ...valid, email: 'anna.uni.lu' }), ValidationError);
});

test('passwordHash is read-only and not in JSON', () => {
    const a = new TestAccount(valid);
    assert.throws(() => { a.passwordHash = 'other'; }, TypeError);
    assert.equal(a.passwordHash, 'hash');
    assert.equal(JSON.stringify(a).includes('hash'), false);
});

test('subclass without role fails loudly', () => {
    assert.throws(() => new NoRoleAccount(valid).role, /must define role/);
});

test("subclass without canLogIn fails loudly", () => {
    assert.throws(() => new NoRoleAccount(valid).canLogIn(), /must define canLogIn/);
});
