FROM cypress/included:13.6.0

ADD . /e2e
WORKDIR /e2e/test-server
RUN cd /e2e/test-server && yarn
