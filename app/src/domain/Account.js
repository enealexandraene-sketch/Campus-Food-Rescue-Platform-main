import { ValidationError } from "./errors.js";

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// const EMAIL_FORMAT = /^[^\s@]+@(student\.)?uni\.lu$/

/**
 * Represents an account
 * 
 * @class Account
 */
export class Account {
    #passwordHash; // Private

    /**
     * Creates a new Account. Cannot be created directly.
     * 
     * The database generates the ID when saving the Account
     * 
     * @param {object} data
     * @param {number|null} [data.accountID]  set when loaded from the database
     * @param {string} data.name
     * @param {string} data.email
     * @param {string} data.passwordHash
     * @throws {TypeError} if Account is created directly
     * @throws {ValidationError} with the names of all invalid fields
     * 
     */
    constructor ({accountID = null, name, email, passwordHash}){

        // Abstract class check
        if (new.target === Account){
            throw new TypeError("Account is abstract: create a Student, Provider or Maintainer");
        }

        // Check that all required fields are given
        const errors = [];
        const cleanEmail = email?.trim().toLowerCase();

        if (!name?.trim()) errors.push("name");
        

        if (!cleanEmail) errors.push("email");
        else if (!EMAIL_FORMAT.test(cleanEmail)) errors.push("email");
        
        if (!passwordHash) errors.push("passwordHash");
        
        if(errors.length > 0){
            throw new ValidationError(`Invalid or missing fields: ${errors.join(', ')}`, errors);
        }

        // Create Account
        this.accountID = accountID;
        this.name = name.trim();
        this.email = cleanEmail;
        this.#passwordHash = passwordHash;
    }

    get passwordHash(){
        return this.#passwordHash;
    }

    canLogIn(){
        throw new Error(`${this.constructor.name} must define canLogIn`);
    }

    /** Each subclass returns its Role (STUDENT, PROVIDER or MAINTAINER) */
    get role(){
        throw new Error(`${this.constructor.name} must define role`);
    }

}
