import child_process from 'child_process';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import ts from 'typescript';
import inquirer from 'inquirer';
import inquirerFileTreeSelection from 'inquirer-file-tree-selection-prompt';


export const FILE_EXTS = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];

export const pbcopy = data => {
	const proc = child_process.spawn('pbcopy');
	proc.stdin.write(data);
	proc.stdin.end();
}

export const getAllFilesWithinDirectory = async (dir, extensions) => {
	let results = [];
	const items = await fs.readdir(dir);
	for (const item of items) {
		const itemPath = path.join(dir, item);
		const stat = await fs.stat(itemPath);
		if (stat.isFile() && extensions.includes(path.extname(item))) {
			results.push(itemPath);
		}
		else if (stat.isDirectory()) {
			results = results.concat(getAllFilesWithinDirectory(itemPath, extensions));
		}
	}
	return results;
}
export const includeDirectoryFiles = async (files, extensions) => {
	const data = await files.reduce(async (accuP, file) => {
		const accu = await accuP;

		const stat = await fs.stat(file);
		if (stat.isFile()) {
			accu.push(file);
		} else if (stat.isDirectory()) {
			const files = await getAllFilesWithinDirectory(file, extensions);
			accu.push(...files);
		}

		return accu;
	}, Promise.resolve([]));

	return data;
}
export function compile(fileNames, options) {
	const createdFiles = {};
	const host = ts.createCompilerHost(options);
	host.writeFile = (fileName, contents) => createdFiles[fileName] = contents;
	const program = ts.createProgram(fileNames, options, host);
	program.emit();
	return createdFiles;
}

export const saveListToFile = async list => {
	const filepath = path.resolve('./', 'codeContextTemp.log');
	const fileHandle = await fs.open(filepath, 'w');
	await fileHandle.writeFile(JSON.stringify(list));
	await fileHandle.close();
};

export const loadListFromFile = async () => {
	try {
		const filepath = path.resolve('./', 'codeContextTemp.log');
		const fileHandle = await fs.open(filepath, 'r');
		const data = await fileHandle.readFile();
		await fileHandle.close();
		const parsedData = JSON.parse(data);
		if (!parsedData.every(file => typeof file === 'string')) {
			throw new Error('Invalid saved data');
		}
		return parsedData;
	} catch (error) {
		return [];
	}
}

export const prepareCodeContext = async (directory, { clearHistory = false, returnJson = false } = {}) => {
	console.log('Using directory:', path.resolve(directory));
	inquirer.registerPrompt('file-tree-selection', inquirerFileTreeSelection)

	const initialList = clearHistory ? [] : await loadListFromFile();

	const answers = await inquirer
		.prompt([
			{
				type: 'file-tree-selection',
				name: 'files',
				root: directory,
				onlyShowValid: true,
				multiple: true,
				default: initialList,
				validate: file => FILE_EXTS.includes(path.extname(file)) || fsSync.lstatSync(file).isDirectory(),
				transformer: file => path.relative(path.resolve(directory), file),
			}
		]);

	await saveListToFile(answers.files);
	const files = await includeDirectoryFiles(answers.files, FILE_EXTS);

	console.log('Generating declarations for files:');
	files.forEach(file => console.log(` - ${path.relative(directory, file)}`));

	const createdFiles = compile(files, {
		allowJs: true,
		declaration: true,
		emitDeclarationOnly: true,
	});

	if (returnJson) {
		const declarations = Object.entries(createdFiles).reduce((accu, [filePath, declaration]) => {
			accu[path.relative(directory, filePath)] = declaration;
			return accu;
		}, {});

		const declarationsString = JSON.stringify(declarations, null, 2);
		pbcopy(declarationsString);

		console.log('\nSuccess! Declarations copied to clipboard.');

		return declarationsString;
	}

	const declarationsString = Object.entries(createdFiles)
		.map(([filePath, declaration]) => `${path.relative(directory, filePath)}\n\`\`\`\n${declaration}\n\`\`\``)
		.join('\n\n');

	pbcopy(declarationsString);

	console.log('\nSuccess! Declarations copied to clipboard.');

	return declarationsString;
};
