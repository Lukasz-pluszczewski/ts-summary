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

Script remembers the last selected files. To ignore saved file list set -s flag:
```sh
tssum -s
```

### Example output

test/testFile.d.ts
```
export declare const func: (foo: string, bar: number) => {
    foo: string;
    bar: number;
};
```
