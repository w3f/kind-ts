import { CmdManager, Cmd } from '@w3f/cmd';
import { Components } from '@w3f/components';
import { Logger } from '@w3f/logger';
import * as k8s from '@kubernetes/client-node'
import url from 'url';

import { KindManager } from './types';


export class Kind implements KindManager {
    static async create(logger: Logger, version = '0.8.1'): Promise<Kind> {
        const cmCfg = {
            'kind': `https://w3f.github.io/components-ts/downloads/linux-amd64/kind/${version}/kind.tar.gz`
        };
        const cm = new Components('kind-test', cmCfg, logger);
        const cmd = new Cmd(logger);
        const kindPath = await cm.path('kind');
        return new this(kindPath, cmd, logger);
    }

    constructor(
        private readonly binaryPath: string,
        private readonly cmd: CmdManager,
        private readonly logger: Logger
    ) { }

    async start(name = 'ci'): Promise<void> {
        this.cmd.setOptions({
            verbose: true
        });

        await this.exec('create', 'cluster', '--name', name);
    }

    async stop(name = 'ci'): Promise<void> {
        this.cmd.setOptions({
            verbose: true
        });

        await this.exec('delete', 'cluster', '--name', name);
    }

    async kubeconfig(name = 'ci'): Promise<string> {
        this.cmd.setOptions({
            verbose: false
        });

        const output = await this.exec('get', 'kubeconfig', '--name', name) as string;

        if (this.isCI()) {
            const port = this.extractPort(output);
            await this.portForward(port);
        }

        return output;
    }

    private async exec(...args: string[]): Promise<string | number> {
        return this.cmd.exec(`${this.binaryPath}`, ...args);
    }

    private isCI(): boolean {
        return !(!process.env['GITHUB_ACTIONS'] && !process.env['CI']);
    }

    private async portForward(port: string): Promise<void> {
        try {
            await this.cmd.exec('docker', 'rm', '-f', 'portforward');
        } catch (e) {
            this.logger.debug(`could not remove portforward container: ${e.message}`);
        }
        this.cmd.setOptions({
            shell: true
        });
        await this.cmd.exec('docker', 'run', '-d', '-it', '--name', 'portforward', '--net=host', '--entrypoint', '/bin/sh', 'alpine/socat', '-c', '"while true; do sleep 100; done"');

        this.cmd.setOptions({
            verbose: false,
            detached: true,
            stdio: 'ignore',
            shell: true
        });
        const pid = await this.cmd.exec('socat', `"TCP-LISTEN:${port},reuseaddr,fork"`, `EXEC:"'docker exec -i portforward socat STDIO TCP:localhost:${port}'"`);

        this.logger.debug(`port forwarder pid: ${pid}`)
    }

    private extractPort(kubeconfig: string): string {
        const kc = new k8s.KubeConfig();
        kc.loadFromString(kubeconfig);

        const server = kc.clusters[0].server;
        const serverURL = url.parse(server);

        this.logger.debug(`server port: ${serverURL.port}`);

        return serverURL.port;
    }
}
