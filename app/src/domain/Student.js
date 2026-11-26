import { Account } from "./Account.js";
import { Role } from "./enums.js";
import { ValidationError } from "./errors.js";

// Account already checks the general format, so only the domain is checked here
const UNIVERSITY_EMAIL = /@(student\.)?uni\.lu$/;

export class Student extends Account {
    /**
     * @param {object} data  account fields (see Account) plus:
     * @param {boolean} [data.emailVerified=false]  true once the student clicked the link (UC-1 step 5)
     * @throws {ValidationError} if the email isn't a university email (FR-1)
     */
    constructor({ emailVerified = false, ...accountData }) {
        super(accountData); // Account validates name, email format and hash

        if (!UNIVERSITY_EMAIL.test(this.email)) {
            throw new ValidationError("A university email is required", ["email"]);
        }

        this.emailVerified = emailVerified;
    }

    get role() {
        return Role.STUDENT;
    }

    canLogIn() {
        return this.emailVerified;
    }

    /** The student clicked the verification link. */
    verifyEmail() {
        this.emailVerified = true;
    }
}
