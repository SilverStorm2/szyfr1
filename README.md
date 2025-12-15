# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## fastText (language detection)

To automatically pick the most likely Polish decryption using Meta fastText language identification:

- Put the model in `models/lid.176.bin` (or `models/lid.176.ftz`), or set `FASTTEXT_MODEL_PATH`.
- Run `npm run detect:fasttext -- --verbose`.

## HuggingFace API (language detection)

AI-backed language detector (token kept server-side via CRA dev proxy):

- Copy `.env.example` to `.env.local` (ignored by git) and set `API_SZYFR=...` (or `HUGGINGFACE_API_TOKEN=...`)
- Restart `yarn start` and enable `HuggingFace (API)` in the UI

Notes:
- Endpoint: `POST /api/hf-language-detect` in `src/setupProxy.js`
- Default model: `papluca/xlm-roberta-base-language-detection`
- Uses `https://router.huggingface.co/hf-inference` by default; override with `HF_INFERENCE_BASE_URL`

## Vercel

Deploy as a static CRA build + serverless API proxy:

- Import repo in Vercel (framework: Create React App / static build)
- Set env var in Vercel Project Settings → Environment Variables:
  - `API_SZYFR=...` (or `HUGGINGFACE_API_TOKEN=...`)
- The API endpoint in production is implemented as a Vercel function: `api/hf-language-detect.js`

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
