import { should } from 'chai';
import { Cmd } from '@w3f/cmd';
import { Components } from '@w3f/components';
import * as k8s from '@kubernetes/client-node';

import { Kind } from '../src/kind';
import { LoggerMock } from './mocks';

should();

const logger = new LoggerMock();
let subjectFactory: Kind;
let subjectConstructor: Kind;

async function checks(subject: Kind): Promise<void> {
    const kubeconfigContent = await subject.kubeconfig() as string;

    const kc = new k8s.KubeConfig();
    kc.loadFromString(kubeconfigContent);

    const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
    const nodes = await k8sApi.listNode();

    nodes.body.items.length.should.be.greaterThan(0);
}

describe('Kind', () => {
    describe('constructor', () => {
        beforeEach(async () => {
            const cmCfg = {
                'kind': 'https://w3f.github.io/components-ts/downloads/linux-amd64/kind/0.8.1/kind.tar.gz'
            };
            const cm = new Components('kind-test', cmCfg, logger);
            const cmd = new Cmd(logger);

            const kindPath = await cm.path('kind');
            subjectConstructor = new Kind(kindPath, cmd, logger);

            await subjectConstructor.start();
        });

        afterEach(async () => {
            await subjectConstructor.stop();
        });

        it('should create accessbile clusters', async () => {
            await checks(subjectConstructor);
        });
    });
    describe('static factory', () => {
        beforeEach(async () => {
            subjectFactory = await Kind.create(logger);

            await subjectFactory.start();
        });

        afterEach(async () => {
            await subjectFactory.stop();
        });

        it('should create accessbile clusters', async () => {
            await checks(subjectFactory);
        });
    });
});
