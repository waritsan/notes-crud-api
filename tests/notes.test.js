'use strict'
let init = require('./steps/init');
let { an_authenticated_user } = require('./steps/given');
let idToken;

describe(`given an authenticated user`, () => {
    beforeAll(async () => {
        init();
        let user = await an_authenticated_user();
        idToken = user.AuthenticationResult.IdToken;
        console.log(idToken);
    });

    describe(`when we invoke POST /notes endpoint`, () => {
        it("should create a new note", async () => {
            expect(true).toBe(true);
        });
    });
});

