### Promise achieve or polyfill

```
const Promise = require('./index.js');
const A = new Promise().then((m)=>{console.log(m)})
```

### Test

```
npm test

```

#### or

```
$  /node_modules/mocha/bin/_mocha ./test

```