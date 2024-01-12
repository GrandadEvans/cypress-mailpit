interface Address {
  Name: string;
  Address: string;
}

interface Attachment {
  ContentID: string;
  ContentType: string;
  FileName: string;
  PartID: string;
  Size: number;
}

interface EmailMessage {
  Attachments: Attachment[];
  Bcc: Address[];
  Cc: Address[];
  Date: string; // Assuming "date-time" is a string format
  From: Address;
  HTML: string;
  ID: string;
  Inline: Attachment[];
  MessageID: string;
  ReplyTo: Address[];
  ReturnPath: string;
  Size: number;
  Subject: string;
  Tags: string[];
  Text: string;
  To: Address[];
}

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

    // Extend Chainable with EmailMessage
    emailMessage(message: EmailMessage): Chainable<EmailMessage>;
  }
}




// declare namespace Cypress {
//   interface EndToEndConfigOptions {
//     mailpitUrl?: string;
//   }
//   interface Chainable {
//     mpDeleteAll(): Chainable<Cypress.Response<any>>;
//     mpGetAllMails(
//       limit?: number,
//       options?: Partial<Timeoutable>
//     ): Chainable<mailpit.Item[]>;
//     mpFirst(): Chainable<mailpit.Item>;
//     mpGetMailsBySubject(
//       subject: string,
//       limit?: number,
//       options?: Partial<Timeoutable>
//     ): Chainable<mailpit.Item[]>;
//     mpGetMailsByRecipient(
//       recipient: string,
//       limit?: number,
//       options?: Partial<Timeoutable>
//     ): Chainable<mailpit.Item[]>;
//     mpGetMailsBySender(
//       from: string,
//       limit?: number,
//       options?: Partial<Timeoutable>
//     ): Chainable<mailpit.Item[]>;
//     mpFilterBySubject(subject: string): Chainable<mailpit.Item[]>;
//     mpFilterByRecipient(recipient: string): Chainable<mailpit.Item[]>;
//     mpFilterBySender(from: string): Chainable<mailpit.Item[]>;
//     mpGetSubject(): Chainable<string>;
//     mpGetBody(): Chainable<string>;
//     mpGetSender(): Chainable<string>;
//     mpGetRecipients(): Chainable<string[]>;
//     mpGetAttachments(): Chainable<string[]>;
//     mpHasMailWithSubject(subject: string): Chainable;
//     mpHasMailFrom(from: string): Chainable;
//     mpHasMailTo(recipient: string): Chainable;
//     mpWaitForMails(moreMailsThen?: number): Chainable;
//   }

// }
