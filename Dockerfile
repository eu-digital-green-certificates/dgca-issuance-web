FROM node:14.16.1 as build
COPY public /app/public
COPY src /app/src
COPY package.json /app/package.json
COPY tsconfig.json /app/tsconfig.json
WORKDIR /app
RUN yarn && yarn build

FROM nginx:1.19.10 as app
COPY --from=build ./app/build /usr/share/nginx/html
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
ENV SERVER_PORT=80
ENV DGCA_ISSUANCE_SERVICE_URL=http://localhost:8080
