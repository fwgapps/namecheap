# Express Example for `@fwgapps/namecheap`

This minimal example demonstrates how to use the `@fwgapps/namecheap` library within an Express server.
**Note:** This example is for demonstration purposes only.


---

## 📦 Installation

```bash
git clone https://github.com/fwgapps/namecheap.git
cd namecheap/example/express
yarn install
```

## ⚙️ Environment Variables
Create a `.env` file in the root of the project with the following variables:

```dotenv
API_USER=your_namecheap_username
API_KEY=your_api_key
CLIENT_IP=your_whitelisted_ip
ENV=DEV
```
* `ENV=DEV` enables sandbox mode.
* Set `ENV=PRODUCTION` to use the production API.

## 🚀 Run the Server

```bash
yarn run dev
```

The API will be available at: 👉 http://localhost:3000




