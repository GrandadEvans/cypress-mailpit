declare namespace Cypress {
  interface EndToEndConfigOptions {
    mailpitUrl?: string;
  }
  interface Chainable {
    mpDeleteAll(): Chainable<Cypress.Response<any>>;
    mpGetAllMails(
      limit?: number,
      options?: Partial<Timeoutable>
    ): Chainable<mailpit.Item[]>;
    mpFirst(): Chainable<mailpit.Item>;
    mpGetMailsBySubject(
      subject: string,
      limit?: number,
      options?: Partial<Timeoutable>
    ): Chainable<mailpit.Item[]>;
    mpGetMailsByRecipient(
      recipient: string,
      limit?: number,
      options?: Partial<Timeoutable>
    ): Chainable<mailpit.Item[]>;
    mpGetMailsBySender(
      from: string,
      limit?: number,
      options?: Partial<Timeoutable>
    ): Chainable<mailpit.Item[]>;
    mpFilterBySubject(subject: string): Chainable<mailpit.Item[]>;
    mpFilterByRecipient(recipient: string): Chainable<mailpit.Item[]>;
    mpFilterBySender(from: string): Chainable<mailpit.Item[]>;
    mpGetSubject(): Chainable<string>;
    mpGetBody(): Chainable<string>;
    mpGetSender(): Chainable<string>;
    mpGetRecipients(): Chainable<string[]>;
    mpGetAttachments(): Chainable<string[]>;
    mpHasMailWithSubject(subject: string): Chainable;
    mpHasMailFrom(from: string): Chainable;
    mpHasMailTo(recipient: string): Chainable;
    mpWaitForMails(moreMailsThen?: number): Chainable;
  }
}
