import { Account } from "./Account.js";
import { Role } from "./enums.js";

/**
 * A platform maintainer. Has no fields of its own.
 * Created by the seed script, since no use case registers maintainers.
 */
export class Maintainer extends Account {
    get role() {
        return Role.MAINTAINER;
    }

    /** Maintainer accounts are created by the team, so they are active immediately. */
    canLogIn() {
        return true;
    }
}
