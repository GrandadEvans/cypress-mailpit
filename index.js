const apiVersion = "v1";

const mpApiUrl = (path) => {
  const envValue = Cypress.env("mailpitUrl");
  const basePath = envValue ? envValue : Cypress.config("mailpitUrl");
  return `${basePath}/api/${apiVersion}${path}`;
};

const mpMessageSummary = (id) => {
  const envValue = Cypress.env("mailpitUrl");
  const basePath = envValue ? envValue : Cypress.config("mailpitUrl");
  return `${basePath}/api/${apiVersion}/message/${id}`;
};

const mpGetMessageContent = (id, type = 'html') => {
  const envValue = Cypress.env("mailpitUrl");
  const basePath = envValue ? envValue : Cypress.config("mailpitUrl");
  return `${basePath}/view/${id}.${type.toLowerCase()}`;
};

let mpAuth = Cypress.env("mailpitAuth") || "";
if (Cypress.env("mailpitUsername") && Cypress.env("mailpitPassword")) {
  mpAuth = {
    user: Cypress.env("mailpitUsername"),
    pass: Cypress.env("mailpitPassword"),
  };
}

let messageCount = 0;

const refreshMessages = (limit) => {
  return cy
    .request({
      method: "GET",
      url: mpApiUrl(`/messages?limit=${limit}`),
      auth: mpAuth,
      log: false,
    })
    .then((response) => {
      if (typeof response.body === "string") {
        let parsed = JSON.parse(response.body);
        messageCount = parsed.count;
        messages = parsed.messages;
      } else {
        messageCount = 0;
        messages = [];
      }
    });
};

let messages = [];

Cypress.Commands.add("mpGetMailsBySubject", { prevSubject: false }, (subject) => {
  return searchMessages(`subject:"${subject}"`).then((data) => data.messages);
});

Cypress.Commands.add("mpFirst", { prevSubject: true }, (messages) => {
  if (messages && messages.length > 0) {
    return messages[0];
  }
  // You should handle the case when there are no messages as well.
  throw new Error('No messages found.');
});

 // TODO: Change this to cy.request
const searchMessages = (query) => {
  return fetch(mpApiUrl(`/search?query=${query}`))
    .then((response) => response.json())
    .then((data) => data)
    .catch((error) => console.error('Error:', error));
}

Cypress.Commands.add("mpDeleteAll", () => {
  return cy.request({
    method: "DELETE",
    url: mpApiUrl("/messages"),
    auth: mpAuth,
  });
});

Cypress.Commands.add("mpGetHtml", {prevSubject: true}, (message) => {
  return cy.request({
    method: "GET",
    url: mpApiUrl(`/message/${message.ID}`),
    auth: mpAuth,
  })
  .then((response) => response.body.HTML);
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

const sampleMessages = {
    "total": 2,
    "unread": 2,
    "count": 2,
    "messages_count": 2,
    "start": 0,
    "tags": [],
    "messages": [
        {
            "ID": "53435c87-d0c3-4bd3-8dfe-173cf560dba5",
            "MessageID": "ca6a1583a5037878956e2d983df3ffe7@buttons.grandadevans.com",
            "Read": false,
            "From": {
                "Name": "Buttons Cat Rescue",
                "Address": "admin@buttons.grandadevans.com"
            },
            "To": [
                {
                    "Name": "",
                    "Address": "admin@buttons.grandadevans.com"
                }
            ],
            "Cc": [],
            "Bcc": [],
            "Subject": "Adoption Form Submission",
            "Created": "2023-12-03T23:46:50.797Z",
            "Tags": [],
            "Size": 3684,
            "Attachments": 0,
            "Snippet": "Hi Email-type-person, This is just a email to say that somebody has taken their time to fill in an adoption form. Here is a copy of what they sent us, so that you can always find it in a search. -----..."
        },
        {
            "ID": "46db884d-3d96-4126-a250-342d5f41c7ea",
            "MessageID": "d1e09a29f6819c2ed97fbcaf1dfe37dc@buttons.grandadevans.com",
            "Read": false,
            "From": {
                "Name": "Buttons Cat Rescue",
                "Address": "admin@buttons.grandadevans.com"
            },
            "To": [
                {
                    "Name": "",
                    "Address": "dev@buttonscatrescue.co.uk"
                }
            ],
            "Cc": [],
            "Bcc": [],
            "Subject": "Adoption form submission (auto-reply)",
            "Created": "2023-12-03T23:46:50.75Z",
            "Tags": [],
            "Size": 1197,
            "Attachments": 0,
            "Snippet": "-- AUTOREPLY -- Hi Billy Bob Thornton, This is just a quick email to say thanks for getting in touch, and somebody should be back in touch with you soon with a reply to your message."
        }
    ]
};
