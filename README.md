# cypress-mailpit

## Work in progress

## Point to note

* Mailpit works on port 8025, not 8090
* Mailpit will also need installing on you system (I've yet to look to see if I can simple include it as a dependency)

## Current State

* mpGetMailsBySubject() - working
* mpFirst() - working
* mpGetHtml() - working
* mpGetText() - working
* mpDeleteAll() - working

## Changelog

### v0.0.6

* Simply previous refactor

### v0.0.5

* Simple refactor of mpMessageSummary to remove duplicate code

### v0.0.4

* Set a default for the Mailpit UI

### v0.0.3

* Added mpGetText() to get the text version of a message
* Increased spacing to 4
* Extensive reformatting ready for conversion to TS
* Configured a few .eslint rules for my preference
* Changed Cypress version requirement to 12+, as I want to use Cypress.command.addQuery
* Still not written any tests!

### v0.0.2

* Added mpGetHtml to get the Html version of a message

### v0.0.1

* Initial fork of the project, so that I can get Cypress to run with Mailpit, as MailHog hasn't been touched recently.
* Simple rename from 'mh...' to 'mp...' method names'

## Plans

* Create a repository so that people can use any mail program they like (MailHog, Mailpit etc), and just switch out the binding
* Write proxy functions so that others can simple install it and use it as a drop-in replacement for cypress-mailhog
* Continue converting functions to mailpit
* Write tests (currently I'm writing it and using my dev project for the tests)
* ...

## Original readme, with a few alterations
A collection of useful Cypress commands for Mailpit 🐗.

This package supports TypeScript out of the box.

### Setup

Install this package:

```bash
# bun
bun add --dev cypress-mailpit

# npm
npm install --save-dev cypress-mailpit

# pnpm
pnpm add -D cypress-mail

# yarn
yarn add --dev cypress-mailpit
```

Include this package into your Cypress command file:

```JavaScript
// cypress/support/commands
import 'cypress-mailpit';
```

Add the base url of your Mailpit installation in the `e2e` block of your Cypress config file:

```typescript
export default defineConfig({
  projectId: "****",
  env: {
    mailpitUrl: "http://localhost:8025/",
  },
});
```

If your Mailpit instance uses authentication, add `mailpitAuth` to your Cypress `env` config:

```json
{
  ...
  "mailpitAuth": {"user": "mailpit username", "pass": "mailpit password"}
}
```

or add `mailpitUsername` and `mailpitPassword` in Cypress env config

```json
{
  ...
  "mailpitUsername": "mailpit username",
  "mailpitPassword": "mailpit password"
}
```

## Commands

### Mail Collection

#### mpGetAllMails( limit=50, options={timeout=defaultCommandTimeout} )

Yields an array of all the mails stored in Mailpit. This retries automatically until mails are found (or until timeout is reached).

```JavaScript
cy
  .mpGetAllMails()
  .should('have.length', 1);
```

#### mpGetMailsBySubject( subject, limit=50, options={timeout=defaultCommandTimeout} )

Yields an array of all mails with given subject. This retries automatically until mails are found (or until timeout is reached).

```JavaScript
cy
  .mpGetMailsBySubject('My Subject')
  .should('have.length', 1);
```

#### mpGetMailsBySender( from, limit=50, options={timeout=defaultCommandTimeout} )

Yields an array of all mails with given sender. This retries automatically until mails are found (or until timeout is reached).

```JavaScript
cy
  .mpGetMailsBySender('sender@example.com')
  .should('have.length', 1);
```

#### mpGetMailsByRecipient( recipient, limit=50 )

Yields an array of all mails with given recipient.

```JavaScript
cy
  .mpGetMailsByRecipient('recipient@example.com')
  .should('have.length', 1);
```

#### mpFirst()

Yields the first mail of the loaded selection.

```JavaScript
cy
  .mpGetAllMails()
  .should('have.length', 1)
  .mpFirst();
```

#### mpDeleteAll()

Deletes all stored mails from Mailpit.

```JavaScript
cy.mpDeleteAll();
```

### Collection Filtering 🪮

**Note:** the below described filter functions can be chained together to build complex filters. They are currently not automatically retrying. So make sure to either wait a certain time before fetching your mails or to implement you own re-try logic.

#### mpFilterBySubject( subject )

Filters the current mails in context by subject and returns the filtered mail list.

```JavaScript
cy
  .mpGetMailsBySender('sender@example.com')
  .mpFilterBySubject('My Subject')
  .should('have.length', 1);
```

#### mpFilterByRecipient( recipient )

Filters the current mails in context by recipient and returns the filtered mail list.

```JavaScript
cy
  .mpGetMailsBySender('sender@example.com')
  .mpFilterByRecipient('recipient@example.com')
  .should('have.length', 1);
```

#### mpFilterBySender( sender )

Filters the current mails in context by sender and returns the filtered mail list.

```JavaScript
cy
  .mpGetMailsByRecipient('recipient@example.com')
  .mpFilterBySender('sender@example.com')
  .should('have.length', 1);
```

#### Chaining Filters

Filters can be infinitely chained together.

```JavaScript
cy
  .mpGetAllMails()
  .mpFilterBySubject('My Subject')
  .mpFilterByRecipient('recipient@example.com')
  .mpFilterBySender('sender@example.com')
  .should('have.length', 1);
```

### Handling a Single Mail ✉️

#### mpGetSubject()

Yields the subject of the current mail.

```JavaScript
cy
  .mpGetAllMails()
  .should('have.length', 1)
  .mpFirst()
  .mpGetSubject()
  .should('eq', 'My Mails Subject');
```

#### mpGetBody()

Yields the body of the current mail.

```JavaScript
cy
  .mpGetAllMails()
  .should('have.length', 1)
  .mpFirst()
  .mpGetBody()
  .should('contain', 'Part of the Message Body');
```

#### mpGetSender()

Yields the sender of the current mail.

```JavaScript
cy
  .mpGetAllMails()
  .should('have.length', 1)
  .mpFirst()
  .mpGetSender()
  .should('eq', 'sender@example.com');
```

#### mpGetRecipients()

Yields the recipient of the current mail.

```JavaScript
cy
  .mpGetAllMails()
  .should('have.length', 1)
  .mpFirst()
  .mpGetRecipients()
  .should('contain', 'recipient@example.com');
```

#### mpGetAttachments()

Yields the list of all file names of the attachments of the current mail.

```JavaScript
cy
  .mpGetAllMails()
  .should('have.length', 1)
  .mpFirst()
  .mpGetAttachments()
  .should('have.length', 2)
  .should('include', 'sample.pdf');
```

### Asserting the Mail Collection 🔍

#### mpHasMailWithSubject( subject )

Asserts if there is a mail with given subject.

```JavaScript
cy.mpHasMailWithSubject('My Subject');
```

#### mpHasMailFrom( from )

Asserts if there is a mail from given sender.

```JavaScript
cy.mpHasMailFrom('sender@example.com');
```

#### mpHasMailTo( recipient )

Asserts if there is a mail to given recipient (looks for "To", "CC" and "BCC").

```JavaScript
cy.mpHasMailTo('recipient@example.com');
```

### Helper Functions ⚙️

#### mpWaitForMails( moreMailsThen = 0 )

Waits until more then <`moreMailsThen`> mails are available on Mailpit.
This is especially useful when using the `mpFilterBy<X>` functions, since they do not support automatic retrying.

```JavaScript
// this waits until there are at least 10 mails on Mailpit
cy
  .mpWaitForMails(9)
  .mpGetAllMails()
  .mpFilterBySender("sender-10@example.com")
  .should("have.length", 1);
```

## Package Development

### Start Local Test Server

Navigate into the `test-server` directory.

```bash
cd ./test-server/
```

Install dependencies.

```bash
composer install
yarn # or npm install
```

Start docker server.

```bash
docker-compose up
```

Open the test page in your browser: [http://localhost:3000/cypress-mp-tests/](http://localhost:3000/cypress-mp-tests/)

Open Mailpit in your browser: [http://localhost:8025/](http://localhost:8025/)

Open the Cypress testclient.

```bash
yarn cypress:open
```
