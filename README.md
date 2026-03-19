# ServiceNow SDK React Component Pack

A two-part developer toolkit for building pro-code ServiceNow SDK applications using pre-built, themeable React components.

## Structure

```
servicenow-sdk-react-component-pack/
├── servicenow-app/   # ServiceNow scoped app — install once per instance
└── npm-package/      # React component library — install per SDK project
```

## Setup

### 1. Install the ServiceNow scoped app

Deploy `servicenow-app` to your ServiceNow instance. This provides the server-side infrastructure: Scripted REST APIs, configuration tables, and ACLs.

```bash
cd servicenow-app
npm install
npm run deploy
```

### 2. Install the NPM component library

In your ServiceNow SDK project, install the component library:

```bash
npm install servicenow-sdk-react-component-pack
```

Then import and use components in your React code:

```tsx
import { Button, TextInput, Form } from 'servicenow-sdk-react-component-pack'
```

## Requirements

- ServiceNow SDK (`@servicenow/sdk` 4.4.0)
- Node.js (version compatible with `@servicenow/sdk`)
- A ServiceNow instance with the scoped app installed
