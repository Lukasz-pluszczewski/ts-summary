# TS-summary
> Script generating type declarations for selected files to make it easier to send context to LLMs


### Install
(Doesn't have to be global)
```sh
npm i ts-summary -g
```

### Usage
```sh
tssum ./src
```
or just
```sh
tssum
```

#### Flags

Script remembers the last selected files. To ignore saved file list set -s flag:
```sh
tssum -s
```

For JSON output use -j flag:
```sh
tssum -j
```

To return actual file contents instead of generated declarations use --contents:
```sh
tssum --contents
```

### Example output

```
test/testFile.d.ts

\```
export declare const func: (foo: string, bar: number) => {
    foo: string;
    bar: number;
};
\```
```

### Example JSON output:
```json
{
  "test/testFile.d.ts": "export declare const func: (foo: string, bar: number) => {\n    foo: string;\n    bar: number;\n};\n"
}
```

### Programmatic usage
CommonJS is not supported as latest version of inquirer.
```ts
import { prepareCodeContext } from 'ts-summary';

// by default prepareCodeContext returns string (as in example above), returnJson changes that behaviour
const results = await prepareCodeContext(directory, { ignoreSaved: true, returnJson: true });

JSON.parse(results);
```

### Changelog
#### 1.0.0
- Added support for returning actual file contents instead of generated declarations with --contents flag

#### 0.0.1
- Initial release
- Added support for JSON output with -j flag
- Added support for ignoring saved file list with -s flag
