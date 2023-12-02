const apiVersion = "v1";
const mpApiUrl = (path) => {
  const envValue = Cypress.env("mailpitUrl");
  const basePath = envValue ? envValue : Cypress.config("mailpitUrl");
  return `${basePath}/${apiVersion}/api${path}`;
};

let mpAuth = Cypress.env("mailpitAuth") || "";
if (Cypress.env("mailpitUsername") && Cypress.env("mailpitPassword")) {
  mpAuth = {
    user: Cypress.env("mailpitUsername"),
    pass: Cypress.env("mailpitPassword"),
  };
}

const messages = (limit) => {
  return cy
    .request({
      method: "GET",
      url: mpApiUrl(`/messages?limit=${limit}`),
      auth: mpAuth,
      log: false,
    })
    .then((response) => {
      if (typeof response.body === "string") {
        return JSON.parse(response.body);
      } else {
        return response.body;
      }
    })
    .then((parsed) => parsed.items);
};

const retryFetchMessages = (filter, limit, options = {}) => {
  const timeout = options.timeout || Cypress.config("defaultCommandTimeout") || 4000;
  let timedOut = false;

  setTimeout(() => {
    timedOut = true;
  }, timeout);

  const filteredMessages = (limit) => messages(limit).then(filter);

  const resolve = () => {
    if (timedOut) {
      return filteredMessages(limit);
    }
    return filteredMessages(limit).then((messages) => {
      return cy.verifyUpcomingAssertions(messages, options, {
        onRetry: resolve,
      });
    });
  };

  return resolve();
};

/**
 * Mail Collection
 */
Cypress.Commands.add("mpDeleteAll", () => {
  return cy.request({
    method: "DELETE",
    url: mpApiUrl("/messages"),
    auth: mpAuth,
  });
});

Cypress.Commands.add("mpGetAllMails", (limit = 50, options = {}) => {
  const filter = (mails) => mails;

  return retryFetchMessages(filter, limit, options);
});

Cypress.Commands.add("mpFirst", { prevSubject: true }, (mails) => {
  return Array.isArray(mails) && mails.length > 0 ? mails[0] : mails;
});

Cypress.Commands.add("mpGetMailsBySubject", (subject, limit = 50, options = {}) => {
    const filter = (mails) =>
      mails.filter((mail) => mail.Content.Headers.Subject[0] === subject);

    return retryFetchMessages(filter, limit, options);
  }
);

Cypress.Commands.add("mpGetMailsByRecipient", (recipient, limit = 50, options = {}) => {
    const filter = (mails) => {
      return mails.filter((mail) =>
        mail.To.map(
          (recipientObj) => `${recipientObj.Mailbox}@${recipientObj.Domain}`
        ).includes(recipient)
      );
    };

    return retryFetchMessages(filter, limit, options);
  }
);

Cypress.Commands.add("mpGetMailsBySender", (from, limit = 50, options = {}) => {
  const filter = (mails) => mails.filter((mail) => mail.Raw.From === from);

  return retryFetchMessages(filter, limit, options);
});

/**
 * Filters on Mail Collections
 */
Cypress.Commands.add("mpFilterBySubject", { prevSubject: true }, (messages, subject) => {
    return messages.filter((mail) => mail.Content.Headers.Subject[0] === subject);
  }
);

Cypress.Commands.add("mpFilterByRecipient", { prevSubject: true }, (messages, recipient) => {
    return messages.filter(
      (mail) =>  mail.To.map(
        (recipientObj) => `${recipientObj.Mailbox}@${recipientObj.Domain}`
      ).includes(recipient)
    );
  }
);

Cypress.Commands.add("mpFilterBySender", { prevSubject: true }, (messages, from) => {
    return messages.filter((mail) => mail.Raw.From === from);
  }
);

/**
 * Single Mail Commands and Assertions
 */
Cypress.Commands.add("mpGetSubject", { prevSubject: true }, (mail) => {
  return cy.wrap(mail.Content.Headers)
           .then((headers) => headers.Subject[0]);
});

Cypress.Commands.add("mpGetBody", { prevSubject: true }, (mail) => {
  return cy.wrap(mail.Content)
           .its("Body");
});

Cypress.Commands.add("mpGetSender", { prevSubject: true }, (mail) => {
  return cy.wrap(mail.Raw)
           .its("From");
});

Cypress.Commands.add("mpGetRecipients", { prevSubject: true }, (mail) => {
  return cy.wrap(mail)
           .then((mail) => mail.To.map(
              (recipientObj) => `${recipientObj.Mailbox}@${recipientObj.Domain}`
            ));
});

/**
 * Mail Collection Assertions
 */
Cypress.Commands.add("mpHasMailWithSubject", (subject) => {
  cy.mpGetMailsBySubject(subject).should("not.be.empty");
});

Cypress.Commands.add("mpHasMailFrom", (from) => {
  cy.mpGetMailsBySender(from).should("not.be.empty");
});

Cypress.Commands.add("mpHasMailTo", (recipient) => {
  cy.mpGetMailsByRecipient(recipient).should("not.be.empty");
});

/**
 * Helpers
 */
Cypress.Commands.add("mpWaitForMails", (moreMailsThen = 0) => {
  cy.mpGetAllMails().should("to.have.length.greaterThan", moreMailsThen);
});

/**
 * Attachments
 */
Cypress.Commands.add("mpGetAttachments", { prevSubject: true }, (mail) => {
  const attachments = []; // should this be const, or let (I'd say let)

  // search through mime parts to find attachments
  if (Array.isArray(mail.MIME?.Parts)) {
    for (const mimePart of mail.MIME?.Parts) {
      // content disposition tells us if this part represents an attachment
      // sample: Content-Disposition: ["attachment; filename=sample.pdf"]
      if (
        mimePart.Headers &&
        mimePart.Headers["Content-Disposition"] &&
        mimePart.Headers["Content-Disposition"][0]
      ) {
        const contentDisposition = mimePart.Headers["Content-Disposition"][0];
        if (contentDisposition) {
          const dispositionTokens = contentDisposition
            .split(";")
            .map((token) => token.trim());
          if (dispositionTokens.includes("attachment")) {
            const fileNameToken = dispositionTokens.find((token) => token.startsWith("filename="));
            const fileName = fileNameToken.replace("filename=", "");
            attachments.push(fileName);
          }
        }
      }
    }
  }

  return cy.wrap(attachments);
});
