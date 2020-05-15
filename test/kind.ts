import { should } from 'chai';
import { Cmd } from '@w3f/cmd';
import { ComponentsManager } from '@w3f/components';
import * as k8s from '@kubernetes/client-node';

import { KindManager } from '../src/kind';
import { LoggerMock } from './mocks';

should();

const logger = new LoggerMock();
const cmCfg = {
    'kind': 'https://w3f.github.io/components-ts/downloads/linux-amd64/kind/0.7.0/kind.tar.gz'
};
const cm = new ComponentsManager('kind-test', cmCfg, logger);
let subject: KindManager;
const cmd = new Cmd(logger);

describe('Kind', () => {
    before(async () => {
        const kindPath = await cm.path('kind');
        subject = new KindManager(kindPath, cmd, logger);
    });
    describe('clusters', () => {
        beforeEach(async () => {
            await subject.start();
        });

        afterEach(async () => {
            await subject.stop();
        });

        it('should create accessbile clusters', async () => {
            const kubeconfigContent = await subject.kubeconfig() as string;

            const kc = new k8s.KubeConfig();
            kc.loadFromString(kubeconfigContent);

            const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
            const nodes = await k8sApi.listNode();

            nodes.body.items.length.should.be.greaterThan(0);
        });
    });
});
