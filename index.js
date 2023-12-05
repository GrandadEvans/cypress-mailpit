/* eslint-disable no-unused-vars */
const apiVersion = "v1";
// eslint-disable-next-line prefer-const
let messageCount = 0;
// eslint-disable-next-line prefer-const
let messages = [];

const mpApiUrl = (path) => {
    const envValue = Cypress.env("mailpitUrl");
    const basePath = envValue ? envValue : Cypress.config("mailpitUrl");
    if (!!basePath.length) {
      basePath = "http://127.0.0.1:8025";
    }
    return `${basePath}/api/${apiVersion}${path}`;
};

const mpMessageSummary = (id) => {
    return mpApiUrl(`/message/${id}`);
};

let mpAuth = Cypress.env("mailpitAuth") || "";
if (Cypress.env("mailpitUsername") && Cypress.env("mailpitPassword")) {
    mpAuth = {
        user: Cypress.env("mailpitUsername"),
        pass: Cypress.env("mailpitPassword"),
    };
}

Cypress.Commands.add("mpGetMailsBySubject", { prevSubject: false }, (subject) => {
    return searchMessages(`subject:"${subject}"`).then((data) => data.messages);
});

Cypress.Commands.add("mpFirst", { prevSubject: true }, (messages) => {
    if (messages && messages.length > 0) {
        return messages[0];
    }
    // You should handle the case when there are no messages as well.
    throw new Error("No messages found.");
});

const searchMessages = (query) => {
    return fetch(mpApiUrl(`/search?query=${query}`))
        .then((response) => response.json())
        .then((data) => data)
        .catch((error) => console.error("Error:", error));
};

Cypress.Commands.add("mpDeleteAll", () => {
    return cy.request({
        method: "DELETE",
        url: mpApiUrl("/messages"),
        auth: mpAuth,
    });
});

Cypress.Commands.add("mpGetHtml", { prevSubject: true }, (message) => {
    return cy.request({
        method: "GET",
        url: mpApiUrl(`/message/${message.ID}`),
        auth: mpAuth,
    })
        .then((response) => response.body.HTML);
});

Cypress.Commands.add("mpGetText", { prevSubject: true }, (message) => {
    return cy.request({
        method: "GET",
        url: mpApiUrl(`/message/${message.ID}`),
        auth: mpAuth,
    })
        .then((response) => response.body.Text);
});

/**
Cypress.Commands.addQuery("mpGetAllMails", function (limit = 50, options = {}) {
  if (messageCount > 0) {
    return refreshMessages(limit);
  }
});

Cypress.Commands.add("mpGetText", (message) => {
  return cy.request({
    method: "GET",
    url: mpMessageSummary(message.Id),
    auth: mpAuth,
  })
  .then((response) => response.body.Text);
});

Cypress.Commands.add("mpGetCount", (mails, limit = 50, options = {}) => {
    const filter = (mails) => {
      mails.count > 0 ? mails.messages.filter((message) => message.Subject === subject) : mails;
    }
    return retryFetchMessages(filter, limit, options);
  }
);

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

Cypress.Commands.addQuery("mpGetMailsByRecipient", function (recipient, options = {}) {
  return searchMessages(`to:"${recipient}"`);
});

Cypress.Commands.addQuery("mpGetMailsBySender", function (from, options = {}) {
  return searchMessages(`from:"${from}"`);
});

/**
 * Filters on Mail Collections
Cypress.Commands.addQuery("mpFilterBySubject", function (messages, subject) {
    return messages.filter((mail) => mail.Subject === subject);
});

Cypress.Commands.addQuery("mpFilterByRecipient", function (messages, recipient) {
 return messages.filter((mail) =>  mail.To.includes(recipient));
});

Cypress.Commands.addQuery("mpFilterBySender", function (messages, from) {
    return messages.filter((mail) => mail.From === from);
});

/**
 * Single Mail Commands and Assertions
Cypress.Commands.addQuery("mpGetSubject", function (mail) {
  return mail.Subject;
});

Cypress.Commands.addQuery("mpGetSender", function (mail) {
  return mail.From;
});

Cypress.Commands.addQuery("mpGetRecipients", function (mail) {
  return mail.recipient;
});

/**
 * Mail Collection Assertions
Cypress.Commands.addQuery("mpHasMailWithSubject", function (subject) {
  cy.mpGetMailsBySubject(subject).should("not.be.empty");
});

Cypress.Commands.addQuery("mpHasMailFrom", function (from) {
  cy.mpGetMailsBySender(from).should("not.be.empty");
});

Cypress.Commands.addQuery("mpHasMailTo", function (recipient) {
  cy.mpGetMailsByRecipient(recipient).should("not.be.empty");
});

/**
 * Helpers
Cypress.Commands.addQuery("mpWaitForMails", function (moreMailsThen = 0) {
  cy.mpGetAllMails().should("to.have.length.greaterThan", moreMailsThen);
});

/**
 * Attachments
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
*/
