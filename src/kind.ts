import { Cmd } from '@w3f/cmd';

import { Kind } from './types';


export class KindManager implements Kind {
    constructor(
        private readonly binaryPath: string,
        private readonly cmd: Cmd
    ) { }

    async start(name = 'ci'): Promise<string | number> {
        this.cmd.setOptions({
            verbose: true
        });

        return this.exec('create', 'cluster', '--name', name);
    }

    async stop(name = 'ci'): Promise<string | number> {
        this.cmd.setOptions({
            verbose: true
        });

        return this.exec('delete', 'cluster', '--name', name);
    }

    async kubeconfig(name = 'ci'): Promise<string | number> {
        this.cmd.setOptions({
            verbose: false
        });

        return this.exec('get', 'kubeconfig', '--name', name);
    }

    private async exec(...args: string[]): Promise<string | number> {
        return this.cmd.exec(`${this.binaryPath}`, ...args);
    }
}
