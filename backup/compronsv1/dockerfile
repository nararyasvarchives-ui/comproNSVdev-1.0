FROM nginx:alpine

# set working dir (optional tapi rapi)
WORKDIR /usr/share/nginx/html

# hapus default
RUN rm -rf ./*

# copy file
COPY . .

# set permission (ini penting!)
RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]