# @fwgapps/namecheap

A simple and efficient TypeScript library for interacting with the Namecheap API, returning structured JSON responses.

## Table of Contents

- [Description](#description)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Description

This library provides a straightforward way to interact with the Namecheap API. It's designed to be easy to use both in **Node.js** and **browser** environments, with TypeScript definitions for type safety. The library helps developers automate domain management tasks via the Namecheap API.

## Features

- Easy-to-use interface for interacting with the Namecheap API.
- Supports both **Node.js** and **browser** environments.
- Returns well-structured **JSON** responses for seamless integration.
- TypeScript definitions included for better developer experience.
- Minimal external dependencies for better performance.

## Installation

You can install the library via npm or yarn:

### Using npm

```bash
npm install @fwgapps/namecheap
```

### Using yarn
```bash
yarn add @fwgapps/namecheap
```

## Usage
### Example in Node.js
```ts
import Namecheap from '@fwgapps/namecheap';

const namecheap = new Namecheap('your-api-key', 'your-username');

async function getDomainInfo() {
  try {
    const response = await namecheap.domains.getInfo({ DomainName: 'example.com' });
    console.log(response);
  } catch (error) {
    console.error('Error fetching domain info:', error);
  }
}

getDomainInfo();
```
### Example in Browser
You can also use this library directly in the browser:
```html
<script type="module">
  import Namecheap from '@fwgapps/namecheap';

  const namecheap = new Namecheap('your-api-key', 'your-username');

  async function getDomainInfo() {
    try {
      const response = await namecheap.domains.getInfo({ DomainName: 'example.com' });
      console.log(response);
    } catch (error) {
      console.error('Error fetching domain info:', error);
    }
  }

  getDomainInfo();
</script>
```

## Contributing
We welcome contributions to this project! If you find a bug or want to suggest a feature, feel free to submit an issue or a pull request.

### How to contribute
1. Fork the repository. 
2. Create a new branch for your feature or bug fix. 
3. Make the necessary changes and commit them. 
4. Push your changes to your fork. 
5. Open a pull request with a description of your changes. 
6. Before submitting your pull request, ensure your code is linted and tested.

## License
This project is licensed under the ISC License. See the [LICENSE](https://github.com/fwgapps/namecheap/LICENSE) file for more information.