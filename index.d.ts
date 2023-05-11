import { CompilerOptions } from 'typescript';

export function compile(fileNames: string[], options: CompilerOptions): Record<string, string>;
export const FILE_EXTS: string[];
export function pbcopy(data: string): void;
export function getAllFilesWithinDirectory(dir: string, extensions: string[]): any;
export function includeDirectoryFiles(files: string[], extensions: string[]): Promise<string[]>;
export function saveListToFile(list: string[]): Promise<void>;
export function loadListFromFile(): Promise<string[]>;
export function prepareCodeContext(directory: string, options?: { clearHistory?: boolean, returnJson?: boolean }): Promise<string>;
